/* The Dhruv Times — newsroom (admin) page.
 * Security notes
 *  - Uses ONLY the public anon key. Every write is authorised server-side by Row Level Security
 *    (public.is_admin()); this page cannot grant itself anything.
 *  - Session is kept in sessionStorage (gone when the tab closes) and expires after 30 idle minutes.
 *  - All content is rendered with textContent / element properties, never innerHTML.
 *  - Uploads are renamed to random names and limited by type and size (also enforced by the bucket).
 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var app = $('#app'), who = $('#who');
  var CFG = window.DT_CONFIG || {};
  var IDLE_MS = 30 * 60 * 1000;
  var MAX_UPLOAD = 10 * 1024 * 1024;
  var IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // ---------- tiny DOM builder (no innerHTML anywhere) ----------
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k in el && k !== 'list') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (x) { if (x != null && x !== false) el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    }
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function toast(msg, bad) {
    var t = h('div', { class: 'toast' + (bad ? ' bad' : ''), role: 'status', text: msg });
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, bad ? 6000 : 2600);
  }
  function safeUrl(u) { u = String(u || '').trim(); return u === '' || /^(https?:\/\/|mailto:)/i.test(u) || /^[A-Za-z0-9_./#-][^:]*$/.test(u); }
  function friendly(err) {
    var m = (err && (err.message || err.error_description)) || String(err);
    if (/row-level security|permission denied|not authorized/i.test(m)) return 'Not allowed: this account is not an admin.';
    if (/check constraint/i.test(m)) return 'The database rejected a value (check URLs, slug format and lengths).';
    if (/duplicate key/i.test(m)) return 'That value is already used (e.g. the URL slug must be unique).';
    if (/JWT|expired|session/i.test(m)) return 'Your session expired. Please sign in again.';
    return m.slice(0, 200);
  }

  // ---------- guards ----------
  if (!CFG.supabaseAnonKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(CFG.supabaseUrl || '')) {
    clear(app).appendChild(h('div', { class: 'panel login' },
      h('h2', { text: 'Not connected yet' }),
      h('p', { text: 'Add your Supabase Project URL and anon public key to config.js, then reload this page.' }),
      h('p', { class: 'note', text: 'Never put the service_role key in config.js.' })));
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    clear(app).appendChild(h('div', { class: 'panel login' }, h('h2', { text: 'Could not load the Supabase library' }),
      h('p', { text: 'Check your connection and reload. If it persists, the CDN file failed its integrity check.' })));
    return;
  }

  var sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
    auth: { storage: window.sessionStorage, storageKey: 'dt-newsroom', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  // ---------- idle logout ----------
  var idleT = 0;
  function bump() { clearTimeout(idleT); idleT = setTimeout(function () { sb.auth.signOut().then(function () { toast('Signed out after 30 minutes of inactivity.'); }); }, IDLE_MS); }
  ['pointerdown', 'keydown', 'scroll'].forEach(function (ev) { addEventListener(ev, bump, { passive: true }); });

  // ---------- content model ----------
  var ICONS = ['ic-pc', 'ic-lock', 'ic-flame', 'ic-binoc', 'ic-cam', 'ic-glass', 'ic-skull', 'ic-star', 'ic-mega', 'ic-q'];
  var ROLES = [['lead', 'Leadership & Event Coordination'], ['sec', 'Cybersecurity & Digital Forensics'], ['intern', 'Internship'], ['award', 'Awards'], ['nss', 'Community Service']];
  var STORY_HELP = 'Formatting: "## Heading", "- list item", "> pull quote", blank line = new paragraph.';

  var SECTIONS = [
    { key: 'settings', label: 'Front page & links', single: true, table: 'settings', intro: 'Headline, intro, About text, ticker, contact links, photo and resume.',
      fields: [
        { k: 'headline_phrases', label: 'Typewriter headline phrases (one per line)', type: 'list' },
        { k: 'deck', label: 'Intro sentence under the headline', type: 'textarea', max: 600 },
        { k: 'about', label: 'About the reporter', type: 'md', max: 6000, help: STORY_HELP + ' Wrap words in [[double brackets]] to redact them.' },
        { k: 'ticker', label: 'News ticker lines (one per line)', type: 'list' },
        { k: 'email', label: 'Contact email (Letters form)', type: 'email' },
        { k: 'github_url', label: 'GitHub URL', type: 'url' },
        { k: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
        { k: 'resume_url', label: 'Resume (PDF)', type: 'file', accept: ['application/pdf'], folder: 'files' },
        { k: 'photo_url', label: 'Profile photo', type: 'image', folder: 'photos' },
        { k: 'cert_folder_url', label: 'Google Drive certificates folder URL', type: 'url' }
      ] },
    { key: 'projects', label: 'Front Page Stories', table: 'projects', intro: 'Project cards and their full story pages.',
      title: function (r) { return r.title; }, sub: function (r) { return '#story/' + r.slug + (r.exhibit ? ' · Exhibit ' + r.exhibit : ''); },
      fields: [
        { k: 'title', label: 'Title', type: 'text', req: true, max: 120 },
        { k: 'slug', label: 'URL slug', type: 'slug', req: true, help: 'Lowercase letters, numbers and dashes. The story opens at #story/<slug>.' },
        { k: 'exhibit', label: 'Exhibit letter', type: 'text', max: 3, half: true },
        { k: 'icon', label: 'Picture icon', type: 'select', options: ICONS, half: true },
        { k: 'kicker', label: 'Kicker (small label above the title)', type: 'text', max: 80 },
        { k: 'summary', label: 'Card summary', type: 'textarea', max: 500 },
        { k: 'meta', label: 'Card tags line (e.g. Next.js · Supabase)', type: 'text', max: 120 },
        { k: 'deck', label: 'Story intro (italic)', type: 'textarea', max: 800 },
        { k: 'caption', label: 'Picture caption', type: 'text', max: 200 },
        { k: 'body', label: 'Story text', type: 'md', max: 20000, help: STORY_HELP },
        { k: 'facts', label: 'Fact box (one per line, "Label: value")', type: 'facts' },
        { k: 'stack', label: 'Stack tags (one per line)', type: 'list' },
        { k: 'github_url', label: 'GitHub URL', type: 'url', half: true },
        { k: 'live_url', label: 'Live site URL', type: 'url', half: true },
        { k: 'published', label: 'Published (untick to keep as a draft)', type: 'bool' }
      ] },
    { key: 'certificates', label: 'Certificates', table: 'certificates', intro: 'Upload a certificate image and file it under a role.',
      title: function (r) { return r.title; }, sub: function (r) { return (ROLES.filter(function (x) { return x[0] === r.role; })[0] || ['', r.role])[1] + (r.date_label ? ' · ' + r.date_label : ''); },
      fields: [
        { k: 'title', label: 'Title', type: 'text', req: true, max: 160 },
        { k: 'role', label: 'Role section', type: 'select', options: ROLES, req: true, half: true },
        { k: 'role_label', label: 'Your role (e.g. Event Coordinator)', type: 'text', max: 60, half: true },
        { k: 'issuer', label: 'Issued by', type: 'text', max: 160 },
        { k: 'date_label', label: 'Date (e.g. 24 Dec 2025)', type: 'text', max: 60, half: true },
        { k: 'cert_type', label: 'Type (e.g. Certificate of Completion)', type: 'text', max: 60, half: true },
        { k: 'note', label: 'Description', type: 'textarea', max: 600 },
        { k: 'image_url', label: 'Certificate image', type: 'image', folder: 'certificates' },
        { k: 'drive_id', label: 'Google Drive file ID (optional, for "Open original")', type: 'text', max: 80, pattern: /^[A-Za-z0-9_-]*$/ },
        { k: 'published', label: 'Published', type: 'bool' }
      ] },
    { key: 'courses', label: 'Currently studying', table: 'courses', intro: 'Courses shown as "In progress" in the certificate archive.',
      title: function (r) { return r.title; }, sub: function (r) { return r.provider; },
      fields: [
        { k: 'title', label: 'Course title', type: 'text', req: true, max: 160 },
        { k: 'subtitle', label: 'Label (e.g. CCNA · Module 1)', type: 'text', max: 80, half: true },
        { k: 'mark', label: 'Stamp text (e.g. CISCO)', type: 'text', max: 30, half: true },
        { k: 'provider', label: 'Provider', type: 'text', max: 120 },
        { k: 'note', label: 'Description', type: 'textarea', max: 600 },
        { k: 'topics', label: 'Topics (one per line)', type: 'list' },
        { k: 'published', label: 'Published', type: 'bool' }
      ] },
    { key: 'press', label: 'Latest from the press', table: 'press_cards', intro: 'Small repository cards under the stories.',
      title: function (r) { return r.title; }, sub: function (r) { return r.url; },
      fields: [
        { k: 'title', label: 'Title', type: 'text', req: true, max: 120 },
        { k: 'kicker', label: 'Kicker', type: 'text', max: 80 },
        { k: 'summary', label: 'Summary', type: 'textarea', max: 500 },
        { k: 'meta', label: 'Tags line', type: 'text', max: 120 },
        { k: 'url', label: 'Link (GitHub or live site)', type: 'url' },
        { k: 'published', label: 'Published', type: 'bool' }
      ] },
    { key: 'skills', label: 'Classified ads (skills)', table: 'skill_groups', intro: 'Skill groups in the Classifieds section.',
      title: function (r) { return r.title; }, sub: function (r) { return (r.tags || []).join(', '); },
      fields: [
        { k: 'title', label: 'Group title', type: 'text', req: true, max: 80 },
        { k: 'tags', label: 'Skills (one per line)', type: 'list' },
        { k: 'published', label: 'Published', type: 'bool' }
      ] },
    { key: 'timeline', label: 'History (film strip)', table: 'timeline', intro: 'Frames in the Operational History reel.',
      title: function (r) { return r.title; }, sub: function (r) { return r.when_label; },
      fields: [
        { k: 'title', label: 'Title', type: 'text', req: true, max: 160 },
        { k: 'when_label', label: 'When (e.g. 2024 - 2026 · Active)', type: 'text', max: 80, half: true },
        { k: 'place', label: 'Where', type: 'text', max: 160, half: true },
        { k: 'body', label: 'Description', type: 'textarea', max: 1000 },
        { k: 'published', label: 'Published', type: 'bool' }
      ] },
    { key: 'activity', label: 'Activity log', activity: true }
  ];

  // ---------- value <-> form conversions ----------
  function toForm(f, v) {
    if (f.type === 'list') return (v || []).join('\n');
    if (f.type === 'facts') return Object.keys(v || {}).map(function (k) { return k + ': ' + v[k]; }).join('\n');
    if (f.type === 'bool') return v !== false;
    return v == null ? '' : String(v);
  }
  function fromForm(f, raw) {
    if (f.type === 'list') return String(raw).split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 50);
    if (f.type === 'facts') {
      var o = {};
      String(raw).split('\n').forEach(function (line) { var i = line.indexOf(':'); if (i > 0) { var k = line.slice(0, i).trim(), v = line.slice(i + 1).trim(); if (k && v) o[k.slice(0, 60)] = v.slice(0, 200); } });
      return o;
    }
    if (f.type === 'bool') return !!raw;
    return String(raw).trim();
  }
  function validate(f, v) {
    if (f.req && (v === '' || v == null)) return 'Required.';
    if (typeof v === 'string' && f.max && v.length > f.max) return 'Too long (max ' + f.max + ' characters).';
    if ((f.type === 'url' || f.type === 'image' || f.type === 'file') && !safeUrl(v)) return 'Must be an https:// link or a site path.';
    if (f.type === 'slug' && !/^[a-z0-9-]{1,40}$/.test(v)) return 'Use 1–40 lowercase letters, numbers or dashes.';
    if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Not a valid email.';
    if (f.pattern && v && !f.pattern.test(v)) return 'Invalid characters.';
    return '';
  }

  // ---------- uploads ----------
  function upload(file, folder, types) {
    if (!file) return Promise.reject(new Error('No file chosen.'));
    if (types.indexOf(file.type) < 0) return Promise.reject(new Error('File type not allowed (' + (file.type || 'unknown') + ').'));
    if (file.size > MAX_UPLOAD) return Promise.reject(new Error('File is larger than 10 MB.'));
    var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf' }[file.type];
    var rnd = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(6)), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    var path = folder + '/' + Date.now() + '-' + rnd + '.' + ext;
    return sb.storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false })
      .then(function (r) { if (r.error) throw r.error; return sb.storage.from('media').getPublicUrl(path).data.publicUrl; });
  }

  // ---------- form ----------
  function buildForm(sec, row, onSave, onCancel) {
    var inputs = {};
    var form = h('form', { class: 'ed', novalidate: true });
    var grid = null;
    sec.fields.forEach(function (f) {
      var id = 'f-' + f.k, input, extra = null, val = toForm(f, row[f.k]);
      if (f.type === 'textarea' || f.type === 'md' || f.type === 'list' || f.type === 'facts') {
        input = h('textarea', { id: id, class: f.type === 'md' ? 'tall' : '', maxLength: f.max || 20000 }); input.value = val;
      } else if (f.type === 'select') {
        input = h('select', { id: id }, f.options.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return h('option', { value: v, text: t }); }));
        input.value = val || (Array.isArray(f.options[0]) ? f.options[0][0] : f.options[0]);
      } else if (f.type === 'bool') {
        input = h('input', { id: id, type: 'checkbox' }); input.checked = val;
      } else {
        input = h('input', { id: id, type: f.type === 'email' ? 'email' : 'text', maxLength: f.max || 2000, autocomplete: 'off', spellcheck: f.type === 'text' }); input.value = val;
        if (f.type === 'image' || f.type === 'file') {
          var types = f.type === 'image' ? IMAGE_TYPES : f.accept;
          var picker = h('input', { type: 'file', accept: types.join(',') });
          var prev = h('img', { alt: '' }); prev.hidden = !val || f.type === 'file';
          if (val && f.type === 'image') prev.src = val;
          var upBtn = h('button', { type: 'button', class: 'btn small', text: 'Upload', onclick: function () {
            upBtn.disabled = true; upBtn.textContent = 'Uploading…';
            upload(picker.files[0], f.folder, types).then(function (url) {
              input.value = url; if (f.type === 'image') { prev.src = url; prev.hidden = false; } toast('Uploaded. Remember to Save.');
            }).catch(function (e) { toast(friendly(e), true); }).then(function () { upBtn.disabled = false; upBtn.textContent = 'Upload'; });
          } });
          extra = h('div', { class: 'img-prev' }, picker, upBtn, prev);
          input.addEventListener('input', function () { if (f.type === 'image') { prev.hidden = !input.value; if (safeUrl(input.value)) prev.src = input.value; } });
        }
      }
      inputs[f.k] = input;
      var err = h('div', { class: 'err' });
      var wrap = f.type === 'bool'
        ? h('div', { class: 'f check' }, h('label', { for: id }, input, f.label), err)
        : h('div', { class: 'f' }, h('label', { for: id, text: f.label + (f.req ? ' *' : '') }), input, extra, f.help ? h('div', { class: 'help', text: f.help }) : null, err);
      wrap._err = err;
      input._wrap = wrap;
      if (f.half) { if (!grid) { grid = h('div', { class: 'grid2' }); form.appendChild(grid); } grid.appendChild(wrap); if (grid.children.length === 2) grid = null; }
      else { grid = null; form.appendChild(wrap); }
    });
    var saveBtn = h('button', { type: 'submit', class: 'btn', text: 'Save' });
    form.appendChild(h('div', { class: 'bar' }, saveBtn, onCancel ? h('button', { type: 'button', class: 'btn alt', text: 'Cancel', onclick: onCancel }) : null));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {}, bad = false;
      sec.fields.forEach(function (f) {
        var inp = inputs[f.k], v = fromForm(f, f.type === 'bool' ? inp.checked : inp.value), msg = validate(f, v);
        inp._wrap._err.textContent = msg; if (msg) bad = true; data[f.k] = v;
      });
      if (bad) { toast('Please fix the highlighted fields.', true); return; }
      saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
      onSave(data).then(function () { toast('Saved. The live site updates on next page load.'); })
        .catch(function (e2) { toast(friendly(e2), true); })
        .then(function () { saveBtn.disabled = false; saveBtn.textContent = 'Save'; });
    });
    return form;
  }

  // ---------- views ----------
  var current = 'settings';
  function q(p) { return p.then(function (r) { if (r.error) throw r.error; return r.data; }); }

  function showSection(key) {
    current = key;
    var sec = SECTIONS.filter(function (s) { return s.key === key; })[0];
    Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (b) { b.classList.toggle('on', b.dataset.k === key); b.setAttribute('aria-pressed', b.dataset.k === key); });
    var panel = clear($('#panel'));
    panel.appendChild(h('h2', { text: sec.label }));
    if (sec.intro) panel.appendChild(h('p', { class: 'sub', text: sec.intro }));
    var body = h('div', null, h('p', { text: 'Loading…' })); panel.appendChild(body);

    if (sec.activity) {
      q(sb.from('audit_log').select('*').order('id', { ascending: false }).limit(60)).then(function (rows) {
        clear(body).appendChild(h('ul', { class: 'log' }, rows.map(function (r) {
          return h('li', { text: new Date(r.at).toLocaleString() + ' — ' + r.op.toLowerCase() + ' in ' + r.tbl });
        })));
        if (!rows.length) body.appendChild(h('p', { text: 'No changes recorded yet.' }));
      }).catch(function (e) { clear(body).appendChild(h('p', { text: friendly(e) })); });
      return;
    }
    if (sec.single) {
      q(sb.from(sec.table).select('*').eq('id', 1).maybeSingle()).then(function (row) {
        clear(body).appendChild(buildForm(sec, row || {}, function (data) {
          data.id = 1;
          return q(sb.from(sec.table).upsert(data).select());
        }));
      }).catch(function (e) { clear(body).appendChild(h('p', { text: friendly(e) })); });
      return;
    }
    listView(sec, body);
  }

  function listView(sec, body) {
    q(sb.from(sec.table).select('*').order('sort', { ascending: true }).order('created_at', { ascending: true })).then(function (rows) {
      clear(body);
      var ul = h('ul', { class: 'rows' });
      rows.forEach(function (r, i) {
        ul.appendChild(h('li', null,
          h('div', { class: 't' }, h('b', null, sec.title(r), r.published === false ? h('span', { class: 'badge', text: 'Draft' }) : null), h('small', { text: sec.sub(r) || '' })),
          h('div', { class: 'acts' },
            h('button', { type: 'button', class: 'btn alt small', text: '↑', title: 'Move up', disabled: i === 0, onclick: function () { swap(sec, rows, i, i - 1, body); } }),
            h('button', { type: 'button', class: 'btn alt small', text: '↓', title: 'Move down', disabled: i === rows.length - 1, onclick: function () { swap(sec, rows, i, i + 1, body); } }),
            h('button', { type: 'button', class: 'btn small', text: 'Edit', onclick: function () { editView(sec, r, body); } }),
            h('button', { type: 'button', class: 'btn danger small', text: 'Delete', onclick: function () {
              if (!confirm('Delete "' + sec.title(r) + '"? This cannot be undone.')) return;
              q(sb.from(sec.table).delete().eq('id', r.id).select()).then(function (d) {
                if (!d || !d.length) throw new Error('not authorized');
                toast('Deleted.'); listView(sec, body);
              }).catch(function (e) { toast(friendly(e), true); });
            } }))));
      });
      body.appendChild(ul);
      if (!rows.length) body.appendChild(h('p', { text: 'Nothing here yet.' }));
      var maxSort = rows.reduce(function (m, r) { return Math.max(m, r.sort || 0); }, 0);
      body.appendChild(h('div', { class: 'bar' }, h('button', { type: 'button', class: 'btn', text: '+ Add new', onclick: function () { editView(sec, { published: true, sort: maxSort + 10 }, body); } })));
    }).catch(function (e) { clear(body).appendChild(h('p', { text: friendly(e) })); });
  }

  function editView(sec, row, body) {
    clear(body);
    body.appendChild(h('p', { class: 'note', text: row.id ? 'Editing: ' + sec.title(row) : 'New entry' }));
    body.appendChild(buildForm(sec, row, function (data) {
      var req = row.id
        ? sb.from(sec.table).update(data).eq('id', row.id).select()
        : sb.from(sec.table).insert(Object.assign({ sort: row.sort }, data)).select();
      return q(req).then(function (d) { if (!d || !d.length) throw new Error('not authorized'); listView(sec, body); });
    }, function () { listView(sec, body); }));
    window.scrollTo(0, 0);
  }

  function swap(sec, rows, a, b, body) {
    var A = rows[a], B = rows[b], sa = A.sort || a * 10, sbv = B.sort || b * 10;
    if (sa === sbv) { sbv = sa + (b > a ? 1 : -1); }
    Promise.all([q(sb.from(sec.table).update({ sort: sbv }).eq('id', A.id).select()), q(sb.from(sec.table).update({ sort: sa }).eq('id', B.id).select())])
      .then(function () { listView(sec, body); }).catch(function (e) { toast(friendly(e), true); });
  }

  function dashboard(email) {
    clear(who).appendChild(h('span', { text: email }));
    who.appendChild(h('a', { class: 'btn alt small', href: '/', target: '_blank', rel: 'noopener', text: 'View site ↗' }));
    who.appendChild(h('button', { type: 'button', class: 'btn small', text: 'Sign out', onclick: function () { sb.auth.signOut(); } }));
    clear(app);
    app.appendChild(h('nav', { class: 'tabs', 'aria-label': 'Sections' }, SECTIONS.map(function (s) {
      return h('button', { type: 'button', text: s.label, 'data-k': s.key, onclick: function () { showSection(s.key); } });
    })));
    app.appendChild(h('section', { class: 'panel', id: 'panel' }));
    showSection(current);
    bump();
  }

  // ---------- login ----------
  var fails = 0, lockUntil = 0;
  function loginView(msg) {
    clear(who);
    var email = h('input', { type: 'email', id: 'em', autocomplete: 'username', required: true });
    var pass = h('input', { type: 'password', id: 'pw', autocomplete: 'current-password', required: true });
    var btn = h('button', { type: 'submit', class: 'btn', text: 'Sign in' });
    var out = h('p', { class: 'err', role: 'alert', text: msg || '' });
    var form = h('form', { class: 'panel login ed' },
      h('h2', { text: 'Newsroom sign-in' }),
      h('div', { class: 'f' }, h('label', { for: 'em', text: 'Email' }), email),
      h('div', { class: 'f' }, h('label', { for: 'pw', text: 'Password' }), pass),
      btn, out);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (Date.now() < lockUntil) { out.textContent = 'Too many attempts. Wait a minute and try again.'; return; }
      btn.disabled = true; out.textContent = '';
      sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value }).then(function (r) {
        pass.value = '';
        if (r.error) {
          fails++; if (fails >= 5) { lockUntil = Date.now() + 60000; fails = 0; }
          out.textContent = 'Sign-in failed. Check your email and password.';
          return;
        }
        fails = 0; return enter(r.data.session);
      }).catch(function () { out.textContent = 'Network error. Try again.'; }).then(function () { btn.disabled = false; });
    });
    clear(app).appendChild(form);
    email.focus();
  }

  function enter(session) {
    if (!session) return loginView();
    return sb.rpc('is_admin').then(function (r) {
      if (r.error || r.data !== true) {
        return sb.auth.signOut().then(function () { loginView('This account is not an admin.'); });
      }
      dashboard(session.user.email);
    });
  }

  sb.auth.onAuthStateChange(function (event) {
    if (event === 'SIGNED_OUT') { clearTimeout(idleT); loginView(); }
  });
  sb.auth.getSession().then(function (r) { enter(r.data && r.data.session); }).catch(function () { loginView(); });
})();

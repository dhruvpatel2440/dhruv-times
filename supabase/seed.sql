-- Seed: copies the content that is currently on the site into the database.
-- Run once AFTER schema.sql. Re-running is safe (each table is only filled when empty).

insert into public.settings (id, headline_phrases, deck, about, ticker, email, github_url, linkedin_url, resume_url, photo_url, cert_folder_url)
values (1, array['CS Student','Security Researcher','Ethical Hacker','Full-Stack Builder']::text[], 'Dhruv Khirsariya builds secure systems and real-world solutions through code, with a passion for ethical hacking, network security and full-stack development.', 'Dhruv is a Computer Science & Engineering student at CSPIT, CHARUSAT University, with a strong focus on cybersecurity, full-stack web development and embedded systems. He scored [[95.46]] in Class 12 Science at Modi School, Rajkot.

> Hands-on execution is the fastest path to mastery.

Now in his third year, he keeps building real-world projects, from POS billing systems to a live farsan ordering store and the SentinelCore network detection platform, while deepening his knowledge of [[ethical hacking, network security]] and secure application design.

He serves as Student Coordinator at the CyberKavach Club and as Event Coordinator for two mega cybersecurity events with [[300+ participants]]. Open to internships, collaborations and anything that [[breaks the ordinary]].', array['Breaking: CyberKavach events draw 300+ participants','Dhruv open to internships and collaborations','Kali Linux sightings reported at CHARUSAT','Ethical hacking: now trending','POS billing system goes live','SentinelCore spots trouble on the wire','Patel Farshan now taking orders online','Now studying: CCNA and Google Cloud Cybersecurity']::text[], 'dhruvkhirsariya590@gmail.com', 'https://github.com/dhruvpatel2440', 'https://www.linkedin.com/in/dhruv-khirsariya-b52b0131a', 'Dhruv_Khirsariya_Resume.pdf', 'photo.jpg', 'https://drive.google.com/drive/folders/1J5lrDJ4VdXlESmYwA4TTgB9xzoWG90ad')
on conflict (id) do nothing;

insert into public.projects (slug,exhibit,kicker,title,summary,meta,deck,caption,icon,facts,stack,body,github_url,live_url,sort)
select * from (values
  ('pos','A','Exclusive · Full-Stack','POS Billing System','A real-world point-of-sale and billing system. Add the problem it solves, the stack and the result here.','Web · Database','A point-of-sale and billing system built for real shop counters: faster checkout, clean invoices and stock that keeps itself up to date.','The billing counter, rebuilt in code.','ic-pc','{"Type": "Web application", "Role": "Solo developer · design to deployment", "Status": "Completed"}'::jsonb,array['PHP','MySQL','phpMyAdmin','HTML','CSS','JavaScript']::text[],'Small shops still lose time and money to handwritten bills and guesswork stock counts. This project set out to replace the paper pad with a simple system a cashier can learn in minutes.

## The problem

Manual billing is slow at rush hour, totals get miscalculated, and nobody knows what is running low until it has already run out. Owners also had no easy way to see daily sales.

## What it does

- Product catalogue with prices, categories and search for quick lookup at the counter
- Cart-style billing with automatic totals, tax and discounts
- Printable invoices with a unique bill number
- Stock is reduced automatically on every sale, with low-stock alerts
- Daily and monthly sales reports for the owner
- Login roles so cashiers and admins see different screens

> “If a cashier needs training to use it, the design has failed.”

## How it is built

The front end is plain HTML, CSS and JavaScript so it runs on any old counter PC. PHP handles the business logic and a relational MySQL database stores products, bills and line items, managed through phpMyAdmin.

## Challenges

- Keeping stock correct when two bills are saved at the same moment
- Designing a database schema that makes reports fast without duplicating data
- Validating every input on the server so prices cannot be tampered with from the browser

## What I learned

Real users care about speed and clarity more than features. Building it end to end taught database design, secure form handling and how to turn a messy real-world process into clean software.','https://github.com/dhruvpatel2440','',0),
  ('farshan','B','Business Desk · E-Commerce','Patel Farshan','A live online ordering store for a Gujarati farsan shop: UPI checkout, real-time order tracking, WhatsApp updates and an installable app.','Next.js · Supabase','A full online ordering store for a Gujarati farsan shop. Customers browse, pay by UPI and track their order live; the shop runs everything from its own admin panel.','Patel Farsan ·પટેલ ફરસાણ, now taking orders online.','ic-flame','{"Type": "Full-stack web app + installable PWA", "Role": "Full-stack developer", "Status": "Live on Vercel"}'::jsonb,array['Next.js','React','TypeScript','Supabase','Tailwind CSS','shadcn/ui','Zustand','Zod','Upstash Redis','Web Push']::text[],'A neighbourhood farsan shop runs on phone calls and WhatsApp messages. Patel Farshan turns that into a proper online store, without taking away the WhatsApp habit customers and the shop already trust.

## For customers

- Browse the menu by category, with filters, ratings and weight-based sizes like 250g, 500g or 1kg
- A cart that remembers what you picked, with delivery charges worked out from the order weight
- Delivery by bus pickup to a list of supported cities, each with its own estimated delivery time
- Pay by UPI: the checkout shows a QR code and the UPI ID, then asks for the UTR number so the shop can verify it, or choose cash on delivery
- A live order tracker that moves through Placed, Confirmed, Packed, Out for delivery and Delivered
- One tap to send the full order summary to the shop on WhatsApp
- Install it like an app on your phone, with push notifications and an offline page

## For the shop

- An admin panel to manage products, categories and delivery cities
- An order desk to confirm payments, move orders through each stage and print bills
- A switch to close the shop, which shows a banner to every customer
- Customer feedback and an audit log of every admin action

> “Keep the WhatsApp habit. Remove the guesswork.”

## Security built in

Login uses one-time codes that are cryptographically random, stored only as peppered hashes, compared in constant time and burned after five wrong guesses. Sensitive endpoints are rate-limited with Upstash Redis, every form is validated with Zod on the server, and admin sessions are kept separate from customer accounts.

## Challenges

- Verifying UPI payments without a payment gateway: a timed payment window, UTR capture and manual confirmation, with unpaid orders cancelled automatically
- Keeping order status in sync live for both the customer and the shop
- Making a web app feel like a native app on cheap phones: installable, fast and usable on slow networks

## What I learned

Building for a real business means designing around how people already work. It was also a full tour of modern full-stack development, from database design in Supabase to push notifications, PWAs and deployment on Vercel.','https://github.com/dhruvpatel2440/Patel-Farshan','https://patel-farshan.vercel.app',10),
  ('sentinel','C','Investigation · Security','SentinelCore','A modular network detection and incident response platform: Suricata alerts in, correlated incidents and time-limited firewall blocks out.','FastAPI · Suricata · React','A modular network detection and incident response platform. Suricata watches the wire, a rule-based pipeline turns raw alerts into incidents, and analysts triage, contain and report.','Every alert traces back to a signature or rule you can read.','ic-lock','{"Type": "Network detection & incident response (NDR / IR)", "Team": "Built with Nisarg Dedakiya", "Deploy": "One docker compose up on Ubuntu Server", "Status": "Working platform, lab use"}'::jsonb,array['Python','FastAPI','React','Tailwind CSS','PostgreSQL','Redis','Suricata','nmap','tshark','iptables','Docker Compose','nginx']::text[],'Most small labs and teams have no visibility into what is happening on their network. SentinelCore puts a full detection and response workflow on a single machine, and it deliberately keeps AI and machine learning out of the detection path, so every alert can be explained.

## How it works

Suricata listens on a mirrored network interface and writes its alerts as EVE JSON. A pipeline worker tails that log, normalises and de-duplicates the alerts into events, and a correlation engine groups related events into incidents. Analysts work those incidents from a React dashboard served through nginx, backed by a FastAPI API, PostgreSQL and Redis.

## Twelve modules

- Login with Argon2 password hashing, JWT tokens and three roles: viewer, analyst and admin
- Asset discovery with nmap scans and a host and port inventory
- Suricata sensor control, rule staging and event search with facets
- Rule-based correlation and an incident triage workflow with evidence linking
- Scheduled reports exported as PDF, CSV or JSON
- PCAP upload and analysis with tshark: flows, artifacts and stream follow
- Threat intelligence: IOC management, feed ingestion, live matching and retro-hunts
- Firewall containment that blocks a host straight from an incident

> “No black boxes: if it raises an alert, you can read the rule that fired.”

## Security by design

- Privilege separation: the API runs unprivileged with every Linux capability dropped; only a small helper container can scan, control Suricata or touch the firewall, through one validated Unix socket
- Every firewall block has a mandatory time limit, from 60 seconds to 24 hours, so nothing is ever blocked forever
- The gateway, DNS servers and the platform itself can never be blocked, enforced inside the helper
- An append-only audit log the database itself refuses to edit or delete, protected by a SHA-256 hash chain

## Testing

Unit tests cover the backend and the helper’s guard logic, an end-to-end suite drives every module through the real API, and a browser test checks the dashboard through nginx. It runs only on networks we own or are authorised to test.

## What I learned

SentinelCore was a crash course in how a security operations team actually works: from packets to alerts to incidents to containment. Designing it so a compromised web layer still could not touch the firewall taught me more about least privilege than any textbook.','https://github.com/dhruvpatel2440/Sentinelcore','',20)
) v(slug,exhibit,kicker,title,summary,meta,deck,caption,icon,facts,stack,body,github_url,live_url,sort)
where not exists (select 1 from public.projects);

insert into public.certificates (role,role_label,title,issuer,date_label,cert_type,note,image_url,drive_id,sort)
select * from (values
  ('lead','Event Coordinator','The Zero Day Chase','CyberKavach Club, CHARUSAT','24 Dec 2025','Certificate of Appreciation','Awarded for outstanding leadership, dedication and structured coordination as Event Coordinator, ensuring the event’s success.','certificates/zero-day-chase-coordinator.jpg','1yYMaMobnBiY-KVSvJXw8OEuyuEoM7neC',0),
  ('lead','Event Coordinator','Warzone: Industry Readiness Cybersecurity Hackathon','CyberKavach × Barracks, CHARUSAT','23 Dec 2025','Certificate of Appreciation','Led the CyberKavach × Barracks hackathon as Event Coordinator, from planning to execution.','certificates/warzone-hackathon-coordinator.jpg','1mKBUxefVDG1Loj7M6UCupzqff68sRMVs',10),
  ('sec','Course graduate','Advanced SQLite Queries with Belkasoft','Belkasoft','12 Jul 2026','Certificate of Completion','Digital forensics training course on querying SQLite evidence. 6 CPE credits. Certificate ID: e2vl51p9sv.','certificates/belkasoft-advanced-sqlite.jpg','1NdVwPUQyVsi1PKF7Ip-YLkkckA10ermx',20),
  ('sec','Course graduate','Certification Course on Digital Forensics','CHARUSAT × Rashtriya Raksha University (RRU)','30 Mar – 3 Apr 2026','Certificate of Completion','Five-day certification course in digital forensics, run with Rashtriya Raksha University’s SITAICS.','certificates/digital-forensics-rru.jpg','1rrfgn06rdPZLJPRS_1fr_jTAjpl-qTyq',30),
  ('sec','CTF competitor','HackQuest Arena (Capture the Flag)','CognizanceX’26 Techfest, CHARUSAT','12–13 Feb 2026','Certificate of Appreciation','Competed in the Capture the Flag event at CognizanceX’26, the flagship techfest of CHARUSAT’s Faculty of Technology and Engineering.','certificates/hackquest-ctf-cognizancex26.jpg','1ySt3534sKXHt4VlK-7miWZaEtn7EfX6E',40),
  ('sec','Workshop participant','Introduction to Network Sniffing: Hands-on with Wireshark','IEEE Student Branch, CHARUSAT','30 Jul 2025','Certificate of Participation','Hands-on workshop on capturing and analysing network traffic with Wireshark.','certificates/ieee-wireshark-workshop.jpg','1tGHwwmuiZJ4yY7Z9yU4kDl4LCCxPaJrb',50),
  ('intern','Web Development Intern','Web Development & Designing Internship','Oasis Infobyte · AICTE OIB-SIP','5 May – 15 Jun 2026','Certificate of Completion','One-month AICTE internship in web development and designing, completed with wonderful remarks.','certificates/oasis-infobyte-internship.jpg','1ERx8AwjZp_Qmnjqd8NGLIo-zen99Cp4s',60),
  ('award','Winner','CSE Department Logo Competition','CSPIT – CSE, CHARUSAT','','Certificate of Appreciation','Winner of the Department of Computer Science and Engineering logo competition, recognised for creativity and excellence.','certificates/logo-competition-winner.jpg','16qmGjsPs58vgV3C3qdg_Clht3UgNzaAm',70),
  ('nss','NSS Volunteer','NSS Rural Skill Development Program','CHARUSAT NSS Unit · CSE / AIML','26 Sep 2024','Certificate of Appreciation','Took part in the National Service Scheme rural skill development programme at Malataj village.','certificates/nss-rural-skill-development.jpg','1Iw7S5i0BoYaH6RkiqF6p3ICNrvfIaOmz',80)
) v(role,role_label,title,issuer,date_label,cert_type,note,image_url,drive_id,sort)
where not exists (select 1 from public.certificates);

insert into public.courses (title,subtitle,provider,mark,topics,note,sort)
select * from (values
  ('CCNA: Introduction to Networks','CCNA · Module 1','Cisco Networking Academy','CISCO',array['Network fundamentals','Ethernet & IP addressing','IPv4 / IPv6 subnetting','Switch & router basics','Packet Tracer labs']::text[],'The first course of the CCNA track: how networks are built, addressed and secured, practised hands-on in Cisco Packet Tracer.',0),
  ('Google Cloud Cybersecurity Certificate','Professional certificate','Google Cloud','GOOGLE CLOUD',array['Cloud security foundations','Identity & access management','Threat detection & response','Risk & compliance']::text[],'Google Cloud’s cybersecurity programme: protecting cloud workloads, managing identity and responding to threats.',10)
) v(title,subtitle,provider,mark,topics,note,sort)
where not exists (select 1 from public.courses);

insert into public.press_cards (kicker,title,summary,meta,url,sort)
select * from (values
  ('AI · Full-Stack · TypeScript','SkillForge AI','AI-powered career roadmap platform. Upload your resume, get an evidence-linked skill gap analysis and readiness score, then follow a week-by-week learning plan with quizzes, resources and interview prep.','React · FastAPI · Gemini · Supabase','https://github.com/dhruvpatel2440/SkillForge-AI',0),
  ('Web Platform','Pizzania Platform','A web platform for Pizzania. Add a one-line summary of what it does and the stack it uses.','GitHub','https://github.com/dhruvpatel2440/pizzania-platform',10)
) v(kicker,title,summary,meta,url,sort)
where not exists (select 1 from public.press_cards);

insert into public.skill_groups (title,tags,sort)
select * from (values
  ('Languages for Hire',array['C','C++','Java','PHP','React']::text[],0),
  ('Security Toolkit',array['Kali Linux','Ethical Hacking','Network Security','Cisco Packet Tracer']::text[],10),
  ('Data & Tools',array['PostgreSQL','phpMyAdmin','MongoDB','VS Code','Antigravity']::text[],20)
) v(title,tags,sort)
where not exists (select 1 from public.skill_groups);

insert into public.timeline (when_label,title,place,body,sort)
select * from (values
  ('2024 - 2026 · Active','B.Tech, Computer Science & Engineering','CSPIT, CHARUSAT University, Changa, Gujarat','3rd year student. 1st year CGPA 7.32. Specialization interest: cybersecurity.',0),
  ('Present · Active','Student Coordinator, CyberKavach Club','CHARUSAT','Active member and coordinator of a university cybersecurity club focused on awareness, hands-on learning and CTF-style challenges. Helps organize sessions, workshops and outreach.',10),
  ('2 Mega Events · Completed','Event Coordinator','300+ participants per event','Co-ordinated two large-scale cybersecurity events, managing scheduling, volunteer coordination, participant communication and on-ground execution end to end.',20),
  ('Passed 2024','Class 12, Science (GSEB)','Modi School, Rajkot, Gujarat','Scored 95.46.',30)
) v(when_label,title,place,body,sort)
where not exists (select 1 from public.timeline);

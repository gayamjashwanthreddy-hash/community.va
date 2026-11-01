# COMMUNITY.VA — Official Website & Community Management Platform

> **Connecting People • Creating Opportunities**  
> *Student-led youth community based in Hyderabad, India.*  
> **Official Contact Email:** `community.vaofficial@gmail.com`

---

## 01. Platform Overview

COMMUNITY.VA is a complete, production-ready community management ecosystem designed for students, organizers, and institutions across Hyderabad.

### Four User Roles & Access Architecture
| Role | Dedicated Route | Permissions & Responsibilities |
| :--- | :--- | :--- |
| **Student** | `/dashboard/student` | Access campus hackathons, workshops, and sports; track registration status. |
| **Volunteer** | `/dashboard/volunteer` | Apply for 9 divisions (Operations, Technical, Media, etc.); view review decisions & assigned division. |
| **College** | `/dashboard/college` | Request campus verification; collaborate on inter-college hackathons and student chapters. |
| **Admin** | `/admin` | Review applications, assign volunteer divisions, verify colleges, audit logs, and trigger automated emails. |

---

## 02. Public Landing Page — Seven Cinematic Scenes

Built with **Next.js 15**, **React**, **TypeScript**, **Tailwind CSS**, **GSAP**, **ScrollTrigger**, and **Lenis**:
1. **Scene 1 — Hero**: Bold headline, official mascot logo, and primary CTAs (`EXPLORE OUR COMMUNITY`, `REGISTER NOW`).
2. **Scene 2 — About**: Guiding philosophy, vision, mission, and the core approach to student empowerment.
3. **Scene 3 — What We Do**: 5 distinct activity spheres:
   - Technology & Innovation (Hackathons, Coding Sprints)
   - Personal Development (Leadership, Public Speaking)
   - Events & Entertainment (Acoustic Nights, Open Mics)
   - Sports & Activities (Campus Tournaments, Athletics)
   - Career & Opportunities (Mentorship, Founder Mixers)
4. **Scene 4 — Events & Experiences**: Interactive category filter bar (`Upcoming Events`, `Past Events`, `Hackathons`, `Workshops`, `Competitions`).
5. **Scene 5 — Community**: Authentic photographic masonry of student builders, stage performers, and backstage teams.
6. **Scene 6 — Get Involved**: Four pathways (`/register/student`, `/register/volunteer`, `/register/college`, `/register/partner`).
7. **Scene 7 — Final CTA**: Large editorial typographic callout linking to community membership.

---

## 03. Backend Architecture & Database

### Database Schema (Supabase PostgreSQL)
All migrations are located in `supabase/migrations/20261031_initial_schema.sql`:
- `profiles`: Linked to `auth.users(id)` with server-enforced roles (`STUDENT`, `VOLUNTEER`, `COLLEGE`, `ADMIN`).
- `students`: Academic profiles, college names, branches, and interests.
- `volunteers`: 9 preferred divisions, skills, experience, and assigned divisions.
- `colleges`: Verified campus records, student strength, and collaboration tracks.
- `partners`: Corporate, startup, and NGO challenge sponsorship requests.
- `application_status_history`: Complete audit trail tracking every status transition (`previous_status`, `new_status`, `changed_by`, `admin_note`, `rejection_reason`).
- `contact_messages`: Portal contact submissions.

### Row Level Security (RLS)
- Strict RLS policies protect every table.
- Students, volunteers, and colleges can only read and update their own records.
- Public role escalation is strictly blocked at database and server levels.
- Administrative reviews and role updates are executed exclusively via authenticated server Route Handlers utilizing `SUPABASE_SERVICE_ROLE_KEY`.

---

## 04. Automated Transactional Emails (Resend)

All transactional emails deliver via **Brevo** with branded templates:
- **Application Submitted**: Sent to applicant + alert sent to `community.vaofficial@gmail.com`.
- **Volunteer Approved**: Congratulations email with assigned division.
- **Volunteer Rejected**: Professional update with constructive feedback.
- **College Verified**: Official campus recognition confirmation.
- **College Rejected**: Verification status feedback.
- **Contact Inquiries**: Sent directly to `community.vaofficial@gmail.com` with `reply_to` header set to the sender.

---

## 05. Environment Configuration

Copy `.env.example` to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...

# Brevo Transactional Emails
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=community.vaofficial@gmail.com

# Official Contact Destination Email
CONTACT_EMAIL=community.vaofficial@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 06. Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```

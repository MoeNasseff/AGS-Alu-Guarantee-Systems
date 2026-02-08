# ALU-NOTEAPP & ALU-REMINDERAPP
### AGS - Alu-Guarantee Systems | Internal Tools

---

## Overview
Two single-page web apps for AGS internal use:
- **noteApp.html** — Notes & expenditure tracker with DataTables
- **reminderApp.html** — Meeting scheduler & reminder manager with bot integration

## Tech Stack
- **Frontend**: HTML, Tailwind CSS (v3, locally built), vanilla JS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide (local)
- **Data Table**: DataTables.js + jQuery (local)
- **Fonts**: Inter (local woff2)
- **Automation**: n8n on Railway (free tier) — *setup pending*
- **Messaging**: WhatsApp Business API, Telegram Bot — *setup pending*
- **Deployment**: Docker + Nginx

## Project Structure
```
miniNotesReminderApp/
├── noteApp.html                    # Notes & expenditure tracker
├── reminderApp.html                # Meeting reminder manager
├── assets/
│   ├── css/
│   │   ├── styles.css              # Compiled Tailwind + custom styles
│   │   ├── datatables.min.css      # DataTables base styles
│   │   └── datatables.responsive.min.css
│   ├── js/
│   │   ├── noteApp.js              # Note app logic
│   │   ├── reminderApp.js          # Reminder app logic
│   │   └── vendor/
│   │       ├── jquery.min.js
│   │       ├── datatables.min.js
│   │       ├── datatables.responsive.min.js
│   │       ├── supabase.min.js
│   │       └── lucide.min.js
│   ├── fonts/
│   │   └── inter/                  # Inter font (300-800 weights, woff2)
│   └── img/                        # Logo & images
├── src/
│   └── css/
│       └── input.css               # Tailwind source + @font-face + custom CSS
├── config/
│   └── nginx.conf                  # Nginx server config
├── tailwind.config.js              # Tailwind theme (AGS brand colors)
├── postcss.config.js
├── package.json                    # npm scripts (build, dev, serve)
├── docker-compose.yml              # Docker deployment
├── Dockerfile
├── .env                            # Supabase keys (gitignored)
├── .gitignore
└── README.md
```

## Quick Start
```bash
npm install                         # Install dependencies
npm run build                       # Build Tailwind CSS
npm run serve                       # Serve on http://localhost:8080
npm run dev                         # Watch mode (auto-rebuild CSS)
```

## Supabase Project
- **Project**: `ags-noteapp`
- **ID**: `iniqnmvdkgqbkfiduqdx`
- **Region**: `eu-central-1`
- **URL**: `https://iniqnmvdkgqbkfiduqdx.supabase.co`

## Database Schema
| Table | Description |
|-------|------------|
| `departments` | 10 AGS departments |
| `employees` | 15 seeded employees with Egyptian names |
| `notes` | Notes with employee, department, title, content, expenditure |
| `meetings` | Meeting scheduler with contact, location, reminders |

## Target URLs
- `www.ags-aluminum.com/noteApp`
- `www.ags-aluminum.com/reminderApp`

## Brand Colors
- **Primary Teal**: `#3ba8bf`
- **Dark Navy**: `#0d1b2a`
- **Background**: `#0a1220`

## Docker Deployment
```bash
docker-compose up -d                # Start nginx container on port 8080
```

## Pending Setup
- [ ] n8n deployment on Railway
- [ ] Telegram Bot (@BotFather)
- [ ] WhatsApp Business API
- [ ] Email SMTP configuration
- [ ] Authentication (integrate with AGS website login)
- [ ] CMS for managing employees, departments, etc.

## Checkpoints
- **CP1** (2026-02-08 23:35 UTC+2): Initial build — noteApp + reminderApp with Supabase, seeded data
  - Revert: `git reset --hard 93b3f16`
- **CP2** (2026-02-09 00:40 UTC+2): Restructured to standard webapp — local assets, Tailwind build, Docker, nginx
  - Revert: `git reset --hard <commit-hash>`

---
*© 2026 AGS - Alu-Guarantee Systems*

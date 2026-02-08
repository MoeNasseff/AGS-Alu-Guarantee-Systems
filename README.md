# ALU-NOTEAPP & ALU-REMINDERAPP
### AGS - Alu-Guarantee Systems | Internal Tools

---

## Overview
Two single-page web apps for AGS internal use:
- **noteApp.html** — Notes & expenditure tracker with DataTables
- **reminderApp.html** — Meeting scheduler & reminder manager with bot integration

## Tech Stack
- **Frontend**: HTML, Tailwind CSS, vanilla JS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide
- **Data Table**: DataTables.js (jQuery)
- **Automation**: n8n on Railway (free tier) — *setup pending*
- **Messaging**: WhatsApp Business API, Telegram Bot — *setup pending*

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

## Pending Setup
- [ ] n8n deployment on Railway
- [ ] Telegram Bot (@BotFather)
- [ ] WhatsApp Business API
- [ ] Email SMTP configuration
- [ ] Authentication (integrate with AGS website login)
- [ ] CMS for managing employees, departments, etc.

## Checkpoints
- **CP1** (2026-02-08 23:35 UTC+2): Initial build — noteApp + reminderApp with Supabase, seeded data
  - Revert: `git reset --hard <commit-hash>`

---
*© 2026 AGS - Alu-Guarantee Systems*

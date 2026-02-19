1) Supabase credential (Header Auth)
Credentials → New → HTTP Header Auth
Name: Supabase Service Role
Auth Header: apikey
Value: <SUPABASE_SERVICE_ROLE_KEY> (use the service_role key from .env)
Save.
2) Telegram credential
Credentials → New → Telegram
Name: Telegram account
Access Token: <your bot token> (from .env TELEGRAM_BOT_TOKEN)
Save.
3) SMTP credential
Credentials → New → SMTP
Name: AGS SMTP
Host: send.one.com
Port: 587
Secure: Off (STARTTLS)
User: w.azzam@ags-aluminum.com
Password: paB6AVAgATlZJGCh@itags_@WAzzam
From: w.azzam@ags-aluminum.com
Save.
4) Rewire nodes to credentials
Open the workflow and set:

Insert to Supabase → Credentials: Supabase Service Role (Header Auth).
Fetch Pending Meetings and Fetch Pending Meetings1 → Credentials: Supabase Service Role.
Mark Reminder Sent → set headers manually if needed:
apikey: {{ $env.SUPABASE_ANON_KEY }} (or switch to service_role credential if you prefer)
Content-Type: application/json
Telegram Trigger, Send Error Message, Send Confirmation, Send Status, Send Help, Send Telegram Reminder → Credentials: Telegram account.
Send Email Reminder → Credentials: AGS SMTP (From already patched to w.azzam@ags-aluminum.com).
5) Confirm key node parameters (do not change logic)
Send Email Reminder: From w.azzam@ags-aluminum.com; To ={{ $json.contact_email }}.
Insert to Supabase: Method POST; URL https://<your>.supabase.co/rest/v1/meetings; Body JSON {{$json.meeting}}; Generic Auth: Header Auth credential above.
Normalize Meeting Payload remains pass-through; Has Parse Error? checks {{$json.error}} == true.
6) Basic Auth to access n8n (if needed)
In Railway variables ensure:

N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=AGS2026!Secure
N8N_USER_MANAGEMENT_DISABLED=true Restart service, then log in with admin / AGS2026!Secure.
After wiring credentials, publish the workflow. Then test /meeting and the ≤1hr reminder path.
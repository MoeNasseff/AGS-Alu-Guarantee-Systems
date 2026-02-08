/**
 * ALU-REMINDERAPP - Meeting & Reminder Manager
 * AGS - Alu-Guarantee Systems
 *
 * Handles: Meeting CRUD, real-time Supabase subscriptions,
 * tab/filter management, status updates, toast notifications.
 */

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://iniqnmvdkgqbkfiduqdx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaXFubXZka2dxYmtmaWR1cWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODIzMjUsImV4cCI6MjA4NjE1ODMyNX0.LqGQ6Qbx22_q1qxlzvjR4IyKHZRM54PEHQRRovpLVRE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── State ───────────────────────────────────────────────────────────────────
let meetings = [];
let employees = [];
let currentFilter = 'all';
let statusTargetId = null;

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  await loadEmployees();
  await loadMeetings();
  setupForm();

  // Subscribe to real-time meeting inserts (from bot)
  supabase
    .channel('meetings-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meetings' }, (payload) => {
      showToast(`New meeting via ${payload.new.source}: ${payload.new.title}`, 'info');
      loadMeetings();
    })
    .subscribe();
});

// ─── Load Employees ─────────────────────────────────────────────────────────
async function loadEmployees() {
  const { data } = await supabase.from('employees').select('*').order('name');
  employees = data || [];
  const select = document.getElementById('meetCreatedBy');
  employees.forEach(e => {
    select.innerHTML += `<option value="${e.id}">${e.name} — ${e.title}</option>`;
  });
}

// ─── Load Meetings ──────────────────────────────────────────────────────────
async function loadMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, employees(name, title)')
    .order('meeting_date', { ascending: true });

  if (error) { showToast('Failed to load meetings', 'error'); return; }
  meetings = data || [];
  updateStats();
  renderMeetings();
}

// ─── Update Stats ───────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-pending').textContent = meetings.filter(m => m.status === 'pending').length;
  document.getElementById('stat-completed').textContent = meetings.filter(m => m.status === 'completed').length;
  document.getElementById('stat-bot').textContent = meetings.filter(m => m.source !== 'web').length;
  document.getElementById('stat-sent').textContent = meetings.reduce((s, m) => s + (m.reminder_count || 0), 0);
}

// ─── Render Meetings ────────────────────────────────────────────────────────
function renderMeetings() {
  const grid = document.getElementById('meetingsGrid');
  const noMsg = document.getElementById('noMeetings');
  const filtered = currentFilter === 'all' ? meetings : meetings.filter(m => m.status === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }

  noMsg.classList.add('hidden');
  grid.innerHTML = filtered.map(m => {
    const date = new Date(m.meeting_date);
    const isPast = date < new Date();
    const isToday = date.toDateString() === new Date().toDateString();
    const timeLeft = getTimeLeft(date);

    return `
      <div class="meeting-card glass rounded-xl p-5 relative overflow-hidden">
        ${isToday && m.status === 'pending' ? '<div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ags-teal via-ags-teal-light to-ags-teal animate-pulse"></div>' : ''}
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-white font-semibold text-sm">${escapeHtml(m.title)}</h3>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="status-${m.status} px-2 py-0.5 rounded-md text-xs font-medium">${m.status}</span>
              <span class="source-${m.source} px-2 py-0.5 rounded-md text-xs font-medium">${m.source}</span>
              ${m.reminder_sent ? '<span class="text-xs text-emerald-400">✓ Reminded</span>' : ''}
            </div>
          </div>
          <button onclick="openStatusModal('${m.id}', '${m.status}')" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-ags-teal transition-all" title="Change status">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 text-ags-teal shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span>${date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            ${!isPast && m.status === 'pending' ? `<span class="text-xs text-ags-teal ml-auto">${timeLeft}</span>` : ''}
          </div>
          <div class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 text-ags-teal shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${escapeHtml(m.contact_person || 'N/A')}</span>
            ${m.contact_phone ? `<span class="text-slate-600 text-xs">${m.contact_phone}</span>` : ''}
          </div>
          ${m.location_name ? `
          <div class="flex items-center gap-2 text-slate-400">
            <svg class="w-3.5 h-3.5 text-ags-teal shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${m.location_url ? `<a href="${m.location_url}" target="_blank" class="hover:text-ags-teal transition-colors">${escapeHtml(m.location_name)}</a>` : `<span>${escapeHtml(m.location_name)}</span>`}
          </div>` : ''}
          ${m.meeting_info ? `
          <div class="pt-2 mt-2 border-t border-ags-border/50">
            <p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(m.meeting_info)}</p>
          </div>` : ''}
        </div>

        ${m.employees ? `
        <div class="mt-3 pt-3 border-t border-ags-border/50 flex items-center gap-2">
          <div class="w-5 h-5 rounded-full bg-ags-teal/15 flex items-center justify-center text-[10px] font-bold text-ags-teal">${m.employees.name[0]}</div>
          <span class="text-xs text-slate-500">by ${m.employees.name}</span>
        </div>` : ''}
      </div>`;
  }).join('');
}

// ─── Tab Switching ──────────────────────────────────────────────────────────
function switchTab(tab) {
  ['form', 'list', 'bot'].forEach(t => {
    document.getElementById(`panel-${t}`).classList.toggle('hidden', t !== tab);
    const tabBtn = document.getElementById(`tab-${t}`);
    tabBtn.classList.toggle('tab-active', t === tab);
    tabBtn.classList.toggle('tab-inactive', t !== tab);
  });
  if (tab === 'list') renderMeetings();
  lucide.createIcons();
}

// ─── Filter Meetings ────────────────────────────────────────────────────────
function filterMeetings(status) {
  currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === status;
    btn.classList.toggle('filter-active', isActive);
    btn.classList.toggle('text-ags-teal', isActive);
    btn.classList.toggle('bg-ags-teal/10', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
  });
  renderMeetings();
}

// ─── Form Submit ────────────────────────────────────────────────────────────
function setupForm() {
  document.getElementById('meetingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('meetTitle').value.trim();
    const meetDate = document.getElementById('meetDate').value;
    const contact = document.getElementById('meetContact').value.trim();
    const email = document.getElementById('meetEmail').value.trim();
    const phone = document.getElementById('meetPhone').value.trim();
    const location = document.getElementById('meetLocation').value.trim();
    const mapUrl = document.getElementById('meetMapUrl').value.trim();
    const info = document.getElementById('meetInfo').value.trim();
    const createdBy = document.getElementById('meetCreatedBy').value || null;

    if (!title || !meetDate || !contact || !info) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const { error } = await supabase.from('meetings').insert({
      title,
      meeting_date: new Date(meetDate).toISOString(),
      contact_person: contact,
      contact_email: email || null,
      contact_phone: phone || null,
      location_name: location || null,
      location_url: mapUrl || null,
      meeting_info: info,
      created_by: createdBy,
      source: 'web'
    });

    if (error) {
      showToast('Failed to schedule: ' + error.message, 'error');
      return;
    }

    showToast('Meeting scheduled successfully!', 'success');
    resetMeetingForm();
    await loadMeetings();
  });
}

// ─── Status Modal ───────────────────────────────────────────────────────────
function openStatusModal(id, current) {
  statusTargetId = id;
  const statuses = ['pending', 'completed', 'cancelled'];
  const colors = { pending: 'amber', completed: 'emerald', cancelled: 'red' };
  const modal = document.getElementById('statusModal');
  const options = document.getElementById('statusOptions');

  options.innerHTML = statuses.map(s => `
    <button onclick="updateMeetingStatus('${s}')" class="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all
      ${s === current ? 'bg-white/5 border border-ags-border' : 'hover:bg-white/5'}">
      <span class="w-2 h-2 rounded-full bg-${colors[s]}-400"></span>
      <span class="text-slate-200 capitalize">${s}</span>
      ${s === current ? '<span class="ml-auto text-xs text-slate-500">Current</span>' : ''}
    </button>
  `).join('');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeStatusModal() {
  document.getElementById('statusModal').classList.add('hidden');
  document.getElementById('statusModal').classList.remove('flex');
  statusTargetId = null;
}

async function updateMeetingStatus(status) {
  if (!statusTargetId) return;
  const { error } = await supabase.from('meetings').update({ status }).eq('id', statusTargetId);
  if (error) { showToast('Update failed', 'error'); }
  else { showToast(`Status updated to ${status}`, 'success'); await loadMeetings(); }
  closeStatusModal();
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function resetMeetingForm() { document.getElementById('meetingForm').reset(); }
function refreshMeetings() { loadMeetings(); showToast('Meetings refreshed', 'info'); }

function getTimeLeft(date) {
  const diff = date - new Date();
  if (diff < 0) return 'Overdue';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ─── Toast Notifications ────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-ags-teal/30 bg-ags-teal/10 text-ags-teal'
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast glass rounded-xl px-5 py-3 border ${colors[type]} flex items-center gap-3 text-sm shadow-xl min-w-[280px]`;
  toast.innerHTML = `<span class="font-bold text-lg">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

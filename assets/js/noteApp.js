/**
 * ALU-NOTEAPP - Notes & Expenditure Tracker
 * AGS - Alu-Guarantee Systems
 * 
 * Handles: CRUD operations for notes, DataTables rendering,
 * Supabase integration, dropdown management, toast notifications.
 */

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://iniqnmvdkgqbkfiduqdx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaXFubXZka2dxYmtmaWR1cWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODIzMjUsImV4cCI6MjA4NjE1ODMyNX0.LqGQ6Qbx22_q1qxlzvjR4IyKHZRM54PEHQRRovpLVRE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── State ───────────────────────────────────────────────────────────────────
let departments = [];
let employees = [];
let notesTable = null;
let deleteTargetId = null;

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  await loadDropdowns();
  await loadNotes();
  setupForm();
  setupEmployeeDeptSync();
});

// ─── Load Dropdowns ─────────────────────────────────────────────────────────
async function loadDropdowns() {
  const [deptRes, empRes] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('employees').select('*, departments(name)').order('name')
  ]);

  departments = deptRes.data || [];
  employees = empRes.data || [];

  // Populate department dropdown
  const deptSelect = document.getElementById('departmentSelect');
  departments.forEach(d => {
    deptSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  // Populate employee dropdown
  const empSelect = document.getElementById('employeeSelect');
  employees.forEach(e => {
    empSelect.innerHTML += `<option value="${e.id}" data-dept="${e.department_id}">${e.name} — ${e.title}</option>`;
  });

  // Populate current user selector
  const userSelect = document.getElementById('currentUser');
  employees.forEach(e => {
    userSelect.innerHTML += `<option value="${e.id}">${e.name}</option>`;
  });

  // Update stats
  document.getElementById('stat-depts').textContent = departments.length;
  document.getElementById('stat-employees').textContent = employees.length;
}

// ─── Auto-sync employee → department ────────────────────────────────────────
function setupEmployeeDeptSync() {
  document.getElementById('employeeSelect').addEventListener('change', function () {
    const selected = this.options[this.selectedIndex];
    const deptId = selected.getAttribute('data-dept');
    if (deptId) {
      document.getElementById('departmentSelect').value = deptId;
    }
  });
}

// ─── Load Notes ─────────────────────────────────────────────────────────────
async function loadNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*, employees(name, title), departments(name)')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Failed to load notes', 'error');
    console.error(error);
    return;
  }

  const notes = data || [];

  // Update stats
  document.getElementById('stat-total').textContent = notes.length;
  const totalExp = notes.reduce((sum, n) => sum + parseFloat(n.expenditure || 0), 0);
  document.getElementById('stat-expenditure').textContent = `EGP ${totalExp.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  // Build DataTable
  if (notesTable) {
    notesTable.clear().destroy();
  }

  const tableData = notes.map(n => [
    `<div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full bg-ags-teal/15 flex items-center justify-center text-xs font-bold text-ags-teal">${(n.employees?.name || '?')[0]}</div>
      <div>
        <div class="text-slate-200 font-medium text-sm">${n.employees?.name || 'N/A'}</div>
        <div class="text-slate-500 text-xs">${n.employees?.title || ''}</div>
      </div>
    </div>`,
    `<span class="text-slate-200 font-medium">${escapeHtml(n.title)}</span>`,
    `<span class="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-ags-teal/10 text-ags-teal border border-ags-teal/20">${n.departments?.name || 'N/A'}</span>`,
    `<div class="max-w-xs truncate text-slate-400 text-sm" title="${escapeHtml(n.note_content || '')}">${escapeHtml(n.note_content || '')}</div>`,
    `<span class="badge-expenditure inline-flex px-3 py-1 rounded-lg text-xs font-semibold text-ags-teal">EGP ${parseFloat(n.expenditure || 0).toLocaleString()}</span>`,
    `<div class="text-slate-500 text-xs">${formatDate(n.created_at)}</div>`,
    `<div class="flex items-center gap-1">
      <button onclick="viewNote('${n.id}')" class="p-1.5 rounded-lg hover:bg-ags-teal/10 text-slate-500 hover:text-ags-teal transition-all" title="View">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button onclick="deleteNote('${n.id}')" class="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>`
  ]);

  notesTable = $('#notesTable').DataTable({
    data: tableData,
    responsive: true,
    pageLength: 10,
    order: [[5, 'desc']],
    language: {
      search: '',
      searchPlaceholder: 'Search notes...',
      emptyTable: 'No notes recorded yet. Add your first note above.',
      lengthMenu: 'Show _MENU_'
    },
    columnDefs: [
      { targets: [3], className: 'none' },
      { targets: [6], orderable: false, width: '80px' }
    ]
  });
}

// ─── Form Submit ────────────────────────────────────────────────────────────
function setupForm() {
  document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const employeeId = document.getElementById('employeeSelect').value;
    const departmentId = document.getElementById('departmentSelect').value;
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const expenditure = parseFloat(document.getElementById('noteExpenditure').value) || 0;

    if (!employeeId || !departmentId || !title || !content) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const { error } = await supabase.from('notes').insert({
      employee_id: employeeId,
      department_id: departmentId,
      title: title,
      note_content: content,
      expenditure: expenditure
    });

    if (error) {
      showToast('Failed to save note: ' + error.message, 'error');
      return;
    }

    showToast('Note saved successfully!', 'success');
    resetForm();
    await loadNotes();
  });
}

// ─── View Note (expand in modal) ────────────────────────────────────────────
async function viewNote(id) {
  const { data } = await supabase
    .from('notes')
    .select('*, employees(name, title), departments(name)')
    .eq('id', id)
    .single();

  if (!data) return;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="glass rounded-2xl p-6 max-w-lg w-full mx-4 animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-white">${escapeHtml(data.title)}</h3>
        <button onclick="this.closest('.fixed').remove()" class="p-1 rounded-lg hover:bg-white/5 text-slate-500">&times;</button>
      </div>
      <div class="space-y-3 text-sm">
        <div class="flex gap-2"><span class="text-slate-500 w-24 shrink-0">Employee:</span><span class="text-slate-200">${data.employees?.name || 'N/A'} — ${data.employees?.title || ''}</span></div>
        <div class="flex gap-2"><span class="text-slate-500 w-24 shrink-0">Department:</span><span class="text-ags-teal">${data.departments?.name || 'N/A'}</span></div>
        <div class="flex gap-2"><span class="text-slate-500 w-24 shrink-0">Expenditure:</span><span class="text-amber-400 font-semibold">EGP ${parseFloat(data.expenditure || 0).toLocaleString()}</span></div>
        <div class="flex gap-2"><span class="text-slate-500 w-24 shrink-0">Date:</span><span class="text-slate-300">${formatDate(data.created_at)}</span></div>
        <div class="pt-2 border-t border-ags-border">
          <span class="text-slate-500 text-xs uppercase tracking-wider">Note Content</span>
          <p class="mt-2 text-slate-300 leading-relaxed">${escapeHtml(data.note_content || '')}</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

// ─── Delete Note ────────────────────────────────────────────────────────────
function deleteNote(id) {
  deleteTargetId = id;
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    const { error } = await supabase.from('notes').delete().eq('id', deleteTargetId);
    if (error) { showToast('Delete failed', 'error'); }
    else { showToast('Note deleted', 'success'); await loadNotes(); }
    closeDeleteModal();
  };
}

function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  deleteTargetId = null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('noteForm').reset();
}

function refreshNotes() {
  loadNotes();
  showToast('Notes refreshed', 'info');
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
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
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

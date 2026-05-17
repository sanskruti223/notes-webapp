const API = '/api/notes';

// state
let notes = [];
let currentId = null;
let searchTimer;
let toastTimer;

// elements
const notesList = document.getElementById('notesList');
const welcomeScreen = document.getElementById('welcomeScreen');
const editorWrap = document.getElementById('editorWrap');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const timestamps = document.getElementById('timestamps');
const titleErr = document.getElementById('titleErr');
const toast = document.getElementById('toast');
const modal = document.getElementById('modal');

// format date
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// toast popup
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = 'show' + (type === 'error' ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 2500);
}

// load all notes from server
async function loadNotes() {
  const query = document.getElementById('searchInput').value.trim();
  const url = query ? `${API}?search=${encodeURIComponent(query)}` : API;
  const res = await fetch(url);
  const data = await res.json();
  notes = data.data || [];
  renderList();
}

// show notes in sidebar
function renderList() {
  notesList.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item' + (note.id === currentId ? ' active' : '');
    li.innerHTML = `
      <div class="note-item-title">${note.title}</div>
      <div class="note-item-date">${formatDate(note.updatedAt)}</div>
    `;
    li.onclick = () => openNote(note.id);
    notesList.appendChild(li);
  });
}

// open a note in the editor
async function openNote(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  const note = data.data;

  currentId = note.id;
  noteTitle.value = note.title;
  noteContent.value = note.content || '';
  timestamps.innerHTML = `Created: ${formatDate(note.createdAt)}<br>Updated: ${formatDate(note.updatedAt)}`;
  titleErr.style.display = 'none';

  welcomeScreen.style.display = 'none';
  editorWrap.style.display = 'flex';

  renderList();
  noteTitle.focus();
}

// blank editor for new note
function newNote() {
  currentId = null;
  noteTitle.value = '';
  noteContent.value = '';
  timestamps.innerHTML = '';
  titleErr.style.display = 'none';

  welcomeScreen.style.display = 'none';
  editorWrap.style.display = 'flex';

  document.querySelectorAll('.note-item').forEach(el => el.classList.remove('active'));
  noteTitle.focus();
}

// save 
async function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title) {
    titleErr.style.display = 'block';
    noteTitle.focus();
    return;
  }
  titleErr.style.display = 'none';

  const method = currentId ? 'PUT' : 'POST';
  const url = currentId ? `${API}/${currentId}` : API;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  const data = await res.json();

  if (!data.success) { showToast('Save failed', 'error'); return; }

  const saved = data.data;
  currentId = saved.id;
  timestamps.innerHTML = `Created: ${formatDate(saved.createdAt)}<br>Updated: ${formatDate(saved.updatedAt)}`;

  showToast('Saved');
  await loadNotes();
}

// show delete modal
function confirmDelete() {
  if (!currentId) return;
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

// delete confirmed
async function deleteNote() {
  closeModal();
  await fetch(`${API}/${currentId}`, { method: 'DELETE' });

  currentId = null;
  editorWrap.style.display = 'none';
  welcomeScreen.style.display = 'flex';

  showToast('Deleted');
  await loadNotes();
}

// search
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadNotes, 300);
}


// start
loadNotes();

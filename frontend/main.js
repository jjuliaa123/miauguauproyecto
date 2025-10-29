const API_BASE = 'http://localhost:5000';

const catsListEl = document.getElementById('catsList');
const qEl = document.getElementById('q');
const filterEl = document.getElementById('filter');
const messageEl = document.getElementById('message');

function showMessage(text, type = 'ok') {
  messageEl.innerHTML = `<div class="msg ${type}">${text}</div>`;
  setTimeout(() => (messageEl.innerHTML = ''), 4000);
}

async function fetchCats() {
  try {
    const res = await fetch(`${API_BASE}/api/cats`);
    const data = await res.json();
    return data;
  } catch {
    showMessage('Error al conectar con el servidor', 'error');
    return [];
  }
}

function renderCats(cats) {
  catsListEl.innerHTML = '';
  if (!cats.length) {
    catsListEl.innerHTML = '<div class="empty">No hay gatos publicados.</div>';
    return;
  }

  cats.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${cat.image || 'https://placekitten.com/400/300'}" alt="${cat.name}">
      <div class="name">${cat.name}</div>
      <div class="meta">
        <span>${cat.breed || ''} ${cat.age ? `· ${cat.age} años` : ''}</span>
        <span class="status ${cat.status}">${cat.status === 'adopted' ? 'Adoptado' : 'Disponible'}</span>
      </div>
      <p class="desc">${cat.description || ''}</p>
      <div class="actions">
        <button onclick="toggleAdopt(${cat.id}, '${cat.status}')">${cat.status === 'adopted' ? 'Marcar disponible' : 'Marcar adoptado'}</button>
        <button class="secondary" onclick="deleteCat(${cat.id})">Eliminar</button>
      </div>`;
    catsListEl.appendChild(card);
  });
}

async function loadAndRender() {
  const data = await fetchCats();
  const q = qEl.value.toLowerCase();
  const filter = filterEl.value;
  const filtered = data.filter(c => {
    const text = `${c.name} ${c.breed} ${c.description}`.toLowerCase();
    if (filter === 'adopted' && c.status !== 'adopted') return false;
    if (filter === 'available' && c.status !== 'available') return false;
    if (q && !text.includes(q)) return false;
    return true;
  });
  renderCats(filtered);
}

async function toggleAdopt(id, status) {
  const newStatus = status === 'adopted' ? 'available' : 'adopted';
  await fetch(`${API_BASE}/api/cats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  loadAndRender();
}

async function deleteCat(id) {
  await fetch(`${API_BASE}/api/cats/${id}`, { method: 'DELETE' });
  loadAndRender();
}

// Evento del form con subida de archivo
document.getElementById('catForm').addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('age', document.getElementById('age').value);
  formData.append('breed', document.getElementById('breed').value);
  formData.append('description', document.getElementById('desc').value);
  formData.append('status', document.getElementById('status').value);
  
  const fileInput = document.getElementById('imageFile');
  if (fileInput.files[0]) formData.append('imageFile', fileInput.files[0]);

  await fetch(`${API_BASE}/api/cats`, {
    method: 'POST',
    body: formData,
  });

  e.target.reset();
  showMessage('Gato publicado ✅');
  loadAndRender();
});

document.getElementById('refresh').onclick = loadAndRender;
document.getElementById('clear').onclick = () => document.getElementById('catForm').reset();
qEl.addEventListener("keypress", e => { if (e.key === "Enter") { e.preventDefault(); loadAndRender(); }});
qEl.oninput = loadAndRender;
filterEl.onchange = loadAndRender;

loadAndRender();

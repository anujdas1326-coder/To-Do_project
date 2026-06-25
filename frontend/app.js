// =====================
// CONFIG
// =====================
const API_BASE = 'https://to-do-project-1-1elz.onrender.com';

// =====================
// STATE
// =====================
let token = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let todos = [];
let currentFilter = 'all';

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    showDashboard();
    fetchTodos();
  } else {
    showAuth();
  }
});

// =====================
// PAGE NAVIGATION
// =====================
function showAuth() {
  document.getElementById('auth-page').classList.add('active');
  document.getElementById('dashboard-page').classList.remove('active');
}

function showDashboard() {
  document.getElementById('auth-page').classList.remove('active');
  document.getElementById('dashboard-page').classList.add('active');
  document.getElementById('nav-username').textContent = `👤 ${currentUser.name}`;
}

// =====================
// TAB SWITCHING
// =====================
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const indicator = document.getElementById('tab-indicator');

  clearMessages();

  if (tab === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    indicator.classList.add('right');
  }
}

function clearMessages() {
  ['login-error', 'register-error', 'register-success', 'create-error', 'edit-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// =====================
// AUTH: REGISTER
// =====================
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl = document.getElementById('register-error');
  const successEl = document.getElementById('register-success');
  const btn = document.getElementById('register-btn');

  errEl.textContent = '';
  successEl.textContent = '';
  setLoading(btn, true);

  try {
    const res = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    successEl.textContent = '✓ Account created! You can now log in.';
    document.getElementById('register-form').reset();
    setTimeout(() => switchTab('login'), 1500);
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    setLoading(btn, false);
  }
}

// =====================
// AUTH: LOGIN
// =====================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  errEl.textContent = '';
  setLoading(btn, true);

  try {
    const res = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));

    showDashboard();
    await fetchTodos();
    showToast(`Welcome back, ${currentUser.name}!`, 'success');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    setLoading(btn, false);
  }
}

// =====================
// AUTH: LOGOUT
// =====================
function handleLogout() {
  token = null;
  currentUser = null;
  todos = [];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showAuth();
  switchTab('login');
  showToast('Logged out successfully', 'success');
}

// =====================
// TODOS: FETCH ALL
// =====================
async function fetchTodos() {
  try {
    const res = await fetch(`${API_BASE}/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) { handleLogout(); return; }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch todos');

    todos = data.todos || [];
    renderTodos();
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =====================
// TODOS: CREATE
// =====================
async function handleCreateTodo(e) {
  e.preventDefault();
  const title = document.getElementById('todo-title').value.trim();
  const description = document.getElementById('todo-desc').value.trim();
  const errEl = document.getElementById('create-error');
  const btn = document.getElementById('add-btn');

  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to create todo');

    todos.unshift(data.todo);
    document.getElementById('create-form').reset();
    renderTodos();
    updateStats();
    showToast('Task added!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '+ Add';
  }
}

// =====================
// TODOS: TOGGLE COMPLETE
// =====================
async function toggleTodo(id) {
  const todo = todos.find(t => t._id === id);
  if (!todo) return;

  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const idx = todos.findIndex(t => t._id === id);
    todos[idx] = data.todo;
    renderTodos();
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =====================
// TODOS: OPEN EDIT MODAL
// =====================
function openEditModal(id) {
  const todo = todos.find(t => t._id === id);
  if (!todo) return;

  document.getElementById('edit-id').value = todo._id;
  document.getElementById('edit-title').value = todo.title;
  document.getElementById('edit-desc').value = todo.description || '';
  document.getElementById('edit-completed').value = String(todo.completed);
  document.getElementById('edit-error').textContent = '';
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

function closeModal(e) {
  if (e.target === document.getElementById('edit-modal')) closeEditModal();
}

// =====================
// TODOS: UPDATE
// =====================
async function handleUpdateTodo(e) {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const completed = document.getElementById('edit-completed').value === 'true';
  const errEl = document.getElementById('edit-error');

  errEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, completed }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');

    const idx = todos.findIndex(t => t._id === id);
    todos[idx] = data.todo;
    closeEditModal();
    renderTodos();
    updateStats();
    showToast('Task updated!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
  }
}

// =====================
// TODOS: DELETE
// =====================
async function deleteTodo(id) {
  if (!confirm('Delete this task?')) return;

  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete failed');

    todos = todos.filter(t => t._id !== id);
    renderTodos();
    updateStats();
    showToast('Task deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =====================
// FILTER
// =====================
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTodos();
}

function getFilteredTodos() {
  if (currentFilter === 'pending') return todos.filter(t => !t.completed);
  if (currentFilter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

// =====================
// RENDER TODOS
// =====================
function renderTodos() {
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('empty-state');
  const filtered = getFilteredTodos();

  // Remove existing todo items (keep empty state)
  list.querySelectorAll('.todo-item').forEach(el => el.remove());

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  filtered.forEach(todo => {
    const item = document.createElement('div');
    item.className = `todo-item${todo.completed ? ' completed' : ''}`;
    item.dataset.id = todo._id;

    const date = new Date(todo.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    item.innerHTML = `
      <div class="todo-check ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo._id}')"></div>
      <div class="todo-body">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
        <div>
          <span class="todo-badge ${todo.completed ? 'badge-done' : 'badge-pending'}">
            ${todo.completed ? '✓ Done' : '● Pending'}
          </span>
        </div>
        <div class="todo-date">${date}</div>
      </div>
      <div class="todo-actions">
        <button class="btn-edit" onclick="openEditModal('${todo._id}')" title="Edit">✎</button>
        <button class="btn-delete" onclick="deleteTodo('${todo._id}')" title="Delete">✕</button>
      </div>
    `;

    list.appendChild(item);
  });
}

// =====================
// STATS
// =====================
function updateStats() {
  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const pending = total - done;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-pending').textContent = pending;
}

// =====================
// HELPERS
// =====================
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.btn-text').textContent = loading ? 'Please wait...' : btn.querySelector('.btn-text').textContent;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
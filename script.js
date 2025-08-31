// DOM REFERENCES
const mainContent   = document.getElementById('cards-ctn');
const toggleButton  = document.getElementById('togglebtn');
const icon          = document.getElementById('icon');
const modal         = document.getElementById('userModal');
const modalBody     = document.getElementById('modal-body');
const closeBtn      = document.querySelector('.close');
const searchInput   = document.getElementById('searchinput');
const searchField   = document.getElementById('searchfield');
const formModal     = document.getElementById('formModal');
const closeFormBtn  = document.querySelector('.close-form');
const userForm      = document.getElementById('userForm');
const formTitle     = document.getElementById('formTitle');
const nameInput     = document.getElementById('nameInput');
const emailInput    = document.getElementById('emailInput');
const phoneInput    = document.getElementById('phoneInput');
const createUserBtn = document.getElementById('createUserBtn');
const confirmModal  = document.getElementById("confirmModal");
const closeConfirm  = document.querySelector(".close-confirm");
const confirmYes    = document.getElementById("confirmYes");
const confirmNo     = document.getElementById("confirmNo");

let allUsers    = [];
let editUserId  = null;
let userToDelete = null;

function showMessage(message, type = "success") {
  const msg = document.createElement("div");
  msg.textContent = message;
  msg.className = `toast ${type}`;
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 2000);
}

// RENDERING
function renderUsers(users) {
  mainContent.innerHTML = '';

  if (users.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'No results found.';
    message.classList.add('no-results');
    mainContent.appendChild(message);
    return;
  }

  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'cardlist';
    card.innerHTML = `
      <h3>${user.name}</h3>
      <p>Email: ${user.email}</p>
      <p>Phone: ${user.phone}</p>
      <p>Company: ${user.company.name}</p>
      <div class="card-actions">
        <button class="details-btn">More Details</button>
        <div class="dropdown">
          <button class="drop-btn">⋮</button>
          <div class="dropdown-ctn">
            <a href="#" class="update">Update</a>
            <a href="#" class="delete">Delete</a>
          </div>
        </div>
      </div>
    `;
    mainContent.appendChild(card);

    // Card Events
    card.querySelector('.details-btn').addEventListener('click', () => {
      modalBody.innerHTML = `
        <h3>${user.username}</h3>
        <p>Id: ${user.id}</p>
        <p>Phone: ${user.phone}</p>
        <p>Website: ${user.website}</p>
        <p>Address: ${user.address.city}, ${user.address.street}</p>
      `;
      modal.style.display = 'flex';
    });

    card.querySelector('.update').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openUpdateForm(user);
      e.target.closest('.dropdown').classList.remove('show');
    });

    card.querySelector('.delete').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDeleteClick(user.id);
      e.target.closest('.dropdown').classList.remove('show');
    });

    card.querySelector('.drop-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = e.target.closest('.dropdown');
      document.querySelectorAll('.dropdown.show').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });
      dropdown.classList.toggle('show');
    });

    window.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.show').forEach(d => d.classList.remove('show'));
    });
  });
}

// API FUNCTIONS
async function getUser() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    allUsers = await response.json();
    renderUsers(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

async function createUser(newUser) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createdUser = await response.json();
    createdUser.company = { name: "N/A" };
    allUsers.push(createdUser);
    renderUsers(allUsers);
    showMessage("User created successfully");
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function updateUser(id, updatedData) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const updatedUser = await response.json();
    const oldUser = allUsers.find(user => user.id === id);
    updatedUser.company = oldUser?.company || { name: "N/A" };
    allUsers = allUsers.map(user => user.id === id ? updatedUser : user);
    renderUsers(allUsers);
    showMessage("User updated successfully");
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function deleteUser(id) {
  try {
    await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { method: 'DELETE' });
    allUsers = allUsers.filter(user => user.id !== id);
    renderUsers(allUsers);
    showMessage("User deleted successfully");
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// MODAL / FORM HANDLERS
function openCreateForm() {
  formTitle.textContent = 'Create User';
  editUserId = null;
  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  formModal.style.display = 'flex';
}

function openUpdateForm(user) {
  formTitle.textContent = 'Update User';
  editUserId = user.id;
  nameInput.value = user.name;
  emailInput.value = user.email;
  phoneInput.value = user.phone;
  formModal.style.display = 'flex';
}

function handleDeleteClick(userId) {
  userToDelete = userId;
  confirmModal.style.display = 'flex';
}

// EVENT LISTENERS
createUserBtn.addEventListener('click', openCreateForm);

userForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userData = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value
  };
  editUserId ? updateUser(editUserId, userData) : createUser(userData);
  formModal.style.display = 'none';
});

closeFormBtn.addEventListener('click', () => formModal.style.display = 'none');
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

closeConfirm.addEventListener('click', () => confirmModal.style.display = 'none');
confirmNo.addEventListener('click', () => confirmModal.style.display = 'none');
confirmYes.addEventListener('click', () => {
  if (userToDelete) {
    deleteUser(userToDelete);
    userToDelete = null;
  }
  confirmModal.style.display = 'none';
});

searchInput.addEventListener('input', (e) => {
  const searchValue = e.target.value.toLowerCase();
  const field = searchField.value;
  const filteredUsers = allUsers.filter(user => user[field].toLowerCase().includes(searchValue));
  renderUsers(filteredUsers);
});

toggleButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    icon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  getUser(); // Fetch users on load
});
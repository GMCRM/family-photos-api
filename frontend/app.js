function checkAuthOnLoad() {
  const token = localStorage.getItem('token');
  const signoutBtn = document.getElementById('signout-btn');
  
  if (token) {
    // Show logged-in sections
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('gallery-section').style.display = 'block';
    signoutBtn.style.display = 'block';

    // Fetch and show photos
    fetchAndDisplayPhotos();
  } else {
    // Show login/signup
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('gallery-section').style.display = 'none';
    signoutBtn.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', checkAuthOnLoad);
// Select login form and inputs
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Login failed');
      return;
    }

    // Save JWT token
    localStorage.setItem('token', data.token);

    // Show upload and gallery sections, hide auth section
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('gallery-section').style.display = 'block';

    document.getElementById('signout-btn').style.display = 'block';

    fetchAndDisplayPhotos();

    console.log('Login successful!');
  } catch (err) {
    console.error('Error logging in:', err);
    alert('An error occurred during login.');
  }
});


// Signup functionality
const signupForm = document.getElementById('signup-form');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupDisplayName = document.getElementById('signup-displayname');
const signupFamilyPassword = document.getElementById('signup-family-password');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const displayName = signupDisplayName.value.trim();
  const familyPassword = signupFamilyPassword.value.trim();

  try {
    const res = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, familyPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Signup failed');
      return;
    }

    alert('Signup successful! You can now log in.');
    signupForm.reset();
  } catch (err) {
    console.error('Signup error:', err);
    alert('An error occurred during signup.');
  }
});
// Modal functionality
const modal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const modalCaption = document.getElementById('modal-caption');
const modalTags = document.getElementById('modal-tags');
const modalClose = document.getElementById('modal-close');

// Function to open modal with photo data
function openModal(photo) {
  modalImage.src = photo.url;
  modalCaption.textContent = photo.caption ? photo.caption : 'No caption provided.';
  modalTags.textContent = photo.tags && photo.tags.length > 0 ? 'Tags: ' + photo.tags.join(', ') : 'No tags.';
  modal.style.display = 'flex';
}

// Close modal on clicking X
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal on clicking outside content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Fetch and display photos function (makes photos clickable to open modal)
async function fetchAndDisplayPhotos() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/photos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch photos');
    const photos = await res.json();

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing

    if (photos.length === 0) {
      gallery.innerHTML = '<p>No photos uploaded yet.</p>';
      return;
    }

    photos.forEach(photo => {
      const div = document.createElement('div');
      div.classList.add('photo-item');
      div.style.cursor = 'pointer';

      div.innerHTML = `
        <img src="${photo.url}" alt="${photo.caption || 'Photo'}" width="200" />
        <p>${photo.caption || ''}</p>
        <p><small>${photo.caption ? photo.caption : ''}</small></p>
      `;

      div.addEventListener('click', () => openModal(photo));

      gallery.appendChild(div);
    });
  } catch (err) {
    console.error('Error fetching photos:', err);
  }
}
// Upload form submit event listener
const uploadForm = document.getElementById('upload-form');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to upload photos.');
    return;
  }

  const formData = new FormData(uploadForm);

  // Convert tags string to array if present
  const tagsInput = document.getElementById('tags').value.trim();
  if (tagsInput) {
    const tagsArray = tagsInput.split(',').map(tag => tag.trim());
    formData.set('tags', JSON.stringify(tagsArray)); // stringify array for backend
  }

  try {
    const res = await fetch('http://localhost:3000/photos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // NOTE: Do NOT set Content-Type header for multipart/form-data
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Photo upload failed');
      return;
    }

    alert('Photo uploaded successfully!');
    uploadForm.reset();

    // Refresh the gallery
    fetchAndDisplayPhotos();
  } catch (err) {
    console.error('Upload error:', err);
    alert('An error occurred during photo upload.');
  }
});

// Toggle signup form visibility
const toggleSignupBtn = document.getElementById('toggle-signup-btn');
const signupFormToggle = document.getElementById('signup-form');

toggleSignupBtn.addEventListener('click', () => {
  if (signupFormToggle.style.display === 'none' || signupFormToggle.style.display === '') {
    signupFormToggle.style.display = 'block';
    toggleSignupBtn.textContent = 'Hide Signup';
  } else {
    signupFormToggle.style.display = 'none';
    toggleSignupBtn.textContent = 'Create Account';
  }
});

// Toggle upload form visibility
const toggleUploadBtn = document.getElementById('toggle-upload-btn');
const uploadFormToggle = document.getElementById('upload-form');

toggleUploadBtn.addEventListener('click', () => {
  if (uploadFormToggle.style.display === 'none' || uploadFormToggle.style.display === '') {
    uploadFormToggle.style.display = 'block';
    toggleUploadBtn.textContent = 'Hide Upload';
  } else {
    uploadFormToggle.style.display = 'none';
    toggleUploadBtn.textContent = 'Upload Photo';
  }
});

const signoutBtn = document.getElementById('signout-btn');

signoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');

  // Reset UI to logged out state
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('gallery-section').style.display = 'none';

  document.getElementById('signout-btn').style.display = 'none';

  alert('You have been signed out.');
});
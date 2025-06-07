const BASE_URL = 'https://family-photos-api.onrender.com';
function checkAuthOnLoad() {
  const token = localStorage.getItem('token');
  const signoutBtn = document.getElementById('signout-btn');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const name = payload.displayName || payload.email;
      signoutBtn.textContent = `Sign Out (${name})`;
    } catch (e) {
      signoutBtn.textContent = 'Sign Out';
    }
    // Show logged-in sections
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('gallery-section').style.display = 'block';
    signoutBtn.style.display = 'block';
    document.getElementById('account-options-btn').style.display = 'block';
    document.getElementById('toggle-upload-btn').style.display = 'block';

    // Fetch and show photos
    const selectedFilter = document.getElementById('visibility-filter')?.value || 'all';
    fetchAndDisplayPhotos(selectedFilter);
  } else {
    // Show login/signup
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('gallery-section').style.display = 'none';
    signoutBtn.style.display = 'none';
    document.getElementById('account-options-btn').style.display = 'none';
    document.getElementById('toggle-upload-btn').style.display = 'none';
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
    const res = await fetch(`${BASE_URL}/auth/login`, {
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

    const userDisplayName = data.user.displayName || data.user.email;
    document.getElementById('signout-btn').textContent = `Sign Out (${userDisplayName})`;

    // Show upload and gallery sections, hide auth section
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('gallery-section').style.display = 'block';

    document.getElementById('signout-btn').style.display = 'block';
    document.getElementById('account-options-btn').style.display = 'block';
    document.getElementById('toggle-upload-btn').style.display = 'block';

    const selectedFilter = document.getElementById('visibility-filter')?.value || 'all';
    fetchAndDisplayPhotos(selectedFilter);

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
    const res = await fetch(`${BASE_URL}/auth/signup`, {
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
async function fetchAndDisplayPhotos(filter = 'all') {
  const token = localStorage.getItem('token');
  if (!token) return;

  let url = `${BASE_URL}/photos`;
  if (filter !== 'all') {
    url += `?visibility=${filter}`;
  }

  try {
    const res = await fetch(url, {
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

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || 'Photo';
      img.width = 200;

      const captionP = document.createElement('p');
      captionP.textContent = photo.caption || '';

      const smallCaption = document.createElement('p');
      smallCaption.innerHTML = `<small>${photo.caption ? photo.caption : ''}</small>`;

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.classList.add('photo-edit-btn');
      editBtn.style.display = 'none'; // Hide edit buttons initially
      editBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newCaption = prompt('Enter new caption:', photo.caption || '');
        const newTags = prompt('Enter new tags (comma separated):', photo.tags ? photo.tags.join(', ') : '');
        if (newCaption !== null && newTags !== null) {
          const token = localStorage.getItem('token');
          try {
            const res = await fetch(`${BASE_URL}/photos/${photo._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                caption: newCaption,
                tags: newTags.split(',').map(tag => tag.trim())
              })
            });
            if (!res.ok) throw new Error('Failed to update photo');
            alert('Photo updated successfully!');
            const selectedFilter = document.getElementById('visibility-filter')?.value || 'all';
            fetchAndDisplayPhotos(selectedFilter);
          } catch (err) {
            console.error('Error updating photo:', err);
            alert('Failed to update photo.');
          }
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('photo-edit-btn');
      deleteBtn.style.display = 'none'; // Hide initially
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = confirm('Are you sure you want to delete this photo?');
        if (!confirmed) return;

        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${BASE_URL}/photos/${photo._id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!res.ok) throw new Error('Failed to delete photo');
          alert('Photo deleted successfully!');
          const selectedFilter = document.getElementById('visibility-filter')?.value || 'all';
          fetchAndDisplayPhotos(selectedFilter);
        } catch (err) {
          console.error('Error deleting photo:', err);
          alert('Failed to delete photo.');
        }
      });

      div.appendChild(img);
      div.appendChild(smallCaption);
      div.appendChild(editBtn);
      div.appendChild(deleteBtn);

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
    const res = await fetch(`${BASE_URL}/photos`, {
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
    const selectedFilter = document.getElementById('visibility-filter')?.value || 'all';
    fetchAndDisplayPhotos(selectedFilter);
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
  const gallery = document.getElementById('gallery');

  if (uploadFormToggle.style.display === 'none' || uploadFormToggle.style.display === '') {
    uploadFormToggle.style.display = 'block';
    toggleUploadBtn.textContent = 'Hide Upload';
    gallery.classList.add('hidden');
  } else {
    uploadFormToggle.style.display = 'none';
    toggleUploadBtn.textContent = 'Upload Photo';
    gallery.classList.remove('hidden');
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
  document.getElementById('account-options-btn').style.display = 'none';
  document.getElementById('account-section').style.display = 'none';
  document.getElementById('toggle-upload-btn').style.display = 'none';

  signoutBtn.textContent = 'Sign Out';

  alert('You have been signed out.');
});

document.getElementById('account-options-btn').addEventListener('click', () => {
  const accountSection = document.getElementById('account-section');
  const gallerySection = document.getElementById('gallery-section');
  const accountBtn = document.getElementById('account-options-btn');

  const isAccountVisible = accountSection.style.display === 'block';

  // Toggle visibility
  accountSection.style.display = isAccountVisible ? 'none' : 'block';
  gallerySection.style.display = isAccountVisible ? 'block' : 'none';

  // Update button label
  accountBtn.textContent = isAccountVisible ? 'Account' : 'Back to Photos';
});

document.getElementById('edit-profile-btn').addEventListener('click', () => {
  const form = document.getElementById('edit-profile-form');
  form.style.display = form.style.display === 'block' ? 'none' : 'block';
});
// Edit Photos button toggles gallery and hides account section
document.getElementById('edit-photos-btn').addEventListener('click', () => {
  const accountSection = document.getElementById('account-section');
  const gallerySection = document.getElementById('gallery-section');

  accountSection.style.display = 'none';
  gallerySection.style.display = 'block';

  // Update account button label
  const accountBtn = document.getElementById('account-options-btn');
  accountBtn.textContent = 'Account';

  const editButtons = document.querySelectorAll('.photo-edit-btn');
  editButtons.forEach(btn => btn.style.display = 'inline-block');
  document.getElementById('done-editing-btn').style.display = 'inline-block';
});

document.getElementById('done-editing-btn').addEventListener('click', () => {
  const editButtons = document.querySelectorAll('.photo-edit-btn');
  editButtons.forEach(btn => btn.style.display = 'none');
  document.getElementById('done-editing-btn').style.display = 'none';
});
// Visibility filter event listener
document.getElementById('visibility-filter').addEventListener('change', (e) => {
  fetchAndDisplayPhotos(e.target.value);
});

// Edit profile form submission (update display name and/or password)
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in.');

    const displayName = document.getElementById('edit-displayname').value.trim();
    const password = document.getElementById('edit-password').value.trim();

    if (!displayName && !password) {
      alert('Please enter a new display name or password.');
      return;
    }

  
    try {
      const res = await fetch(`${BASE_URL}/auth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ displayName, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user.');
      }

      alert('Profile updated successfully! Please sign out and sign back in to see changes.');
      document.getElementById('edit-profile-form').reset();
    } catch (err) {
      console.error('Update error:', err);
      alert('An error occurred while updating your profile.');
    }
  });
});
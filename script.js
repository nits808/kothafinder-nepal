/**
 * ============================================
 * KOTHAFINDER NEPAL — Application Logic
 * Vanilla JavaScript | No Dependencies
 * ============================================
 *
 * Architecture:
 * - Single source of truth: `state.rooms` array
 * - localStorage read once at init, written on mutations
 * - Event delegation where possible
 * - Modular, reusable functions organized by concern
 *
 * Sections:
 * 1. Constants & Seed Data
 * 2. Application State
 * 3. DOM References
 * 4. Utility Functions
 * 5. Storage Functions
 * 6. Authentication
 * 7. CRUD Operations
 * 8. Filtering & Sorting
 * 9. Rendering
 * 10. Modal Management
 * 11. Form Validation
 * 12. Event Handlers
 * 13. Event Binding
 * 14. Initialization
 */

'use strict';

/* ============================================
   1. CONSTANTS & SEED DATA
   ============================================ */

/** LocalStorage keys */
const STORAGE_KEY = 'nepal_rooms';
const SESSION_KEY = 'admin_logged_in';
const INQUIRIES_KEY = 'kothafinder_inquiries';

/** Admin credentials */
const ADMIN_CREDENTIALS = Object.freeze({
  username: 'admin',
  password: 'nepal123',
});

/** Default seed listings loaded on first visit */
const SEED_DATA = Object.freeze([
  {
    id: 'seed-1',
    title: 'Modern Single Room in Thamel',
    city: 'Kathmandu',
    image: 'assets/room-kathmandu.png',
    description:
      'A beautifully furnished single room located in the heart of Thamel, Kathmandu. Close to restaurants, shops, and public transport. Ideal for students and working professionals looking for a convenient city lifestyle.',
    rent: 12000,
    features: ['WiFi', 'Furnished', 'Attached Bathroom'],
    createdAt: 1716000000000,
  },
  {
    id: 'seed-2',
    title: 'Spacious 2BHK Flat in Patan',
    city: 'Lalitpur',
    image: 'assets/room-lalitpur.png',
    description:
      'A bright and airy 2-bedroom apartment in the heritage area of Patan. Features traditional Newari window details combined with modern amenities. Perfect for small families or couples.',
    rent: 25000,
    features: ['Parking', '2 Bedrooms', 'Kitchen', 'Balcony'],
    createdAt: 1716100000000,
  },
  {
    id: 'seed-3',
    title: 'Cozy Room near Durbar Square',
    city: 'Bhaktapur',
    image: 'assets/room-bhaktapur.png',
    description:
      'Experience the charm of Bhaktapur in this cozy room with traditional brick walls and wooden furniture. Walking distance to Durbar Square and local pottery markets. Quiet neighborhood.',
    rent: 8000,
    features: ['Furnished', 'WiFi', 'Water Supply'],
    createdAt: 1716200000000,
  },
  {
    id: 'seed-4',
    title: 'Lake View Studio in Lakeside',
    city: 'Pokhara',
    image: 'assets/room-pokhara.png',
    description:
      'A stunning studio apartment with panoramic views of Phewa Lake and the Annapurna mountain range. Modern interiors, peaceful surroundings, and ideal for remote workers or nature lovers.',
    rent: 18000,
    features: ['Lake View', 'Furnished', 'WiFi', 'Hot Water'],
    createdAt: 1716300000000,
  },
  {
    id: 'seed-5',
    title: 'Ground Floor Flat in Bharatpur',
    city: 'Chitwan',
    image: 'assets/room-chitwan.png',
    description:
      'Spacious ground floor flat with a lush garden view in Bharatpur, Chitwan. Cool and breezy with ceiling fans and large windows. Close to schools, hospitals, and the main market area.',
    rent: 10000,
    features: ['Garden', 'Parking', '2 Rooms', 'Ceiling Fan'],
    createdAt: 1716400000000,
  },
  {
    id: 'seed-6',
    title: 'Premium 2BHK in Baneshwor',
    city: 'Kathmandu',
    image: 'assets/room-kathmandu2.png',
    description:
      'A premium fully-furnished 2BHK flat in New Baneshwor with modern kitchen, spacious living room, and 24-hour water supply. Close to business hubs and shopping centers.',
    rent: 30000,
    features: ['Furnished', 'Parking', 'Water 24/7', 'Lift'],
    createdAt: 1716500000000,
  },
]);

/** Placeholder SVG for broken images */
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='248' viewBox='0 0 400 248'%3E%3Crect width='400' height='248' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Inter,sans-serif' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";

const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='40' viewBox='0 0 56 40'%3E%3Crect width='56' height='40' fill='%23f3f4f6'/%3E%3C/svg%3E";

/* ============================================
   2. APPLICATION STATE
   ============================================ */

/**
 * Global application state — single source of truth.
 * All UI rendering derives from this state object.
 */
const state = {
  rooms: [],
  inquiries: [],
  isLoggedIn: false,
  deleteTargetId: null,
  adminTab: 'listings',

  // Public search & filter
  searchQuery: '',
  cityFilter: '',

  // Admin search, filter & sort
  adminSearch: '',
  adminCityFilter: '',
  adminSort: 'newest',
};

/* ============================================
   3. DOM ELEMENT REFERENCES (cached once)
   ============================================ */

const dom = {
  // Header
  header: document.getElementById('site-header'),
  navToggle: document.getElementById('nav-toggle'),
  primaryNav: document.getElementById('primary-nav'),
  adminPortalBtn: document.getElementById('admin-portal-btn'),
  adminBtnText: document.querySelector('.admin-btn-text'),
  adminBtnIconLock: document.querySelector('.admin-btn-icon-lock'),
  adminBtnIconGrid: document.querySelector('.admin-btn-icon-grid'),

  // Public Listings
  listingsGrid: document.getElementById('listings-grid'),
  noResults: document.getElementById('no-results'),
  resultsCount: document.getElementById('results-count'),

  // Public Search & Filter
  searchInput: document.getElementById('search-input'),
  cityFilter: document.getElementById('city-filter'),

  // Contact form
  contactForm: document.getElementById('contact-form'),
  contactSuccess: document.getElementById('contact-success'),
  contactName: document.getElementById('contact-name'),
  contactEmail: document.getElementById('contact-email'),
  contactMessage: document.getElementById('contact-message'),

  // Login modal
  loginModal: document.getElementById('login-modal'),
  loginModalClose: document.getElementById('login-modal-close'),
  loginForm: document.getElementById('login-form'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  loginError: document.getElementById('login-error'),
  loginSubmitBtn: document.getElementById('login-submit-btn'),

  // Dashboard modal
  dashboardModal: document.getElementById('dashboard-modal'),
  dashboardModalClose: document.getElementById('dashboard-modal-close'),
  dashboardLogoutBtn: document.getElementById('dashboard-logout-btn'),

  // Dashboard stats
  statTotalCount: document.getElementById('stat-total-count'),
  statInquiriesCount: document.getElementById('stat-inquiries-count'),
  statHotspotsRatio: document.getElementById('stat-hotspots-ratio'),
  inquiriesCountBadge: document.getElementById('inquiries-count-badge'),
  inquiriesTableBody: document.getElementById('inquiries-table-body'),
  inquiriesEmpty: document.getElementById('inquiries-empty'),
  dashboardTabs: document.getElementById('dashboard-tabs'),

  // Add listing form
  listingForm: document.getElementById('listing-form'),
  listingTitle: document.getElementById('listing-title'),
  listingCity: document.getElementById('listing-city'),
  listingRent: document.getElementById('listing-rent'),
  listingImage: document.getElementById('listing-image'),
  listingFeatures: document.getElementById('listing-features'),
  listingDescription: document.getElementById('listing-description'),
  addImagePreview: document.getElementById('add-image-preview'),
  addImagePreviewImg: document.getElementById('add-image-preview-img'),

  // Admin controls
  adminSearchInput: document.getElementById('admin-search-input'),
  adminCityFilter: document.getElementById('admin-city-filter'),
  adminSort: document.getElementById('admin-sort'),

  // Admin table
  adminTableBody: document.getElementById('admin-table-body'),
  listingCountBadge: document.getElementById('listing-count-badge'),
  tableEmpty: document.getElementById('table-empty'),

  // Edit modal
  editModal: document.getElementById('edit-modal'),
  editModalClose: document.getElementById('edit-modal-close'),
  editForm: document.getElementById('edit-form'),
  editRoomId: document.getElementById('edit-room-id'),
  editTitle: document.getElementById('edit-title'),
  editCity: document.getElementById('edit-city'),
  editRent: document.getElementById('edit-rent'),
  editImage: document.getElementById('edit-image'),
  editFeatures: document.getElementById('edit-features'),
  editDescription: document.getElementById('edit-description'),
  editCancelBtn: document.getElementById('edit-cancel-btn'),
  editImagePreview: document.getElementById('edit-image-preview'),
  editImagePreviewImg: document.getElementById('edit-image-preview-img'),

  // Delete confirmation modal
  deleteModal: document.getElementById('delete-modal'),
  deleteRoomName: document.getElementById('delete-room-name'),
  deleteCancelBtn: document.getElementById('delete-cancel-btn'),
  deleteConfirmBtn: document.getElementById('delete-confirm-btn'),

  // Toast
  toastContainer: document.getElementById('toast-container'),
};

/* ============================================
   4. UTILITY FUNCTIONS
   ============================================ */

/**
 * Generate a unique ID for new listings.
 * @returns {string}
 */
function generateId() {
  return `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Format a number as Nepali Rupees.
 * @param {number} amount
 * @returns {string}
 */
function formatRent(amount) {
  return `NPR ${Number(amount).toLocaleString('en-NP')}`;
}

/**
 * Escape HTML to prevent XSS when inserting user content.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce a function for performance.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ============================================
   5. STORAGE FUNCTIONS
   ============================================ */

/**
 * Load rooms from localStorage. Called once during initialization.
 * @returns {Array|null} Parsed rooms array, or null if not found/invalid.
 */
function loadRooms() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to parse localStorage data:', error);
    return null;
  }
}

/**
 * Persist current rooms state to localStorage.
 * Called after every state mutation (add, edit, delete).
 */
function saveRooms() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.rooms));
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
}

/**
 * Load customer inquiries from localStorage.
 * @returns {Array|null}
 */
function loadInquiries() {
  try {
    const data = localStorage.getItem(INQUIRIES_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Persist inquiries to localStorage.
 */
function saveInquiries() {
  try {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(state.inquiries));
  } catch (error) {
    console.warn('Failed to save inquiries:', error);
  }
}

/**
 * Check if admin session exists in localStorage.
 * @returns {boolean}
 */
function checkSession() {
  try {
    return localStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Save admin session to localStorage.
 */
function saveSession() {
  try {
    localStorage.setItem(SESSION_KEY, 'true');
  } catch (error) {
    console.warn('Failed to save session:', error);
  }
}

/**
 * Clear admin session from localStorage.
 */
function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear session:', error);
  }
}

/* ============================================
   6. AUTHENTICATION
   ============================================ */

/**
 * Attempt to log in with provided credentials.
 * @param {string} username
 * @param {string} password
 * @returns {boolean} Whether login was successful.
 */
function login(username, password) {
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    state.isLoggedIn = true;
    saveSession();
    updateAdminButton();
    return true;
  }
  return false;
}

/**
 * Log out the admin user.
 */
function logout() {
  state.isLoggedIn = false;
  clearSession();
  updateAdminButton();
  closeModal(dom.dashboardModal);
  showToast('Logged out successfully.');
}

/**
 * Update the admin button appearance based on login state.
 */
function updateAdminButton() {
  if (state.isLoggedIn) {
    dom.adminPortalBtn.classList.add('logged-in');
    dom.adminBtnText.textContent = 'Dashboard';
    dom.adminBtnIconLock.style.display = 'none';
    dom.adminBtnIconGrid.style.display = '';
    dom.adminPortalBtn.setAttribute('aria-label', 'Open Admin Dashboard');
  } else {
    dom.adminPortalBtn.classList.remove('logged-in');
    dom.adminBtnText.textContent = 'Admin Portal';
    dom.adminBtnIconLock.style.display = '';
    dom.adminBtnIconGrid.style.display = 'none';
    dom.adminPortalBtn.setAttribute('aria-label', 'Open Admin Portal');
  }
}

/* ============================================
   7. CRUD OPERATIONS
   ============================================ */

/**
 * CREATE — Add a new room listing.
 * @param {Object} data - Raw form data.
 */
function addRoom(data) {
  const newRoom = {
    id: generateId(),
    title: data.title.trim(),
    city: data.city,
    image: data.image.trim(),
    description: data.description.trim(),
    rent: Number(data.rent),
    features: data.features
      ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [],
    status: 'Available',
    createdAt: Date.now(),
  };

  // Flag new room ID for creation entry highlights
  state.newRoomId = newRoom.id;
  setTimeout(() => {
    state.newRoomId = null;
  }, 2500);

  state.rooms.push(newRoom);
  saveRooms();
  renderPublicListings();
  renderAdminListings();
  updateStatistics();
  showToast('Listing added successfully!');
}

/**
 * UPDATE — Edit an existing room listing.
 * @param {string} id - Room ID to update.
 * @param {Object} data - Updated form data.
 */
function editRoom(id, data) {
  const index = state.rooms.findIndex((r) => r.id === id);
  if (index === -1) return;

  state.rooms[index] = {
    ...state.rooms[index],
    title: data.title.trim(),
    city: data.city,
    image: data.image.trim(),
    description: data.description.trim(),
    rent: Number(data.rent),
    features: data.features
      ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [],
  };

  saveRooms();
  renderPublicListings();
  renderAdminListings();
  updateStatistics();
  showToast('Listing updated successfully!');
}

/**
 * DELETE — Remove a listing by ID.
 * @param {string} id - Room ID to delete.
 */
function deleteRoom(id) {
  const index = state.rooms.findIndex((r) => r.id === id);
  if (index === -1) return;

  const roomTitle = state.rooms[index].title;

  const tr = dom.adminTableBody ? dom.adminTableBody.querySelector(`tr[data-room-id="${id}"]`) : null;
  const card = dom.listingsGrid ? dom.listingsGrid.querySelector(`li[data-room-id="${id}"]`) : null;

  let deletionTriggered = false;
  const proceedWithDeletion = () => {
    if (deletionTriggered) return;
    deletionTriggered = true;

    const finalIdx = state.rooms.findIndex((r) => r.id === id);
    if (finalIdx !== -1) {
      state.rooms.splice(finalIdx, 1);
    }
    saveRooms();
    renderPublicListings();
    renderAdminListings();
    updateStatistics();
    showToast(`"${roomTitle}" has been deleted.`, 'error');
  };

  if (tr || card) {
    if (tr) tr.classList.add('fade-out');
    if (card) card.classList.add('fade-out');
    setTimeout(proceedWithDeletion, 300);
  } else {
    proceedWithDeletion();
  }
}

/* ============================================
   8. FILTERING & SORTING
   ============================================ */

/**
 * Filter rooms by search query and city.
 * @param {Array} rooms - Array of room objects to filter.
 * @param {string} searchQuery - Text to search for.
 * @param {string} cityFilter - City name or empty string for all.
 * @returns {Array} Filtered rooms.
 */
function filterRooms(rooms, searchQuery, cityFilter) {
  const query = searchQuery.toLowerCase().trim();

  return rooms.filter((room) => {
    // City filter
    if (cityFilter && room.city !== cityFilter) return false;

    // Text search — matches title, description, city, features
    if (query) {
      const searchable = `${room.title} ${room.description} ${room.city} ${(room.features || []).join(' ')}`.toLowerCase();
      return searchable.includes(query);
    }

    return true;
  });
}

/**
 * Sort rooms by the specified criteria.
 * @param {Array} rooms - Array of room objects to sort.
 * @param {string} sortBy - Sort key: 'newest', 'oldest', 'rent-low', 'rent-high', 'title-az'.
 * @returns {Array} New sorted array (does not mutate original).
 */
function sortRooms(rooms, sortBy) {
  const sorted = [...rooms];

  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      break;
    case 'oldest':
      sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      break;
    case 'rent-low':
      sorted.sort((a, b) => a.rent - b.rent);
      break;
    case 'rent-high':
      sorted.sort((a, b) => b.rent - a.rent);
      break;
    case 'title-az':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return sorted;
}

/* ============================================
   9. RENDERING
   ============================================ */

/**
 * Render filtered room cards into the public listings grid.
 * Uses DocumentFragment for efficient batch DOM insertion.
 */
function renderPublicListings() {
  const filtered = filterRooms(state.rooms, state.searchQuery, state.cityFilter);
  const fragment = document.createDocumentFragment();

  filtered.forEach((room, index) => {
    const card = createRoomCard(room);
    card.style.animation = 'cardFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
    card.style.animationDelay = `${index * 0.05}s`;
    fragment.appendChild(card);
  });

  dom.listingsGrid.innerHTML = '';
  dom.listingsGrid.appendChild(fragment);

  // Observe newly added cards for scroll reveal
  if (window.listingsObserver) {
    dom.listingsGrid.querySelectorAll('.room-card').forEach((card) => {
      window.listingsObserver.observe(card);
    });
  }

  // Update results count
  const total = state.rooms.length;
  const shown = filtered.length;

  if (state.searchQuery || state.cityFilter) {
    dom.resultsCount.textContent = `Showing ${shown} of ${total} listing${total !== 1 ? 's' : ''}`;
  } else {
    dom.resultsCount.textContent = `${total} listing${total !== 1 ? 's' : ''} available`;
  }

  // Show/hide no results message
  dom.noResults.hidden = shown > 0;
  dom.listingsGrid.style.display = shown > 0 ? '' : 'none';
}

/**
 * Create a single room card element for the public grid.
 * @param {Object} room
 * @returns {HTMLElement}
 */
function createRoomCard(room) {
  const li = document.createElement('li');
  const isRented = room.status === 'Rented';
  const isHighlighted = state.newRoomId && room.id === state.newRoomId;
  li.className = `room-card reveal ${isRented ? 'rented' : ''} ${isHighlighted ? 'highlight-entry' : ''}`;
  li.setAttribute('role', 'listitem');
  li.dataset.roomId = room.id;

  const featuresHTML = (room.features || [])
    .map((f) => `<span class="feature-tag">${escapeHTML(f)}</span>`)
    .join('');

  const actionButtonHTML = isRented
    ? `<span class="badge badge-rented" style="padding: 0.5rem 0.875rem; font-size: var(--font-size-xs); font-weight:700;">Rented</span>`
    : `<button class="btn btn-sm btn-primary room-card-action" data-action="inquire" data-title="${escapeHTML(room.title)}" data-city="${escapeHTML(room.city)}" aria-label="Inquire about ${escapeHTML(room.title)}">Inquire Now</button>`;

  li.innerHTML = `
    <div class="room-card-image-wrapper">
      <img
        src="${escapeHTML(room.image)}"
        alt="${escapeHTML(room.title)} — Room in ${escapeHTML(room.city)}"
        class="room-card-image"
        loading="lazy"
        onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
      >
      <div class="room-card-badges">
        <span class="badge badge-city" data-city="${escapeHTML(room.city)}">${escapeHTML(room.city)}</span>
        <span class="badge badge-rent">${formatRent(room.rent)}/mo</span>
      </div>
    </div>
    <div class="room-card-body">
      <h3 class="room-card-title">${escapeHTML(room.title)}</h3>
      ${featuresHTML ? `<div class="room-card-features">${featuresHTML}</div>` : ''}
      <p class="room-card-description">${escapeHTML(room.description)}</p>
    </div>
    <div class="room-card-footer">
      <span class="room-card-price">${formatRent(room.rent)} <span>/month</span></span>
      ${actionButtonHTML}
    </div>
  `;

  return li;
}

/**
 * Render the admin dashboard table with filtered, sorted listings.
 */
function renderAdminListings() {
  let filtered = filterRooms(state.rooms, state.adminSearch, state.adminCityFilter);
  filtered = sortRooms(filtered, state.adminSort);

  const fragment = document.createDocumentFragment();

  filtered.forEach((room, index) => {
    const tr = document.createElement('tr');
    tr.dataset.roomId = room.id;
    const status = room.status || 'Available';
    const isHighlighted = state.newRoomId && room.id === state.newRoomId;

    if (isHighlighted) {
      tr.classList.add('highlight-entry');
    }

    // Apply staggered fade-in slide animation to dashboard list rows
    tr.style.animation = 'cardFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
    tr.style.animationDelay = `${index * 0.03}s`;

    tr.innerHTML = `
      <td>
        <img
          src="${escapeHTML(room.image)}"
          alt="${escapeHTML(room.title)}"
          class="table-img"
          loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_THUMB}';"
        >
      </td>
      <td><strong>${escapeHTML(room.title)}</strong></td>
      <td>${escapeHTML(room.city)}</td>
      <td>${formatRent(room.rent)}</td>
      <td>
        <button class="status-toggle-btn ${status === 'Rented' ? 'status--rented' : 'status--available'}" data-action="toggle-status" data-id="${room.id}" aria-label="Toggle availability status, currently ${status}">
          ${status}
        </button>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-edit" data-action="edit" data-id="${room.id}" aria-label="Edit ${escapeHTML(room.title)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${room.id}" aria-label="Delete ${escapeHTML(room.title)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    `;

    fragment.appendChild(tr);
  });

  dom.adminTableBody.innerHTML = '';
  dom.adminTableBody.appendChild(fragment);

  // Update count badge (always shows total, not filtered)
  dom.listingCountBadge.textContent = state.rooms.length;

  // Show/hide empty state
  const isEmpty = filtered.length === 0;
  dom.tableEmpty.hidden = !isEmpty;
  const tableResponsive = dom.adminTableBody.closest('.table-responsive');
  if (tableResponsive) tableResponsive.style.display = isEmpty ? 'none' : '';
}

/**
 * Update the statistics cards with current data counts.
 * Called after every CRUD operation.
 */
function updateStatistics() {
  const total = state.rooms.length;
  const totalInquiries = state.inquiries.length;
  
  // Valley count (Kathmandu + Lalitpur + Bhaktapur)
  const valleyCount = state.rooms.filter((r) => 
    r.city === 'Kathmandu' || r.city === 'Lalitpur' || r.city === 'Bhaktapur'
  ).length;
  
  // Other cities count (Pokhara + Chitwan)
  const otherCount = total - valleyCount;

  if (dom.statTotalCount) dom.statTotalCount.textContent = total;
  if (dom.statInquiriesCount) dom.statInquiriesCount.textContent = totalInquiries;
  if (dom.statHotspotsRatio) {
    dom.statHotspotsRatio.textContent = `Valley: ${valleyCount} | Others: ${otherCount}`;
  }
}

/**
 * Render dynamic user inquiries in a neat dashboard list view.
 */
function renderInquiries() {
  const fragment = document.createDocumentFragment();
  
  // Sort newest inquiries first
  const sortedInquiries = [...state.inquiries].sort((a, b) => b.timestamp - a.timestamp);
  
  sortedInquiries.forEach((inq) => {
    const tr = document.createElement('tr');
    tr.dataset.inquiryId = inq.id;
    
    const dateStr = new Date(inq.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    tr.innerHTML = `
      <td><span style="font-size: var(--font-size-xs); font-weight:500; color: var(--color-text-secondary);">${dateStr}</span></td>
      <td><strong>${escapeHTML(inq.name)}</strong></td>
      <td><a href="mailto:${escapeHTML(inq.email)}" style="color: var(--color-blue); text-decoration: underline;">${escapeHTML(inq.email)}</a></td>
      <td><div style="max-height: 80px; overflow-y: auto; font-size:var(--font-size-xs); line-height: 1.5; white-space: pre-wrap;">${escapeHTML(inq.message)}</div></td>
      <td>
        <button class="btn btn-sm btn-danger" data-action="resolve-inquiry" data-id="${inq.id}" aria-label="Mark inquiry from ${escapeHTML(inq.name)} as resolved" style="padding: 4px 8px !important; font-size: 11px !important;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Resolve
        </button>
      </td>
    `;
    fragment.appendChild(tr);
  });
  
  dom.inquiriesTableBody.innerHTML = '';
  dom.inquiriesTableBody.appendChild(fragment);
  
  // Update badges and empty state
  const totalInqs = state.inquiries.length;
  if (dom.inquiriesCountBadge) {
    dom.inquiriesCountBadge.textContent = totalInqs;
    dom.inquiriesCountBadge.hidden = totalInqs === 0;
  }
  
  const isEmpty = totalInqs === 0;
  dom.inquiriesEmpty.hidden = !isEmpty;
  const tableResponsive = dom.inquiriesTableBody.closest('.table-responsive');
  if (tableResponsive) tableResponsive.style.display = isEmpty ? 'none' : '';
}

/**
 * Toggle active dashboard tab panels.
 * @param {'listings'|'inquiries'} tabId
 */
function switchTab(tabId) {
  state.adminTab = tabId;
  
  const tabListings = document.getElementById('tab-listings');
  const tabInquiries = document.getElementById('tab-inquiries');
  const panelListings = document.getElementById('panel-listings');
  const panelInquiries = document.getElementById('panel-inquiries');
  
  if (!tabListings || !tabInquiries) return;
  
  if (tabId === 'listings') {
    tabListings.classList.add('active');
    tabInquiries.classList.remove('active');
    tabListings.setAttribute('aria-selected', 'true');
    tabInquiries.setAttribute('aria-selected', 'false');
    panelListings.classList.add('active');
    panelInquiries.classList.remove('active');
    panelListings.hidden = false;
    panelInquiries.hidden = true;
    
    renderAdminListings();
  } else if (tabId === 'inquiries') {
    tabListings.classList.remove('active');
    tabInquiries.classList.add('active');
    tabListings.setAttribute('aria-selected', 'false');
    tabInquiries.setAttribute('aria-selected', 'true');
    panelListings.classList.remove('active');
    panelInquiries.classList.add('active');
    panelListings.hidden = true;
    panelInquiries.hidden = false;
    
    renderInquiries();
  }
}

/* ============================================
   10. MODAL MANAGEMENT
   ============================================ */

let activeFocusTrapListener = null;

/**
 * Confines keyboard tab focus inside the specified modal element.
 * @param {HTMLElement} modalEl
 */
function bindFocusTrap(modalEl) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  // Remove any existing listener first
  if (activeFocusTrapListener) {
    document.removeEventListener('keydown', activeFocusTrapListener);
  }
  
  activeFocusTrapListener = function (e) {
    if (e.key !== 'Tab') return;
    
    const focusableElements = modalEl.querySelectorAll(focusableSelectors);
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab: cycle backward
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab: cycle forward
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  document.addEventListener('keydown', activeFocusTrapListener);
}

/**
 * Removes active focus trap listener.
 */
function unbindFocusTrap() {
  if (activeFocusTrapListener) {
    document.removeEventListener('keydown', activeFocusTrapListener);
    activeFocusTrapListener = null;
  }
}

/**
 * Measures browser scrollbar width.
 * @returns {number}
 */
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Open a modal overlay.
 * @param {HTMLElement} modalEl
 */
function openModal(modalEl) {
  const sbWidth = getScrollbarWidth();
  if (sbWidth > 0) {
    document.body.style.paddingRight = `${sbWidth}px`;
    if (dom.header) dom.header.style.paddingRight = `${sbWidth}px`;
  }

  modalEl.hidden = false;
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    modalEl.classList.add('visible');
  });

  // Confine focus inside active modal
  bindFocusTrap(modalEl);

  // Focus first focusable element
  const focusTarget = modalEl.querySelector(
    'input:not([type="hidden"]), select, textarea, button:not(.modal-close)'
  );
  if (focusTarget) {
    setTimeout(() => focusTarget.focus(), 120);
  }
}

/**
 * Close a modal overlay.
 * @param {HTMLElement} modalEl
 */
function closeModal(modalEl) {
  modalEl.classList.remove('visible');
  unbindFocusTrap();
  
  setTimeout(() => {
    modalEl.hidden = true;
    // Only remove body lock if no other modals are visible
    const anyVisible = document.querySelector('.modal-overlay.visible');
    if (!anyVisible) {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      if (dom.header) dom.header.style.paddingRight = '';
    } else {
      // Re-bind focus trap to underlying modal
      bindFocusTrap(anyVisible);
    }
  }, 250);
}

/* ============================================
   11. FORM VALIDATION
   ============================================ */

/**
 * Validate a single form field and display error.
 * @param {HTMLElement} input
 * @param {string} errorId - ID of the error span element.
 * @returns {boolean}
 */
function validateField(input, errorId) {
  const errorEl = document.getElementById(errorId);
  const value = input.value.trim();
  let message = '';

  if (!value) {
    message = 'This field is required.';
  } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = 'Please enter a valid email address.';
  } else if (input.type === 'number' && (isNaN(Number(value)) || Number(value) <= 0)) {
    message = 'Please enter a valid positive amount.';
  } else if (input.type === 'url' && !value.match(/^https?:\/\/.+/i) && !value.startsWith('assets/')) {
    message = 'Please enter a valid URL (starting with http:// or https://).';
  } else if (input.minLength && value.length < input.minLength) {
    message = `Must be at least ${input.minLength} characters long.`;
  }

  if (message) {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
    return false;
  }

  input.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

/**
 * Clear all validation errors from a form.
 * @param {HTMLFormElement} form
 */
function clearFormErrors(form) {
  form.querySelectorAll('.form-input').forEach((input) => input.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach((err) => (err.textContent = ''));
}

/**
 * Update image preview when URL changes.
 * @param {string} url - The image URL.
 * @param {HTMLElement} previewContainer
 * @param {HTMLImageElement} previewImg
 */
function updateImagePreview(url, previewContainer, previewImg) {
  const trimmed = url.trim();
  if (trimmed && (trimmed.startsWith('http') || trimmed.startsWith('assets/'))) {
    previewImg.src = trimmed;
    previewImg.onerror = function () {
      previewContainer.hidden = true;
      this.onerror = null;
    };
    previewContainer.hidden = false;
  } else {
    previewContainer.hidden = true;
  }
}

/* ============================================
   12. TOAST NOTIFICATIONS
   ============================================ */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'} type
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  const icons = {
    success:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  toast.innerHTML = `${icons[type] || icons.success}<span>${escapeHTML(message)}</span>`;
  dom.toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ============================================
   13. EVENT HANDLERS
   ============================================ */

/** Sticky header shadow on scroll */
function handleHeaderScroll() {
  dom.header.classList.toggle('scrolled', window.scrollY > 10);
}

/** Active nav link highlight based on scroll position */
function handleActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 150;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[data-nav="${id}"]`);

    if (navLink) {
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
        navLink.classList.add('active');
      }
    }
  });
}

/** Mobile navigation toggle */
function handleNavToggle() {
  const isOpen = dom.primaryNav.classList.toggle('open');
  dom.navToggle.classList.toggle('active', isOpen);
  dom.navToggle.setAttribute('aria-expanded', isOpen);
}

/** Admin portal button click */
function handleAdminPortalClick() {
  if (state.isLoggedIn) {
    openModal(dom.dashboardModal);
    switchTab('listings');
    updateStatistics();
  } else {
    openModal(dom.loginModal);
  }
}

/** Login form submission with loading state */
function handleLogin(e) {
  e.preventDefault();

  const username = dom.loginUsername.value.trim();
  const password = dom.loginPassword.value;

  // Validate empty fields
  let valid = true;
  if (!username) {
    dom.loginUsername.classList.add('error');
    document.getElementById('login-username-error').textContent = 'Username is required.';
    valid = false;
  } else {
    dom.loginUsername.classList.remove('error');
    document.getElementById('login-username-error').textContent = '';
  }

  if (!password) {
    dom.loginPassword.classList.add('error');
    document.getElementById('login-password-error').textContent = 'Password is required.';
    valid = false;
  } else {
    dom.loginPassword.classList.remove('error');
    document.getElementById('login-password-error').textContent = '';
  }

  if (!valid) return;

  // Show loading state
  dom.loginSubmitBtn.classList.add('btn-loading');
  dom.loginError.hidden = true;

  // Simulate brief authentication delay
  setTimeout(() => {
    dom.loginSubmitBtn.classList.remove('btn-loading');

    if (login(username, password)) {
      dom.loginForm.reset();
      clearFormErrors(dom.loginForm);
      closeModal(dom.loginModal);

      // Open dashboard after login modal closes
      setTimeout(() => {
        openModal(dom.dashboardModal);
        renderAdminListings();
        updateStatistics();
      }, 300);

      showToast('Welcome back, Admin!');
    } else {
      dom.loginError.hidden = false;
      dom.loginPassword.value = '';
      dom.loginPassword.focus();
    }
  }, 800);
}

/** Add listing form submission */
function handleAddListingSubmit(e) {
  e.preventDefault();

  const validations = [
    validateField(dom.listingTitle, 'listing-title-error'),
    validateField(dom.listingCity, 'listing-city-error'),
    validateField(dom.listingRent, 'listing-rent-error'),
    validateField(dom.listingImage, 'listing-image-error'),
    validateField(dom.listingDescription, 'listing-description-error'),
  ];

  if (validations.includes(false)) return;

  addRoom({
    title: dom.listingTitle.value,
    city: dom.listingCity.value,
    rent: dom.listingRent.value,
    image: dom.listingImage.value,
    features: dom.listingFeatures.value,
    description: dom.listingDescription.value,
  });

  dom.listingForm.reset();
  clearFormErrors(dom.listingForm);
  dom.addImagePreview.hidden = true;
}

/** Open edit modal with pre-filled data */
function handleOpenEditModal(id) {
  const room = state.rooms.find((r) => r.id === id);
  if (!room) return;

  dom.editRoomId.value = room.id;
  dom.editTitle.value = room.title;
  dom.editCity.value = room.city;
  dom.editRent.value = room.rent;
  dom.editImage.value = room.image;
  dom.editFeatures.value = (room.features || []).join(', ');
  dom.editDescription.value = room.description;

  // Show image preview
  updateImagePreview(room.image, dom.editImagePreview, dom.editImagePreviewImg);

  clearFormErrors(dom.editForm);
  openModal(dom.editModal);
}

/** Edit form submission */
function handleEditSubmit(e) {
  e.preventDefault();

  const validations = [
    validateField(dom.editTitle, 'edit-title-error'),
    validateField(dom.editCity, 'edit-city-error'),
    validateField(dom.editRent, 'edit-rent-error'),
    validateField(dom.editImage, 'edit-image-error'),
    validateField(dom.editDescription, 'edit-description-error'),
  ];

  if (validations.includes(false)) return;

  editRoom(dom.editRoomId.value, {
    title: dom.editTitle.value,
    city: dom.editCity.value,
    rent: dom.editRent.value,
    image: dom.editImage.value,
    features: dom.editFeatures.value,
    description: dom.editDescription.value,
  });

  closeModal(dom.editModal);
}

/** Open delete confirmation modal */
function handleOpenDeleteModal(id) {
  const room = state.rooms.find((r) => r.id === id);
  if (!room) return;

  state.deleteTargetId = id;
  dom.deleteRoomName.textContent = room.title;
  openModal(dom.deleteModal);
}

/** Confirm deletion */
function handleConfirmDelete() {
  if (state.deleteTargetId) {
    deleteRoom(state.deleteTargetId);
    state.deleteTargetId = null;
    closeModal(dom.deleteModal);
  }
}

/** Public search input handler */
function handlePublicSearch() {
  state.searchQuery = dom.searchInput.value;
  renderPublicListings();
}

/** Public city filter handler */
function handlePublicCityFilter() {
  state.cityFilter = dom.cityFilter.value;
  renderPublicListings();
}

/** Admin search input handler */
function handleAdminSearch() {
  state.adminSearch = dom.adminSearchInput.value;
  renderAdminListings();
}

/** Admin city filter handler */
function handleAdminCityFilter() {
  state.adminCityFilter = dom.adminCityFilter.value;
  renderAdminListings();
}

/** Admin sort handler */
function handleAdminSort() {
  state.adminSort = dom.adminSort.value;
  renderAdminListings();
}

/** Contact form submission */
function handleContactSubmit(e) {
  e.preventDefault();

  const validations = [
    validateField(dom.contactName, 'contact-name-error'),
    validateField(dom.contactEmail, 'contact-email-error'),
    validateField(dom.contactMessage, 'contact-message-error'),
  ];

  if (validations.includes(false)) return;

  // Capture inquiry object
  const inquiry = {
    id: `inquiry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    name: dom.contactName.value.trim(),
    email: dom.contactEmail.value.trim(),
    message: dom.contactMessage.value.trim()
  };
  
  state.inquiries.push(inquiry);
  saveInquiries();
  
  // Trigger UI response
  dom.contactForm.hidden = true;
  dom.contactSuccess.hidden = false;
  dom.contactForm.reset();
  
  renderInquiries();
  updateStatistics();
  showToast('Message sent successfully!');

  setTimeout(() => {
    dom.contactForm.hidden = false;
    dom.contactSuccess.hidden = true;
  }, 5000);
}

/** ESC key handler — close topmost modal */
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    // Close in reverse z-index order
    if (!dom.deleteModal.hidden) {
      closeModal(dom.deleteModal);
    } else if (!dom.editModal.hidden) {
      closeModal(dom.editModal);
    } else if (!dom.dashboardModal.hidden) {
      closeModal(dom.dashboardModal);
    } else if (!dom.loginModal.hidden) {
      closeModal(dom.loginModal);
    }
  }
}

/** Click outside modal content to close */
function handleOverlayClick(e) {
  if (e.target === dom.loginModal) closeModal(dom.loginModal);
  if (e.target === dom.dashboardModal) closeModal(dom.dashboardModal);
  if (e.target === dom.editModal) closeModal(dom.editModal);
  if (e.target === dom.deleteModal) closeModal(dom.deleteModal);
}

/** Footer city links — filter public listings by city */
function handleCityLink(e) {
  const cityLink = e.target.closest('[data-city-link]');
  if (!cityLink) return;

  const city = cityLink.dataset.cityLink;
  dom.cityFilter.value = city;
  state.cityFilter = city;
  renderPublicListings();
}

/* ============================================
   14. EVENT BINDING (single setup, no duplicates)
   ============================================ */

function bindEvents() {
  // ---- Scroll events (passive) ----
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  window.addEventListener('scroll', handleActiveNav, { passive: true });

  // ---- Navigation ----
  dom.navToggle.addEventListener('click', handleNavToggle);

  // Close mobile nav on link click
  dom.primaryNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      dom.primaryNav.classList.remove('open');
      dom.navToggle.classList.remove('active');
      dom.navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ---- Admin Portal ----
  dom.adminPortalBtn.addEventListener('click', handleAdminPortalClick);

  // ---- Login Modal ----
  dom.loginModalClose.addEventListener('click', () => closeModal(dom.loginModal));
  dom.loginForm.addEventListener('submit', handleLogin);

  // ---- Dashboard Modal ----
  dom.dashboardModalClose.addEventListener('click', () => closeModal(dom.dashboardModal));
  dom.dashboardLogoutBtn.addEventListener('click', logout);

  // ---- Add Listing Form ----
  dom.listingForm.addEventListener('submit', handleAddListingSubmit);

  // Image preview for add form
  dom.listingImage.addEventListener(
    'input',
    debounce(() => {
      updateImagePreview(dom.listingImage.value, dom.addImagePreview, dom.addImagePreviewImg);
    }, 400)
  );

  // ---- Admin Table — Event Delegation for Edit / Delete / Toggle Status ----
  dom.adminTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'edit') handleOpenEditModal(id);
    if (action === 'delete') handleOpenDeleteModal(id);
    
    if (action === 'toggle-status') {
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.status = room.status === 'Rented' ? 'Available' : 'Rented';
        saveRooms();
        renderAdminListings();
        renderPublicListings();
        updateStatistics();
        showToast(`"${room.title}" marked as ${room.status}.`, room.status === 'Rented' ? 'warning' : 'success');
      }
    }
  });

  // ---- Inquiries Table Delegation ----
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
  if (inquiriesTableBody) {
    inquiriesTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="resolve-inquiry"]');
      if (!btn) return;
      
      const id = btn.dataset.id;
      const index = state.inquiries.findIndex((inq) => inq.id === id);
      if (index === -1) return;
      
      const senderName = state.inquiries[index].name;
      state.inquiries.splice(index, 1);
      saveInquiries();
      
      renderInquiries();
      updateStatistics();
      showToast(`Inquiry from "${senderName}" resolved.`, 'success');
    });
  }
  
  // ---- Admin Dashboard Tab Switching ----
  if (dom.dashboardTabs) {
    dom.dashboardTabs.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[role="tab"]');
      if (!tabBtn) return;
      
      const tabId = tabBtn.id === 'tab-listings' ? 'listings' : 'inquiries';
      switchTab(tabId);
    });
  }

  // ---- Admin Search / Filter / Sort ----
  dom.adminSearchInput.addEventListener('input', debounce(handleAdminSearch, 200));
  dom.adminCityFilter.addEventListener('change', handleAdminCityFilter);
  dom.adminSort.addEventListener('change', handleAdminSort);

  // ---- Edit Modal ----
  dom.editModalClose.addEventListener('click', () => closeModal(dom.editModal));
  dom.editCancelBtn.addEventListener('click', () => closeModal(dom.editModal));
  dom.editForm.addEventListener('submit', handleEditSubmit);

  // Image preview for edit form
  dom.editImage.addEventListener(
    'input',
    debounce(() => {
      updateImagePreview(dom.editImage.value, dom.editImagePreview, dom.editImagePreviewImg);
    }, 400)
  );

  // ---- Delete Confirmation Modal ----
  dom.deleteCancelBtn.addEventListener('click', () => closeModal(dom.deleteModal));
  dom.deleteConfirmBtn.addEventListener('click', handleConfirmDelete);

  // ---- Room Card Inquiry Delegation ----
  dom.listingsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="inquire"]');
    if (!btn) return;
    
    const title = btn.dataset.title;
    const city = btn.dataset.city;
    
    // Smooth scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Fill message and focus name
    setTimeout(() => {
      dom.contactName.focus();
      dom.contactMessage.value = `Hi, I am interested in renting the room: "${title}" in ${city}. Please let me know the availability and how we can proceed with a viewing. Thank you!`;
    }, 400); // minor delay to let scroll finish
    
    showToast(`Inquiry loaded for "${title}".`);
  });

  // ---- Public Search & Filter ----
  dom.searchInput.addEventListener('input', debounce(handlePublicSearch, 200));
  dom.cityFilter.addEventListener('change', handlePublicCityFilter);

  // ---- Contact Form ----
  dom.contactForm.addEventListener('submit', handleContactSubmit);

  // ---- Global Keyboard ----
  document.addEventListener('keydown', handleKeyDown);

  // ---- Click outside modals ----
  dom.loginModal.addEventListener('click', handleOverlayClick);
  dom.dashboardModal.addEventListener('click', handleOverlayClick);
  dom.editModal.addEventListener('click', handleOverlayClick);
  dom.deleteModal.addEventListener('click', handleOverlayClick);

  // ---- Footer city links (delegation) ----
  document.getElementById('site-footer').addEventListener('click', handleCityLink);

  // ---- New CTAs / Footer links ----
  const heroSecondaryBtn = document.getElementById('hero-secondary-btn');
  if (heroSecondaryBtn) {
    heroSecondaryBtn.addEventListener('click', handleAdminPortalClick);
  }

  const footerAdminLink = document.getElementById('footer-admin-link');
  if (footerAdminLink) {
    footerAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      handleAdminPortalClick();
    });
  }
}

/* ============================================
   15. SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );

  // Expose observer globally for dynamic room cards
  window.listingsObserver = observer;

  // Observe all static elements with reveal class
  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
}

/* ============================================
   16. INITIALIZATION
   ============================================ */

function init() {
  // 1. Load rooms and inquiries
  const storedRooms = loadRooms();
  state.rooms = storedRooms || SEED_DATA.map((room) => ({ ...room }));
  
  // Ensure status field is initialized for all listings
  state.rooms.forEach((room) => {
    if (!room.status) room.status = 'Available';
  });

  // Persist seed data on first visit
  if (!storedRooms) {
    saveRooms();
  }

  const storedInquiries = loadInquiries();
  state.inquiries = storedInquiries || [];

  // 2. Restore admin session from localStorage
  if (checkSession()) {
    state.isLoggedIn = true;
    updateAdminButton();
  }

  // 3. Bind all event listeners (single setup)
  bindEvents();

  // 4. Render initial public listings
  renderPublicListings();

  // 5. Initialize scroll animations
  initScrollAnimations();

  // 6. Set initial header state
  handleHeaderScroll();

  // 7. Initialize hero statistics counters
  initStatsCounters();

  // 8. Set dynamic copyright year in footer
  const copyrightEl = document.querySelector('.footer-bottom p');
  if (copyrightEl) {
    copyrightEl.innerHTML = `&copy; ${new Date().getFullYear()} KothaFinder Nepal. All Rights Reserved.`;
  }
}

/**
 * Animate numbers inside stats cards with high performance requestAnimationFrame.
 */
function animateCounter(id, start, end, duration, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    el.innerHTML = `${value}<span class="hero-stat-suffix">${suffix}</span>`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initStatsCounters() {
  animateCounter('counter-listings', 0, state.rooms.length, 1200, '');
  animateCounter('counter-cities', 0, 5, 1000, '+');

  // Animate commission down from 10% to 0%
  const brokerEl = document.getElementById('counter-broker');
  if (brokerEl) {
    const startTime = performance.now();
    const duration = 1200;
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.max(0, Math.floor(10 - progress * 10));
      brokerEl.innerHTML = `${value}<span class="hero-stat-suffix">%</span>`;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

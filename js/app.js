/* 
  Vanilla JavaScript Application State & Interactions
  Expertly architected for dynamic state management, event delegation, and accessible DOM manipulation.
*/

// --- State Database ---
const APP_STATE = {
  activeCategory: 'all',
  likedItemsCount: 0,
  likedItemsSet: new Set(),
  items: []
};

// --- DOM References ---
const DOM = {
  mobileMenuBtn: document.getElementById('menu-toggle-btn'),
  sidebar: document.getElementById('app-sidebar'),
  cardGrid: document.getElementById('main-content-grid'),
  filterContainer: document.getElementById('filter-chips-container'),
  likesCounter: document.getElementById('likes-count-badge'),
  modalOverlay: document.getElementById('details-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalTitle: document.getElementById('modal-card-title'),
  modalCategory: document.getElementById('modal-card-category'),
  modalDescription: document.getElementById('modal-card-desc'),
  modalBodyContent: document.getElementById('modal-card-body-content'),
  sidebarButtons: document.querySelectorAll('.sidebar-btn'),
  navLinks: document.querySelectorAll('.nav-link')
};

// --- Fetch API ---
async function fetchLiveArticles() {
  try {
    const response = await fetch('http://localhost:3000/articles');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsedData = await response.json();
    console.log("Backend Response:", parsedData);

    // Safely assign the array and normalize the data keys
    if (parsedData && parsedData.data && Array.isArray(parsedData.data.articles)) {
      APP_STATE.items = parsedData.data.articles.map((article, index) => ({
        id: article.id || index + 1,
        title: article.title || 'Untitled Article',
        category: article.category || 'development',
        badge: article.badge || 'Live',
        // Fallback checks for mismatched backend keys
        description: article.description || article.body || 'No description provided.',
        authorName: article.author || article.authorName || 'Decode Developer',
        authorInitials: (article.author || article.authorName || 'DD').substring(0, 2).toUpperCase(),
        // Provide a default pristine image if the backend didn't send one
        image: article.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
        altText: article.altText || 'Article thumbnail'
      }));
    } else {
      APP_STATE.items = [];
    }

  } catch (error) {
    console.error('Failed to fetch live articles:', error);
    if (DOM.cardGrid) {
      DOM.cardGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: var(--space-xl) var(--space-md); color: var(--color-slate-grey);">Unable to establish connection to the server.</div>';
    }
  }

  // The Fallback Safety
  if (!Array.isArray(APP_STATE.items)) {
    APP_STATE.items = [];
  }
}

// --- Initializer ---
document.addEventListener('DOMContentLoaded', async () => {
  initMobileMenu();
  initSidebar();
  initNav();
  initModal();

  await fetchLiveArticles();

  initFilters();
  renderInitialCards();
});

// --- Mobile Sidebar Toggle Menu ---
function initMobileMenu() {
  if (DOM.mobileMenuBtn && DOM.sidebar) {
    DOM.mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = DOM.sidebar.classList.toggle('active-drawer');
      DOM.mobileMenuBtn.classList.toggle('active');
      DOM.mobileMenuBtn.setAttribute('aria-expanded', String(isActive));
    });

    // Close mobile drawer when clicking anywhere outside sidebar
    document.addEventListener('click', (e) => {
      if (
        DOM.sidebar.classList.contains('active-drawer') &&
        !DOM.sidebar.contains(e.target) &&
        !DOM.mobileMenuBtn.contains(e.target)
      ) {
        DOM.sidebar.classList.remove('active-drawer');
        DOM.mobileMenuBtn.classList.remove('active');
        DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// --- Active Nav Handler ---
function initNav() {
  DOM.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      DOM.navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Mirror filtering logic if category matches navigation target
      const category = link.getAttribute('data-nav-category');
      if (category) {
        updateCategoryFilter(category);
      }
    });
  });
}

// --- Sidebar Menu Handler ---
function initSidebar() {
  DOM.sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-sidebar-category');
      if (category) {
        updateCategoryFilter(category);
      }

      // Auto collapse sidebar drawer on mobile after selection
      if (window.innerWidth < 768) {
        DOM.sidebar.classList.remove('active');
        DOM.mobileMenuBtn.classList.remove('active');
        DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// --- Filter Chip Controls ---
function initFilters() {
  if (DOM.filterContainer) {
    // Generate chips dynamically
    const categories = ['all', 'design', 'development', 'strategy'];
    DOM.filterContainer.innerHTML = categories.map(cat => `
      <button class="filter-chip ${cat === APP_STATE.activeCategory ? 'active' : ''}" data-category="${cat}">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    // Event delegation for chips click
    DOM.filterContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      const category = chip.getAttribute('data-category');
      updateCategoryFilter(category);
    });
  }
}

// --- Sync Category Filters Across UI Components ---
function updateCategoryFilter(category) {
  APP_STATE.activeCategory = category;

  // Sync active state in Filter Chips
  if (DOM.filterContainer) {
    const chips = DOM.filterContainer.querySelectorAll('.filter-chip');
    chips.forEach(c => {
      if (c.getAttribute('data-category') === category) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  // Sync active state in Sidebar Buttons
  DOM.sidebarButtons.forEach(b => {
    if (b.getAttribute('data-sidebar-category') === category) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Sync active state in Header Navigation Links
  DOM.navLinks.forEach(l => {
    if (l.getAttribute('data-nav-category') === category) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  filterDomCards();
}

// --- Card Rendering & Event Binding ---
function renderInitialCards() {
  if (!DOM.cardGrid) return;

  DOM.cardGrid.innerHTML = APP_STATE.items.map(item => {
    const isLiked = APP_STATE.likedItemsSet.has(item.id);
    return `
      <article class="content-card" data-id="${item.id}" data-category="${item.category}">
        <figure class="card-header-img">
          <img src="${item.image}" alt="${item.altText}" loading="lazy">
          <span class="card-badge">${item.badge}</span>
        </figure>
        <div class="card-body">
          <span class="card-category">${item.category}</span>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-description">${item.description}</p>
        </div>
        <div class="card-footer">
          <div class="card-author">
            <div class="author-avatar">${item.authorInitials}</div>
            <span class="author-name">${item.authorName}</span>
          </div>
          <div style="display: flex; gap: var(--space-xs); align-items: center;">
            <button class="btn-icon card-like-btn" aria-label="${isLiked ? 'Unlike' : 'Like'} this article" data-liked="${isLiked}" aria-live="polite">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'var(--color-mocha-mousse)' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button class="btn-secondary card-read-btn">Explore</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind local event listeners to dynamic elements (using event delegation for efficiency)
  bindCardInteractions();
  triggerCardCascade();
}

// --- DOM Iteration Card Filtering ---
function filterDomCards() {
  const cards = DOM.cardGrid.querySelectorAll('.content-card');
  let visibleIndex = 0;
  let hasVisible = false;

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');

    if (APP_STATE.activeCategory === 'all' || cardCategory === APP_STATE.activeCategory) {
      card.style.display = 'flex';
      hasVisible = true;
      // Re-trigger animation
      card.classList.remove('animate-in');
      setTimeout(() => {
        card.classList.add('animate-in');
      }, visibleIndex * 100);
      visibleIndex++;
    } else {
      card.style.display = 'none';
      card.classList.remove('animate-in');
    }
  });

  // Handle empty state gracefully
  const emptyStateEl = document.getElementById('empty-state-msg');
  if (!hasVisible) {
    if (!emptyStateEl) {
      const msg = document.createElement('div');
      msg.id = 'empty-state-msg';
      msg.style.gridColumn = '1 / -1';
      msg.style.textAlign = 'center';
      msg.style.padding = 'var(--space-xl) var(--space-md)';
      msg.innerHTML = '<p style="color: var(--color-slate-grey);">No articles found in this category.</p>';
      DOM.cardGrid.appendChild(msg);
    }
  } else if (emptyStateEl) {
    emptyStateEl.remove();
  }
}

// --- Cascading Entrance Animation ---
function triggerCardCascade() {
  const cards = DOM.cardGrid.querySelectorAll('.content-card');
  cards.forEach((card, index) => {
    // Progressively delay the entrance to create a cascade
    setTimeout(() => {
      card.classList.add('animate-in');
    }, index * 100);
  });
}

// --- Card Button Event Listeners ---
function bindCardInteractions() {
  const cards = DOM.cardGrid.querySelectorAll('.content-card');

  cards.forEach(card => {
    const cardId = parseInt(card.getAttribute('data-id'));
    const likeBtn = card.querySelector('.card-like-btn');
    const readBtn = card.querySelector('.card-read-btn');

    // Heart Like Trigger
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLikeState(cardId, likeBtn);
    });

    // Modal Trigger
    readBtn.addEventListener('click', () => {
      openDetailsModal(cardId);
    });
  });
}

// --- Heart Like State Logic ---
function toggleLikeState(cardId, buttonEl) {
  const svgEl = buttonEl.querySelector('svg');
  if (APP_STATE.likedItemsSet.has(cardId)) {
    // Unlike
    APP_STATE.likedItemsSet.delete(cardId);
    buttonEl.setAttribute('data-liked', 'false');
    buttonEl.setAttribute('aria-label', 'Like this article');
    svgEl.setAttribute('fill', 'none');
    APP_STATE.likedItemsCount--;
  } else {
    // Like
    APP_STATE.likedItemsSet.add(cardId);
    buttonEl.setAttribute('data-liked', 'true');
    buttonEl.setAttribute('aria-label', 'Unlike this article');
    svgEl.setAttribute('fill', 'var(--color-mocha-mousse)');
    APP_STATE.likedItemsCount++;
  }

  // Update navbar indicator
  if (DOM.likesCounter) {
    DOM.likesCounter.textContent = APP_STATE.likedItemsCount;
    if (APP_STATE.likedItemsCount > 0) {
      DOM.likesCounter.style.display = 'inline-flex';
      // Subtle badge highlight scale animation
      DOM.likesCounter.style.transform = 'scale(1.2)';
      setTimeout(() => {
        DOM.likesCounter.style.transform = 'scale(1)';
      }, 200);
    } else {
      DOM.likesCounter.style.display = 'none';
    }
  }
}

// --- Detail Modal Overlay Engine ---
let previouslyFocusedElement = null;

function initModal() {
  if (DOM.modalCloseBtn && DOM.modalOverlay) {
    // Close button
    DOM.modalCloseBtn.addEventListener('click', closeDetailsModal);

    // Backdrop click — dismiss when clicking outside the modal box
    DOM.modalOverlay.addEventListener('click', (e) => {
      if (e.target === DOM.modalOverlay) {
        closeDetailsModal();
      }
    });

    // Keyboard ESC bind
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.modalOverlay.classList.contains('active')) {
        closeDetailsModal();
      }
    });
  }
}

function openDetailsModal(cardId) {
  const item = APP_STATE.items.find(i => i.id === cardId);
  if (!item) return;

  // Store the element that triggered the modal for focus restoration
  previouslyFocusedElement = document.activeElement;

  DOM.modalTitle.textContent = item.title;
  DOM.modalCategory.textContent = item.category.toUpperCase();
  DOM.modalDescription.textContent = item.description;
  DOM.modalBodyContent.innerHTML = `
    <figure style="height: 120px; border-radius: var(--radius-md); margin-bottom: var(--space-md); overflow: hidden; margin-top: 0; margin-left: 0; margin-right: 0;">
      <img src="${item.image}" alt="${item.altText}" style="width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.85;">
    </figure>
    <p style="font-size: var(--font-sm); color: var(--color-slate-grey);">
      This represents a highly accessible detail window. The layout remains clean, maintaining the exact typography scale and palette.
      By utilizing native HTML landmarks and vanilla interactive elements, the browser ensures optimal paint performance, SEO indexability, 
      and strict screen-reader structure mapping.
    </p>
    <div style="display: flex; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
      <div class="author-avatar">${item.authorInitials}</div>
      <div>
        <p style="font-size: var(--font-sm); font-weight: var(--weight-bold); margin: 0;">Written by ${item.authorName}</p>
        <p style="font-size: var(--font-xs); color: var(--color-slate-grey); margin: 0;">Senior Architecture Analyst</p>
      </div>
    </div>
  `;

  // Show overlay first (display: flex), then animate in on next frame
  DOM.modalOverlay.style.display = 'flex';
  requestAnimationFrame(() => {
    DOM.modalOverlay.classList.add('active');
  });
  DOM.modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock background scroll
  DOM.modalCloseBtn.focus(); // Shift keyboard focus for accessibility
}

function closeDetailsModal() {
  DOM.modalOverlay.classList.remove('active');
  DOM.modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Release background scroll

  // Wait for the CSS transition to finish before hiding with display: none
  DOM.modalOverlay.addEventListener('transitionend', function handler() {
    if (!DOM.modalOverlay.classList.contains('active')) {
      DOM.modalOverlay.style.display = 'none';
    }
    DOM.modalOverlay.removeEventListener('transitionend', handler);
  });

  // Restore focus to the element that originally triggered the modal
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

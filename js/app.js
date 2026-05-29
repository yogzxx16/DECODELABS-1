/* 
  Vanilla JavaScript Application State & Interactions
  Expertly architected for dynamic state management, event delegation, and accessible DOM manipulation.
*/

// --- State Database ---
const APP_STATE = {
  activeCategory: 'all',
  likedItemsCount: 0,
  likedItemsSet: new Set(),
  items: [
    {
      id: 1,
      title: 'Architecting for 2025: Grounded Aesthetics',
      category: 'design',
      badge: 'Trending',
      description: 'Explore the shifting landscape of digital design, moving away from hyper-minimalist white spaces towards grounded, rich earthly hues like mocha mousse coupled with fluid layouts.',
      authorName: 'A. Architect',
      authorInitials: 'AA',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop',
      altText: 'Modern minimalist architecture featuring warm earthly tones and fluid structures.'
    },
    {
      id: 2,
      title: 'Framework-less Craftsmanship with Vanilla JS',
      category: 'development',
      badge: 'New',
      description: 'How to build highly scalable, ultra-fast, and deeply responsive digital products utilizing only native browser mechanisms, grid foundations, and semantic strategies.',
      authorName: 'C. Developer',
      authorInitials: 'CD',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
      altText: 'A high-end workspace setup with code visible on a sleek monitor.'
    },
    {
      id: 3,
      title: 'Productive Strategy for Modern Interfaces',
      category: 'strategy',
      badge: 'Guide',
      description: 'A deep-dive analysis of macro layouts versus micro layouts and how to optimize user interaction structures using screen-reader compliance blueprints and solid WCAG principles.',
      authorName: 'E. Planner',
      authorInitials: 'EP',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
      altText: 'Strategic planning and abstract diagrams laid out on a professional desk.'
    },
    {
      id: 4,
      title: 'Responsive Fluid Scales and Clamp Calculations',
      category: 'design',
      badge: 'Hot',
      description: 'Master the math behind fluid typography and dynamic spacing. Ensure flawless alignment, crisp scaling, and natural visual hierarchy without breaking layouts across mobile and widescreen monitors.',
      authorName: 'M. Designer',
      authorInitials: 'MD',
      // I swapped the broken URL for a stable, highly abstract architectural image
      // A softer, more realistic architectural image to match the grounded aesthetic
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
      altText: 'Abstract architectural fluid curves demonstrating scaling concepts.'
    },
    {
      id: 5,
      title: 'Designing Accessible Tables & Landmark Trees',
      category: 'strategy',
      badge: 'WCAG',
      description: 'Understanding how assistive tech processes structural blocks. Elevate screen reader experiences through strict landmark distributions, clear descriptive labeling, and perfect keyboard hooks.',
      authorName: 'S. Engineer',
      authorInitials: 'SE',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop',
      altText: 'A person thoughtfully interacting with a clean, highly accessible workspace environment.'
    },
    {
      id: 6,
      title: 'Micro-Animations that Delight Users',
      category: 'development',
      badge: 'Interactive',
      description: 'A catalog of performance-friendly CSS transitions and micro-interactions. Create elements that feel tactile, responsive, and natural without loading massive script libraries.',
      authorName: 'T. Coder',
      authorInitials: 'TC',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
      altText: 'Abstract colorful rendering of digital micro-interactions and smooth gradients.'
    }
  ]
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

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFilters();
  initSidebar();
  initNav();
  renderInitialCards();
  initModal();
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

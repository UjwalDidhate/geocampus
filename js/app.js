/**
 * Campus Micro-Problem Mapper - Main Application Coordinator
 * Manages tabs, live feed, quick reporting flow, geofencing checks, and UI interactions.
 * Developed by Ujwal Didhate
 */

// Global State
window.currentActiveTab = 'student-map'; // 'student-map' | 'admin'
let selectedReportCategory = 'sanitation';
let selectedReportCoordinates = null;
let selectedReportBuilding = null;
let currentReportPhoto = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Initialize Map
  window.CampusMap.init('campus-map');

  // 2. Initialize Admin Dashboard
  window.AdminView.init();

  // 3. Setup Navigation & View Switching
  setupNavigation();

  // 4. Setup Live Feed Panel
  setupLiveFeed();

  // 5. Setup Quick Report Flow
  setupQuickReportModal();

  // 6. Setup Theme & Sound Toggles
  setupThemeAndPreferences();

  // 7. Setup PWA Service Worker
  registerServiceWorker();

  // 8. Subscribe to store changes to refresh feed
  window.appState.subscribe((event, data) => {
    renderLiveFeed();
  });

  // Initial feed render
  renderLiveFeed();
}

/**
 * Navigation & View Tabs
 */
function setupNavigation() {
  const tabStudent = document.getElementById('nav-tab-student');
  const tabAdmin = document.getElementById('nav-tab-admin');
  const fabReport = document.getElementById('fab-quick-report');
  const btnHeaderReport = document.getElementById('btn-header-report');

  if (tabStudent) {
    tabStudent.addEventListener('click', () => switchView('student-map'));
  }
  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => switchView('admin'));
  }
  if (fabReport) {
    fabReport.addEventListener('click', () => openQuickReportModal());
  }
  if (btnHeaderReport) {
    btnHeaderReport.addEventListener('click', () => openQuickReportModal());
  }

  // Map view controls (Heatmap vs Pin toggle)
  const modeHeatmap = document.getElementById('btn-mode-heatmap');
  const modePins = document.getElementById('btn-mode-pins');
  const modeBoth = document.getElementById('btn-mode-both');

  if (modeHeatmap && modePins && modeBoth) {
    const updateModeUI = (activeBtn) => {
      [modeHeatmap, modePins, modeBoth].forEach(btn => {
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm', 'font-bold');
        btn.classList.add('text-slate-500', 'dark:text-slate-400');
      });
      activeBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm', 'font-bold');
      activeBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
    };

    modeHeatmap.addEventListener('click', () => {
      window.soundEngine.playClick();
      updateModeUI(modeHeatmap);
      window.CampusMap.setViewMode('heatmap');
    });

    modePins.addEventListener('click', () => {
      window.soundEngine.playClick();
      updateModeUI(modePins);
      window.CampusMap.setViewMode('pins');
    });

    modeBoth.addEventListener('click', () => {
      window.soundEngine.playClick();
      updateModeUI(modeBoth);
      window.CampusMap.setViewMode('both');
    });
  }

  // Surrounding Landmarks & Villages Toggle
  const btnToggleSurrounding = document.getElementById('btn-toggle-surrounding');
  if (btnToggleSurrounding) {
    btnToggleSurrounding.addEventListener('click', () => {
      window.soundEngine.playClick();
      const isActive = window.CampusMap.toggleSurroundingLandmarks();
      if (isActive) {
        btnToggleSurrounding.classList.add('bg-indigo-50', 'dark:bg-indigo-950/60', 'text-indigo-600', 'border-indigo-200');
        btnToggleSurrounding.classList.remove('opacity-50');
        window.showToast('🏘️ Surrounding Villages & Landmarks enabled', 'info');
      } else {
        btnToggleSurrounding.classList.remove('bg-indigo-50', 'dark:bg-indigo-950/60', 'text-indigo-600', 'border-indigo-200');
        btnToggleSurrounding.classList.add('opacity-50');
        window.showToast('Surrounding Villages & Landmarks hidden', 'info');
      }
    });
  }

  // Category filter chips in map header
  document.querySelectorAll('.map-filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      window.soundEngine.playClick();
      const cat = chip.dataset.category;
      document.querySelectorAll('.map-filter-chip').forEach(c => {
        c.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/60', 'font-bold');
      });
      chip.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/60', 'font-bold');
      window.CampusMap.setFilter(cat, 'all');
      renderLiveFeed();
    });
  });

  // Admin filter inputs
  const adminSearch = document.getElementById('admin-search-input');
  const adminCat = document.getElementById('admin-cat-filter');
  const adminStatus = document.getElementById('admin-status-filter');
  const adminSort = document.getElementById('admin-sort-filter');
  const btnGenReport = document.getElementById('btn-generate-report');
  const btnExportCSV = document.getElementById('btn-export-csv');

  if (adminSearch) {
    adminSearch.addEventListener('input', (e) => {
      window.AdminView.tableSearchQuery = e.target.value;
      window.AdminView.renderTable();
    });
  }
  if (adminCat) {
    adminCat.addEventListener('change', (e) => {
      window.AdminView.tableCategoryFilter = e.target.value;
      window.AdminView.renderTable();
    });
  }
  if (adminStatus) {
    adminStatus.addEventListener('change', (e) => {
      window.AdminView.tableStatusFilter = e.target.value;
      window.AdminView.renderTable();
    });
  }
  if (adminSort) {
    adminSort.addEventListener('change', (e) => {
      window.AdminView.tableSortBy = e.target.value;
      window.AdminView.renderTable();
    });
  }
  if (btnGenReport) {
    btnGenReport.addEventListener('click', () => {
      window.soundEngine.playClick();
      window.AdminView.generateOperationsReport();
    });
  }
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      window.soundEngine.playClick();
      window.AdminView.exportCSV();
    });
  }
}

function switchView(tabName) {
  window.currentActiveTab = tabName;
  window.soundEngine.playClick();

  const studentView = document.getElementById('view-student-map');
  const adminView = document.getElementById('view-admin');
  const tabStudent = document.getElementById('nav-tab-student');
  const tabAdmin = document.getElementById('nav-tab-admin');

  if (tabName === 'student-map') {
    studentView.classList.remove('hidden');
    adminView.classList.add('hidden');

    tabStudent.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
    tabStudent.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

    tabAdmin.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
    tabAdmin.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

    setTimeout(() => {
      if (window.CampusMap && window.CampusMap.map) {
        window.CampusMap.map.invalidateSize();
      }
    }, 150);
  } else if (tabName === 'admin') {
    studentView.classList.add('hidden');
    adminView.classList.remove('hidden');

    tabAdmin.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
    tabAdmin.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

    tabStudent.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
    tabStudent.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

    window.AdminView.renderKPIs();
    window.AdminView.renderCharts();
    window.AdminView.renderTable();
  }
}

window.switchView = switchView;

/**
 * Live Feed Sidebar & Issue Cards
 */
function setupLiveFeed() {
  const feedToggleBtn = document.getElementById('btn-toggle-feed');
  const feedDrawer = document.getElementById('feed-drawer');

  if (feedToggleBtn && feedDrawer) {
    feedToggleBtn.addEventListener('click', () => {
      window.soundEngine.playClick();
      feedDrawer.classList.toggle('translate-x-full');
      const isClosed = feedDrawer.classList.contains('translate-x-full');
      feedToggleBtn.innerHTML = isClosed 
        ? `<span class="text-sm">📋</span> <span class="hidden sm:inline">Feed</span>`
        : `<span class="text-sm">✕</span> <span class="hidden sm:inline">Close</span>`;
    });
  }

  const feedSearchInput = document.getElementById('feed-search-input');
  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', () => {
      renderLiveFeed();
    });
  }

  const feedSortSelect = document.getElementById('feed-sort-select');
  if (feedSortSelect) {
    feedSortSelect.addEventListener('change', () => {
      renderLiveFeed();
    });
  }
}

function renderLiveFeed() {
  const feedList = document.getElementById('feed-issues-list');
  const countBadge = document.getElementById('feed-badge-count');
  if (!feedList) return;

  let issues = window.CampusMap ? window.CampusMap.getFilteredIssues() : window.appState.getIssues();

  // Search filter
  const searchVal = document.getElementById('feed-search-input')?.value.trim().toLowerCase();
  if (searchVal) {
    issues = issues.filter(i => 
      i.title.toLowerCase().includes(searchVal) ||
      i.note.toLowerCase().includes(searchVal) ||
      i.building.toLowerCase().includes(searchVal)
    );
  }

  // Sort
  const sortVal = document.getElementById('feed-sort-select')?.value || 'upvotes';
  if (sortVal === 'upvotes') {
    issues.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sortVal === 'recent') {
    issues.sort((a, b) => (b.reportedAt || 0) - (a.reportedAt || 0));
  }

  if (countBadge) {
    countBadge.textContent = `${issues.length} active`;
  }

  if (issues.length === 0) {
    feedList.innerHTML = `
      <div class="text-center py-12 px-4 text-slate-400">
        <div class="text-3xl mb-2">🎉</div>
        <div class="font-bold text-sm text-slate-700 dark:text-slate-300">All clear in this section!</div>
        <p class="text-xs text-slate-400 mt-1">No micro-problems reported matching your filters.</p>
      </div>
    `;
    return;
  }

  feedList.innerHTML = issues.map(issue => {
    const cat = window.CATEGORIES[issue.category] || window.CATEGORIES.infrastructure;
    const status = window.STATUS_MAP[issue.status] || window.STATUS_MAP.open;
    const timeAgo = window.CampusMap ? window.CampusMap.formatRelativeTime(issue.reportedAt) : 'recently';
    const hasVoted = Array.isArray(issue.voters) && issue.voters.includes(window.appState.userId);
    const hasVerified = Array.isArray(issue.verifiers) && issue.verifiers.includes(window.appState.userId);
    const isPendingVerif = issue.status === 'pending_verification';

    return `
      <div class="group bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2 relative">
        <!-- Top row: Category & Time -->
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cat.badgeClass}">
            <span>${cat.icon}</span> ${cat.name}
          </span>
          <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            ${timeAgo}
          </span>
        </div>

        <!-- Middle: Title, Building, Photo preview -->
        <div class="flex gap-3 items-start">
          <div class="flex-1">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white leading-snug hover:text-indigo-600 cursor-pointer" onclick="window.CampusMap.focusOnIssue('${issue.id}')">
              ${escapeHtml(issue.title)}
            </h4>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>📍 ${escapeHtml(issue.building)}</span>
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="font-medium">${escapeHtml(issue.floor || 'Ground')}</span>
            </div>
          </div>
          <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
            <img src="${issue.photoUrl}" alt="${issue.title}" class="w-full h-full object-cover" loading="lazy"/>
          </div>
        </div>

        ${issue.note ? `<p class="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic line-clamp-2">"${escapeHtml(issue.note)}"</p>` : ''}

        <!-- Status & Confirmations -->
        <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span class="px-2 py-0.5 text-[10px] font-bold rounded-full border ${status.badgeClass}">
            ${status.label}
          </span>

          <div class="flex items-center gap-1.5">
            ${isPendingVerif ? `
              <button 
                onclick="handleFeedVerify('${issue.id}')"
                class="px-2.5 py-1 rounded-md text-[11px] font-bold ${hasVerified ? 'bg-blue-100 text-blue-800 opacity-60' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'} transition-transform active:scale-95"
                ${hasVerified ? 'disabled' : ''}
              >
                ${hasVerified ? '✅ Confirmed' : `👍 Confirm Fixed (${issue.confirmations || 0}/2)`}
              </button>
            ` : ''}

            <button 
              onclick="handleFeedUpvote('${issue.id}')"
              class="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all active:scale-95 ${hasVoted ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'}"
            >
              <span>🔺</span>
              <span>${issue.upvotes || 0}</span>
            </button>

            <button 
              onclick="window.CampusMap.focusOnIssue('${issue.id}')"
              class="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Focus on Map"
            >
              🗺️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleFeedUpvote = function(issueId) {
  window.soundEngine.playUpvote();
  window.appState.upvoteIssue(issueId);
  renderLiveFeed();
};

window.handleFeedVerify = function(issueId) {
  window.soundEngine.playVerify();
  const res = window.appState.confirmResolution(issueId);
  if (res.success) {
    if (res.closed) {
      window.showToast('🎉 Issue confirmed fixed and marked Closed by community!', 'success');
    } else {
      window.showToast('👍 Fix verification registered! (1 more confirmation needed)', 'info');
    }
  } else {
    window.showToast(res.error, 'warning');
  }
  renderLiveFeed();
};

/**
 * 10-Second Quick Report Modal Flow
 */
function setupQuickReportModal() {
  const modal = document.getElementById('report-modal-dialog');
  const closeBtn = document.getElementById('btn-close-report-modal');
  const cancelBtn = document.getElementById('btn-cancel-report');
  const form = document.getElementById('form-quick-report');
  const noteInput = document.getElementById('report-note-input');
  const charCounter = document.getElementById('report-char-count');
  const btnFetchGps = document.getElementById('btn-fetch-gps');
  const btnPickMap = document.getElementById('btn-pick-map-loc');

  if (closeBtn) closeBtn.addEventListener('click', closeQuickReportModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeQuickReportModal);

  // Category Selection Chips
  document.querySelectorAll('.report-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      window.soundEngine.playClick();
      document.querySelectorAll('.report-cat-chip').forEach(c => {
        c.classList.remove('ring-4', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/60', 'scale-105');
      });
      chip.classList.add('ring-4', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/60', 'scale-105');
      selectedReportCategory = chip.dataset.category;
      updateQuickTagSuggestions();
    });
  });

  // Character Counter (Max 100 chars)
  if (noteInput && charCounter) {
    noteInput.addEventListener('input', (e) => {
      const len = e.target.value.length;
      charCounter.textContent = `${len}/100`;
      if (len >= 95) {
        charCounter.classList.add('text-rose-500', 'font-bold');
      } else {
        charCounter.classList.remove('text-rose-500', 'font-bold');
      }
    });
  }

  // GPS Simulation Trigger
  if (btnFetchGps) {
    btnFetchGps.addEventListener('click', () => {
      window.soundEngine.playClick();
      handleFetchGPS();
    });
  }

  // Pick on Map Trigger
  if (btnPickMap) {
    btnPickMap.addEventListener('click', () => {
      window.soundEngine.playClick();
      modal.classList.add('hidden');
      window.CampusMap.startPickLocationMode((lat, lng) => {
        setReportCoordinates(lat, lng);
        window.CampusMap.stopPickLocationMode();
        modal.classList.remove('hidden');
        window.showToast('📍 Coordinate selected from map', 'success');
      });
    });
  }

  // Photo Upload & Dropzone
  setupPhotoDropzone();

  // Form Submit Action
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmitReport();
    });
  }
}

function openQuickReportModal() {
  window.soundEngine.playClick();
  const modal = document.getElementById('report-modal-dialog');
  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Reset form defaults if no coordinates selected
  if (!selectedReportCoordinates) {
    handleFetchGPS(); // default fetch simulated campus point
  }

  updateQuickTagSuggestions();
}

function closeQuickReportModal() {
  const modal = document.getElementById('report-modal-dialog');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  window.CampusMap.stopPickLocationMode();
}

function updateQuickTagSuggestions() {
  const tagContainer = document.getElementById('quick-tag-suggestions');
  if (!tagContainer) return;

  const cat = window.CATEGORIES[selectedReportCategory] || window.CATEGORIES.infrastructure;
  tagContainer.innerHTML = cat.quickTags.map(tag => `
    <button 
      type="button" 
      class="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 transition-colors font-medium"
      onclick="applyQuickTag('${escapeHtml(tag)}')"
    >
      + ${escapeHtml(tag)}
    </button>
  `).join('');
}

window.applyQuickTag = function(tag) {
  window.soundEngine.playClick();
  const noteInput = document.getElementById('report-note-input');
  if (noteInput) {
    noteInput.value = tag;
    document.getElementById('report-char-count').textContent = `${tag.length}/100`;
  }
};

function handleFetchGPS() {
  const btn = document.getElementById('btn-fetch-gps');
  if (btn) btn.innerHTML = `<span>⏳</span> <span>Locating...</span>`;

  // Simulate quick GPS acquisition with high precision inside campus
  setTimeout(() => {
    const pt = window.CampusGeofence.getRandomCampusPoint();
    setReportCoordinates(pt.lat, pt.lng);

    if (btn) btn.innerHTML = `<span>📡</span> <span>GPS Fixed (High Accuracy)</span>`;
    window.soundEngine.playSuccess();
    window.showToast(`📍 Located near ${pt.buildingName}`, 'success');
  }, 400);
}

function setReportCoordinates(lat, lng) {
  selectedReportCoordinates = { lat, lng };

  const coordBadge = document.getElementById('report-coord-display');
  const geofenceBadge = document.getElementById('report-geofence-badge');
  const duplicateAlert = document.getElementById('report-duplicate-alert');

  if (coordBadge) {
    coordBadge.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  // 1. Geofencing check
  const isInside = window.CampusGeofence.isInsideCampus(lat, lng);
  const buildingInfo = window.CampusGeofence.findNearestBuilding(lat, lng);
  selectedReportBuilding = buildingInfo.building;

  if (geofenceBadge) {
    if (isInside) {
      geofenceBadge.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
          ✅ Inside Campus (${buildingInfo.building.name})
        </span>
      `;
    } else {
      geofenceBadge.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
          ⚠️ Outside Campus Geofence Boundary
        </span>
      `;
    }
  }

  // 2. 15-meter Duplicate Detection
  const issues = window.appState.getIssues();
  const nearby = window.CampusGeofence.findNearbyIssues(lat, lng, issues, 15);

  if (duplicateAlert) {
    if (nearby.length > 0) {
      const topDuplicate = nearby[0];
      duplicateAlert.classList.remove('hidden');
      duplicateAlert.innerHTML = `
        <div class="p-3 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
          <span class="text-xl">⚠️</span>
          <div class="flex-1 text-xs">
            <div class="font-bold text-amber-900 dark:text-amber-200">
              Similar Problem Already Reported Nearby (${topDuplicate.distance}m away)!
            </div>
            <div class="text-amber-800 dark:text-amber-300 mt-0.5 line-clamp-1">
              "${escapeHtml(topDuplicate.issue.title)}"
            </div>
            <div class="mt-2 flex items-center gap-2">
              <button 
                type="button" 
                onclick="handleUpvoteExistingDuplicate('${topDuplicate.issue.id}')"
                class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all"
              >
                🔺 Upvote Existing (+1 I see this) & Close
              </button>
            </div>
          </div>
        </div>
      `;
      window.soundEngine.playWarning();
    } else {
      duplicateAlert.classList.add('hidden');
      duplicateAlert.innerHTML = '';
    }
  }
}

window.handleUpvoteExistingDuplicate = function(issueId) {
  window.soundEngine.playUpvote();
  window.appState.upvoteIssue(issueId);
  closeQuickReportModal();
  window.showToast('🎉 Upvoted existing issue nearby! Thank you for reducing duplicates.', 'success');
  window.CampusMap.focusOnIssue(issueId);
};

function setupPhotoDropzone() {
  const fileInput = document.getElementById('report-photo-input');
  const previewImg = document.getElementById('report-photo-preview');
  const dropzone = document.getElementById('report-photo-dropzone');
  const btnRemovePhoto = document.getElementById('btn-remove-photo');
  const presetSelector = document.getElementById('preset-photo-buttons');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentReportPhoto = ev.target.result;
          displayPhotoPreview(currentReportPhoto);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Drag and drop
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-500', 'bg-indigo-50/50');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentReportPhoto = ev.target.result;
          displayPhotoPreview(currentReportPhoto);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      currentReportPhoto = null;
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = '';
      document.getElementById('photo-preview-container')?.classList.add('hidden');
      document.getElementById('photo-upload-placeholder')?.classList.remove('hidden');
    });
  }
}

function displayPhotoPreview(dataUrl) {
  const previewImg = document.getElementById('report-photo-preview');
  const container = document.getElementById('photo-preview-container');
  const placeholder = document.getElementById('photo-upload-placeholder');

  if (previewImg && container && placeholder) {
    previewImg.src = dataUrl;
    container.classList.remove('hidden');
    placeholder.classList.add('hidden');
  }
}

function handleSubmitReport() {
  const noteInput = document.getElementById('report-note-input');
  const floorInput = document.getElementById('report-floor-input');
  const severitySelect = document.getElementById('report-severity-select');

  const note = noteInput ? noteInput.value.trim() : '';
  const floor = floorInput ? floorInput.value.trim() : 'Ground Floor';
  const severity = severitySelect ? severitySelect.value : 'medium';

  if (!selectedReportCoordinates) {
    handleFetchGPS();
    window.showToast('Please wait for GPS coordinates to calibrate', 'warning');
    return;
  }

  // Derive smart title
  const cat = window.CATEGORIES[selectedReportCategory];
  const title = note.length > 0 ? (note.length > 40 ? note.substring(0, 40) + '...' : note) : `${cat.name} Issue`;

  // Auto-generate photo if none uploaded
  const photo = currentReportPhoto || window.generatePhotoSVG(
    selectedReportCategory,
    title,
    selectedReportBuilding ? selectedReportBuilding.name : 'Campus Grounds'
  );

  const newIssue = window.appState.addIssue({
    title,
    category: selectedReportCategory,
    note,
    lat: selectedReportCoordinates.lat,
    lng: selectedReportCoordinates.lng,
    building: selectedReportBuilding ? selectedReportBuilding.name : 'Campus Grounds',
    buildingCode: selectedReportBuilding ? selectedReportBuilding.code : 'CAMPUS',
    floor: floor || 'Ground Floor',
    severity,
    photoUrl: photo
  });

  window.soundEngine.playSuccess();
  closeQuickReportModal();
  window.showToast('🚀 Report submitted! Heatmap recalculated instantly.', 'success');

  // Reset form
  if (noteInput) noteInput.value = '';
  document.getElementById('btn-remove-photo')?.click();

  // Focus map on newly created issue
  switchView('student-map');
  setTimeout(() => {
    window.CampusMap.focusOnIssue(newIssue.id);
  }, 200);
}

/**
 * Preferences, Dark/Light Mode, Sound
 */
function setupThemeAndPreferences() {
  const themeToggle = document.getElementById('btn-theme-toggle');
  const soundToggle = document.getElementById('btn-sound-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('campus_theme', isDark ? 'dark' : 'light');
      themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    });

    // Check stored theme or OS preference
    if (localStorage.getItem('campus_theme') === 'dark' || (!localStorage.getItem('campus_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      themeToggle.innerHTML = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      themeToggle.innerHTML = '🌙';
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      soundToggle.innerHTML = isMuted ? '🔇' : '🔔';
      window.showToast(isMuted ? 'Sound muted' : 'Sound enabled', 'info');
    });
  }
}

/**
 * Toast Notification Engine
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
    warning: 'bg-amber-900/90 border-amber-700 text-amber-100',
    info: 'bg-slate-900/90 border-slate-700 text-slate-100',
    error: 'bg-rose-900/90 border-rose-700 text-rose-100'
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    error: '❌'
  };

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-xs font-medium transition-all duration-300 transform translate-y-4 opacity-0 ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span>${icons[type] || 'ℹ️'}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto dismiss
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;

/**
 * PWA Service Worker Registration
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration note (normal in file:/// preview):', err);
      });
    });
  }
}

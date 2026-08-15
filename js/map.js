/**
 * Campus Micro-Problem Mapper - Interactive Geospatial Map Engine
 * Features permanent building labels on heatmap, surrounding villages & landmarks,
 * dynamic Leaflet.heat layer, interactive pins, and rich popups.
 * Developed by Ujwal Didhate
 */

class CampusMapEngine {
  constructor() {
    this.map = null;
    this.heatLayer = null;
    this.markersLayer = null;
    this.buildingsLayer = null;
    this.labelsLayer = null;
    this.surroundingLayer = null;
    this.boundaryLayer = null;
    this.tempMarker = null;
    this.currentViewMode = 'heatmap'; // 'heatmap' | 'pins' | 'both'
    this.activeFilterCategory = 'all';
    this.activeFilterStatus = 'all';
    this.showSurroundingLandmarks = true;
    this.isPickLocationMode = false;
    this.onLocationPickedCallback = null;
    this.markerMap = new Map(); // id -> L.marker
  }

  init(containerId = 'campus-map') {
    if (this.map) return;

    const { center, zoom, minZoom, maxZoom } = window.CampusGeofence.CONFIG;

    // Initialize Leaflet Map with crisp CartoDB Positron / OSM tiles
    this.map = L.map(containerId, {
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      zoomControl: false,
      attributionControl: false
    });

    // Create a dedicated high-priority Pane for Building & Landmark Labels so they are NEVER hidden by the heatmap
    const labelsPane = this.map.createPane('campusLabelsPane');
    labelsPane.style.zIndex = '650';
    labelsPane.style.pointerEvents = 'auto';

    // Modern styled vector tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Zoom Controls
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Layer Groups
    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.buildingsLayer = L.layerGroup().addTo(this.map);
    this.labelsLayer = L.layerGroup().addTo(this.map);
    this.surroundingLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Render Campus Boundary, Buildings, Labels & Surrounding Landmarks
    this.renderCampusPolygons();
    this.renderSurroundingLandmarks();

    // Map Click Listener
    this.map.on('click', (e) => this.handleMapClick(e));

    // Initial Render
    this.refresh();

    // State change listener
    window.appState.subscribe((event, data) => {
      this.refresh();
      if (event === 'issue_added' && data) {
        this.focusOnCoordinate(data.lat, data.lng, 18);
      }
    });

    setTimeout(() => this.map.invalidateSize(), 250);
  }

  renderCampusPolygons() {
    const { boundary, buildings } = window.CampusGeofence.CONFIG;

    // 1. Campus Boundary Polygon
    this.boundaryLayer.clearLayers();
    const boundaryPoly = L.polygon(boundary, {
      color: '#4f46e5',
      weight: 2.5,
      dashArray: '6, 8',
      fillColor: '#6366f1',
      fillOpacity: 0.04,
      smoothFactor: 1
    }).bindTooltip(
      '<div class="font-bold text-xs text-indigo-900 bg-white/95 px-2 py-0.5 rounded shadow">🏫 Campus Boundary</div>',
      { sticky: true }
    );
    this.boundaryLayer.addLayer(boundaryPoly);

    // 2. Campus Buildings & Permanent High-Visibility Labels
    this.buildingsLayer.clearLayers();
    this.labelsLayer.clearLayers();

    buildings.forEach(bldg => {
      const activeIssues = window.appState.getIssues().filter(
        i => i.buildingCode === bldg.code && (i.status === 'open' || i.status === 'in_progress')
      );
      const activeCount = activeIssues.length;

      // Building Outline Polygon
      const poly = L.polygon(bldg.polygon, {
        color: bldg.color,
        weight: 2.5,
        fillColor: bldg.color,
        fillOpacity: 0.22,
        smoothFactor: 1
      });

      const deptsList = bldg.departments.slice(0, 5).map(d => `• ${d}`).join('<br>');

      poly.bindTooltip(
        `<div class="text-xs p-1.5 max-w-[260px]">
          <div class="font-extrabold text-gray-900 flex items-center gap-1.5">
            <span>${bldg.icon || '🏛️'}</span>
            <span>${bldg.name}</span>
          </div>
          <div class="text-[11px] text-gray-500 my-1 font-mono">${deptsList}</div>
          <div class="mt-1 text-[11px] font-bold ${activeCount > 0 ? 'text-rose-600' : 'text-emerald-600'}">
            ${activeCount > 0 ? `⚠️ ${activeCount} active problem(s)` : '✅ All facilities normal'}
          </div>
        </div>`,
        { sticky: true, className: 'campus-building-tooltip' }
      );

      poly.on('click', () => {
        if (!this.isPickLocationMode) {
          this.focusOnBuilding(bldg.id);
        }
      });

      this.buildingsLayer.addLayer(poly);

      // 3. Permanent High-Contrast Label Badge Rendered in Custom Pane (Over Heatmap)
      const labelHtml = `
        <div class="building-map-label" onclick="window.CampusMap.focusOnBuilding('${bldg.id}')">
          <div class="badge-card flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-slate-300 dark:border-slate-700 shadow-xl backdrop-blur-md cursor-pointer transition-transform duration-200" style="border-left: 5px solid ${bldg.color};">
            <span class="text-base select-none leading-none">${bldg.icon || '🏛️'}</span>
            <div class="flex flex-col text-left select-none">
              <span class="font-extrabold text-xs text-slate-900 dark:text-white leading-tight tracking-tight whitespace-nowrap">
                ${bldg.shortName || bldg.name}
              </span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                  activeCount > 0 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300' 
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                }">
                  ${activeCount > 0 ? `⚠️ ${activeCount} issues` : '✅ Normal'}
                </span>
                <span class="text-[9px] text-slate-400 font-mono">${bldg.code}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const labelIcon = L.divIcon({
        html: labelHtml,
        className: 'building-label-container',
        iconSize: [180, 42],
        iconAnchor: [90, 21],
        pane: 'campusLabelsPane'
      });

      const labelMarker = L.marker(bldg.center, {
        icon: labelIcon,
        pane: 'campusLabelsPane',
        interactive: true
      });

      this.labelsLayer.addLayer(labelMarker);
    });
  }

  // Render Surrounding Villages & Major Landmarks
  renderSurroundingLandmarks() {
    this.surroundingLayer.clearLayers();

    if (!this.showSurroundingLandmarks) return;

    const { surroundingLandmarks } = window.CampusGeofence.CONFIG;

    surroundingLandmarks.forEach(lm => {
      const markerHtml = `
        <div class="surrounding-landmark-pin group cursor-pointer transition-all duration-200 hover:scale-110">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border-2 border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200">
            <span class="text-base">${lm.icon}</span>
            <div class="flex flex-col text-left">
              <span class="font-extrabold text-[11px] whitespace-nowrap text-slate-900 dark:text-white">${lm.name.split('/')[0]}</span>
              <span class="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">${lm.distanceDesc}</span>
            </div>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-indigo-600 mx-auto -mt-[1px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'surrounding-icon-wrapper',
        iconSize: [170, 40],
        iconAnchor: [85, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([lm.lat, lm.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-3 font-sans text-gray-900 dark:text-gray-100 max-w-[260px]">
          <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <span class="text-base">${lm.icon}</span>
            <span>Surrounding Landmark / Village</span>
          </div>
          <h4 class="font-extrabold text-sm mb-1 text-slate-900 dark:text-white">${escapeHtml(lm.name)}</h4>
          <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">${escapeHtml(lm.description)}</p>
          <div class="pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span class="font-bold text-indigo-600">📍 ${lm.distanceDesc}</span>
          </div>
        </div>
      `, { className: 'custom-issue-popup' });

      this.surroundingLayer.addLayer(marker);
    });
  }

  toggleSurroundingLandmarks(show = null) {
    if (show === null) {
      this.showSurroundingLandmarks = !this.showSurroundingLandmarks;
    } else {
      this.showSurroundingLandmarks = show;
    }
    this.renderSurroundingLandmarks();
    return this.showSurroundingLandmarks;
  }

  focusOnBuilding(bldgId) {
    const bldg = window.CampusGeofence.CONFIG.buildings.find(b => b.id === bldgId);
    if (!bldg) return;

    this.map.flyTo(bldg.center, 18, { duration: 0.8 });
    window.soundEngine.playClick();
    window.showToast?.(`📍 Selected: ${bldg.name}`, 'info');
  }

  setFilter(category = 'all', status = 'all') {
    this.activeFilterCategory = category;
    this.activeFilterStatus = status;
    this.refresh();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.refresh();
  }

  getFilteredIssues() {
    let list = window.appState.getIssues();

    if (this.activeFilterCategory !== 'all') {
      list = list.filter(i => i.category === this.activeFilterCategory);
    }
    if (this.activeFilterStatus !== 'all') {
      list = list.filter(i => i.status === this.activeFilterStatus);
    }

    return list;
  }

  refresh() {
    const issues = this.getFilteredIssues();
    this.renderHeatmap(issues);
    this.renderMarkers(issues);
    this.renderCampusPolygons();
    this.renderSurroundingLandmarks();
  }

  renderHeatmap(issues) {
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }

    if (this.currentViewMode !== 'heatmap' && this.currentViewMode !== 'both') {
      return;
    }

    const heatPoints = [];

    issues.forEach(i => {
      if (i.status === 'closed') return;

      let weight = i.severity === 'high' ? 0.9 : i.severity === 'medium' ? 0.6 : 0.4;
      weight += Math.min(0.8, (i.upvotes || 1) * 0.05);

      if (i.status === 'pending_verification') {
        weight *= 0.3;
      }

      heatPoints.push([i.lat, i.lng, Math.min(1.0, weight)]);
    });

    if (heatPoints.length > 0 && typeof L.heatLayer === 'function') {
      this.heatLayer = L.heatLayer(heatPoints, {
        radius: 32,
        blur: 22,
        maxZoom: 18,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
          0.2: '#10b981',
          0.45: '#eab308',
          0.7: '#f97316',
          0.9: '#ef4444',
          1.0: '#991b1b'
        }
      }).addTo(this.map);
    }
  }

  renderMarkers(issues) {
    this.markersLayer.clearLayers();
    this.markerMap.clear();

    const showMarkers = this.currentViewMode === 'pins' || this.currentViewMode === 'both' || this.currentViewMode === 'heatmap';
    if (!showMarkers) return;

    issues.forEach(issue => {
      const catConfig = window.CATEGORIES[issue.category] || window.CATEGORIES.infrastructure;
      const statusConfig = window.STATUS_MAP[issue.status] || window.STATUS_MAP.open;

      const isUrgent = issue.severity === 'high' && issue.status === 'open';
      const isPending = issue.status === 'pending_verification';

      let pinColor = statusConfig.color;
      let badgeHtml = '';

      if (isPending) {
        pinColor = '#3b82f6';
        badgeHtml = `<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-white">?</span>`;
      } else if (isUrgent) {
        badgeHtml = `<span class="animate-ping absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>`;
      }

      const iconHtml = `
        <div class="custom-map-pin group cursor-pointer relative transition-transform duration-200 hover:scale-125" data-issue-id="${issue.id}">
          <div class="pin-bubble w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background-color: ${pinColor}; box-shadow: 0 4px 12px ${pinColor}66">
            <span class="text-base leading-none select-none">${catConfig.icon}</span>
          </div>
          <div class="pin-tip w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px]" style="border-t-color: ${pinColor};"></div>
          ${badgeHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([issue.lat, issue.lng], { icon: customIcon });

      marker.bindPopup(() => this.generatePopupContent(issue), {
        maxWidth: 320,
        className: 'custom-issue-popup'
      });

      marker.on('popupopen', () => {
        this.attachPopupListeners(issue.id);
      });

      this.markersLayer.addLayer(marker);
      this.markerMap.set(issue.id, marker);
    });
  }

  generatePopupContent(issue) {
    const cat = window.CATEGORIES[issue.category] || window.CATEGORIES.infrastructure;
    const status = window.STATUS_MAP[issue.status] || window.STATUS_MAP.open;
    const timeAgo = this.formatRelativeTime(issue.reportedAt);
    const hasVoted = Array.isArray(issue.voters) && issue.voters.includes(window.appState.userId);
    const hasVerified = Array.isArray(issue.verifiers) && issue.verifiers.includes(window.appState.userId);
    const isPendingVerif = issue.status === 'pending_verification';

    return `
      <div class="p-3 font-sans text-gray-900 dark:text-gray-100 max-w-[300px]">
        <!-- Header & Category -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cat.badgeClass}">
            <span>${cat.icon}</span> ${cat.name}
          </span>
          <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            🕒 ${timeAgo}
          </span>
        </div>

        <!-- Photo preview -->
        <div class="relative w-full h-32 rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <img src="${issue.photoUrl}" alt="${issue.title}" class="w-full h-full object-cover"/>
          <span class="absolute bottom-1 right-1 text-[10px] bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded font-mono">
            ${issue.floor || 'Ground'}
          </span>
        </div>

        <!-- Title & Location -->
        <h4 class="font-bold text-sm leading-snug mb-1">${escapeHtml(issue.title)}</h4>
        <div class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mb-2">
          <span class="text-indigo-600 dark:text-indigo-400 font-bold">📍 ${issue.building}</span>
        </div>

        ${issue.note ? `<p class="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 p-2 rounded border border-gray-100 dark:border-gray-700/60 mb-2 italic">"${escapeHtml(issue.note)}"</p>` : ''}

        <!-- Status & Verification Bar -->
        <div class="flex items-center justify-between text-xs py-1.5 border-t border-b border-gray-100 dark:border-gray-800 my-2">
          <span class="font-medium text-gray-500">Status:</span>
          <span class="px-2 py-0.5 text-xs font-bold rounded-full border ${status.badgeClass}">
            ${status.label}
          </span>
        </div>

        <!-- Ground-Truth Verification banner if pending -->
        ${isPendingVerif ? `
          <div class="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-2 rounded-lg mb-2 text-center">
            <div class="text-[11px] font-semibold text-blue-800 dark:text-blue-300 mb-1">
              🛠️ Facilities marked this fixed. Did they?
            </div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 mb-1.5">
              Verified by ${issue.confirmations || 0}/2 students
            </div>
            <button 
              id="btn-verify-${issue.id}" 
              data-id="${issue.id}"
              class="w-full text-xs font-bold py-1.5 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${hasVerified ? 'opacity-60 cursor-not-allowed' : ''}"
              ${hasVerified ? 'disabled' : ''}
            >
              ${hasVerified ? '✅ You Confirmed' : '👍 Confirm Fixed (+1)'}
            </button>
          </div>
        ` : ''}

        <!-- Footer Actions: Upvote & Quick Info -->
        <div class="flex items-center justify-between gap-2 mt-2 pt-1">
          <button 
            id="btn-upvote-${issue.id}" 
            data-id="${issue.id}"
            class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm ${hasVoted ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-200 dark:border-gray-700'}"
          >
            <span class="text-sm">🔺</span>
            <span>Upvote (${issue.upvotes || 0})</span>
          </button>
          
          <button 
            class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
            title="Copy Direct Link"
            onclick="navigator.clipboard.writeText(window.location.href); alert('Issue link copied to clipboard!');"
          >
            🔗
          </button>
        </div>
      </div>
    `;
  }

  attachPopupListeners(issueId) {
    const upvoteBtn = document.getElementById(`btn-upvote-${issueId}`);
    if (upvoteBtn) {
      upvoteBtn.onclick = (e) => {
        e.stopPropagation();
        window.soundEngine.playUpvote();
        const res = window.appState.upvoteIssue(issueId);
        if (res.success) {
          const marker = this.markerMap.get(issueId);
          if (marker && marker.isPopupOpen()) {
            const issue = window.appState.getIssueById(issueId);
            marker.setPopupContent(this.generatePopupContent(issue));
            this.attachPopupListeners(issueId);
          }
        }
      };
    }

    const verifyBtn = document.getElementById(`btn-verify-${issueId}`);
    if (verifyBtn) {
      verifyBtn.onclick = (e) => {
        e.stopPropagation();
        window.soundEngine.playVerify();
        const res = window.appState.confirmResolution(issueId);
        if (res.success) {
          const marker = this.markerMap.get(issueId);
          if (res.closed) {
            this.map.closePopup();
            window.showToast?.('🎉 Problem confirmed fixed and closed by community!', 'success');
          } else {
            const issue = window.appState.getIssueById(issueId);
            if (marker && marker.isPopupOpen()) {
              marker.setPopupContent(this.generatePopupContent(issue));
              this.attachPopupListeners(issueId);
            }
            window.showToast?.('👍 Fix verified! (1 more confirmation needed)', 'info');
          }
        } else {
          window.showToast?.(res.error, 'warning');
        }
      };
    }
  }

  focusOnIssue(issueId) {
    const issue = window.appState.getIssueById(issueId);
    if (!issue) return;

    this.map.flyTo([issue.lat, issue.lng], 18, {
      duration: 1.0
    });

    setTimeout(() => {
      const marker = this.markerMap.get(issueId);
      if (marker) {
        marker.openPopup();
      }
    }, 1100);
  }

  focusOnCoordinate(lat, lng, zoom = 18) {
    this.map.flyTo([lat, lng], zoom, { duration: 0.9 });
  }

  startPickLocationMode(callback) {
    this.isPickLocationMode = true;
    this.onLocationPickedCallback = callback;
    document.getElementById('campus-map')?.classList.add('cursor-crosshair');
    window.showToast?.('📍 Click anywhere on the campus map to place your pin', 'info');
  }

  stopPickLocationMode() {
    this.isPickLocationMode = false;
    this.onLocationPickedCallback = null;
    document.getElementById('campus-map')?.classList.remove('cursor-crosshair');
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
      this.tempMarker = null;
    }
  }

  handleMapClick(e) {
    const { lat, lng } = e.latlng;

    if (this.isPickLocationMode && this.onLocationPickedCallback) {
      this.setTempPin(lat, lng);
      this.onLocationPickedCallback(lat, lng);
      return;
    }
  }

  setTempPin(lat, lng) {
    if (this.tempMarker) {
      this.tempMarker.setLatLng([lat, lng]);
    } else {
      const tempIcon = L.divIcon({
        html: `
          <div class="relative animate-bounce">
            <div class="w-10 h-10 rounded-full bg-rose-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-lg font-bold">
              📍
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600 mx-auto -mt-[1px]"></div>
          </div>
        `,
        className: 'temp-report-marker',
        iconSize: [40, 48],
        iconAnchor: [20, 48]
      });

      this.tempMarker = L.marker([lat, lng], {
        icon: tempIcon,
        draggable: true
      }).addTo(this.map);

      this.tempMarker.on('dragend', (ev) => {
        const pos = ev.target.getLatLng();
        if (this.onLocationPickedCallback) {
          this.onLocationPickedCallback(pos.lat, pos.lng);
        }
      });
    }
  }

  formatRelativeTime(timestamp) {
    if (!timestamp) return 'recently';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.CampusMap = new CampusMapEngine();

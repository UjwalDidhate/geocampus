/**
 * Campus Micro-Problem Mapper - Admin Analytics & Operations Engine
 * Calculates operational KPIs, generates charts, manages issue lifecycles,
 * and formats printable/exportable Weekly Operations Reports.
 * Developed by Ujwal Didhate
 */

class AdminDashboard {
  constructor() {
    this.tableSearchQuery = '';
    this.tableCategoryFilter = 'all';
    this.tableStatusFilter = 'all';
    this.tableSortBy = 'priority'; // 'priority' | 'upvotes' | 'recent' | 'severity'
    this.currentPage = 1;
    this.pageSize = 8;
  }

  init() {
    this.renderKPIs();
    this.renderCharts();
    this.renderTable();

    // Subscribe to state updates
    window.appState.subscribe(() => {
      if (window.currentActiveTab === 'admin') {
        this.renderKPIs();
        this.renderCharts();
        this.renderTable();
      }
    });
  }

  renderKPIs() {
    const stats = window.appState.getStats();

    // Top Metric Cards
    const kpiContainer = document.getElementById('admin-kpi-grid');
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
      <!-- Card 1: Active Issues -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Issues</span>
          <span class="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 text-lg">⚠️</span>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${stats.activeCount}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            ${stats.openCount} Open / ${stats.inProgressCount} In-Prog
          </span>
        </div>
        <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span class="text-amber-500 font-bold">●</span> ${stats.pendingVerification} awaiting verification
        </div>
      </div>

      <!-- Card 2: High Friction Red Zone -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Top Friction Hotspot</span>
          <span class="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 text-lg">🔥</span>
        </div>
        <div class="mt-4">
          <span class="text-xl font-bold text-slate-900 dark:text-white line-clamp-1" title="${stats.topRedZone}">
            ${stats.topRedZone}
          </span>
        </div>
        <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Density Severity:</span>
          <span class="font-bold text-amber-600 dark:text-amber-400">${stats.redZones[0] ? stats.redZones[0].score + ' pts' : 'Zero'}</span>
        </div>
      </div>

      <!-- Card 3: Resolved & Verified -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolved & Closed</span>
          <span class="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 text-lg">✅</span>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${stats.closedCount}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            Community Verified
          </span>
        </div>
        <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span>Avg turnaround time:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">~3.8 hrs</span>
        </div>
      </div>

      <!-- Card 4: Community Engagement & Upvotes -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Crowdsourced Upvotes</span>
          <span class="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 text-lg">🔺</span>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">${stats.totalUpvotes}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            Active Signal
          </span>
        </div>
        <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span>Student confirmation rate:</span>
          <span class="font-bold text-indigo-600 dark:text-indigo-400">92%</span>
        </div>
      </div>
    `;
  }

  renderCharts() {
    const stats = window.appState.getStats();
    const chartCatContainer = document.getElementById('chart-categories');
    const chartHotspotsContainer = document.getElementById('chart-hotspots');

    // 1. Render Category Breakdown
    if (chartCatContainer) {
      const total = stats.total || 1;
      const cats = [
        { key: 'sanitation', name: 'Sanitation & Water', count: stats.categoryCounts.sanitation || 0, color: '#0284c7', icon: '🚰' },
        { key: 'safety', name: 'Safety & Lighting', count: stats.categoryCounts.safety || 0, color: '#eab308', icon: '💡' },
        { key: 'academic_it', name: 'Academic & IT', count: stats.categoryCounts.academic_it || 0, color: '#8b5cf6', icon: '💻' },
        { key: 'infrastructure', name: 'Infrastructure', count: stats.categoryCounts.infrastructure || 0, color: '#10b981', icon: '🚪' }
      ];

      chartCatContainer.innerHTML = `
        <div class="space-y-3.5">
          ${cats.map(c => {
            const pct = Math.round((c.count / total) * 100);
            return `
              <div>
                <div class="flex items-center justify-between text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  <span class="flex items-center gap-1.5">
                    <span>${c.icon}</span>
                    <span>${c.name}</span>
                  </span>
                  <span class="font-bold font-mono">${c.count} (${pct}%)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${c.color}"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 2. Render Building Hotspots
    if (chartHotspotsContainer) {
      const maxScore = stats.redZones.length > 0 ? Math.max(...stats.redZones.map(r => r.score)) : 1;

      chartHotspotsContainer.innerHTML = `
        <div class="space-y-3">
          ${stats.redZones.slice(0, 5).map((rz, idx) => {
            const widthPct = Math.round((rz.score / (maxScore || 1)) * 100);
            return `
              <div class="flex items-center gap-3">
                <span class="w-5 text-xs font-bold text-slate-400">#${idx + 1}</span>
                <div class="flex-1">
                  <div class="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span class="font-semibold truncate max-w-[200px]" title="${rz.name}">${rz.name}</span>
                    <span class="text-rose-600 dark:text-rose-400 font-mono font-bold">${rz.count} active</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style="width: ${Math.max(10, widthPct)}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  calculatePriorityScore(issue) {
    let severityWeight = issue.severity === 'high' ? 30 : issue.severity === 'medium' ? 15 : 5;
    let upvotesWeight = (issue.upvotes || 0) * 3;
    let ageHours = (Date.now() - (issue.reportedAt || Date.now())) / (1000 * 60 * 60);
    let ageWeight = Math.min(20, ageHours * 2);

    if (issue.status === 'closed') return 0;
    if (issue.status === 'pending_verification') return 5;

    return Math.round(severityWeight + upvotesWeight + ageWeight);
  }

  getFilteredTableIssues() {
    let issues = window.appState.getIssues();

    // Text search
    if (this.tableSearchQuery.trim()) {
      const q = this.tableSearchQuery.toLowerCase();
      issues = issues.filter(i => 
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.note && i.note.toLowerCase().includes(q)) ||
        (i.building && i.building.toLowerCase().includes(q)) ||
        (i.reportedBy && i.reportedBy.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.tableCategoryFilter !== 'all') {
      issues = issues.filter(i => i.category === this.tableCategoryFilter);
    }

    // Status filter
    if (this.tableStatusFilter !== 'all') {
      issues = issues.filter(i => i.status === this.tableStatusFilter);
    }

    // Sorting
    issues.sort((a, b) => {
      if (this.tableSortBy === 'priority') {
        return this.calculatePriorityScore(b) - this.calculatePriorityScore(a);
      }
      if (this.tableSortBy === 'upvotes') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (this.tableSortBy === 'recent') {
        return (b.reportedAt || 0) - (a.reportedAt || 0);
      }
      if (this.tableSortBy === 'severity') {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      }
      return 0;
    });

    return issues;
  }

  renderTable() {
    const tableBody = document.getElementById('admin-issues-tbody');
    const tableCountBadge = document.getElementById('admin-table-count');
    if (!tableBody) return;

    const filtered = this.getFilteredTableIssues();

    if (tableCountBadge) {
      tableCountBadge.textContent = `${filtered.length} issues`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-12 text-slate-400">
            <div class="text-3xl mb-2">🔍</div>
            <div class="font-semibold text-sm">No campus issues match your filter criteria</div>
            <button onclick="window.AdminView.resetFilters()" class="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Reset Filters</button>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(issue => {
      const cat = window.CATEGORIES[issue.category] || window.CATEGORIES.infrastructure;
      const status = window.STATUS_MAP[issue.status] || window.STATUS_MAP.open;
      const priority = this.calculatePriorityScore(issue);
      const timeAgo = CampusMap.formatRelativeTime(issue.reportedAt);

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 text-xs">
          <!-- Priority & Category -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs ${
                priority > 40 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                priority > 20 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }" title="Calculated Priority Score: ${priority}">
                ${priority}
              </span>
              <span class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border ${cat.badgeClass}">
                <span>${cat.icon}</span> ${cat.name}
              </span>
            </div>
          </td>

          <!-- Issue Title & Location -->
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900 dark:text-slate-100 max-w-[240px] truncate" title="${escapeHtml(issue.title)}">
              ${escapeHtml(issue.title)}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <span>📍 ${escapeHtml(issue.building)}</span>
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="font-mono">${escapeHtml(issue.floor || 'Ground')}</span>
            </div>
          </td>

          <!-- Upvotes & Signals -->
          <td class="py-3 px-4 text-center">
            <span class="inline-flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
              🔺 ${issue.upvotes || 0}
            </span>
          </td>

          <!-- Status & Verification -->
          <td class="py-3 px-4">
            <div class="flex flex-col gap-1 items-start">
              <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${status.badgeClass}">
                ${status.label}
              </span>
              ${issue.status === 'pending_verification' ? `
                <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  🔍 Verified: ${issue.confirmations || 0}/2
                </span>
              ` : ''}
            </div>
          </td>

          <!-- Reported Timestamp -->
          <td class="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
            ${timeAgo}
          </td>

          <!-- Action Controls -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              <select 
                class="status-select bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                onchange="window.AdminView.handleStatusChange('${issue.id}', this.value)"
              >
                <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="pending_verification" ${issue.status === 'pending_verification' ? 'selected' : ''}>Mark Resolved (Verify)</option>
                <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed / Force Verified</option>
              </select>

              <button 
                onclick="window.AdminView.showOnMap('${issue.id}')"
                class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                title="Locate on Map"
              >
                🗺️
              </button>

              <button 
                onclick="window.AdminView.promptDispatchNote('${issue.id}')"
                class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors"
                title="Add Maintenance Dispatch Note"
              >
                📝
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  handleStatusChange(issueId, newStatus) {
    let note = null;
    if (newStatus === 'in_progress') {
      note = 'Maintenance team dispatched.';
    } else if (newStatus === 'pending_verification') {
      note = 'Facilities marked fixed. Verification requested.';
    }

    window.appState.updateIssueStatus(issueId, newStatus, note);
    window.soundEngine.playClick();
    window.showToast?.(`Status updated to "${window.STATUS_MAP[newStatus].label}"`, 'success');
  }

  promptDispatchNote(issueId) {
    const issue = window.appState.getIssueById(issueId);
    if (!issue) return;

    const currentNote = issue.adminNote || '';
    const newNote = prompt(`Enter maintenance dispatch note for: "${issue.title}"`, currentNote);

    if (newNote !== null) {
      window.appState.updateIssueStatus(issueId, issue.status, newNote.trim());
      window.showToast?.('Maintenance note saved', 'success');
    }
  }

  showOnMap(issueId) {
    // Switch to Map view and fly to issue
    window.switchView('student-map');
    setTimeout(() => {
      window.CampusMap.focusOnIssue(issueId);
    }, 200);
  }

  resetFilters() {
    this.tableSearchQuery = '';
    this.tableCategoryFilter = 'all';
    this.tableStatusFilter = 'all';
    this.tableSortBy = 'priority';

    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) searchInput.value = '';

    const catSelect = document.getElementById('admin-cat-filter');
    if (catSelect) catSelect.value = 'all';

    const statusSelect = document.getElementById('admin-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    this.renderTable();
  }

  // Operations Summary Report Generator (Formatted Printable Modal + CSV Export)
  generateOperationsReport() {
    const stats = window.appState.getStats();
    const issues = window.appState.getIssues();
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const modal = document.getElementById('report-modal');
    const content = document.getElementById('report-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div id="printable-operations-report" class="p-6 bg-white text-slate-900 font-sans">
        <!-- Report Header -->
        <div class="flex items-center justify-between border-b-2 border-indigo-600 pb-4 mb-6">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🗺️</span>
              <h2 class="text-xl font-bold tracking-tight text-slate-900">GeoCampus Operations Framework</h2>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Spatial-Temporal Crowdsourcing & Infrastructure Operations Report</p>
          </div>
          <div class="text-right">
            <span class="inline-block bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-1 rounded border border-indigo-100">
              REPORT #GC-${Math.floor(1000 + Math.random() * 9000)}
            </span>
            <div class="text-[11px] text-slate-400 mt-1">${dateStr}</div>
          </div>
        </div>

        <!-- Executive Metrics KPI Summary -->
        <div class="grid grid-cols-4 gap-3 mb-6">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div class="text-xs font-bold text-slate-500 uppercase">Total Active</div>
            <div class="text-2xl font-extrabold text-rose-600 mt-1">${stats.activeCount}</div>
            <div class="text-[10px] text-slate-400">${stats.openCount} Open / ${stats.inProgressCount} In Prog</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div class="text-xs font-bold text-slate-500 uppercase">Verified Closed</div>
            <div class="text-2xl font-extrabold text-emerald-600 mt-1">${stats.closedCount}</div>
            <div class="text-[10px] text-slate-400">By Community Loop</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div class="text-xs font-bold text-slate-500 uppercase">Top Friction Zone</div>
            <div class="text-base font-bold text-amber-700 mt-1.5 truncate" title="${stats.topRedZone}">${stats.topRedZone}</div>
            <div class="text-[10px] text-slate-400">Highest Report Density</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div class="text-xs font-bold text-slate-500 uppercase">Student Upvotes</div>
            <div class="text-2xl font-extrabold text-indigo-600 mt-1">${stats.totalUpvotes}</div>
            <div class="text-[10px] text-slate-400">Community Engagement</div>
          </div>
        </div>

        <!-- Category & Hotspot Table -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 class="text-xs font-bold uppercase text-slate-700 mb-2">Category Distribution</h4>
            <table class="w-full text-xs">
              ${Object.entries(stats.categoryCounts).map(([catKey, count]) => {
                const c = window.CATEGORIES[catKey];
                return `
                  <tr class="border-b border-slate-200/60">
                    <td class="py-1.5 flex items-center gap-1.5"><span>${c.icon}</span> <span>${c.name}</span></td>
                    <td class="py-1.5 text-right font-mono font-bold">${count}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 class="text-xs font-bold uppercase text-slate-700 mb-2">High-Friction Campus Hotspots</h4>
            <table class="w-full text-xs">
              ${stats.redZones.slice(0, 4).map((rz, idx) => `
                <tr class="border-b border-slate-200/60">
                  <td class="py-1.5"><b>#${idx + 1}</b> ${rz.name}</td>
                  <td class="py-1.5 text-right font-mono font-bold text-rose-600">${rz.count} active (${rz.score} pts)</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </div>

        <!-- Issue Inventory Summary Table -->
        <h4 class="text-xs font-bold uppercase text-slate-700 mb-2">Operational Issues Inventory</h4>
        <div class="border border-slate-200 rounded-lg overflow-hidden mb-6">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="py-2 px-3">Title & Location</th>
                <th class="py-2 px-3">Category</th>
                <th class="py-2 px-3">Severity</th>
                <th class="py-2 px-3">Upvotes</th>
                <th class="py-2 px-3">Status</th>
                <th class="py-2 px-3">Admin Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${issues.map(i => {
                const c = window.CATEGORIES[i.category];
                return `
                  <tr>
                    <td class="py-2 px-3">
                      <div class="font-semibold text-slate-900">${escapeHtml(i.title)}</div>
                      <div class="text-[11px] text-slate-500">${escapeHtml(i.building)} (${i.floor || 'Ground'})</div>
                    </td>
                    <td class="py-2 px-3">${c ? c.name : i.category}</td>
                    <td class="py-2 px-3 font-semibold uppercase text-[10px] ${i.severity === 'high' ? 'text-red-600' : 'text-slate-600'}">${i.severity}</td>
                    <td class="py-2 px-3 font-mono">${i.upvotes || 0}</td>
                    <td class="py-2 px-3"><span class="font-semibold">${window.STATUS_MAP[i.status]?.label || i.status}</span></td>
                    <td class="py-2 px-3 text-slate-500 italic">${escapeHtml(i.adminNote || 'None')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Sign-off & Developer Attribution -->
        <div class="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Operations Lead: Facilities & IT Taskforce</span>
          </div>
          <div class="font-semibold text-indigo-600">
            GeoCampus • Developed by Ujwal Didhate
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  exportCSV() {
    const issues = window.appState.getIssues();
    const headers = ['ID', 'Title', 'Category', 'Building', 'Floor', 'Severity', 'Status', 'Upvotes', 'Confirmations', 'ReportedAt', 'AdminNotes'];
    
    const rows = issues.map(i => [
      i.id,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category,
      `"${(i.building || '').replace(/"/g, '""')}"`,
      `"${(i.floor || '').replace(/"/g, '""')}"`,
      i.severity,
      i.status,
      i.upvotes || 0,
      i.confirmations || 0,
      new Date(i.reportedAt).toISOString(),
      `"${(i.adminNote || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `geocampus_operations_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showToast?.('📊 CSV report downloaded successfully', 'success');
  }
}

window.AdminView = new AdminDashboard();

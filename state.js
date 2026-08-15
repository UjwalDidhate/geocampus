/**
 * Campus Micro-Problem Mapper - State Management & Seeded Issues
 * Developed by Ujwal Didhate
 */

const CATEGORIES = {
  sanitation: {
    id: 'sanitation',
    name: 'Sanitation & Water',
    icon: '🚰',
    color: '#0284c7',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    markerColor: '#0284c7',
    quickTags: ['Water Cooler Leaking', 'Clogged Sink', 'Empty Dispenser', 'Restroom Issue']
  },
  safety: {
    id: 'safety',
    name: 'Safety & Lighting',
    icon: '💡',
    color: '#eab308',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    markerColor: '#eab308',
    quickTags: ['Dark Walkway', 'Flickering Light', 'Slippery Stairs', 'Emergency Exit']
  },
  academic_it: {
    id: 'academic_it',
    name: 'Academic & IT Hardware',
    icon: '💻',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    markerColor: '#8b5cf6',
    quickTags: ['IDEA Lab Equipment', 'Wi-Fi Deadzone', 'Faulty Projector', 'Dead Sockets']
  },
  infrastructure: {
    id: 'infrastructure',
    name: 'Infrastructure & Cleanliness',
    icon: '🚪',
    color: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    markerColor: '#10b981',
    quickTags: ['Broken Bench/Desk', 'Workshop Machine', 'Overflowing Bin', 'Door Latch Broken']
  }
};

const STATUS_MAP = {
  open: {
    label: 'Open',
    color: '#ef4444',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    description: 'Active problem awaiting administrative review'
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'Maintenance team dispatched / work ongoing'
  },
  pending_verification: {
    label: 'Pending Verification',
    color: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    description: 'Admin marked fixed; awaiting student verification (Need 2 confirms)'
  },
  closed: {
    label: 'Closed / Verified',
    color: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Resolved & verified by campus community'
  }
};

function generatePhotoSVG(category, title, detail) {
  const bgColors = {
    sanitation: '#0284c7',
    safety: '#d97706',
    academic_it: '#7c3aed',
    infrastructure: '#059669'
  };
  const bg = bgColors[category] || '#475569';
  const icon = CATEGORIES[category]?.icon || '⚠️';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
      </linearGradient>
      <pattern id="grid-${category}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="400" height="240" fill="url(#grad-${category})"/>
    <rect width="400" height="240" fill="url(#grid-${category})"/>
    <circle cx="200" cy="90" r="48" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <text x="200" y="105" font-size="42" text-anchor="middle" font-family="sans-serif">${icon}</text>
    <text x="200" y="165" font-size="16" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${title}</text>
    <text x="200" y="190" font-size="12" fill="#94a3b8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${detail}</text>
    <rect x="15" y="15" width="120" height="22" rx="4" fill="rgba(0,0,0,0.55)"/>
    <text x="75" y="30" font-size="10" font-weight="600" fill="#38bdf8" text-anchor="middle" font-family="monospace">CAMPUS-CAM #LIVE</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SEED_ISSUES = [
  {
    id: 'issue-1',
    title: 'IDEA Lab 3D Printer Extruder Jammed',
    category: 'academic_it',
    note: 'Pradnya Yantra Idea Lab: Printer 2 jammed with filament error E05 during student project build.',
    building: 'Block 1 (Administrative & IDEA Lab)',
    buildingCode: 'BLOCK-1',
    lat: 20.9710,
    lng: 79.0355,
    floor: 'IDEA Lab Ground Floor',
    status: 'open',
    upvotes: 26,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 22,
    photoUrl: generatePhotoSVG('academic_it', '3D Printer Jam E05', 'IDEA Lab Block 1'),
    reportedBy: 'Student #304',
    adminNote: '',
    voters: ['user-mock-1']
  },
  {
    id: 'issue-2',
    title: 'Water cooler leaking near Conference Hall',
    category: 'sanitation',
    note: 'Large water puddle spreading near Block 1 Conference Hall entrance. Slipping hazard.',
    building: 'Block 1 (Administrative & IDEA Lab)',
    buildingCode: 'BLOCK-1',
    lat: 20.9715,
    lng: 79.0350,
    floor: '1st Floor Corridors',
    status: 'open',
    upvotes: 19,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 45,
    photoUrl: generatePhotoSVG('sanitation', 'Conference Hall Leak', 'Block 1 1st Floor'),
    reportedBy: 'Student #512',
    adminNote: '',
    voters: []
  },
  {
    id: 'issue-3',
    title: 'CNC Workshop Coolant Pump Tripping Breaker',
    category: 'academic_it',
    note: 'CNC & Milling workshop machine #4 coolant motor trips circuit breaker on start.',
    building: 'Block 3 (Engineering & Workshops)',
    buildingCode: 'BLOCK-3',
    lat: 20.9730,
    lng: 79.0332,
    floor: 'CNC Workshop Bay',
    status: 'in_progress',
    upvotes: 38,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 180,
    photoUrl: generatePhotoSVG('academic_it', 'CNC Machine Trip', 'Block 3 Workshop'),
    reportedBy: 'Student #891',
    adminNote: 'Mechanical maintenance tech assigned to replace relay.',
    voters: []
  },
  {
    id: 'issue-4',
    title: 'High-bay LED light flickering in Mech Lab',
    category: 'safety',
    note: 'Thermal & Heat Transfer Lab has rapid strobing light near test bench 2.',
    building: 'Block 3 (Engineering & Workshops)',
    buildingCode: 'BLOCK-3',
    lat: 20.9735,
    lng: 79.0340,
    floor: 'Thermal Lab Floor',
    status: 'open',
    upvotes: 14,
    confirmations: 0,
    severity: 'medium',
    reportedAt: Date.now() - 1000 * 60 * 95,
    photoUrl: generatePhotoSVG('safety', 'Mech Lab Light Strobing', 'Block 3 Lab'),
    reportedBy: 'Student #117',
    adminNote: '',
    voters: []
  },
  {
    id: 'issue-5',
    title: 'Wi-Fi AP Offline in Central Computer Centre',
    category: 'academic_it',
    note: 'No wireless connection in IT Dept Computer Centre. Cellular signal is very poor.',
    building: 'Central Library & IT/MBA Complex',
    buildingCode: 'LIB-IT',
    lat: 20.9709,
    lng: 79.0318,
    floor: 'Computer Centre 1F',
    status: 'open',
    upvotes: 52,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 30,
    photoUrl: generatePhotoSVG('academic_it', 'AP-02 Signal Deadzone', 'Central Computer Centre'),
    reportedBy: 'Student #993',
    adminNote: '',
    voters: []
  },
  {
    id: 'issue-6',
    title: 'Washroom tap valve replaced & sealed',
    category: 'sanitation',
    note: '2nd floor IT department washroom tap was dripping. Facilities marked valve replaced.',
    building: 'Central Library & IT/MBA Complex',
    buildingCode: 'LIB-IT',
    lat: 20.9704,
    lng: 79.0312,
    floor: '2nd Floor IT Wing',
    status: 'pending_verification',
    upvotes: 12,
    confirmations: 1,
    severity: 'low',
    reportedAt: Date.now() - 1000 * 60 * 60 * 14,
    photoUrl: generatePhotoSVG('sanitation', 'Tap Valve Replacement', 'Library 2F Washroom'),
    reportedBy: 'Student #205',
    adminNote: 'Plumber installed new quarter-turn brass valve.',
    voters: []
  },
  {
    id: 'issue-7',
    title: 'Drinking water dispenser empty at Canteen',
    category: 'sanitation',
    note: 'Central Canteen water station 1 has been dry since lunch peak hour.',
    building: 'Central Canteen & Amphitheatre',
    buildingCode: 'CANTEEN',
    lat: 20.9733,
    lng: 79.0316,
    floor: 'Canteen Food Kiosk',
    status: 'in_progress',
    upvotes: 45,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 140,
    photoUrl: generatePhotoSVG('sanitation', 'Water Cooler Refill', 'Central Canteen'),
    reportedBy: 'Student #672',
    adminNote: 'Canteen vendor ordered 20L backup jars.',
    voters: []
  },
  {
    id: 'issue-8',
    title: 'Chipped concrete edge on Lower Amphitheatre',
    category: 'infrastructure',
    note: 'Lower Amphitheatre tier 3 seating has exposed rebar edge.',
    building: 'Central Canteen & Amphitheatre',
    buildingCode: 'CANTEEN',
    lat: 20.9728,
    lng: 79.0312,
    floor: 'Open-Air Seating',
    status: 'pending_verification',
    upvotes: 9,
    confirmations: 1,
    severity: 'low',
    reportedAt: Date.now() - 1000 * 60 * 60 * 20,
    photoUrl: generatePhotoSVG('infrastructure', 'Amphitheatre Patch', 'Tier 3 Seating'),
    reportedBy: 'Student #441',
    adminNote: 'Masonry team patched concrete.',
    voters: []
  },
  {
    id: 'issue-9',
    title: 'Volleyball court net wire snapped',
    category: 'infrastructure',
    note: 'East court volleyball net tension cable snapped, sagging to the sand.',
    building: 'Sports Grounds & Recreation Arena',
    buildingCode: 'SPORTS',
    lat: 20.9724,
    lng: 79.0292,
    floor: 'Volleyball Court',
    status: 'open',
    upvotes: 18,
    confirmations: 0,
    severity: 'medium',
    reportedAt: Date.now() - 1000 * 60 * 260,
    photoUrl: generatePhotoSVG('infrastructure', 'Volleyball Net Snap', 'Sports Ground'),
    reportedBy: 'Student #830',
    adminNote: '',
    voters: []
  },
  {
    id: 'issue-10',
    title: 'Main Entrance Gate lighting pitch dark near highway',
    category: 'safety',
    note: 'Bus pick-up / drop-off zone on highway entrance has 2 dead lamps.',
    building: 'Main Entrance Gate & Student Parking',
    buildingCode: 'PARKING',
    lat: 20.9688,
    lng: 79.0352,
    floor: 'Main Gate Bay',
    status: 'open',
    upvotes: 35,
    confirmations: 0,
    severity: 'high',
    reportedAt: Date.now() - 1000 * 60 * 75,
    photoUrl: generatePhotoSVG('safety', 'Highway Gate Lighting', 'Main Entrance Gate'),
    reportedBy: 'Student #112',
    adminNote: '',
    voters: []
  }
];

class StateStore {
  constructor() {
    this.STORAGE_KEY = 'campus_problem_mapper_v4';
    this.USER_ID_KEY = 'campus_mapper_user_id';
    this.listeners = [];
    this.userId = this.getOrCreateUserId();
    this.issues = this.loadIssues();
  }

  getOrCreateUserId() {
    let id = localStorage.getItem(this.USER_ID_KEY);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(this.USER_ID_KEY, id);
    }
    return id;
  }

  loadIssues() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    this.saveIssues(SEED_ISSUES);
    return [...SEED_ISSUES];
  }

  saveIssues(issues) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, data) {
    this.saveIssues(this.issues);
    this.listeners.forEach(l => {
      try {
        l(event, data, this.issues);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  }

  getIssues() {
    return [...this.issues];
  }

  getIssueById(id) {
    return this.issues.find(i => i.id === id);
  }

  addIssue(data) {
    const newIssue = {
      id: 'issue-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: data.title || (data.note ? data.note.substring(0, 45) + '...' : 'Campus Issue'),
      category: data.category || 'infrastructure',
      note: data.note || '',
      building: data.building || 'Campus Grounds',
      buildingCode: data.buildingCode || 'CAMPUS',
      lat: +data.lat,
      lng: +data.lng,
      floor: data.floor || 'Ground Level',
      status: 'open',
      upvotes: 1,
      confirmations: 0,
      severity: data.severity || 'medium',
      reportedAt: Date.now(),
      photoUrl: data.photoUrl || generatePhotoSVG(data.category, data.title || 'Reported Issue', data.building || 'Campus'),
      reportedBy: 'Student #' + Math.floor(100 + Math.random() * 899),
      adminNote: '',
      voters: [this.userId]
    };

    this.issues.unshift(newIssue);
    this.notify('issue_added', newIssue);
    return newIssue;
  }

  upvoteIssue(id) {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) return { success: false, error: 'Issue not found' };

    if (!Array.isArray(issue.voters)) issue.voters = [];

    const alreadyVoted = issue.voters.includes(this.userId);
    if (alreadyVoted) {
      issue.voters = issue.voters.filter(v => v !== this.userId);
      issue.upvotes = Math.max(0, (issue.upvotes || 1) - 1);
      this.notify('issue_upvoted', { issue, delta: -1, hasVoted: false });
      return { success: true, hasVoted: false, upvotes: issue.upvotes };
    } else {
      issue.voters.push(this.userId);
      issue.upvotes = (issue.upvotes || 0) + 1;
      this.notify('issue_upvoted', { issue, delta: 1, hasVoted: true });
      return { success: true, hasVoted: true, upvotes: issue.upvotes };
    }
  }

  confirmResolution(id) {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) return { success: false, error: 'Issue not found' };

    if (issue.status !== 'pending_verification') {
      return { success: false, error: 'Issue is not pending verification' };
    }

    if (!Array.isArray(issue.verifiers)) issue.verifiers = [];

    if (issue.verifiers.includes(this.userId)) {
      return { success: false, error: 'You have already verified this fix' };
    }

    issue.verifiers.push(this.userId);
    issue.confirmations = (issue.confirmations || 0) + 1;

    if (issue.confirmations >= 2) {
      issue.status = 'closed';
      issue.closedAt = Date.now();
      this.notify('issue_closed', issue);
      return { success: true, closed: true, confirmations: issue.confirmations };
    } else {
      this.notify('issue_verified', issue);
      return { success: true, closed: false, confirmations: issue.confirmations };
    }
  }

  updateIssueStatus(id, newStatus, adminNote = null) {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) return false;

    issue.status = newStatus;
    if (adminNote !== null) {
      issue.adminNote = adminNote;
    }
    if (newStatus === 'pending_verification') {
      issue.resolvedAt = Date.now();
      issue.confirmations = issue.confirmations || 0;
      issue.verifiers = [];
    } else if (newStatus === 'closed') {
      issue.closedAt = Date.now();
    }

    this.notify('status_updated', issue);
    return true;
  }

  deleteIssue(id) {
    const index = this.issues.findIndex(i => i.id === id);
    if (index !== -1) {
      const removed = this.issues.splice(index, 1)[0];
      this.notify('issue_deleted', removed);
      return true;
    }
    return false;
  }

  resetToMock() {
    this.issues = [...SEED_ISSUES];
    this.saveIssues(this.issues);
    this.notify('state_reset', this.issues);
  }

  getStats() {
    const all = this.issues;
    const active = all.filter(i => i.status === 'open' || i.status === 'in_progress');
    const openCount = all.filter(i => i.status === 'open').length;
    const inProgressCount = all.filter(i => i.status === 'in_progress').length;
    const pendingVerification = all.filter(i => i.status === 'pending_verification').length;
    const closedCount = all.filter(i => i.status === 'closed').length;

    const totalUpvotes = all.reduce((sum, i) => sum + (i.upvotes || 0), 0);

    const buildingFriction = {};
    active.forEach(i => {
      if (!buildingFriction[i.building]) {
        buildingFriction[i.building] = { count: 0, score: 0, code: i.buildingCode };
      }
      buildingFriction[i.building].count += 1;
      buildingFriction[i.building].score += (i.upvotes || 1) * (i.severity === 'high' ? 3 : i.severity === 'medium' ? 2 : 1);
    });

    const redZones = Object.entries(buildingFriction)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.score - a.score);

    const categoryCounts = {
      sanitation: 0,
      safety: 0,
      academic_it: 0,
      infrastructure: 0
    };
    all.forEach(i => {
      if (categoryCounts[i.category] !== undefined) {
        categoryCounts[i.category]++;
      }
    });

    return {
      total: all.length,
      activeCount: active.length,
      openCount,
      inProgressCount,
      pendingVerification,
      closedCount,
      totalUpvotes,
      redZones,
      topRedZone: redZones[0] ? redZones[0].name : 'All Clear',
      avgResolutionHours: '2.4 hrs',
      categoryCounts
    };
  }
}

window.CATEGORIES = CATEGORIES;
window.STATUS_MAP = STATUS_MAP;
window.generatePhotoSVG = generatePhotoSVG;
window.appState = new StateStore();

/**
 * Campus Micro-Problem Mapper - Spatial Analysis & Surrounding Landmarks
 * Focuses on surrounding villages, arterial roads, and regional landmarks around campus.
 * Developed by Ujwal Didhate
 */

const CAMPUS_CONFIG = {
  name: 'University Campus',
  center: [20.9715, 79.0325],
  zoom: 17,
  minZoom: 14,
  maxZoom: 19,

  // Campus Perimeter Polygon [lat, lng]
  boundary: [
    [20.9752, 79.0278],
    [20.9758, 79.0335],
    [20.9745, 79.0375],
    [20.9720, 79.0382],
    [20.9680, 79.0372],
    [20.9668, 79.0330],
    [20.9673, 79.0282],
    [20.9705, 79.0268],
    [20.9738, 79.0270]
  ],

  // Specific Building & Zone Polygons
  buildings: [
    {
      id: 'bldg-block-1',
      name: 'Block 1 (Administrative & IDEA Lab)',
      shortName: 'Block 1 (Admin & IDEA Lab)',
      code: 'BLOCK-1',
      icon: '🏛️',
      color: '#3b82f6',
      center: [20.9712, 79.0354],
      floors: 4,
      departments: [
        'Director\'s Office',
        'Principal\'s Office',
        'IDEA Lab / Pradnya Yantra (3D Printing & Robotics)',
        'T&P Department (Training & Placement)',
        'Central Conference Hall',
        'MCA & Civil Engineering Dept',
        'CSE & Basic Science & Humanities',
        'Main Atrium & Ganesha Sculpture Dome'
      ],
      polygon: [
        [20.9719, 79.0344],
        [20.9721, 79.0362],
        [20.9705, 79.0364],
        [20.9703, 79.0346]
      ]
    },
    {
      id: 'bldg-block-3',
      name: 'Block 3 (Engineering & Workshops)',
      shortName: 'Block 3 (Engg & Workshops)',
      code: 'BLOCK-3',
      icon: '⚙️',
      color: '#8b5cf6',
      center: [20.9733, 79.0338],
      floors: 3,
      departments: [
        'Computer Science & Engineering Dept',
        'Electrical Engineering Dept',
        'Mechanical Engineering Dept',
        'Universal Testing Machine (UTM) Lab',
        'Thermal & Heat Transfer Lab',
        'Dynamics of Machinery Lab',
        'CNC & Milling Workshop',
        'Fitting & Carpentry Workshops'
      ],
      polygon: [
        [20.9739, 79.0327],
        [20.9741, 79.0348],
        [20.9725, 79.0349],
        [20.9723, 79.0328]
      ]
    },
    {
      id: 'bldg-lib-it',
      name: 'Central Library & IT/MBA Complex',
      shortName: 'Library & IT/MBA Complex',
      code: 'LIB-IT',
      icon: '📚',
      color: '#06b6d4',
      center: [20.9708, 79.0316],
      floors: 3,
      departments: [
        'Central Library & Digital Reading Commons',
        'Information Technology Dept (IT)',
        'MBA Department',
        'Central Computer Centre & Server Room',
        'Central Courtyard Green Garden'
      ],
      polygon: [
        [20.9715, 79.0307],
        [20.9716, 79.0325],
        [20.9700, 79.0326],
        [20.9699, 79.0308]
      ]
    },
    {
      id: 'bldg-canteen',
      name: 'Central Canteen & Amphitheatre',
      shortName: 'Canteen & Amphitheatre',
      code: 'CANTEEN',
      icon: '☕',
      color: '#10b981',
      center: [20.9733, 79.0315],
      floors: 1,
      departments: [
        'Central Canteen & Student Food Court',
        'Upper Open-Air Amphitheatre',
        'Lower Open-Air Amphitheatre'
      ],
      polygon: [
        [20.9738, 79.0308],
        [20.9739, 79.0322],
        [20.9727, 79.0323],
        [20.9726, 79.0309]
      ]
    },
    {
      id: 'bldg-sports',
      name: 'Sports Grounds & Recreation Arena',
      shortName: 'Sports Grounds',
      code: 'SPORTS',
      icon: '⚽',
      color: '#ef4444',
      center: [20.9720, 79.0292],
      floors: 1,
      departments: [
        'Cricket Ground',
        'Football Pitch',
        'Volleyball Courts',
        'Indoor Sports Room 1 (Gym & Fitness)',
        'Indoor Sports Room 2 (Table Tennis & Chess)'
      ],
      polygon: [
        [20.9733, 79.0281],
        [20.9735, 79.0300],
        [20.9707, 79.0302],
        [20.9705, 79.0283]
      ]
    },
    {
      id: 'bldg-parking',
      name: 'Main Entrance Gate & Student Parking',
      shortName: 'Entrance & Parking',
      code: 'PARKING',
      icon: '🅿️',
      color: '#f59e0b',
      center: [20.9691, 79.0357],
      floors: 1,
      departments: [
        'Main Entrance Gate',
        'Bus Pick-up / Drop-off Zone',
        'Student Two-Wheeler & Four-Wheeler Parking',
        'Wardha Road Highway Access'
      ],
      polygon: [
        [20.9698, 79.0345],
        [20.9700, 79.0366],
        [20.9683, 79.0367],
        [20.9682, 79.0347]
      ]
    }
  ],

  // Surrounding Real-World Villages & Major Regional Landmarks
  surroundingLandmarks: [
    {
      id: 'surr-wardha-rd',
      name: 'Wardha Road / Chandrapur-Nagpur Highway (NH-44)',
      type: 'road',
      icon: '🛣️',
      badgeColor: '#e11d48',
      lat: 20.9676,
      lng: 79.0368,
      distanceDesc: 'Direct Frontage (Adjacent)',
      description: 'Major national arterial corridor connecting Nagpur City to Wardha & Chandrapur.'
    },
    {
      id: 'surr-mohgaon',
      name: 'Mohgaon Village',
      type: 'village',
      icon: '🏘️',
      badgeColor: '#64748b',
      lat: 20.9650,
      lng: 79.0305,
      distanceDesc: '400m South-West',
      description: 'Adjacent residential village and local market hub with shops, stationery, and student services.'
    },
    {
      id: 'surr-dongargaon',
      name: 'Dongargaon',
      type: 'village',
      icon: '🏘️',
      badgeColor: '#059669',
      lat: 20.9775,
      lng: 79.0340,
      distanceDesc: '1.1 km North',
      description: 'Neighboring village settlement north of the academic campus perimeter.'
    },
    {
      id: 'surr-mihan',
      name: 'MIHAN SEZ & Industrial Tech Corridor',
      type: 'hub',
      icon: '🏭',
      badgeColor: '#7c3aed',
      lat: 20.9820,
      lng: 79.0430,
      distanceDesc: '3.2 km North-East',
      description: 'Multi-modal International Cargo Hub and Airport at Nagpur (MIHAN) & IT SEZ.'
    },
    {
      id: 'surr-gumgaon',
      name: 'Gumgaon',
      type: 'village',
      icon: '🏘️',
      badgeColor: '#0284c7',
      lat: 20.9580,
      lng: 79.0260,
      distanceDesc: '2.4 km South',
      description: 'Major suburban hub and railway transit link south along the highway.'
    },
    {
      id: 'surr-khapri',
      name: 'Khapri & Metro Terminal',
      type: 'transit',
      icon: '🚆',
      badgeColor: '#4f46e5',
      lat: 20.9860,
      lng: 79.0460,
      distanceDesc: '3.8 km North',
      description: 'Nagpur Metro terminal and multimodal transit center connecting to the city.'
    }
  ]
};

/**
 * Ray-casting algorithm to determine if a point is inside a polygon
 */
function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if a coordinate is strictly inside the campus perimeter
 */
function isInsideCampus(lat, lng) {
  return isPointInPolygon([lat, lng], CAMPUS_CONFIG.boundary);
}

/**
 * Haversine formula to compute great-circle distance in meters between two lat/lng points
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Detects if any existing open/in-progress issues are within threshold distance (default 15m)
 */
function findNearbyIssues(lat, lng, issuesList, thresholdMeters = 15) {
  const duplicates = [];
  issuesList.forEach(issue => {
    if (issue.status === 'closed') return;
    const dist = calculateDistanceMeters(lat, lng, issue.lat, issue.lng);
    if (dist <= thresholdMeters) {
      duplicates.push({
        issue,
        distance: dist
      });
    }
  });
  return duplicates.sort((a, b) => a.distance - b.distance);
}

/**
 * Identifies the closest or containing campus building for a given point
 */
function findNearestBuilding(lat, lng) {
  for (const bldg of CAMPUS_CONFIG.buildings) {
    if (isPointInPolygon([lat, lng], bldg.polygon)) {
      return { building: bldg, isInside: true, distance: 0 };
    }
  }

  let nearest = CAMPUS_CONFIG.buildings[0];
  let minDistance = Infinity;

  CAMPUS_CONFIG.buildings.forEach(bldg => {
    const dist = calculateDistanceMeters(lat, lng, bldg.center[0], bldg.center[1]);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = bldg;
    }
  });

  return { building: nearest, isInside: false, distance: minDistance };
}

/**
 * Generates a realistic random coordinate inside campus boundary for simulation
 */
function getRandomCampusPoint() {
  const bldg = CAMPUS_CONFIG.buildings[Math.floor(Math.random() * CAMPUS_CONFIG.buildings.length)];
  const jitterLat = (Math.random() - 0.5) * 0.0005;
  const jitterLng = (Math.random() - 0.5) * 0.0005;
  return {
    lat: +(bldg.center[0] + jitterLat).toFixed(6),
    lng: +(bldg.center[1] + jitterLng).toFixed(6),
    buildingName: bldg.name
  };
}

window.CampusGeofence = {
  CONFIG: CAMPUS_CONFIG,
  isInsideCampus,
  calculateDistanceMeters,
  findNearbyIssues,
  findNearestBuilding,
  getRandomCampusPoint
};

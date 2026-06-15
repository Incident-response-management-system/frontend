/**
 * Redemption Camp Location Dataset
 * ─────────────────────────────────────────────────────────────
 * Comprehensive local landmark database for Redemption Camp,
 * Km 46, Lagos-Ibadan Expressway, Ogun State, Nigeria.
 *
 * Used as Layer 1 in the 3-layer location search system.
 * The dataset is designed to be easily extended.
 */

export type LocationCategory =
  | 'auditorium'
  | 'gate'
  | 'clinic'
  | 'administrative'
  | 'road'
  | 'junction'
  | 'hostel'
  | 'facility'
  | 'poi'
  | 'worship'
  | 'market'
  | 'education'
  | 'security';

export interface CampLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: LocationCategory;
  aliases: string[];
}

// ─── Dataset ─────────────────────────────────────────────────

export const CAMP_LOCATIONS: CampLocation[] = [

  // ── Auditoriums & Arenas ──────────────────────────────────
  {
    id: 'faith-arena',
    name: 'Faith Arena',
    latitude: 6.8940,
    longitude: 3.1725,
    category: 'auditorium',
    aliases: ['faith arena', 'rccg faith arena', 'arena', 'the arena', 'big arena', 'open arena'],
  },
  {
    id: 'old-auditorium',
    name: 'Old Auditorium',
    latitude: 6.8930,
    longitude: 3.1710,
    category: 'auditorium',
    aliases: ['old auditorium', 'old church', 'first auditorium', 'original auditorium'],
  },
  {
    id: 'childrens-auditorium',
    name: "Children's Auditorium",
    latitude: 6.8922,
    longitude: 3.1718,
    category: 'auditorium',
    aliases: ["children's auditorium", 'childrens auditorium', 'kids auditorium', 'children church', 'junior church'],
  },
  {
    id: 'prayer-city-auditorium',
    name: 'Prayer City Auditorium',
    latitude: 6.8950,
    longitude: 3.1730,
    category: 'auditorium',
    aliases: ['prayer city', 'prayer city auditorium', 'pc auditorium', 'main church'],
  },
  {
    id: 'youth-auditorium',
    name: 'Youth Auditorium',
    latitude: 6.8936,
    longitude: 3.1720,
    category: 'auditorium',
    aliases: ['youth auditorium', 'youth church', 'youth building'],
  },

  // ── Gates & Entry Points ──────────────────────────────────
  {
    id: 'main-gate',
    name: 'Main Gate',
    latitude: 6.8900,
    longitude: 3.1700,
    category: 'gate',
    aliases: ['main gate', 'main entrance', 'front gate', 'camp main entrance', 'lagos ibadan gate', 'expressway gate'],
  },
  {
    id: 'gate-2',
    name: 'Gate 2',
    latitude: 6.8912,
    longitude: 3.1698,
    category: 'gate',
    aliases: ['gate 2', 'second gate', 'gate two', 'side entrance 2'],
  },
  {
    id: 'gate-3',
    name: 'Gate 3',
    latitude: 6.8955,
    longitude: 3.1702,
    category: 'gate',
    aliases: ['gate 3', 'third gate', 'gate three', 'back gate'],
  },
  {
    id: 'gate-4',
    name: 'Gate 4',
    latitude: 6.8960,
    longitude: 3.1740,
    category: 'gate',
    aliases: ['gate 4', 'fourth gate', 'gate four', 'north gate'],
  },
  {
    id: 'cattle-gate',
    name: 'Cattle Market Gate',
    latitude: 6.8908,
    longitude: 3.1695,
    category: 'gate',
    aliases: ['cattle gate', 'market gate', 'cattle market entrance'],
  },

  // ── Clinics & Medical ──────────────────────────────────────
  {
    id: 'camp-clinic',
    name: 'Camp Clinic',
    latitude: 6.8915,
    longitude: 3.1730,
    category: 'clinic',
    aliases: ['camp clinic', 'camp hospital', 'main clinic', 'medical center'],
  },
  {
    id: 'rccg-medical-centre',
    name: 'RCCG Medical Centre',
    latitude: 6.8918,
    longitude: 3.1732,
    category: 'clinic',
    aliases: ['rccg medical centre', 'rccg medical center', 'medical centre', 'rccg hospital', 'redemption hospital'],
  },
  {
    id: 'first-aid-post-arena',
    name: 'First Aid Post – Faith Arena',
    latitude: 6.8942,
    longitude: 3.1726,
    category: 'clinic',
    aliases: ['first aid', 'first aid post', 'first aid arena', 'arena first aid', 'emergency post'],
  },
  {
    id: 'first-aid-post-gate',
    name: 'First Aid Post – Main Gate',
    latitude: 6.8902,
    longitude: 3.1700,
    category: 'clinic',
    aliases: ['gate first aid', 'main gate first aid', 'first aid gate'],
  },
  {
    id: 'general-hospital-mowe',
    name: 'General Hospital Mowe',
    latitude: 6.8890,
    longitude: 3.1695,
    category: 'clinic',
    aliases: ['mowe hospital', 'general hospital', 'general hospital mowe', 'mowe general'],
  },

  // ── Administrative Buildings ────────────────────────────────
  {
    id: 'admin-block',
    name: 'Administration Block',
    latitude: 6.8932,
    longitude: 3.1720,
    category: 'administrative',
    aliases: ['admin block', 'admin building', 'administration block', 'administration office', 'rccg admin', 'camp admin'],
  },
  {
    id: 'secretary-general-office',
    name: "Secretary General's Office",
    latitude: 6.8933,
    longitude: 3.1722,
    category: 'administrative',
    aliases: ["secretary general's office", 'secretary office', 'sg office', 'secretary general'],
  },
  {
    id: 'protocol-department',
    name: 'Protocol Department',
    latitude: 6.8931,
    longitude: 3.1718,
    category: 'administrative',
    aliases: ['protocol department', 'protocol office', 'camp protocol'],
  },
  {
    id: 'camp-directorate',
    name: 'Camp Directorate',
    latitude: 6.8930,
    longitude: 3.1721,
    category: 'administrative',
    aliases: ['camp directorate', 'directorate office', 'rccg directorate'],
  },

  // ── Roads & Junctions ──────────────────────────────────────
  {
    id: 'camp-entrance-road',
    name: 'Camp Entrance Road',
    latitude: 6.8908,
    longitude: 3.1710,
    category: 'road',
    aliases: ['camp entrance road', 'entrance road', 'main road', 'access road', 'entry road'],
  },
  {
    id: 'camp-highway',
    name: 'Lagos-Ibadan Expressway Junction',
    latitude: 6.8898,
    longitude: 3.1700,
    category: 'junction',
    aliases: ['expressway', 'highway junction', 'lagos ibadan expressway', 'expressway junction', 'km 46'],
  },
  {
    id: 'central-junction',
    name: 'Central Camp Junction',
    latitude: 6.8928,
    longitude: 3.1715,
    category: 'junction',
    aliases: ['central junction', 'camp junction', 'main junction', 'roundabout', 'camp center'],
  },
  {
    id: 'arena-road',
    name: 'Arena Road',
    latitude: 6.8935,
    longitude: 3.1720,
    category: 'road',
    aliases: ['arena road', 'faith arena road', 'road to arena'],
  },
  {
    id: 'clinic-road',
    name: 'Clinic Road',
    latitude: 6.8916,
    longitude: 3.1725,
    category: 'road',
    aliases: ['clinic road', 'medical road', 'hospital road'],
  },

  // ── Hostels & Accommodation ────────────────────────────────
  {
    id: 'camp-hotel',
    name: 'Camp Hotel',
    latitude: 6.8938,
    longitude: 3.1722,
    category: 'hostel',
    aliases: ['camp hotel', 'redemption hotel', 'rccg hotel', 'camp lodge'],
  },
  {
    id: 'male-hostel',
    name: 'Male Hostel',
    latitude: 6.8943,
    longitude: 3.1718,
    category: 'hostel',
    aliases: ['male hostel', 'gents hostel', 'male quarters', 'mens hostel'],
  },
  {
    id: 'female-hostel',
    name: 'Female Hostel',
    latitude: 6.8945,
    longitude: 3.1721,
    category: 'hostel',
    aliases: ['female hostel', 'ladies hostel', 'female quarters', 'womens hostel'],
  },
  {
    id: 'zone-a-campground',
    name: 'Zone A Campground',
    latitude: 6.8955,
    longitude: 3.1720,
    category: 'hostel',
    aliases: ['zone a', 'zone a campground', 'camping zone a', 'zone a ground'],
  },
  {
    id: 'zone-b-campground',
    name: 'Zone B Campground',
    latitude: 6.8960,
    longitude: 3.1730,
    category: 'hostel',
    aliases: ['zone b', 'zone b campground', 'camping zone b', 'zone b ground'],
  },
  {
    id: 'zone-c-campground',
    name: 'Zone C Campground',
    latitude: 6.8958,
    longitude: 3.1740,
    category: 'hostel',
    aliases: ['zone c', 'zone c campground', 'camping zone c', 'zone c ground'],
  },

  // ── Facilities & Utilities ────────────────────────────────
  {
    id: 'power-house',
    name: 'Power House',
    latitude: 6.8910,
    longitude: 3.1725,
    category: 'facility',
    aliases: ['power house', 'powerhouse', 'generator house', 'main generator', 'electricity building', 'power station'],
  },
  {
    id: 'petrol-station',
    name: 'Camp Petrol Station',
    latitude: 6.8912,
    longitude: 3.1718,
    category: 'facility',
    aliases: ['petrol station', 'filling station', 'fuel station', 'camp filling station', 'camp petrol'],
  },
  {
    id: 'water-treatment',
    name: 'Water Treatment Plant',
    latitude: 6.8907,
    longitude: 3.1728,
    category: 'facility',
    aliases: ['water treatment', 'water plant', 'water station', 'borehole'],
  },
  {
    id: 'waste-disposal',
    name: 'Waste Disposal Area',
    latitude: 6.8920,
    longitude: 3.1705,
    category: 'facility',
    aliases: ['waste disposal', 'refuse dump', 'garbage area', 'waste site'],
  },

  // ── Security & Control ────────────────────────────────────
  {
    id: 'security-post-main',
    name: 'Security Post – Main Gate',
    latitude: 6.8901,
    longitude: 3.1700,
    category: 'security',
    aliases: ['security post', 'main security', 'gate security', 'security checkpoint', 'camp security'],
  },
  {
    id: 'security-post-arena',
    name: 'Security Post – Faith Arena',
    latitude: 6.8940,
    longitude: 3.1724,
    category: 'security',
    aliases: ['arena security', 'faith arena security', 'security arena'],
  },
  {
    id: 'police-post',
    name: 'Camp Police Post',
    latitude: 6.8903,
    longitude: 3.1702,
    category: 'security',
    aliases: ['police post', 'camp police', 'nigeria police', 'police station', 'cop post'],
  },

  // ── Markets & Commerce ─────────────────────────────────────
  {
    id: 'camp-market',
    name: 'Camp Market',
    latitude: 6.8920,
    longitude: 3.1708,
    category: 'market',
    aliases: ['camp market', 'market', 'rccg market', 'main market', 'redemption market'],
  },
  {
    id: 'food-court',
    name: 'Food Court',
    latitude: 6.8925,
    longitude: 3.1715,
    category: 'market',
    aliases: ['food court', 'food area', 'canteen', 'dining area', 'restaurant area', 'eating area'],
  },
  {
    id: 'bookshop',
    name: 'RCCG Bookshop',
    latitude: 6.8928,
    longitude: 3.1712,
    category: 'market',
    aliases: ['bookshop', 'book shop', 'rccg bookshop', 'camp bookshop', 'christian bookstore'],
  },
  {
    id: 'camp-atm',
    name: 'Camp ATM Zone',
    latitude: 6.8926,
    longitude: 3.1714,
    category: 'market',
    aliases: ['atm', 'camp atm', 'cash point', 'bank machine', 'automated teller'],
  },

  // ── Education & Training ───────────────────────────────────
  {
    id: 'youth-centre',
    name: 'Youth Centre',
    latitude: 6.8935,
    longitude: 3.1740,
    category: 'education',
    aliases: ['youth centre', 'youth center', 'youth hall', 'youth building', 'ycc'],
  },
  {
    id: 'rccg-school',
    name: 'RCCG School',
    latitude: 6.8948,
    longitude: 3.1712,
    category: 'education',
    aliases: ['rccg school', 'camp school', 'redemption school', 'primary school', 'camp primary'],
  },
  {
    id: 'bible-school',
    name: 'Bible School',
    latitude: 6.8945,
    longitude: 3.1730,
    category: 'education',
    aliases: ['bible school', 'theological school', 'divinity school', 'rccg bible school'],
  },

  // ── Worship & Prayer ──────────────────────────────────────
  {
    id: 'prayer-arena',
    name: 'Prayer Arena',
    latitude: 6.8945,
    longitude: 3.1715,
    category: 'worship',
    aliases: ['prayer arena', 'prayer ground', 'vigil ground', 'night vigil arena', 'prayer camp'],
  },
  {
    id: 'prayer-mountain',
    name: 'Prayer Mountain',
    latitude: 6.8965,
    longitude: 3.1708,
    category: 'worship',
    aliases: ['prayer mountain', 'mountain of prayer', 'prayer hill', 'mountain'],
  },
  {
    id: 'mens-fellowship',
    name: "Men's Fellowship Hall",
    latitude: 6.8937,
    longitude: 3.1716,
    category: 'worship',
    aliases: ["men's fellowship", 'mens fellowship hall', 'mfm hall', 'mens hall'],
  },
  {
    id: 'womens-fellowship',
    name: "Women's Fellowship Hall",
    latitude: 6.8939,
    longitude: 3.1718,
    category: 'worship',
    aliases: ["women's fellowship", 'womens fellowship hall', 'women hall', 'ladies hall'],
  },
];

// ─── Fuzzy Search Engine ─────────────────────────────────────

const STOP_WORDS = new Set([
  'redemption', 'camp', 'ogun', 'state', 'nigeria',
  'rccg', 'in', 'near', 'at', 'the', 'by', 'around',
  'beside', 'behind', 'opposite', 'next', 'to', 'of', 'a',
]);

export interface SearchResult {
  location: CampLocation;
  score: number;
  distance?: number;
}

/**
 * Search the local dataset with keyword-based scoring.
 * Filters generic stop words and scores based on:
 *   - Alias exact match: +20
 *   - Name contains word: +10 (bonus +5 if starts with word)
 *   - Alias contains word: +8
 *   - Type/Category matches: +5
 */
export function searchLocalDataset(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const words = q.replace(/[,\-]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  const searchWords = words.filter(w => !STOP_WORDS.has(w));
  const wordsToMatch = searchWords.length > 0 ? searchWords : words;

  return CAMP_LOCATIONS
    .map(loc => {
      const nameLower = loc.name.toLowerCase();
      const catLower = loc.category.toLowerCase();
      let score = 0;

      for (const word of wordsToMatch) {
        // Check aliases for exact full match first (highest priority)
        for (const alias of loc.aliases) {
          if (alias === q) { score += 30; break; }
          if (alias.includes(word)) { score += 8; }
        }
        // Check name
        if (nameLower.includes(word)) {
          score += 10;
          if (nameLower.startsWith(word)) score += 5;
        }
        // Check category
        if (catLower.includes(word)) score += 5;
      }

      return { location: loc, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Find all nearby camp locations within a given radius (meters),
 * sorted by proximity to the clicked point.
 */
export function getNearbyLocations(
  lat: number,
  lng: number,
  maxMeters = 3000
): (CampLocation & { distance: number })[] {
  return CAMP_LOCATIONS
    .map(loc => ({
      ...loc,
      distance: haversineDistance(lat, lng, loc.latitude, loc.longitude),
    }))
    .filter(loc => loc.distance <= maxMeters)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Haversine formula — distance in metres between two lat/lng points.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

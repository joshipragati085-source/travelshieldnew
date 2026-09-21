import {
  User,
  Provider,
  PriceCheckResult,
  TranslationResult,
  Complaint,
  SafetyAlert,
  MapMarker,
  TripItinerary,
  NotificationItem,
  ProviderReview
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-demo-001',
    name: 'Alex Johnson',
    email: 'demo@travelshield.com',
    country: 'United Kingdom',
    phone: '+44 7700 900077',
    preferredLanguage: 'English',
    travellerType: 'Solo Traveller',
    role: 'TOURIST',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'usr-demo-002',
    name: 'Priya Sharma',
    email: 'priya@travelshield.com',
    country: 'India',
    phone: '+91 98110 44556',
    preferredLanguage: 'Hindi',
    travellerType: 'Family',
    role: 'TOURIST',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'usr-pragati-085',
    name: 'Pragati Joshi',
    email: 'joshipragati085@gmail.com',
    country: 'India',
    phone: '+91 98765 43210',
    preferredLanguage: 'English',
    travellerType: 'Solo Traveller',
    role: 'TOURIST',
    createdAt: new Date().toISOString()
  }
];

export const mockProviders: Provider[] = [
  {
    id: 'prov-001',
    name: 'Delhi Metro & Airport Prepaid Express Cab Association',
    category: 'Transport',
    city: 'Delhi',
    location: 'IGI Airport Terminal 3 & Connaught Place, New Delhi',
    isVerified: true,
    licenseNumber: 'DL-GOV-TP-2024-8841',
    trustScore: 94,
    trustBreakdown: {
      overall: 94,
      tier: 'Highly Trusted',
      verification: 100,
      reviewsScore: 92,
      complaintHistory: 98,
      serviceReliability: 95,
      recentActivity: 90
    },
    rating: 4.8,
    reviewCount: 342,
    complaintRate: 0.1,
    priceRange: '₹700 – ₹1,100 (Metered / Prepaid Voucher)',
    phone: '+91 11 2341 5566',
    email: 'helpdesk@delhiprepaid.gov.in',
    description: 'Government certified Delhi airport prepaid taxi counter and verified booth. Fixed tariff slips, GPS tracking, zero overcharging guarantee.',
    tags: ['Govt Certified', 'Fixed Voucher', 'GPS Tracked', '24x7 Counter'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 28.5562, lng: 77.1000 },
    reviewSentiment: {
      positive: 91,
      neutral: 7,
      negative: 2,
      riskKeywords: ['Safe late night', 'Exact receipt issued', 'Polite drivers'],
      summary: 'Tourists consistently praise transparent counter slips, strict meter enforcement, and polite English-speaking assistance at IGI Terminal 3.'
    }
  },
  {
    id: 'prov-002',
    name: 'Heritage Rajasthan Certified Guide Guild',
    category: 'Tour Guides',
    city: 'Jaipur',
    location: 'Amer Fort & City Palace, Jaipur, Rajasthan',
    isVerified: true,
    licenseNumber: 'RJ-TOUR-GD-4192',
    trustScore: 92,
    trustBreakdown: {
      overall: 92,
      tier: 'Highly Trusted',
      verification: 98,
      reviewsScore: 94,
      complaintHistory: 96,
      serviceReliability: 90,
      recentActivity: 88
    },
    rating: 4.9,
    reviewCount: 215,
    complaintRate: 0.1,
    priceRange: '₹1,200 – ₹2,000 / half day',
    phone: '+91 141 260 8899',
    email: 'guild@rajasthantourism.org',
    description: 'Ministry of Tourism approved badge-holding local historians. Transparent government-fixed fee card, no forced shopping commissions.',
    tags: ['Ministry Approved', 'Multilingual', 'No Shopping Traps', 'Badge Verified'],
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 26.9855, lng: 75.8513 },
    reviewSentiment: {
      positive: 94,
      neutral: 4,
      negative: 2,
      riskKeywords: ['Honest history', 'No hidden stops', 'Excellent English/French'],
      summary: 'Travellers report zero commission tricks and deeply educational tours through Amer Fort and City Palace.'
    }
  },
  {
    id: 'prov-003',
    name: 'The Imperial Heritage Stay',
    category: 'Hotels',
    city: 'Delhi',
    location: 'Janpath, Connaught Place, New Delhi',
    isVerified: true,
    licenseNumber: 'DL-HTL-A1-0988',
    trustScore: 96,
    trustBreakdown: {
      overall: 96,
      tier: 'Highly Trusted',
      verification: 100,
      reviewsScore: 96,
      complaintHistory: 99,
      serviceReliability: 95,
      recentActivity: 94
    },
    rating: 4.9,
    reviewCount: 480,
    complaintRate: 0.05,
    priceRange: '₹7,500 – ₹16,000 / night',
    phone: '+91 11 2334 1234',
    email: 'reservations@theimperialindia.com',
    description: 'Premier heritage property with 24/7 tourist safety desk, verified airport transfers, high-security surveillance, and concierge support.',
    tags: ['Safe Stay Verified', '24/7 Concierge', 'Solo Traveler Friendly', 'Central Location'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 28.6219, lng: 77.2185 },
    reviewSentiment: {
      positive: 96,
      neutral: 3,
      negative: 1,
      riskKeywords: ['High security', 'Kind staff', 'Trusted airport pickup'],
      summary: 'Exceptional security protocols, spotless amenities, and trusted taxi arrangements make it top rated for international tourists.'
    }
  },
  {
    id: 'prov-004',
    name: "Karim's Historic Dining & Culinary Walk",
    category: 'Restaurants',
    city: 'Delhi',
    location: 'Gali Kababian, Jama Masjid, Old Delhi',
    isVerified: true,
    licenseNumber: 'FSSAI-10014011002234',
    trustScore: 88,
    trustBreakdown: {
      overall: 88,
      tier: 'Trusted',
      verification: 95,
      reviewsScore: 89,
      complaintHistory: 92,
      serviceReliability: 86,
      recentActivity: 85
    },
    rating: 4.6,
    reviewCount: 1240,
    complaintRate: 0.3,
    priceRange: '₹400 – ₹900 per person',
    phone: '+91 11 2326 4981',
    email: 'care@karimshotels.com',
    description: 'Iconic Mughlai culinary institution established in 1913. FSSAI hygiene certified, printed bills with itemized pricing.',
    tags: ['FSSAI Certified', 'Printed Receipts', 'Iconic Heritage', 'Clean Drinking Water'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 28.6507, lng: 77.2334 },
    reviewSentiment: {
      positive: 88,
      neutral: 9,
      negative: 3,
      riskKeywords: ['Authentic taste', 'Itemized billing', 'Crowded at dinner'],
      summary: 'Highly recommended culinary stop with fair menu pricing and certified hygiene practices.'
    }
  },
  {
    id: 'prov-005',
    name: 'Varanasi Dawn Sunrise Boatman Cooperative',
    category: 'Activities',
    city: 'Varanasi',
    location: 'Dashashwamedh Ghat & Assi Ghat, Varanasi',
    isVerified: true,
    licenseNumber: 'UP-VAR-BOAT-1044',
    trustScore: 91,
    trustBreakdown: {
      overall: 91,
      tier: 'Highly Trusted',
      verification: 96,
      reviewsScore: 92,
      complaintHistory: 95,
      serviceReliability: 90,
      recentActivity: 88
    },
    rating: 4.8,
    reviewCount: 310,
    complaintRate: 0.2,
    priceRange: '₹400 – ₹700 (Rowboat) / ₹1,200 (Motorboat)',
    phone: '+91 542 227 5050',
    email: 'gangaboatcoop@varanasi.gov.in',
    description: 'Official boatmen society of Ganga Ghats. Regulated life-jackets provided on all boats, fixed sunrise & sunset rate charts.',
    tags: ['Life Jackets Provided', 'Govt Rate Chart', 'Verified Boatmen', 'Assi to Manikarnika'],
    image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 25.3076, lng: 83.0107 },
    reviewSentiment: {
      positive: 92,
      neutral: 6,
      negative: 2,
      riskKeywords: ['Safety jackets checked', 'Peaceful experience', 'No mid-river bargaining'],
      summary: 'Tourists appreciate adherence to fixed rate boards and safety life jackets for all passengers.'
    }
  },
  {
    id: 'prov-006',
    name: 'Mumbai Coastal Safari & Gateway Tour Operators',
    category: 'Tour Operators',
    city: 'Mumbai',
    location: 'Colaba & Gateway of India, Mumbai, Maharashtra',
    isVerified: true,
    licenseNumber: 'MH-MUM-TO-3321',
    trustScore: 89,
    trustBreakdown: {
      overall: 89,
      tier: 'Trusted',
      verification: 95,
      reviewsScore: 88,
      complaintHistory: 90,
      serviceReliability: 89,
      recentActivity: 86
    },
    rating: 4.7,
    reviewCount: 198,
    complaintRate: 0.4,
    priceRange: '₹1,500 – ₹3,500 / full day tour',
    phone: '+91 22 2284 3300',
    email: 'info@mumbaisafari.in',
    description: 'Licensed Maharashtra Tourism tour operator offering walking tours, Elephanta caves excursions, and heritage south Mumbai walks.',
    tags: ['MTDC Partner', 'Licensed Guide', 'Air Conditioned Fleet', 'Digital Booking'],
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    coordinates: { lat: 18.9220, lng: 72.8347 },
    reviewSentiment: {
      positive: 89,
      neutral: 8,
      negative: 3,
      riskKeywords: ['Smooth coordination', 'Punctual AC coach', 'Clear itinerary'],
      summary: 'Reliable city highlights tour with verified guides and transparent inclusions.'
    }
  }
];

export const mockReviews: ProviderReview[] = [
  {
    id: 'rev-001',
    providerId: 'prov-001',
    userId: 'usr-demo-001',
    userName: 'Alex Johnson',
    userCountry: 'United Kingdom',
    rating: 5,
    comment: 'Took the prepaid cab from Delhi Airport Terminal 3 to Connaught Place at 11 PM. The counter gave a printed slip for ₹820 and the driver was prompt, helpful with luggage, and followed the GPS route strictly.',
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rev-002',
    providerId: 'prov-001',
    userId: 'usr-demo-002',
    userName: 'Sophie Martin',
    userCountry: 'France',
    rating: 5,
    comment: 'No hassles, no bargaining required. The slip system eliminates scams completely.',
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'rev-003',
    providerId: 'prov-002',
    userId: 'usr-demo-001',
    userName: 'David Miller',
    userCountry: 'Australia',
    rating: 5,
    comment: 'Our guide Rajesh at Amer fort had his official government card and knew all architectural secrets. Never pressured us into shopping emporiums.',
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

export const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: 'alt-001',
    title: 'Paharganj / New Delhi Station Touts Advisory',
    description: 'Unverified individuals claiming that hotels in the area are closed or under renovation to redirect tourists to expensive private agencies. Always proceed directly to your booked stay.',
    city: 'Delhi',
    location: 'Paharganj & New Delhi Railway Station Area',
    severity: 'Medium',
    category: 'Scam Advisory',
    date: 'Active Today',
    active: true
  },
  {
    id: 'alt-002',
    title: 'Monsoon Ghat High Water Flow Alert',
    description: 'Moderate currents along outer Varanasi steps. Please board only certified cooperative boats equipped with life jackets.',
    city: 'Varanasi',
    location: 'Main Dashashwamedh to Assi Ghat line',
    severity: 'Low',
    category: 'Weather & Monsoon',
    date: 'Active Today',
    active: true
  },
  {
    id: 'alt-003',
    title: 'Hawa Mahal Unofficial Gemstone Stores Alert',
    description: 'Beware of unregistered street vendors offering synthetic stones with fake certificate cards. Purchase only from Govt Rajasthan Emporium (Rajasthali).',
    city: 'Jaipur',
    location: 'Johari Bazaar & Badi Chaupar, Jaipur',
    severity: 'Medium',
    category: 'Scam Advisory',
    date: 'Active Today',
    active: true
  },
  {
    id: 'alt-004',
    title: 'Protected Tourist Police Zone - Connaught Place',
    description: 'Dedicated 24/7 Tourist Police kiosks operating in Inner Circle Blocks A, C & F. Multilingual officers available for immediate assistance.',
    city: 'Delhi',
    location: 'Connaught Place Radial Roads',
    severity: 'Low',
    category: 'General',
    date: 'Active 24x7',
    active: true
  }
];

export const mockComplaints: Complaint[] = [
  {
    id: 'TS-2026-00109',
    userId: 'usr-demo-001',
    userName: 'Alex Johnson',
    userEmail: 'demo@travelshield.com',
    providerName: 'Unregistered Yellow Taxi DL1T-9921',
    category: 'Overcharging',
    location: 'New Delhi Railway Station Paharganj Exit',
    description: 'Driver demanded ₹1,400 for a 4km ride to Karol Bagh, refusing to switch on the meter and claiming surge night tax.',
    amount: 1400,
    currency: 'INR',
    date: '2026-08-25',
    evidence: 'Photo of vehicle license plate and audio recording of demand.',
    status: 'Resolved',
    priority: 'High',
    timeline: [
      { step: 'Submitted', timestamp: '2026-08-25T14:30:00Z', note: 'Complaint logged into TravelShield safety system' },
      { step: 'Under Review', timestamp: '2026-08-25T15:10:00Z', note: 'Verified against Delhi transport regulatory fare rates' },
      { step: 'Action Taken', timestamp: '2026-08-26T09:00:00Z', note: 'Notice issued via Tourist Police Liaison Desk' },
      { step: 'Resolved', timestamp: '2026-08-26T17:00:00Z', note: 'Official refund advisory & cautionary flag placed on vehicle' }
    ],
    createdAt: '2026-08-25T14:30:00Z'
  }
];

export const mockTrips: TripItinerary[] = [
  {
    id: 'trip-001',
    userId: 'usr-demo-001',
    title: 'Golden Triangle Exploration (Delhi - Agra - Jaipur)',
    destination: 'New Delhi & Jaipur',
    startDate: '2026-08-27',
    endDate: '2026-09-03',
    hotel: 'The Imperial Heritage Stay (Verified)',
    transport: 'Prepaid Delhi Airport Cab & Gatimaan Express',
    emergencyContacts: [
      { name: 'Sarah Johnson (Sister)', relation: 'Family', phone: '+44 7700 900112' },
      { name: 'Delhi Tourist Police Cell', relation: 'Official Kiosk', phone: '1363' }
    ],
    savedPlaces: ['Connaught Place', 'Qutub Minar', 'Amer Fort', 'City Palace Jaipur', 'Dashashwamedh Ghat'],
    safetyScore: 96,
    sharedToken: 'TS-TRIP-9921'
  }
];

export const mockMapMarkers: MapMarker[] = [
  {
    id: 'marker-01',
    name: 'IGI Airport Terminal 3 Tourist Police Post',
    category: 'police',
    city: 'Delhi',
    lat: 28.5562,
    lng: 77.1000,
    address: 'Arrivals Gate 4, Terminal 3, IGI Airport',
    phone: '011-25652011',
    details: '24x7 Tourist Police Desk with prepaid taxi oversight'
  },
  {
    id: 'marker-02',
    name: 'Connaught Place Block A Tourist Assistance Kiosk',
    category: 'helpdesk',
    city: 'Delhi',
    lat: 28.6328,
    lng: 77.2197,
    address: 'Block A, Inner Circle, Connaught Place, New Delhi',
    phone: '1363',
    details: 'Multilingual assistance officers & official city map distribution'
  },
  {
    id: 'marker-03',
    name: 'Amer Fort Tourism Police & Prepaid Auto Booth',
    category: 'transport',
    city: 'Jaipur',
    lat: 26.9855,
    lng: 75.8513,
    address: 'Main Courtyard Exit, Amer Fort, Jaipur',
    phone: '0141-2530264',
    details: 'Government rate board for Elephant Village & Jal Mahal return'
  },
  {
    id: 'marker-04',
    name: 'Assi Ghat River Safety Patrol Kiosk',
    category: 'police',
    city: 'Varanasi',
    lat: 25.2885,
    lng: 83.0062,
    address: 'Assi Ghat Steps, Varanasi',
    phone: '0542-2275050',
    details: 'Water police helpline and boat rate card verification center'
  },
  {
    id: 'marker-05',
    name: 'Gateway of India MTDC Tourist Information Center',
    category: 'helpdesk',
    city: 'Mumbai',
    lat: 18.9220,
    lng: 72.8347,
    address: 'Opposite Taj Mahal Palace, Colaba, Mumbai',
    phone: '022-22845678',
    details: 'Elephanta caves ferry tickets & licensed guide verification'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Active Trip Safety Radar Enabled',
    message: 'Your route in Central Delhi is fully covered by 24x7 Tourist Police kiosks.',
    type: 'safety',
    date: '10 mins ago',
    read: false
  },
  {
    id: 'notif-02',
    title: 'Fare Protection Reminder',
    message: 'Always demand a prepaid voucher or standard meter before boarding autos at rail stations.',
    type: 'alert',
    date: '2 hours ago',
    read: false
  }
];

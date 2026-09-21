// Database schema and seed data for city-specific transport fare rules
// Configurable and updatable via admin APIs, stored on the backend.

export interface CityFareRuleRecord {
  id: string;
  city: string;
  state: string;
  transportType: string; // 'Taxi' | 'Auto-Rickshaw' | 'Bus' | 'Metro' | 'Tour Guide' | etc.
  vehicleCategory: string; // 'Sedan (AC)' | 'Hatchback (Non-AC)' | 'Auto-Rickshaw (3W)' | etc.
  baseFare: number;
  baseKm: number;
  perKmRate: number;
  waitingChargePerHour: number;
  nightSurchargePercentage: number; // e.g., 25 for 25%
  nightWindowStart: string; // '23:00'
  nightWindowEnd: string; // '05:00'
  estimatedTolls: number;
  luggageChargePerBag: number;
  isOfficialTariff: boolean; // True ONLY if matched to official published state/RTO gazettes
  regulatoryAuthority: string; // Exact statutory or departmental body
  gazetteRefUrlOrDate: string;
  officialNotes: string;
  updatedAt: string;
}

export interface RouteDistancePreset {
  id: string;
  city: string;
  source: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  typicalToll: number;
  notes: string;
}

// Stored City Fare Rules (Government Gazette tariffs where available, or calibrated benchmark guidelines)
export const initialCityFareRules: CityFareRuleRecord[] = [
  // --- DELHI NCR ---
  {
    id: 'rule-del-taxi-sedan',
    city: 'Delhi',
    state: 'Delhi NCR',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 40,
    baseKm: 1.0,
    perKmRate: 20.0,
    waitingChargePerHour: 30,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 15,
    isOfficialTariff: true,
    regulatoryAuthority: 'Delhi Transport Department Gazette Revision (F.No. 19/2022/Ops/Tpt)',
    gazetteRefUrlOrDate: 'Notified Gazette Order dated 28-10-2022',
    officialNotes: 'Official meter fare: ₹40 for first 1 km, ₹20/km thereafter for AC taxi. Night surcharge of 25% applies from 23:00 to 05:00.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-del-taxi-nonac',
    city: 'Delhi',
    state: 'Delhi NCR',
    transportType: 'Taxi',
    vehicleCategory: 'Hatchback (Non-AC)',
    baseFare: 40,
    baseKm: 1.0,
    perKmRate: 17.0,
    waitingChargePerHour: 30,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 10,
    isOfficialTariff: true,
    regulatoryAuthority: 'Delhi Transport Department Gazette Notification',
    gazetteRefUrlOrDate: 'Gazette Oct 2022',
    officialNotes: 'Non-AC meter: ₹40 for first km + ₹17/km thereafter. Night surcharge 25%.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-del-auto',
    city: 'Delhi',
    state: 'Delhi NCR',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Auto-Rickshaw (3W)',
    baseFare: 30,
    baseKm: 1.5,
    perKmRate: 11.0,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 10,
    isOfficialTariff: true,
    regulatoryAuthority: 'Delhi State Transport Authority (STA) Notification',
    gazetteRefUrlOrDate: 'Notification No. F.23(336)/TPT/OPS/2019/3362',
    officialNotes: 'Flag down fare: ₹30 for initial 1.5 km, ₹11 per subsequent km. Extra 25% night charge between 23:00 and 05:00.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- MUMBAI ---
  {
    id: 'rule-mum-taxi-cool',
    city: 'Mumbai',
    state: 'Maharashtra',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 33,
    baseKm: 1.5,
    perKmRate: 21.0,
    waitingChargePerHour: 35,
    nightSurchargePercentage: 25,
    nightWindowStart: '00:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 85, // Sea Link / Airport toll where applicable
    luggageChargePerBag: 10,
    isOfficialTariff: true,
    regulatoryAuthority: 'Maharashtra Transport Department (MMRTA Gazetted Resolution)',
    gazetteRefUrlOrDate: 'Khatua Committee Tariff Notification (MMRTA)',
    officialNotes: 'Official Cool Cab AC base fare ₹33 for first 1.5 km, ₹21 per km thereafter. Midnight surcharge 25% from 00:00 to 05:00.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-mum-taxi-blackyellow',
    city: 'Mumbai',
    state: 'Maharashtra',
    transportType: 'Taxi',
    vehicleCategory: 'Hatchback (Non-AC)',
    baseFare: 28,
    baseKm: 1.5,
    perKmRate: 18.66,
    waitingChargePerHour: 25,
    nightSurchargePercentage: 25,
    nightWindowStart: '00:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 6,
    isOfficialTariff: true,
    regulatoryAuthority: 'Mumbai Metropolitan Region Transport Authority (MMRTA)',
    gazetteRefUrlOrDate: 'MMRTA Fare Order 2022',
    officialNotes: 'Khatua formula: ₹28 for first 1.5 km, ₹18.66/km. Night surcharge 25%.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-mum-auto',
    city: 'Mumbai',
    state: 'Maharashtra',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Auto-Rickshaw (3W)',
    baseFare: 23,
    baseKm: 1.5,
    perKmRate: 15.33,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 25,
    nightWindowStart: '00:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 5,
    isOfficialTariff: true,
    regulatoryAuthority: 'Mumbai Metropolitan Region Transport Authority (MMRTA)',
    gazetteRefUrlOrDate: 'MMRTA Order Oct 2022',
    officialNotes: 'Meter auto fare: ₹23 for first 1.5 km, ₹15.33 per km thereafter in suburban Mumbai.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- JAIPUR ---
  {
    id: 'rule-jai-taxi-sedan',
    city: 'Jaipur',
    state: 'Rajasthan',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 50,
    baseKm: 1.0,
    perKmRate: 18.0,
    waitingChargePerHour: 40,
    nightSurchargePercentage: 20,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 10,
    isOfficialTariff: true,
    regulatoryAuthority: 'Rajasthan Transport Department (RTO Jaipur)',
    gazetteRefUrlOrDate: 'RTO Tariff Guideline Card 2023',
    officialNotes: 'City tourist cab tariff: ₹50 first km + ₹18/km for standard AC sedan.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-jai-auto',
    city: 'Jaipur',
    state: 'Rajasthan',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Auto-Rickshaw (3W)',
    baseFare: 30,
    baseKm: 1.5,
    perKmRate: 12.0,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 20,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 5,
    isOfficialTariff: true,
    regulatoryAuthority: 'Jaipur Traffic Police & Regional Transport Office',
    gazetteRefUrlOrDate: 'Prepaid Booth Schedule Jaipur Junction',
    officialNotes: 'Regulated prepaid booth tariff card at Jaipur Railway Station & Sindhi Camp.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- BENGALURU ---
  {
    id: 'rule-blr-taxi-sedan',
    city: 'Bengaluru',
    state: 'Karnataka',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 100,
    baseKm: 4.0,
    perKmRate: 24.0,
    waitingChargePerHour: 50,
    nightSurchargePercentage: 10,
    nightWindowStart: '00:00',
    nightWindowEnd: '06:00',
    estimatedTolls: 105, // KIA Airport trumpet expressway toll
    luggageChargePerBag: 0,
    isOfficialTariff: true,
    regulatoryAuthority: 'Karnataka State Transport Department (KSRTC/RTO Bengaluru)',
    gazetteRefUrlOrDate: 'Karnataka City Taxi Rules Notification Feb 2024',
    officialNotes: 'Class B (Vehicles priced ₹10L-₹15L): ₹100 for first 4 km, ₹24/km thereafter. 10% night allowance 00:00-06:00.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-blr-auto',
    city: 'Bengaluru',
    state: 'Karnataka',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Auto-Rickshaw (3W)',
    baseFare: 30,
    baseKm: 2.0,
    perKmRate: 15.0,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 50,
    nightWindowStart: '22:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 0,
    isOfficialTariff: true,
    regulatoryAuthority: 'Bengaluru City Police & Transport Department',
    gazetteRefUrlOrDate: 'Notification No. TD 246 TME 2021',
    officialNotes: 'Official auto meter: ₹30 for first 2 km, ₹15 per km thereafter. 50% night charge applies between 22:00 and 05:00.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- AGRA ---
  {
    id: 'rule-agra-taxi',
    city: 'Agra',
    state: 'Uttar Pradesh',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 60,
    baseKm: 1.5,
    perKmRate: 19.0,
    waitingChargePerHour: 40,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 10,
    isOfficialTariff: true,
    regulatoryAuthority: 'Agra Regional Transport Authority (UP RTO)',
    gazetteRefUrlOrDate: 'Agra Cantonment Station Prepaid Tariff Board',
    officialNotes: 'Prepaid rate card established by Agra Police & UP Tourism at Cantt Railway Station.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-agra-auto',
    city: 'Agra',
    state: 'Uttar Pradesh',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Electric Auto',
    baseFare: 35,
    baseKm: 1.5,
    perKmRate: 13.0,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 20,
    nightWindowStart: '22:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 5,
    isOfficialTariff: true,
    regulatoryAuthority: 'Taj Trapezium Zone (TTZ) Pollution Control Board & RTO Agra',
    gazetteRefUrlOrDate: 'TTZ Clean Transit Advisory 2023',
    officialNotes: 'Green electric auto rickshaws operating in the Taj heritage corridor.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- GOA ---
  {
    id: 'rule-goa-taxi',
    city: 'Goa',
    state: 'Goa',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 100,
    baseKm: 2.0,
    perKmRate: 26.0,
    waitingChargePerHour: 60,
    nightSurchargePercentage: 35,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 15,
    isOfficialTariff: true,
    regulatoryAuthority: 'Goa Directorate of Transport (GoaMiles / Dabolim Airport Tariff)',
    gazetteRefUrlOrDate: 'Goa Motor Vehicles Rules & Airport Authority Tariff',
    officialNotes: 'Airport prepaid counter approved slab rates at Dabolim (GOI) and Mopa (GOX) airports.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- VARANASI ---
  {
    id: 'rule-var-boat',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    transportType: 'Boat / Safari',
    vehicleCategory: 'Hand-rowed Ghat Boat',
    baseFare: 200,
    baseKm: 1.0,
    perKmRate: 150.0,
    waitingChargePerHour: 100,
    nightSurchargePercentage: 0,
    nightWindowStart: '20:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 0,
    isOfficialTariff: false, // Benchmark estimate
    regulatoryAuthority: 'Varanasi Boatmen Union & District Administration Benchmark',
    gazetteRefUrlOrDate: 'Local Ghat Cooperative Benchmark (Assi to Dashashwamedh)',
    officialNotes: 'Fair advisory guideline: ₹300–₹600 for typical 1-hour sunrise/sunset boat ride for up to 4 persons.',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // --- GENERAL REGIONAL BENCHMARK (For any unlisted city) ---
  {
    id: 'rule-general-taxi',
    city: 'General / Other',
    state: 'India Benchmark',
    transportType: 'Taxi',
    vehicleCategory: 'Sedan (AC)',
    baseFare: 50,
    baseKm: 1.5,
    perKmRate: 18.0,
    waitingChargePerHour: 35,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 10,
    isOfficialTariff: false, // NOT official: TravelShield calibrated benchmark
    regulatoryAuthority: 'TravelShield Calibrated National Benchmark (Tier-1/2 Metros)',
    gazetteRefUrlOrDate: 'TravelShield Aggregate Transit Index 2026',
    officialNotes: 'Calibrated heuristic reference derived from aggregate state transit averages across India.',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-general-auto',
    city: 'General / Other',
    state: 'India Benchmark',
    transportType: 'Auto-Rickshaw',
    vehicleCategory: 'Auto-Rickshaw (3W)',
    baseFare: 30,
    baseKm: 1.5,
    perKmRate: 12.0,
    waitingChargePerHour: 20,
    nightSurchargePercentage: 25,
    nightWindowStart: '23:00',
    nightWindowEnd: '05:00',
    estimatedTolls: 0,
    luggageChargePerBag: 5,
    isOfficialTariff: false,
    regulatoryAuthority: 'TravelShield Calibrated National Benchmark',
    gazetteRefUrlOrDate: 'TravelShield Aggregate Transit Index 2026',
    officialNotes: 'Calibrated heuristic reference based on standard Indian city meter averages.',
    updatedAt: '2026-03-01T00:00:00Z'
  }
];

// Presets for common tourist routes with reliable distance knowledge
export const routeDistancePresets: RouteDistancePreset[] = [
  {
    id: 'route-del-01',
    city: 'Delhi',
    source: 'delhi airport (t3)',
    destination: 'connaught place',
    distanceKm: 16.5,
    estimatedMinutes: 40,
    typicalToll: 0,
    notes: 'Direct via Aerocity & Vandemataram Marg / Dhaula Kuan'
  },
  {
    id: 'route-del-02',
    city: 'Delhi',
    source: 'delhi airport (t3)',
    destination: 'paharganj / new delhi rly station',
    distanceKm: 18.0,
    estimatedMinutes: 45,
    typicalToll: 0,
    notes: 'Via Ring Road or Dhaula Kuan corridor'
  },
  {
    id: 'route-del-03',
    city: 'Delhi',
    source: 'connaught place',
    destination: 'red fort / chandni chowk',
    distanceKm: 5.5,
    estimatedMinutes: 20,
    typicalToll: 0,
    notes: 'Via Delhi Gate and Netaji Subhash Marg'
  },
  {
    id: 'route-mum-01',
    city: 'Mumbai',
    source: 'mumbai airport (t2)',
    destination: 'colaba / gateway of india',
    distanceKm: 24.5,
    estimatedMinutes: 60,
    typicalToll: 85,
    notes: 'Via Western Express Highway & Rajiv Gandhi Sea Link'
  },
  {
    id: 'route-mum-02',
    city: 'Mumbai',
    source: 'mumbai airport (t2)',
    destination: 'bandra kurla complex (bkc)',
    distanceKm: 6.5,
    estimatedMinutes: 20,
    typicalToll: 0,
    notes: 'Via BKC connector elevated road'
  },
  {
    id: 'route-jai-01',
    city: 'Jaipur',
    source: 'jaipur railway station',
    destination: 'amer fort',
    distanceKm: 13.5,
    estimatedMinutes: 35,
    typicalToll: 0,
    notes: 'Via MI Road, Zorawar Singh Gate & Amer Road'
  },
  {
    id: 'route-jai-02',
    city: 'Jaipur',
    source: 'hawa mahal',
    destination: 'nahargarh fort',
    distanceKm: 14.0,
    estimatedMinutes: 40,
    typicalToll: 0,
    notes: 'Hill climb via Charan Mandir'
  },
  {
    id: 'route-blr-01',
    city: 'Bengaluru',
    source: 'bengaluru airport (kia)',
    destination: 'mg road / indiranagar',
    distanceKm: 36.0,
    estimatedMinutes: 70,
    typicalToll: 105,
    notes: 'Via Bellary Road Elevated Expressway and Hebbal'
  },
  {
    id: 'route-agra-01',
    city: 'Agra',
    source: 'agra cantt station',
    destination: 'taj mahal east gate',
    distanceKm: 7.0,
    estimatedMinutes: 22,
    typicalToll: 0,
    notes: 'Via Mall Road and Fatehabad Road'
  },
  {
    id: 'route-goa-01',
    city: 'Goa',
    source: 'goa dabolim airport',
    destination: 'calangute beach / candolim',
    distanceKm: 41.0,
    estimatedMinutes: 75,
    typicalToll: 0,
    notes: 'Via Zuari Bridge and Panaji bypass'
  }
];

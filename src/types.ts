export type TravellerType = 'Solo Traveller' | 'Family' | 'Couple' | 'Group' | 'Business';

export type UserRole = 'TOURIST' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  preferredLanguage: string;
  travellerType: TravellerType;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export type ProviderCategory = 'Transport' | 'Hotels' | 'Restaurants' | 'Tour Guides' | 'Tour Operators' | 'Activities';

export interface TrustScoreBreakdown {
  overall: number; // 0-100
  tier: 'Highly Trusted' | 'Trusted' | 'Moderate' | 'Needs Caution';
  verification: number; // %
  reviewsScore: number; // %
  complaintHistory: number; // %
  serviceReliability: number; // %
  recentActivity: number; // %
}

export interface ReviewSentiment {
  positive: number;
  neutral: number;
  negative: number;
  riskKeywords: string[];
  summary: string;
}

export interface ProviderReview {
  id: string;
  providerId?: string;
  userId: string;
  userName: string;
  userCountry?: string;
  rating: number; // 1-5
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  city: string;
  location: string;
  isVerified: boolean;
  licenseNumber?: string;
  trustScore: number;
  trustBreakdown: TrustScoreBreakdown;
  rating: number;
  reviewCount: number;
  complaintRate: number; // e.g. 0.1%
  priceRange: string;
  phone: string;
  email?: string;
  description: string;
  tags: string[];
  image: string;
  coordinates: { lat: number; lng: number };
  reviewSentiment?: ReviewSentiment;
}

export type PriceStatus = 'FAIR' | 'HIGH' | 'POSSIBLE OVERCHARGING' | 'LOW';

export type TransportType = 'Taxi' | 'Auto-Rickshaw' | 'Bus' | 'Metro' | 'Ride-Hailing' | 'Tour Guide' | 'Boat / Safari' | 'Other';
export type VehicleCategory = 'Hatchback (Non-AC)' | 'Sedan (AC)' | 'SUV / Prime' | 'Auto-Rickshaw (3W)' | 'Electric Auto' | 'Standard Coach' | 'Hand-rowed Ghat Boat' | 'Motorized Safari' | string;

export interface CityFareRule {
  id: string;
  city: string;
  state: string;
  transportType: TransportType | string;
  vehicleCategory?: string;
  baseFare: number;
  baseKm: number;
  perKmRate: number;
  waitingChargePerHour?: number;
  nightSurchargePercentage: number; // e.g. 25%
  nightWindowStart: string; // e.g. "23:00"
  nightWindowEnd: string; // e.g. "05:00"
  estimatedTolls?: number;
  luggageChargePerBag?: number;
  isOfficialTariff: boolean;
  regulatoryAuthority: string; // e.g. "Delhi Transport Department Gazette (2023)" or "TravelShield Regional Benchmark"
  gazetteRefUrlOrDate?: string;
  officialNotes?: string;
  updatedAt: string;
}

export interface PriceCheckRequest {
  city: string;
  serviceType: TransportType | string;
  source: string;
  destination: string;
  quotedPrice: number;
  distanceKm?: number;
  travelTime?: string; // e.g. "14:30" or "23:45"
  vehicleType?: VehicleCategory | string;
}

export interface CalculationFactor {
  label: string;
  amount: number;
  formulaDescription: string;
}

export interface SaferAlternative {
  id: string;
  name: string;
  type: 'Official Prepaid Counter' | 'Public Transport' | 'Verified App Service' | 'Tourist Helpline Service';
  description: string;
  estimatedFareRange: string;
  howToAccess: string;
  trustScore?: number;
  locationTip?: string;
}

export interface DetailedFareCalculation {
  quotedPrice: number;
  city: string;
  transportType: string;
  vehicleType: string;
  pickup: string;
  destination: string;
  travelTime: string;
  isNightTime: boolean;
  computedDistanceKm: number;
  isCustomDistance: boolean;
  
  // Three strictly separated layers:
  officialData: {
    hasOfficialTariff: boolean;
    regulatoryAuthority: string;
    officialBaseFare: number;
    officialPerKmRate: number;
    officialNightPercentage: number;
    officialGazetteNote?: string;
  };
  
  travelShieldEstimate: {
    minimumReasonable: number;
    maximumReasonable: number;
    medianEstimatedFare: number;
    status: PriceStatus;
    deviationPercentage: number;
    explanation: string;
    factors: CalculationFactor[];
    calculationSteps: string[];
    isLegalClaim: boolean; // strictly false
  };

  aiGuidance: {
    summary: string;
    negotiationTip: string;
    localContextAdvice: string;
    safetyWatchout: string;
  };

  saferAlternatives: SaferAlternative[];
  fareRuleUsed?: CityFareRule;
}

export interface PriceCheckResult {
  quotedPrice: number;
  referenceMin: number;
  referenceMax: number;
  status: PriceStatus;
  message: string;
  distanceKm?: number;
  estimatedTime?: string;
  breakdown?: {
    baseFare: number;
    perKmRate: number;
    tollOrNightCharge?: number;
    recommendedRateNote: string;
  };
  detailed?: DetailedFareCalculation;
  alternativeProvider?: {
    id: string;
    name: string;
    trustScore: number;
    estimatedFare: string;
    category: string;
  };
}

export interface SavedFareCheck {
  id: string;
  userId?: string;
  city: string;
  transportType: string;
  pickup: string;
  destination: string;
  quotedPrice: number;
  estimatedMin: number;
  estimatedMax: number;
  status: PriceStatus;
  distanceKm: number;
  timestamp: string;
  notes?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
  isEmergency?: boolean;
  isError?: boolean;
  canRetry?: boolean;
  originalPrompt?: string;
  source?: string;
  model?: string;
  disclaimer?: string;
  actionSuggestions?: { label: string; action: string; payload?: any }[];
}

export interface TranslationResult {
  sourceText?: string;
  originalText?: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  phoneticGuide?: string;
  explanation: string;
  culturalNote?: string;
  safetyTip?: string;
}

export type ComplaintCategory = 
  | 'Overcharging' 
  | 'Fake Service' 
  | 'Misleading Information' 
  | 'Safety Issue' 
  | 'Transport Problem' 
  | 'Hotel Problem' 
  | 'Other';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Action Taken' | 'Resolved';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  providerName: string;
  providerId?: string;
  category: ComplaintCategory;
  location: string;
  description: string;
  amount?: number;
  currency?: string;
  date: string;
  evidence?: string;
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  timeline: {
    step: string;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
}

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  category: 'Scam Advisory' | 'Traffic & Transport' | 'Weather & Monsoon' | 'Festival Crowd' | 'General';
  date: string;
  active: boolean;
}

export interface MapMarker {
  id: string;
  title?: string;
  name?: string;
  type?: 'hotel' | 'restaurant' | 'transport' | 'police' | 'hospital' | 'attraction' | 'help_center' | 'helpdesk';
  category?: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  contact?: string;
  phone?: string;
  details?: string;
  trustScore?: number;
  isVerified?: boolean;
}

export interface TripItinerary {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  hotel: string;
  transport: string;
  emergencyContacts: { name: string; relation: string; phone: string }[];
  savedPlaces: string[];
  safetyScore: number;
  sharedToken?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'verification' | 'safety' | 'price' | 'complaint' | 'system' | 'alert';
  timestamp?: string;
  date?: string;
  read: boolean;
  link?: string;
}

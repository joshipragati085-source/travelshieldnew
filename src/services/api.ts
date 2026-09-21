import {
  User,
  Provider,
  PriceCheckResult,
  PriceStatus,
  TranslationResult,
  Complaint,
  SafetyAlert,
  MapMarker,
  TripItinerary,
  NotificationItem,
  ProviderReview,
  CityFareRule,
  SavedFareCheck
} from '../types';
import { calculateDetailedFairPrice } from './fairPriceCalculator';
import { initialCityFareRules, routeDistancePresets } from '../data/fareRulesData';
import {
  mockUsers,
  mockProviders,
  mockReviews,
  mockSafetyAlerts,
  mockComplaints,
  mockTrips,
  mockMapMarkers,
  mockNotifications
} from '../data/mockData';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('travelshield_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Local storage keys for offline persistence
const STORAGE_COMPLAINTS_KEY = 'travelshield_stored_complaints';
const STORAGE_REVIEWS_KEY = 'travelshield_stored_reviews';
const STORAGE_TRIPS_KEY = 'travelshield_stored_trips';

function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLAINTS_KEY);
    return raw ? JSON.parse(raw) : mockComplaints;
  } catch {
    return mockComplaints;
  }
}

function getStoredReviews(): ProviderReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : mockReviews;
  } catch {
    return mockReviews;
  }
}

function getStoredTrips(): TripItinerary[] {
  try {
    const raw = localStorage.getItem(STORAGE_TRIPS_KEY);
    return raw ? JSON.parse(raw) : mockTrips;
  } catch {
    return mockTrips;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('travelshield_token', data.token);
        localStorage.setItem('travelshield_current_user', JSON.stringify(data.user));
        return data;
      }
      const err = await res.json().catch(() => ({ error: 'Invalid email or password' }));
      throw new Error(err.error || 'Invalid credentials');
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      // Resilient fallback only if server network is completely unreachable
      const matched = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        const token = `ts_tok_${Date.now()}`;
        localStorage.setItem('travelshield_token', token);
        localStorage.setItem('travelshield_current_user', JSON.stringify(matched));
        return { token, user: matched };
      }
      throw e;
    }
  },

  async loginGoogle(email?: string, name?: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('travelshield_token', data.token);
        localStorage.setItem('travelshield_current_user', JSON.stringify(data.user));
        return data;
      }
      const err = await res.json().catch(() => ({ error: 'Google sign-in failed' }));
      throw new Error(err.error || 'Google sign-in failed');
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      const userEmail = email || 'joshipragati085@gmail.com';
      const matched = mockUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase()) || {
        id: 'usr-pragati-085',
        name: name || 'Pragati Joshi',
        email: userEmail,
        country: 'India',
        phone: '+91 98765 43210',
        preferredLanguage: 'English',
        travellerType: 'Solo Traveller',
        role: 'TOURIST' as const,
        createdAt: new Date().toISOString()
      };
      const token = `ts_tok_${Date.now()}`;
      localStorage.setItem('travelshield_token', token);
      localStorage.setItem('travelshield_current_user', JSON.stringify(matched));
      return { token, user: matched };
    }
  },

  async register(data: Partial<User> & { password: string }): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem('travelshield_token', result.token);
        localStorage.setItem('travelshield_current_user', JSON.stringify(result.user));
        return result;
      }
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    } catch (e: any) {
      throw e;
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return res.json();
    } catch {}
    return {
      success: true,
      message: `Password reset verification link has been dispatched to ${email}.`
    };
  },

  async getMe(): Promise<{ user: User | null }> {
    try {
      const token = localStorage.getItem('travelshield_token');
      if (!token) {
        const stored = localStorage.getItem('travelshield_current_user');
        if (stored) {
          try {
            return { user: JSON.parse(stored) };
          } catch {}
        }
        return { user: null };
      }

      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('travelshield_current_user', JSON.stringify(data.user));
          return data;
        }
      } else if (res.status === 401 || res.status === 403) {
        // Fallback to cached profile if available to preserve user session
        const stored = localStorage.getItem('travelshield_current_user');
        if (stored) {
          try {
            return { user: JSON.parse(stored) };
          } catch {}
        }
        localStorage.removeItem('travelshield_token');
        localStorage.removeItem('travelshield_current_user');
        return { user: null };
      }
    } catch {}

    const stored = localStorage.getItem('travelshield_current_user');
    if (stored) {
      try {
        return { user: JSON.parse(stored) };
      } catch {}
    }
    return { user: null };
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('travelshield_token');
      localStorage.removeItem('travelshield_current_user');
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (res.ok) {
      const result = await res.json();
      localStorage.setItem('travelshield_current_user', JSON.stringify(result.user));
      return result;
    }

    const err = await res.json().catch(() => ({ error: 'Failed to update profile.' }));
    throw new Error(err.error || 'Failed to update profile.');
  },

  // Price Checker
  async checkPrice(
    serviceType: string,
    source: string,
    destination: string,
    quotedPrice: number,
    options?: {
      city?: string;
      distanceKm?: number;
      travelTime?: string;
      vehicleType?: string;
    }
  ): Promise<PriceCheckResult> {
    try {
      const res = await fetch(`${BASE_URL}/price/check`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          city: options?.city || 'Delhi',
          service_type: serviceType,
          transportType: serviceType,
          source,
          destination,
          quoted_price: quotedPrice,
          distanceKm: options?.distanceKm,
          travelTime: options?.travelTime,
          vehicleType: options?.vehicleType
        })
      });
      if (res.ok) return res.json();
    } catch {}

    // Offline / Fallback calculation with transparent configurable fare engine
    return calculateDetailedFairPrice({
      city: options?.city || 'Delhi',
      transportType: serviceType,
      vehicleCategory: options?.vehicleType,
      source,
      destination,
      quotedPrice,
      customDistanceKm: options?.distanceKm,
      travelTime: options?.travelTime,
      fareRulesDB: initialCityFareRules,
      routePresets: routeDistancePresets
    });
  },

  async getFareRules(filters?: { city?: string; transportType?: string }): Promise<CityFareRule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.append('city', filters.city);
      if (filters?.transportType) params.append('transportType', filters.transportType);

      const res = await fetch(`${BASE_URL}/fare-rules?${params.toString()}`);
      if (res.ok) return res.json();
    } catch {}

    let rules: any[] = [...initialCityFareRules];
    if (filters?.city) {
      rules = rules.filter(r => r.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.transportType) {
      rules = rules.filter(r => r.transportType.toLowerCase() === filters.transportType!.toLowerCase());
    }
    return rules;
  },

  async saveFareCheck(data: {
    city: string;
    transportType: string;
    pickup: string;
    destination: string;
    quotedPrice: number;
    estimatedMin: number;
    estimatedMax: number;
    status: PriceStatus;
    distanceKm: number;
    notes?: string;
  }): Promise<SavedFareCheck> {
    try {
      const res = await fetch(`${BASE_URL}/price/saved`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.item;
      }
    } catch {}

    const localItem: SavedFareCheck = {
      id: `local-${Date.now()}`,
      city: data.city,
      transportType: data.transportType,
      pickup: data.pickup,
      destination: data.destination,
      quotedPrice: data.quotedPrice,
      estimatedMin: data.estimatedMin,
      estimatedMax: data.estimatedMax,
      status: data.status,
      distanceKm: data.distanceKm,
      timestamp: new Date().toISOString(),
      notes: data.notes
    };

    try {
      const existing = JSON.parse(localStorage.getItem('travelshield_saved_fare_checks') || '[]');
      existing.unshift(localItem);
      localStorage.setItem('travelshield_saved_fare_checks', JSON.stringify(existing.slice(0, 30)));
    } catch {}

    return localItem;
  },

  async getSavedFareChecks(): Promise<SavedFareCheck[]> {
    try {
      const res = await fetch(`${BASE_URL}/price/saved`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {}

    try {
      const local = JSON.parse(localStorage.getItem('travelshield_saved_fare_checks') || '[]');
      if (local && local.length > 0) return local;
    } catch {}

    return [
      {
        id: 'sfc-demo-1',
        city: 'Delhi',
        transportType: 'Taxi',
        pickup: 'Delhi Airport (T3)',
        destination: 'Connaught Place',
        quotedPrice: 950,
        estimatedMin: 700,
        estimatedMax: 1050,
        status: 'FAIR',
        distanceKm: 16.5,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Verified airport taxi'
      }
    ];
  },

  async deleteSavedFareCheck(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/price/saved/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return true;
    } catch {}

    try {
      const existing = JSON.parse(localStorage.getItem('travelshield_saved_fare_checks') || '[]');
      const filtered = existing.filter((item: SavedFareCheck) => item.id !== id);
      localStorage.setItem('travelshield_saved_fare_checks', JSON.stringify(filtered));
    } catch {}
    return true;
  },

  // Providers
  async getProviders(filters?: { category?: string; city?: string; verified?: boolean; minTrust?: number; search?: string }): Promise<Provider[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.verified) params.append('verified', 'true');
      if (filters?.minTrust) params.append('minTrust', String(filters.minTrust));
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`${BASE_URL}/providers?${params.toString()}`);
      if (res.ok) return res.json();
    } catch {}

    let results = [...mockProviders];
    if (filters?.category && filters.category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.city && filters.city !== 'All') {
      results = results.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.minTrust) {
      results = results.filter(p => p.trustScore >= filters.minTrust!);
    }
    if (filters?.verified) {
      results = results.filter(p => p.isVerified);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return results;
  },

  async getProviderById(id: string): Promise<Provider | null> {
    try {
      const res = await fetch(`${BASE_URL}/providers/${id}`);
      if (res.ok) return res.json();
    } catch {}
    return mockProviders.find(p => p.id === id) || mockProviders[0];
  },

  async getProviderReviews(providerId: string): Promise<ProviderReview[]> {
    try {
      const res = await fetch(`${BASE_URL}/providers/${providerId}/reviews`);
      if (res.ok) return res.json();
    } catch {}
    const all = getStoredReviews();
    return all.filter(r => r.providerId === providerId);
  },

  async addReview(providerId: string, rating: number, comment: string): Promise<{ review: ProviderReview }> {
    try {
      const res = await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ providerId, rating, comment })
      });
      if (res.ok) return res.json();
    } catch {}

    const newRev: ProviderReview = {
      id: `rev-${Date.now()}`,
      providerId,
      userId: 'usr-demo-001',
      userName: 'Verified Explorer',
      userCountry: 'International Visitor',
      rating: Number(rating),
      comment,
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
      createdAt: new Date().toISOString()
    };
    const current = getStoredReviews();
    current.unshift(newRev);
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(current));
    return { review: newRev };
  },

  // AI Assistant (TravelShield Safety Assistant with OpenAI & Gemini support)
  async getAIProviders(): Promise<{
    openaiAvailable: boolean;
    geminiAvailable: boolean;
    openaiModel: string;
    defaultProvider: 'openai' | 'gemini';
    keyNotice?: string;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/ai/providers`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      openaiAvailable: false,
      geminiAvailable: true,
      openaiModel: 'gpt-4o-mini',
      defaultProvider: 'gemini'
    };
  },

  async askAI(
    message: string,
    language?: string,
    context?: any,
    conversationHistory?: Array<{ sender: 'user' | 'assistant'; text: string }>,
    provider?: 'openai' | 'gemini' | 'auto'
  ): Promise<{
    response: string;
    language: string;
    source?: string;
    model?: string;
    isEmergency?: boolean;
    disclaimer?: string;
    suggestedActions?: { label: string; action: string; payload?: any }[];
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18-second client timeout

    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message,
          language,
          provider: provider || 'auto',
          context,
          conversationHistory: conversationHistory?.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('AI request timed out. Please retry or contact the 24x7 Tourist Helpline at 1363.');
      }
    }

    // Resilient client-side safety AI fallback engine if server is unreachable
    const msg = message.toLowerCase();
    const isEmergency = msg.includes('emergency') || msg.includes('danger') || msg.includes('attack') || msg.includes('stolen') || msg.includes('hospital') || msg.includes('police');
    let response = "Welcome to India! As your TravelShield Safety Assistant, I'm here to ensure your journey is safe, fair, and hassle-free. For immediate transport, always use government prepaid taxi counters or certified app booths. If you encounter touts claiming hotels are closed or monuments have alternate entrances, disregard them and proceed directly to official entry gates. You can reach the 24x7 Multi-lingual Tourist Police at 1363 anytime!";

    if (isEmergency) {
      response = "🚨 **IMMEDIATE EMERGENCY SUPPORT**:\nIf you are in immediate danger or distress, **dial 112** (Universal Emergency) or **1363** (24x7 Tourist Police) right away. Do not wait for or rely on an AI assistant during an active crisis.\n\n• Universal Police/Emergency: **112**\n• Tourist Police: **1363**\n• Women Helpline: **1091**\n• Ambulance: **108**";
    } else if (msg.includes('taxi') || msg.includes('auto') || msg.includes('meter') || msg.includes('cab') || msg.includes('price') || msg.includes('fare')) {
      response = "🚖 **Transport Safety Advisory**:\n\n1. **Prepaid Counters**: At airports and major railway stations (like New Delhi & Howrah), always pay at the official Delhi Traffic Police / State Transport prepaid booth before boarding.\n2. **Meter Enforcement**: For street auto-rickshaws, ask: *'Bhaiya, meter se chaliye'* (Brother, please turn on the meter).\n3. **GPS Routing**: Keep Google Maps open on your phone so you can verify the route in real time.\n\n*Note: Dynamic tariffs should be verified at official prepaid counters.*";
    } else if (msg.includes('scam') || msg.includes('tout') || msg.includes('fake') || msg.includes('police')) {
      response = "🛡️ **Scam Countermeasures**:\n\n1. **'Hotel is Closed' Trick**: Touts may falsely claim your hotel is burnt, blocked by riots, or closed to take you to expensive private agencies. Always call your hotel directly.\n2. **Fake Ticket Offices**: Only buy monument tickets via ASI website (asi.payumoney.com) or official monument counter.\n3. **Emergency Support**: Dial **1363** for Tourist Police or **112** for Universal Emergency.";
    } else if (msg.includes('women') || msg.includes('solo') || msg.includes('night') || msg.includes('female')) {
      response = "👩 **Solo & Women Traveller Safety Protocol**:\n\n1. **Dedicated Helpline**: Dial **1091** (National Women Helpline) or **1363** (Tourist Police).\n2. **Metro Safety**: Indian metros (Delhi, Mumbai, Bengaluru) have reserved **Front Coaches for Women Only**.\n3. **Stay in Central Lit Areas**: Choose verified hotels in Connaught Place, South Delhi, Colaba, or C-Scheme Jaipur with 24x7 reception desks.";
    } else if (msg.includes('food') || msg.includes('water') || msg.includes('stomach') || msg.includes('health')) {
      response = "🥗 **Food & Water Hygiene Guide**:\n\n1. **Water**: Drink only sealed bottled water from reputed brands (Kinley, Aquafina, Bisleri). Verify the seal clicks on opening.\n2. **Street Food**: Choose bustling stalls where food is freshly cooked in front of you in piping hot oil or tandoors.\n3. **Emergency Medical**: Dial **108** / **112** for emergency ambulance routing to top accredited hospitals.";
    }

    return {
      response,
      language: language || 'English',
      source: 'TravelShield Tourism Safety Knowledge Base',
      isEmergency,
      disclaimer: 'Advisory guidance only. Not an official government authority. In any active emergency, immediately dial 112 or 1363.'
    };
  },

  async getOfficialSafetyContacts(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/ai/contacts`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      contacts: {
        emergency: { number: '112', name: 'Universal Emergency (Police/Fire/Ambulance)' },
        touristHelpline: { number: '1363', name: '24x7 Multi-lingual Tourist Helpline' },
        womenHelpline: { number: '1091', name: 'Women in Distress Helpline' },
        ambulance: { number: '108', name: 'National Ambulance Service' },
        railways: { number: '139', name: 'Indian Railways RailMadad' }
      },
      disclaimer: 'Advisory assistance only. Not an official government authority.'
    };
  },

  // Translate
  async translateText(text: string, sourceLanguage?: string, targetLanguage?: string): Promise<TranslationResult> {
    try {
      const res = await fetch(`${BASE_URL}/ai/translate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text, sourceLanguage, targetLanguage })
      });
      if (res.ok) return res.json();
    } catch {}

    const t = text.toLowerCase();
    let translated = "कृपया मुझे उचित दर बताएं (Kripya mujhe uchit dar batayein)";
    let phonetic = "Krip-ya mu-jhey u-chit dar ba-ta-yein";
    let explanation = "Polite request asking for the fair/standard official price.";
    let culturalNote = "Using 'Kripya' (Please) establishes respectful mutual rapport with drivers and shopkeepers.";

    if (t.includes('meter')) {
      translated = "भैया, कृपया मीटर चालू कीजिए (Bhaiya, kripya meter chaalu kijiye)";
      phonetic = "Bhai-ya, krip-ya mee-ter chaa-loo kee-ji-ye";
      explanation = "Standard respectful phrasing asking an auto/taxi driver to engage the fare meter.";
      culturalNote = "Addressing the driver warmly as 'Bhaiya' (brother) is standard polite etiquette across North & Central India.";
    } else if (t.includes('police') || t.includes('help') || t.includes('emergency')) {
      translated = "कृपया मेरी मदद करें, मुझे पुलिस सहायता चाहिए (Kripya meri madad karein, mujhe police sahayata chahiye)";
      phonetic = "Krip-ya me-ree ma-dad ka-rein, mu-jhey po-leece sa-ha-ya-ta chaa-hi-ye";
      explanation = "Emergency phrase requesting immediate police and safety assistance.";
      culturalNote = "Can be spoken to any station official, security guard, or bystander.";
    } else if (t.includes('how much') || t.includes('cost') || t.includes('price')) {
      translated = "यह कितने का है? (Yeh kitne ka hai?)";
      phonetic = "Yeh kit-ney kaa hai?";
      explanation = "Common Hindi inquiry for item or fare pricing.";
      culturalNote = "Simple and universally recognized in markets and street shops across India.";
    } else if (t.includes('receipt') || t.includes('bill')) {
      translated = "क्या मुझे रसीद / पक्का बिल मिल सकता है? (Kya mujhe raseed / pakka bill mil sakta hai?)";
      phonetic = "Kya mu-jhey ra-seed / pak-kaa bill mil sak-taa hai?";
      explanation = "Request for an itemized official printed bill or receipt.";
      culturalNote = "Requesting a 'pakka bill' ensures you are being billed according to registered GST rates.";
    }

    return {
      originalText: text,
      sourceLanguage: sourceLanguage || 'English',
      targetLanguage: targetLanguage || 'Hindi',
      translatedText: translated,
      phoneticGuide: phonetic,
      explanation,
      culturalNote
    };
  },

  // Complaint Assistant
  async assistComplaint(userStatement: string, serviceType?: string, amount?: number): Promise<{
    category: string;
    shortExplanation: string;
    suggestedComplaintText: string;
    usefulEvidence: string[];
    nextStep: string;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/ai/complaint-assist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userStatement, serviceType, amount })
      });
      if (res.ok) return res.json();
    } catch {}

    return {
      category: serviceType || 'Overcharging',
      shortExplanation: 'Incident of tariff overcharging and refusal of regulated meter fares.',
      suggestedComplaintText: `FORMAL GRIEVANCE SUBMISSION\nTo: State Tourist Police & Consumer Protection Cell\nSubject: Incident of Tariff Violation & Consumer Exploitation\n\nStatement: On ${new Date().toLocaleDateString()}, while engaging travel services (${serviceType || 'Transport'}), the operator quoted and demanded ₹${amount || 'an excessive sum'}, which deviates from the legally approved rate card.\n\nFactual summary: "${userStatement}"\n\nI request an investigation into this operator's registration credentials and verification under Consumer Protection Act provisions.`,
      usefulEvidence: [
        'Photo of vehicle registration number / booth badge',
        'UPI digital transaction ID or physical receipt slip',
        'GPS trip timeline or screenshot of route'
      ],
      nextStep: 'Present this generated tracking ticket at the nearest Tourist Police Assistance Kiosk (Helpline: 1363).'
    };
  },

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {}
    return getStoredComplaints();
  },

  async submitComplaint(data: {
    providerName: string;
    category: string;
    location: string;
    description: string;
    amount?: number;
    evidence?: string;
    providerId?: string;
  }): Promise<{ complaintId: string; complaint: Complaint }> {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) return res.json();
    } catch {}

    const id = `TS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: Complaint = {
      id,
      userId: 'usr-demo-001',
      userName: 'Verified Tourist',
      userEmail: 'demo@travelshield.com',
      providerName: data.providerName,
      category: data.category as any,
      location: data.location,
      description: data.description,
      amount: data.amount,
      currency: 'INR',
      date: new Date().toISOString().split('T')[0],
      evidence: data.evidence,
      status: 'Under Review',
      priority: data.amount && data.amount > 2000 ? 'High' : 'Medium',
      timeline: [
        {
          step: 'Submitted',
          timestamp: new Date().toISOString(),
          note: 'Complaint registered in TravelShield national safety mesh'
        },
        {
          step: 'Under Review',
          timestamp: new Date().toISOString(),
          note: 'Case officer assigned to inspect provider license & regulatory tariffs'
        }
      ],
      createdAt: new Date().toISOString()
    };

    const current = getStoredComplaints();
    current.unshift(newComplaint);
    localStorage.setItem(STORAGE_COMPLAINTS_KEY, JSON.stringify(current));

    return { complaintId: id, complaint: newComplaint };
  },

  // Feedback
  async submitFeedback(data: {
    rating: number;
    wasPriceFair: boolean;
    wasServiceTrustworthy: boolean;
    didFeelSafe: boolean;
    comment?: string;
  }): Promise<{ message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) return res.json();
    } catch {}
    return {
      message: 'Thank you for your valuable feedback! Your review helps enhance tourism quality across India.'
    };
  },

  // Safety
  async getSafetyAlerts(): Promise<SafetyAlert[]> {
    try {
      const res = await fetch(`${BASE_URL}/safety/alerts`);
      if (res.ok) return res.json();
    } catch {}
    return mockSafetyAlerts;
  },

  async getNearbySafety(city?: string): Promise<{
    currentStatus: string;
    verifiedZone: boolean;
    alerts: SafetyAlert[];
    emergencyHotlines: Record<string, string>;
  }> {
    try {
      const params = city ? `?city=${encodeURIComponent(city)}` : '';
      const res = await fetch(`${BASE_URL}/safety/nearby${params}`);
      if (res.ok) return res.json();
    } catch {}

    const selectedCity = city || 'Delhi';
    const cityAlerts = mockSafetyAlerts.filter(a =>
      a.city.toLowerCase() === selectedCity.toLowerCase()
    );

    return {
      currentStatus: 'Verified Protected Tourist Sector',
      verifiedZone: true,
      alerts: cityAlerts.length > 0 ? cityAlerts : mockSafetyAlerts,
      emergencyHotlines: {
        'Universal Emergency': '112',
        'Tourist Police Helpline': '1363',
        'Women Safety Helpline': '1091',
        'Railway Security Helpline': '139'
      }
    };
  },

  // Trips
  async getTrips(): Promise<TripItinerary[]> {
    try {
      const res = await fetch(`${BASE_URL}/trips`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {}
    return getStoredTrips();
  },

  async createTrip(tripData: Partial<TripItinerary>): Promise<{ trip: TripItinerary }> {
    try {
      const res = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tripData)
      });
      if (res.ok) return res.json();
    } catch {}

    const newTrip: TripItinerary = {
      id: `trip-${Date.now()}`,
      userId: 'usr-demo-001',
      title: tripData.title || 'Protected Indian Itinerary',
      destination: tripData.destination || 'Delhi - Jaipur',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      hotel: tripData.hotel || 'Verified Stay',
      transport: tripData.transport || 'Prepaid Transit',
      emergencyContacts: tripData.emergencyContacts || [
        { name: 'Family Contact', relation: 'Family', phone: '+1 555-0199' }
      ],
      savedPlaces: tripData.savedPlaces || ['City Center', 'Heritage Forts'],
      safetyScore: 96,
      sharedToken: `TS-TRIP-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const current = getStoredTrips();
    current.unshift(newTrip);
    localStorage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(current));

    return { trip: newTrip };
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/notifications`);
      if (res.ok) return res.json();
    } catch {}
    return mockNotifications;
  },

  async markNotificationsRead(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/notifications/mark-read`, { method: 'POST' });
    } catch {}
  },

  // Map Markers
  async getMapMarkers(): Promise<MapMarker[]> {
    try {
      const res = await fetch(`${BASE_URL}/map/markers`);
      if (res.ok) return res.json();
    } catch {}
    return mockMapMarkers;
  }
};

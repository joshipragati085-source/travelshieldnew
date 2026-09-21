import { CityFareRuleRecord, RouteDistancePreset } from '../data/fareRulesData';

export interface FareCalculationParams {
  city?: string;
  transportType?: string;
  vehicleCategory?: string;
  source: string;
  destination: string;
  quotedPrice: number;
  customDistanceKm?: number;
  travelTime?: string; // e.g. "23:30"
  fareRulesDB: CityFareRuleRecord[];
  routePresets: RouteDistancePreset[];
}

export function isNightHours(timeStr?: string, nightStart = '23:00', nightEnd = '05:00'): boolean {
  if (!timeStr) {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 23 || currentHour < 5;
  }

  const [hStr] = timeStr.split(':');
  const hour = parseInt(hStr, 10);
  if (isNaN(hour)) return false;

  const [startH] = nightStart.split(':').map(Number);
  const [endH] = nightEnd.split(':').map(Number);

  if (startH > endH) {
    // Overnight window (e.g. 23:00 to 05:00)
    return hour >= startH || hour < endH;
  }
  return hour >= startH && hour < endH;
}

export function calculateDetailedFairPrice(params: FareCalculationParams) {
  const {
    city = 'Delhi',
    transportType = 'Taxi',
    vehicleCategory,
    source,
    destination,
    quotedPrice,
    customDistanceKm,
    travelTime,
    fareRulesDB,
    routePresets
  } = params;

  const normSource = (source || '').toLowerCase().trim();
  const normDest = (destination || '').toLowerCase().trim();
  const normType = (transportType || 'Taxi').toLowerCase().trim();
  const normCity = (city || 'Delhi').toLowerCase().trim();

  // 1. Distance resolution:
  let distanceKm = 12.0;
  let estimatedMinutes = 30;
  let typicalTolls = 0;
  let isCustomDistance = false;

  if (customDistanceKm && !isNaN(customDistanceKm) && customDistanceKm > 0) {
    distanceKm = Number(customDistanceKm);
    estimatedMinutes = Math.round(distanceKm * 2.2);
    isCustomDistance = true;
  } else {
    // Check known route preset in database
    const matchedPreset = routePresets.find(p =>
      (p.city.toLowerCase() === normCity || normCity.includes(p.city.toLowerCase())) &&
      (normSource.includes(p.source) || p.source.includes(normSource)) &&
      (normDest.includes(p.destination) || p.destination.includes(normDest))
    );

    if (matchedPreset) {
      distanceKm = matchedPreset.distanceKm;
      estimatedMinutes = matchedPreset.estimatedMinutes;
      typicalTolls = matchedPreset.typicalToll;
    } else {
      // Heuristic distance based on keywords
      const isAirport = normSource.includes('airport') || normDest.includes('airport');
      const isRailway = normSource.includes('station') || normDest.includes('station') || normSource.includes('cantt') || normDest.includes('cantt');
      
      if (isAirport) {
        distanceKm = 18.5;
        estimatedMinutes = 45;
      } else if (isRailway) {
        distanceKm = 9.0;
        estimatedMinutes = 25;
      } else {
        distanceKm = 10.0;
        estimatedMinutes = 25;
      }
    }
  }

  // 2. Fare Rule Resolution:
  // Match rule by (city & transportType & vehicleCategory) -> fallback (city & transportType) -> fallback (General)
  let rule = fareRulesDB.find(r => 
    r.city.toLowerCase() === normCity &&
    r.transportType.toLowerCase() === normType &&
    (!vehicleCategory || r.vehicleCategory.toLowerCase().includes(vehicleCategory.toLowerCase()))
  );

  if (!rule) {
    rule = fareRulesDB.find(r => 
      r.city.toLowerCase() === normCity &&
      r.transportType.toLowerCase() === normType
    );
  }

  if (!rule) {
    // City match with general transport
    rule = fareRulesDB.find(r =>
      r.city.toLowerCase() === normCity
    );
  }

  if (!rule) {
    // Fallback to General / National calibrated benchmark
    rule = fareRulesDB.find(r =>
      r.city.toLowerCase().includes('general') &&
      r.transportType.toLowerCase() === normType
    ) || fareRulesDB.find(r => r.city.toLowerCase().includes('general')) || fareRulesDB[0];
  }

  // 3. Mathematical Formula Execution
  const nightActive = isNightHours(travelTime, rule.nightWindowStart, rule.nightWindowEnd);
  
  // Base fare covers up to rule.baseKm
  const baseCharge = rule.baseFare;
  const extraKm = Math.max(0, distanceKm - rule.baseKm);
  const distanceCharge = Math.round(extraKm * rule.perKmRate);

  // Night surcharge
  const subtotalBeforeNight = baseCharge + distanceCharge;
  const nightSurchargeAmount = nightActive ? Math.round(subtotalBeforeNight * (rule.nightSurchargePercentage / 100)) : 0;

  // Luggage or Tolls
  const tollCharge = typicalTolls || rule.estimatedTolls || 0;
  
  // Clean sum: TravelShield Median Reasonable Expected Fare
  const calculatedMedian = subtotalBeforeNight + nightSurchargeAmount + tollCharge;

  // Fair bracket: Allow standard traffic/waiting variation (-10% to +20%)
  const referenceMin = Math.round(calculatedMedian * 0.9);
  const referenceMax = Math.max(referenceMin + 50, Math.round(calculatedMedian * 1.25));

  // 4. Classification:
  // Fair Rate: within or close to reasonable benchmark
  // Higher Than Expected: 25% - 60% above expected
  // Possible Overcharging: > 60% above expected benchmark
  let status: 'FAIR' | 'HIGH' | 'POSSIBLE OVERCHARGING' | 'LOW' = 'FAIR';
  let message = '';
  const deviationPct = Math.round(((quotedPrice - calculatedMedian) / calculatedMedian) * 100);

  if (quotedPrice > referenceMax * 1.4) {
    status = 'POSSIBLE OVERCHARGING';
    message = `The quoted fare of ₹${quotedPrice.toLocaleString()} is significantly higher (+${deviationPct}%) than the estimated standard range of ₹${referenceMin.toLocaleString()} – ₹${referenceMax.toLocaleString()} for this ${distanceKm} km route. Consider metered fare or official prepaid counters.`;
  } else if (quotedPrice > referenceMax) {
    status = 'HIGH';
    message = `The quoted fare of ₹${quotedPrice.toLocaleString()} is higher than expected (+${deviationPct}% vs standard estimate of ₹${referenceMin.toLocaleString()} – ₹${referenceMax.toLocaleString()}). Check if this includes highway tolls, luggage charges, or waiting time.`;
  } else if (quotedPrice < referenceMin * 0.6 && referenceMin > 200) {
    status = 'LOW';
    message = `The quoted fare of ₹${quotedPrice.toLocaleString()} is unusually lower than standard operating cost (₹${referenceMin.toLocaleString()} – ₹${referenceMax.toLocaleString()}). Confirm that the driver will not make unplanned commission-shop detours or ask for extra cash on arrival.`;
  } else {
    status = 'FAIR';
    message = `The quoted fare of ₹${quotedPrice.toLocaleString()} falls comfortably within the expected reasonable tariff range of ₹${referenceMin.toLocaleString()} – ₹${referenceMax.toLocaleString()}.`;
  }

  // Calculation factor lines for complete transparency
  const factors = [
    {
      label: `Base Flag-Down Fare (First ${rule.baseKm} km)`,
      amount: baseCharge,
      formulaDescription: `Flat base start charge according to ${rule.isOfficialTariff ? 'gazetted tariff' : 'regional benchmark'}`
    },
    {
      label: `Distance Charge (${extraKm.toFixed(1)} km @ ₹${rule.perKmRate}/km)`,
      amount: distanceCharge,
      formulaDescription: `Calculated as: (${distanceKm.toFixed(1)} km total - ${rule.baseKm} km base) × ₹${rule.perKmRate}/km`
    }
  ];

  if (nightActive && nightSurchargeAmount > 0) {
    factors.push({
      label: `Night Surcharge (${rule.nightSurchargePercentage}% between ${rule.nightWindowStart} - ${rule.nightWindowEnd})`,
      amount: nightSurchargeAmount,
      formulaDescription: `${rule.nightSurchargePercentage}% added to standard daytime tariff (Travel time: ${travelTime || 'Current late hours'})`
    });
  }

  if (tollCharge > 0) {
    factors.push({
      label: 'Applicable Expressway / Airport Toll',
      amount: tollCharge,
      formulaDescription: 'Standard electronic fastag municipal or highway toll'
    });
  }

  // Calculation steps for transparent display
  const calculationSteps = [
    `Route: ${source} to ${destination} (${distanceKm.toFixed(1)} km)`,
    `Base fare applied: ₹${baseCharge} covering first ${rule.baseKm} km`,
    `Additional distance: ${extraKm.toFixed(1)} km × ₹${rule.perKmRate}/km = ₹${distanceCharge}`,
    nightActive ? `Night surcharge: ${rule.nightSurchargePercentage}% applied (+₹${nightSurchargeAmount})` : 'Daytime travel: standard tariff applied (no night surcharge)',
    tollCharge > 0 ? `Expressway/Airport toll addition: +₹${tollCharge}` : 'Tolls: none or included in standard route',
    `Sum benchmark: ₹${calculatedMedian} (Expected fair range: ₹${referenceMin} – ₹${referenceMax})`
  ];

  // AI Guidance & Safety tips
  const aiGuidance = {
    summary: status === 'POSSIBLE OVERCHARGING'
      ? `A quote of ₹${quotedPrice} appears noticeably inflated for a ${distanceKm} km ride in ${city}. Standard metered rides typically total around ₹${calculatedMedian}.`
      : status === 'HIGH'
      ? `This rate is somewhat above normal daytime meters. In peak congestion or bad weather, slight premiums occur, but verify luggage and toll terms beforehand.`
      : `The price quoted (₹${quotedPrice}) is consistent with prevailing tariffs and transparent pricing practices in ${city}.`,
    negotiationTip: status === 'POSSIBLE OVERCHARGING' || status === 'HIGH'
      ? `Politely ask: "Bhaiya, meter se chalo ya Delhi/state prepaid rate card ke hisab se?" (Please run by meter or prepaid counter voucher). If quoting fixed, offer ₹${referenceMax}.`
      : `Verify destination landmark clearly before boarding so the driver takes the direct corridor without detour.`,
    localContextAdvice: rule.isOfficialTariff
      ? `In ${city}, official meter rates are notified under ${rule.regulatoryAuthority}. Drivers must turn on the electronic meter or adhere to prepaid booth receipts.`
      : `In this region, rates are governed by local operator consensus. Request a written token or book via official transport stands.`,
    safetyWatchout: `Important: A fare estimate is an advisory benchmark, not an assertion of illegality. Private hire agreements may vary; always confirm the final price including tolls before luggage is loaded.`
  };

  // Alternative Safer Options:
  const saferAlternatives = [
    {
      id: 'alt-prepaid',
      name: `${city} Police / Airport Authority Prepaid Booth`,
      type: 'Official Prepaid Counter' as const,
      description: 'Pre-paid transport counter managed by local traffic police or airport terminal authority with fixed computerised vouchers.',
      estimatedFareRange: `₹${referenceMin} – ₹${referenceMax}`,
      howToAccess: 'Locate the bright yellow/blue Traffic Police Prepaid Booth outside the arrival terminal or main railway exit.',
      locationTip: 'Pay inside the booth and retain the pink customer receipt until drop-off.'
    },
    {
      id: 'alt-metro',
      name: `${city} Metro / Express Rail System`,
      type: 'Public Transport' as const,
      description: 'Rapid air-conditioned mass transit system, immune to traffic jams and completely fixed regulated ticketing.',
      estimatedFareRange: '₹20 – ₹80 per passenger',
      howToAccess: 'Follow station overhead signs for Metro concourse; buy a single journey QR ticket or smart card.',
      locationTip: 'Clean, secure with CCTV and dedicated tourist assistance helpdesks.'
    },
    {
      id: 'alt-app',
      name: 'Regulated App Rides (Uber / Ola / BluSmart / Namma Yatri)',
      type: 'Verified App Service' as const,
      description: 'GPS tracked ride with upfront digital pricing, electronic receipt, and driver background verification.',
      estimatedFareRange: `₹${Math.round(calculatedMedian * 0.95)} – ₹${Math.round(calculatedMedian * 1.2)}`,
      howToAccess: 'Book via mobile application at designated app pickup bays.',
      locationTip: 'Never accept rides from individuals approaching you inside terminal lobbies.'
    }
  ];

  return {
    quotedPrice,
    referenceMin,
    referenceMax,
    status,
    message,
    distanceKm,
    estimatedTime: `${estimatedMinutes} mins`,
    breakdown: {
      baseFare: baseCharge,
      perKmRate: rule.perKmRate,
      tollOrNightCharge: nightSurchargeAmount + tollCharge,
      recommendedRateNote: `${rule.regulatoryAuthority} (${rule.isOfficialTariff ? 'Official Gazette Tariff' : 'TravelShield Calibrated Benchmark'})`
    },
    detailed: {
      quotedPrice,
      city: rule.city,
      transportType: rule.transportType,
      vehicleType: vehicleCategory || rule.vehicleCategory,
      pickup: source,
      destination,
      travelTime: travelTime || (nightActive ? 'Night Hours' : 'Day Hours'),
      isNightTime: nightActive,
      computedDistanceKm: distanceKm,
      isCustomDistance,
      officialData: {
        hasOfficialTariff: rule.isOfficialTariff,
        regulatoryAuthority: rule.regulatoryAuthority,
        officialBaseFare: rule.baseFare,
        officialPerKmRate: rule.perKmRate,
        officialNightPercentage: rule.nightSurchargePercentage,
        officialGazetteNote: rule.officialNotes
      },
      travelShieldEstimate: {
        minimumReasonable: referenceMin,
        maximumReasonable: referenceMax,
        medianEstimatedFare: calculatedMedian,
        status,
        deviationPercentage: deviationPct,
        explanation: message,
        factors,
        calculationSteps,
        isLegalClaim: false
      },
      aiGuidance,
      saferAlternatives,
      fareRuleUsed: rule
    },
    alternativeProvider: {
      id: 'prov-001',
      name: `${city} Official Traffic Police Prepaid Counter`,
      trustScore: 98,
      estimatedFare: `₹${referenceMin} – ₹${referenceMax}`,
      category: 'Transport'
    }
  };
}

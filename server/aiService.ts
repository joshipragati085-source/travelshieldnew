import { GoogleGenAI } from '@google/genai';
import {
  buildSafetyAssistantSystemInstruction,
  isEmergencyQuery,
  STANDARD_SAFETY_DISCLAIMER,
  VERIFIED_OFFICIAL_CONTACTS,
  UNCERTAINTY_VERIFICATION_CLAUSE
} from './safetyPromptConfig';

export interface ChatHistoryMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export interface TravelAssistantChatOptions {
  message: string;
  language?: string;
  provider?: 'openai' | 'gemini' | 'auto';
  context?: {
    travellerType?: string;
    country?: string;
    currentCity?: string;
  };
  conversationHistory?: ChatHistoryMessage[];
}

export interface TravelAssistantChatResult {
  response: string;
  language: string;
  source: 'openai' | 'gemini-3.8-flash' | 'smart-fallback-engine';
  model?: string;
  isEmergency: boolean;
  disclaimer: string;
  officialContacts?: typeof VERIFIED_OFFICIAL_CONTACTS;
  suggestedActions?: { label: string; action: string; payload?: any }[];
}

/**
 * Dedicated Backend AI Service for TravelShield
 */
class TravelSafetyAIService {
  private genAIClient: GoogleGenAI | null = null;
  private readonly DEFAULT_MODEL = 'gemini-3.8-flash';
  private readonly TIMEOUT_MS = 15000; // 15 seconds timeout

  /**
   * Validates if an API key conforms to OpenAI API key specifications
   */
  public isValidOpenAIKey(key?: string): boolean {
    if (!key) return false;
    const trimmed = key.trim();
    return (
      (trimmed.startsWith('sk-') ||
        trimmed.startsWith('sk-proj-') ||
        trimmed.startsWith('sk-admin-') ||
        trimmed.startsWith('sk-svcacct-')) &&
      trimmed.length >= 20
    );
  }

  /**
   * Queries Gemini 3.8 Flash safely with timeout and error protection
   */
  private async queryGemini(
    systemInstruction: string,
    conversationHistory: ChatHistoryMessage[],
    userMessage: string
  ): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const recentHistory = conversationHistory.slice(-8);
      const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

      for (const turn of recentHistory) {
        if (!turn.text || typeof turn.text !== 'string') continue;
        contents.push({
          role: turn.sender === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI response timed out after 15 seconds')), this.TIMEOUT_MS);
      });

      const apiPromise = client.models.generateContent({
        model: this.DEFAULT_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
          topP: 0.95
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      const replyText = response.text || '';
      return replyText.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Directly queries OpenAI Chat Completions API
   */
  private async queryOpenAI(
    apiKey: string,
    modelName: string,
    systemInstruction: string,
    conversationHistory: ChatHistoryMessage[],
    userMessage: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content:
          systemInstruction +
          '\n\nYou are interacting directly with a tourist visiting or traveling in India. Listen to their thoughts, feelings, travel queries, or anxieties with warmth, empathy, practical local guidance, and strict adherence to the safety directives.'
      },
      ...conversationHistory.slice(-8).map((turn) => ({
        role: turn.sender === 'user' ? 'user' : 'assistant',
        content: turn.text
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.6,
          max_tokens: 1200
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errorJson: any = await res.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `OpenAI returned status ${res.status}`);
      }

      const json: any = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('Empty response received from OpenAI API');
      }
      return content.trim();
    } catch (e: any) {
      clearTimeout(timer);
      throw e;
    }
  }

  /**
   * Lazily initializes and returns the GoogleGenAI instance with telemetry headers
   */
  private getClient(): GoogleGenAI | null {
    if (!this.genAIClient && process.env.GEMINI_API_KEY) {
      try {
        this.genAIClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        // Fall back gracefully
      }
    }
    return this.genAIClient;
  }

  /**
   * Primary conversation handler
   */
  public async chat(options: TravelAssistantChatOptions): Promise<TravelAssistantChatResult> {
    const { message, language, provider = 'auto', context, conversationHistory = [] } = options;
    const isEmergency = isEmergencyQuery(message);
    const selectedLanguage = language || 'English';

    // Build the system instructions from the centralized configuration
    const systemInstruction = buildSafetyAssistantSystemInstruction(selectedLanguage, context);

    const rawOpenAIKey = process.env.OPENAI_API_KEY?.trim();
    const isKeyValidFormat = this.isValidOpenAIKey(rawOpenAIKey);
    const rawModel = process.env.OPENAI_MODEL?.trim();
    const openAIModel =
      rawModel && (rawModel.startsWith('gpt-') || rawModel.startsWith('o1') || rawModel.startsWith('o3'))
        ? rawModel
        : 'gpt-4o-mini';

    // 1. Check if OpenAI should be queried
    // Only attempt to call OpenAI API if the key is formatted properly (starts with sk-)
    const shouldTryOpenAI =
      (provider === 'openai' && isKeyValidFormat) || (provider === 'auto' && isKeyValidFormat);

    if (shouldTryOpenAI && rawOpenAIKey) {
      try {
        let replyText = await this.queryOpenAI(
          rawOpenAIKey,
          openAIModel,
          systemInstruction,
          conversationHistory,
          message
        );

        if (isEmergency && !replyText.includes('112')) {
          replyText = `🚨 **IMMEDIATE EMERGENCY SUPPORT**:
If you are in immediate danger or distress, **dial 112** (Universal Police/Emergency) or **1363** (24x7 Tourist Police) right away. Do not rely solely on an AI assistant during an active crisis.

${replyText}`;
        }

        return {
          response: replyText,
          language: selectedLanguage,
          source: 'openai',
          model: openAIModel,
          isEmergency,
          disclaimer: STANDARD_SAFETY_DISCLAIMER,
          officialContacts: VERIFIED_OFFICIAL_CONTACTS,
          suggestedActions: this.buildSuggestedActions(message, isEmergency)
        };
      } catch (err: any) {
        // If explicitly selected, don't crash or trigger alert logs
        if (provider === 'openai') {
          const geminiReply = await this.queryGemini(systemInstruction, conversationHistory, message);
          const fallbackText = geminiReply || this.generateSafetyFallback(message, selectedLanguage, isEmergency);
          const isAuth =
            err.message?.includes('Incorrect API key') ||
            err.message?.includes('401') ||
            err.message?.includes('invalid_api_key');

          return {
            response: `💡 **OpenAI Notice**: ${
              isAuth
                ? 'The OpenAI API key provided is not authorized. Switched smoothly to Gemini 3.8 Flash.'
                : 'OpenAI request could not be completed. Switched smoothly to Gemini 3.8 Flash.'
            }\n\n${fallbackText}`,
            language: selectedLanguage,
            source: geminiReply ? 'gemini-3.8-flash' : 'smart-fallback-engine',
            isEmergency,
            disclaimer: STANDARD_SAFETY_DISCLAIMER,
            officialContacts: VERIFIED_OFFICIAL_CONTACTS,
            suggestedActions: this.buildSuggestedActions(message, isEmergency)
          };
        }
        // If 'auto', simply fall through to Gemini below
      }
    } else if (provider === 'openai') {
      // User explicitly selected OpenAI, but the key is missing or not a valid OpenAI key (e.g. starts with AQ.)
      const geminiReply = await this.queryGemini(systemInstruction, conversationHistory, message);
      const fallbackText = geminiReply || this.generateSafetyFallback(message, selectedLanguage, isEmergency);

      const noticeMessage = rawOpenAIKey
        ? `💡 **OpenAI Key Format Notice**:
The key currently set in \`OPENAI_API_KEY\` starts with \`${rawOpenAIKey.slice(0, 4)}...\` instead of the standard \`sk-\` prefix. (OpenAI keys always start with \`sk-\` or \`sk-proj-\`). You can get an OpenAI key at https://platform.openai.com/api-keys.

*Your inquiry has been answered below using ${geminiReply ? 'Gemini 3.8 Flash' : 'TravelShield Safety Engine'}:*

${fallbackText}`
        : `💡 **OpenAI API Key Needed**:
You have selected OpenAI, but \`OPENAI_API_KEY\` is not set in your environment / AI Studio Settings yet.
To connect OpenAI:
1. Open the AI Studio **Settings / Secrets** panel.
2. Add \`OPENAI_API_KEY\` with your OpenAI key (starts with \`sk-...\`).

*In the meantime, your inquiry has been answered below by ${geminiReply ? 'Gemini 3.8 Flash' : 'TravelShield Safety Engine'}:*

${fallbackText}`;

      return {
        response: noticeMessage,
        language: selectedLanguage,
        source: geminiReply ? 'gemini-3.8-flash' : 'smart-fallback-engine',
        isEmergency,
        disclaimer: STANDARD_SAFETY_DISCLAIMER,
        officialContacts: VERIFIED_OFFICIAL_CONTACTS,
        suggestedActions: this.buildSuggestedActions(message, isEmergency)
      };
    }

    // 2. Query Gemini 3.8 Flash
    const geminiText = await this.queryGemini(systemInstruction, conversationHistory, message);
    if (geminiText) {
      let replyText = geminiText;
      if (isEmergency && !replyText.includes('112')) {
        replyText = `🚨 **IMMEDIATE EMERGENCY SUPPORT**:
If you are in immediate danger or distress, **dial 112** (Universal Police/Emergency) or **1363** (24x7 Tourist Police) right away. Do not rely solely on an AI assistant during an active crisis.

${replyText}`;
      }

      return {
        response: replyText,
        language: selectedLanguage,
        source: 'gemini-3.8-flash',
        isEmergency,
        disclaimer: STANDARD_SAFETY_DISCLAIMER,
        officialContacts: VERIFIED_OFFICIAL_CONTACTS,
        suggestedActions: this.buildSuggestedActions(message, isEmergency)
      };
    }

    // 3. High-quality, domain-grounded safety fallback engine
    const fallbackText = this.generateSafetyFallback(message, selectedLanguage, isEmergency);

    return {
      response: fallbackText,
      language: selectedLanguage,
      source: 'smart-fallback-engine',
      isEmergency,
      disclaimer: STANDARD_SAFETY_DISCLAIMER,
      officialContacts: VERIFIED_OFFICIAL_CONTACTS,
      suggestedActions: this.buildSuggestedActions(message, isEmergency)
    };
  }

  /**
   * Generates a rich, verified safety response when Gemini is offline or timing out
   */
  private generateSafetyFallback(message: string, language: string, isEmergency: boolean): string {
    const lower = message.toLowerCase();

    if (isEmergency) {
      return `🚨 **IMMEDIATE EMERGENCY ACTION REQUIRED**:
If you are in danger or facing an emergency in India, please contact official emergency services immediately. Do not rely on AI advice.

• **Universal Emergency (Police / Fire / Medical)**: Dial **112**
• **Ministry of Tourism 24x7 Tourist Police Helpline**: Dial **1363** (Multi-lingual)
• **Women in Distress Helpline**: Dial **1091**
• **National Ambulance**: Dial **108**

**Immediate steps**:
1. Move to a well-lit, crowded public area (such as a metro station, railway platform, or hotel lobby).
2. Seek on-duty police personnel or security guards.
3. Share your live GPS location with trusted emergency contacts.`;
    }

    // Check scam, tout, and hotel diversion tricks first
    if (
      lower.includes('scam') ||
      lower.includes('tout') ||
      lower.includes('trick') ||
      lower.includes('fake') ||
      lower.includes('closed') ||
      lower.includes('burn') ||
      lower.includes('divert') ||
      lower.includes('cheat')
    ) {
      return `🛡️ **Tourist Scam Awareness & Tout Avoidance**:
• **"Hotel Is Closed / Burned Down" Trick**: Unsolicited drivers or touts may claim your booked accommodation is closed, burned down, or inaccessible to divert you to expensive commission hotels. **Never alter plans on a driver's claim** — call your hotel directly using your reservation confirmation.
• **Fake Ticket Counters**: Touts outside railway terminals (e.g. New Delhi Station) or monuments may claim official ticket offices have relocated. Ignore them; official counters are strictly inside government gates. Book ASI monument tickets at *asi.payumoney.com*.
• **Gemstone & Carpet "Export" Scheme**: Avoid strangers offering easy profit reselling Indian handicrafts or gems abroad.
• **How to Handle Touts**: Give a polite, firm *"Nahin chahiye, shukriya"* (No thank you) and keep walking directly to your destination without stopping.

*Advisory assistance only. To report fraudulent operators, dial 1363.*`;
    }

    // Check solo and women traveller safety
    if (lower.includes('women') || lower.includes('female') || lower.includes('solo') || lower.includes('alone') || lower.includes('night')) {
      return `👩 **Solo & Women Traveller Safety Protocols**:
• **Metro Women-Only Coaches**: Major metro networks (Delhi, Mumbai, Bengaluru) feature dedicated women-only coaches (usually the first coach, marked with pink signage).
• **Verified Accommodations**: Stay in central, highly rated neighborhoods with 24-hour reception desks (e.g. Connaught Place or South Delhi, Colaba or Bandra in Mumbai).
• **Night Travel**: Avoid unlit alleys or isolated streets after 10:00 PM. Use verified app cabs rather than flagging street vehicles.
• **Live Location Sharing**: Keep trip tracking active with trusted family or friends.
• **Essential Helplines**:
  - **1091** (National Women Helpline)
  - **112** (Universal Emergency)
  - **1363** (Tourist Police)

*${UNCERTAINTY_VERIFICATION_CLAUSE}*`;
    }

    // Transit & Fares
    if (lower.includes('taxi') || lower.includes('cab') || lower.includes('auto') || lower.includes('fair') || lower.includes('fare') || lower.includes('price') || lower.includes('meter')) {
      return `🚖 **Transit Safety & Fair Pricing Guidance**:
• **Use Official Prepaid Booths**: At airports (e.g. Delhi T3, Mumbai T2) and major railway stations, buy your voucher at the official Traffic Police / State Transport prepaid counter inside the arrival terminal before stepping outside.
• **App-Based Cabs**: Use verified ride-hailing services (Uber, Ola, BluSmart). Rates are algorithmic, drivers are registered, and routes are tracked via GPS.
• **Auto-Rickshaws**: Insist on meter usage (*"Bhaiya, meter se chaliye"*) or agree firmly on a rate before boarding.
• **Night Surcharge**: Official night tariff adds ~25% between 11:00 PM and 5:00 AM.
• **Check Fares in TravelShield**: Use the **Fair Price Checker** tab in the main navigation for detailed distance and route tariff checks.

*${UNCERTAINTY_VERIFICATION_CLAUSE}*`;
    }

    if (lower.includes('food') || lower.includes('water') || lower.includes('stomach') || lower.includes('drink') || lower.includes('health') || lower.includes('hygiene')) {
      return `🥗 **Food, Water & Hygiene Precautions**:
• **Drinking Water**: Drink only sealed bottled water from reputed brands (Bisleri, Kinley, Aquafina) or verified RO-filtered water. Verify that the cap seal clicks upon opening. Avoid tap water and ice from small street stalls.
• **Street Food Safety**: Eat at busy, high-turnover stalls where dishes are prepared fresh and piping hot in front of you. Avoid pre-cut fruits or unwashed raw salads.
• **Hot Beverages**: Freshly boiled Masala Chai and fresh tender coconut water (drank through a straw) are both safe and delicious.
• **Medical Support**: For urgent health issues, dial **108** for ambulance services or visit an accredited hospital.

*Advisory guidance. Consult a medical professional for health treatments.*`;
    }

    if (lower.includes('etiquette') || lower.includes('culture') || lower.includes('temple') || lower.includes('dress') || lower.includes('shoes') || lower.includes('custom')) {
      return `🛕 **Cultural Etiquette & Respectful Travel**:
• **Places of Worship**: Wear modest clothing covering shoulders and knees. Always remove shoes before entering temples, gurdwaras, or mosques.
• **Head Coverings**: Mandatory at Sikh Gurdwaras (clean head coverings are provided free at entrances) and customary at mosques.
• **Photography Permissions**: Always ask politely before taking photographs of locals, religious rituals, or holy sanctums. Respect "No Photography" signs.
• **Traditional Greeting**: Greet locals with *"Namaste"* with joined palms; it is universally appreciated.
• **Right Hand Custom**: Use your right hand when eating, passing money, or handing gifts.

*Respecting local customs fosters warm, wonderful interactions across India.*`;
    }

    if (lower.includes('sim') || lower.includes('visa') || lower.includes('ticket') || lower.includes('asi') || lower.includes('procedure') || lower.includes('luggage') || lower.includes('cloak')) {
      return `🏛️ **Tourism Procedures & Official Counters**:
• **Tourist SIM Cards**: Purchase official prepaid SIMs (Airtel, Jio, Vi) at international airport arrival halls by presenting your passport, visa copy, and a passport-size photo.
• **Monument Entry**: Book discounted e-tickets directly through the Archaeological Survey of India (ASI) official portal (*asi.payumoney.com*) or scan official ASI QR codes at monument gates.
• **Railway Cloak Rooms**: Major Indian Railways stations offer secure 24-hour luggage cloakrooms (requires a valid confirmed train ticket and locked luggage).
• **Official Support**: Look for Tourist Police Desks (*Prahari*) at key railway stations and monument plazas.

*${UNCERTAINTY_VERIFICATION_CLAUSE}*`;
    }

    return `Hello! I am **TravelShield AI**, your personal Indian travel safety companion.

Here are key ways I can help you:
• **Fair Pricing**: Check whether quotes for taxis, autos, or guides are fair and avoid overcharging.
• **Scam Awareness**: Avoid touts, fake ticket counters, or hotel diversion tricks.
• **Solo & Women Safety**: Advice on transit, women-only metro coaches, and verified neighborhoods.
• **Cultural Etiquette**: Guidance on attire, temple customs, and respectful photography.
• **Official Helplines**: Verified contacts including Tourist Police (**1363**) and Universal Emergency (**112**).

What specific city, journey, or travel situation can I assist you with today?

*Advisory assistance only. Not an official government authority.*`;
  }

  /**
   * Provides contextual quick-action suggestions
   */
  private buildSuggestedActions(message: string, isEmergency: boolean) {
    if (isEmergency) {
      return [
        { label: '📞 Call 112 (Universal Emergency)', action: 'call_112' },
        { label: '📞 Call 1363 (Tourist Police)', action: 'call_1363' },
        { label: '🚨 Open Emergency Hub', action: 'open_emergency_hub' }
      ];
    }

    const lower = message.toLowerCase();
    if (lower.includes('taxi') || lower.includes('fare') || lower.includes('price')) {
      return [
        { label: 'Check Fair Price Calculator', action: 'navigate_price_checker' },
        { label: 'Report Overcharging Incident', action: 'navigate_complaints' }
      ];
    }

    return [
      { label: 'Explore Verified Providers', action: 'navigate_services' },
      { label: 'Review Safety Advisories', action: 'navigate_safety' }
    ];
  }
}

export const travelSafetyAIService = new TravelSafetyAIService();

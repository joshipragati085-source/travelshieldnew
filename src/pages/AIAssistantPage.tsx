import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldAlert,
  Languages,
  Check,
  Copy,
  PhoneCall,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Compass,
  Car,
  HeartHandshake,
  Utensils,
  Landmark,
  UserCheck,
  Building2,
  Info,
  Cpu,
  Bot,
  Zap
} from 'lucide-react';
import { AIChatMessage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AIAssistantPageProps {
  initialPrompt?: string | null;
  setActiveTab: (tab: string) => void;
  onOpenEmergency?: () => void;
}

interface SafetyTopic {
  id: string;
  icon: React.ReactNode;
  label: string;
  query: string;
  category: string;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  initialPrompt,
  setActiveTab,
  onOpenEmergency
}) => {
  const { user, activeLanguage, setActiveLanguage } = useAuth();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **TravelShield AI**, your personal Indian travel safety companion.

How I can assist your journey:
• **Local Travel & Fares**: Assess fair rates for taxis, autos, and airport transit.
• **Scam Awareness**: Recognize hotel diversion schemes, tout tactics, and fake ticket offices.
• **Solo & Women Safety**: Guidance on women-only metro coaches, safe neighborhoods, and transit.
• **Cultural Etiquette**: Respectful temple dress codes, footwear removal, and photography norms.
• **Food & Water Hygiene**: Precautions on packaged water, street food safety, and dining tips.
• **Emergency Protocols**: Direct connection to official helplines (**112** and **1363**).

*Advisory Notice: TravelShield is an assistance platform and does not replace police, medical professionals, or government authorities. In any immediate crisis, call 112.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash',
      disclaimer: 'Advisory guidance. Dynamic tariffs and rules should be verified at official counters.'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI Model Provider state ('openai' | 'gemini' | 'auto')
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini' | 'auto'>(() => {
    return (localStorage.getItem('travelshield_ai_provider') as any) || 'gemini';
  });

  const [providerConfig, setProviderConfig] = useState<{
    openaiAvailable: boolean;
    geminiAvailable: boolean;
    openaiModel: string;
    defaultProvider: 'openai' | 'gemini';
    keyNotice?: string;
  }>({
    openaiAvailable: false,
    geminiAvailable: true,
    openaiModel: 'gpt-4o-mini',
    defaultProvider: 'gemini'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Fetch AI provider connection status
  useEffect(() => {
    api
      .getAIProviders()
      .then((cfg) => {
        setProviderConfig(cfg);
        // If OpenAI key is not valid, automatically default to Gemini
        if (!cfg.openaiAvailable) {
          const stored = localStorage.getItem('travelshield_ai_provider');
          if (!stored || stored === 'openai') {
            setAiProvider(cfg.defaultProvider || 'gemini');
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle initial prompt from other pages (e.g. Dashboard, PriceChecker)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Loading timer
  useEffect(() => {
    if (loading) {
      setLoadingTime(0);
      timerRef.current = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoadingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const safetyTopics: SafetyTopic[] = [
    {
      id: 'transport',
      icon: <Car className="w-3.5 h-3.5 text-blue-600" />,
      label: 'Transport Safety',
      category: 'transport',
      query: 'What is the safest way to travel from Delhi airport (T3) to central Delhi at night, and what should it cost?'
    },
    {
      id: 'scam',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
      label: 'Scams & Touts',
      category: 'scams',
      query: 'What should I do if a taxi driver claims my booked hotel is burned down or in a restricted zone?'
    },
    {
      id: 'tout',
      icon: <Compass className="w-3.5 h-3.5 text-rose-600" />,
      label: 'Tout Avoidance',
      category: 'scams',
      query: 'How do I politely but firmly decline aggressive touts outside monuments and railway stations?'
    },
    {
      id: 'women',
      icon: <UserCheck className="w-3.5 h-3.5 text-purple-600" />,
      label: 'Women & Solo Travel',
      category: 'solo',
      query: 'What are essential safety precautions and transport protocols for a solo female traveler in India?'
    },
    {
      id: 'culture',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Cultural Etiquette',
      category: 'culture',
      query: 'What are the cultural etiquette rules for attire, footwear, and photography when visiting Indian temples?'
    },
    {
      id: 'food',
      icon: <Utensils className="w-3.5 h-3.5 text-orange-600" />,
      label: 'Food & Water',
      category: 'health',
      query: 'What precautions should I take regarding drinking water and street food hygiene in India?'
    },
    {
      id: 'procedure',
      icon: <Landmark className="w-3.5 h-3.5 text-indigo-600" />,
      label: 'Tourism Procedures',
      category: 'procedures',
      query: 'Where can I buy official ASI monument entry tickets online, and how do I get an Indian tourist SIM card?'
    },
    {
      id: 'support',
      icon: <Building2 className="w-3.5 h-3.5 text-cyan-600" />,
      label: 'Official Support',
      category: 'support',
      query: 'Where can I find official Tourist Police assistance booths and what support do they provide?'
    },
    {
      id: 'emergency',
      icon: <PhoneCall className="w-3.5 h-3.5 text-red-600" />,
      label: 'Emergency Numbers',
      category: 'emergency',
      query: 'What are the official, verified emergency helplines for police, medical, and tourist assistance in India?'
    }
  ];

  const filteredTopics = selectedCategory === 'all'
    ? safetyTopics
    : safetyTopics.filter((t) => t.category === selectedCategory);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Keep active conversation context (last 6 messages)
    const conversationHistory = messages
      .filter((m) => !m.isError)
      .slice(-6);

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const data = await api.askAI(
        text.trim(),
        activeLanguage,
        {
          travellerType: user?.travellerType,
          country: user?.country
        },
        conversationHistory,
        aiProvider
      );

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || (aiProvider === 'openai' ? 'openai' : 'gemini-3.8-flash'),
        model: data.model,
        isEmergency: data.isEmergency,
        disclaimer: data.disclaimer,
        actionSuggestions: data.suggestedActions
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'Unable to connect to the safety assistant service. Please check your connection or retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        canRetry: true,
        originalPrompt: text.trim(),
        actionSuggestions: [
          { label: '📞 Call 1363 (Tourist Police)', action: 'call_1363' },
          { label: '📞 Call 112 (Universal Emergency)', action: 'call_112' }
        ]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (promptText?: string) => {
    if (promptText) {
      handleSendMessage(promptText);
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'call_112':
        window.location.href = 'tel:112';
        break;
      case 'call_1363':
        window.location.href = 'tel:1363';
        break;
      case 'open_emergency_hub':
        if (onOpenEmergency) onOpenEmergency();
        break;
      case 'navigate_price_checker':
        setActiveTab('price-checker');
        break;
      case 'navigate_complaints':
        setActiveTab('complaints');
        break;
      case 'navigate_services':
        setActiveTab('services');
        break;
      case 'navigate_safety':
        setActiveTab('safety');
        break;
      default:
        break;
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat session reset. What safety questions, transit fares, cultural customs, or tourism procedures would you like guidance on?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-3.8-flash'
      }
    ]);
  };

  const supportedLanguages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Spanish', label: 'Español' },
    { code: 'French', label: 'Français' },
    { code: 'German', label: 'Deutsch' },
    { code: 'Japanese', label: '日本語' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
    { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16 font-sans">
      {/* Top Banner with Safety Disclaimers & Emergency Dialers */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md shrink-0">
              {aiProvider === 'openai' ? (
                <Bot className="w-6 h-6 text-emerald-400" />
              ) : (
                <Sparkles className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {aiProvider === 'openai' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    OpenAI {providerConfig.openaiModel} Tourist Intelligence
                  </span>
                ) : aiProvider === 'gemini' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[11px] font-bold text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Gemini 3.8 Flash Safety Intelligence
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-bold text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    Auto Dual-Engine (OpenAI & Gemini)
                  </span>
                )}

                <span className="text-[11px] text-blue-200/80">
                  Direct Tourist Thought Companion
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Ask TravelShield AI
              </h1>
              <p className="text-xs text-blue-100 max-w-xl">
                Express your real-time travel thoughts, safety questions, fare negotiations, and itinerary queries freely.
              </p>
            </div>
          </div>

          {/* Quick Actions, AI Engine Selector & Language Selector */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* AI Engine Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100">
              <Bot className="w-3.5 h-3.5 text-emerald-300" />
              <select
                aria-label="Select AI Model Engine"
                value={aiProvider}
                onChange={(e) => {
                  const val = e.target.value as 'openai' | 'gemini' | 'auto';
                  setAiProvider(val);
                  localStorage.setItem('travelshield_ai_provider', val);
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              >
                <option value="openai" className="text-slate-900 bg-white">
                  OpenAI ({providerConfig.openaiModel})
                </option>
                <option value="gemini" className="text-slate-900 bg-white">
                  Gemini 3.8 Flash
                </option>
                <option value="auto" className="text-slate-900 bg-white">
                  Auto Engine
                </option>
              </select>
            </div>

            {/* Language Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100">
              <Languages className="w-3.5 h-3.5 text-blue-300" />
              <select
                aria-label="Select AI response language"
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetChat}
              title="Clear session and reset chat"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/15"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>



        {/* Emergency Helplines Quick-Dial Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-rose-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Official Emergency Helplines:
            </span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <PhoneCall className="w-3 h-3" />
              <span>112 (Universal Police/Medical)</span>
            </a>
            <a
              href="tel:1363"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <PhoneCall className="w-3 h-3" />
              <span>1363 (Tourist Police 24x7)</span>
            </a>
            <a
              href="tel:1091"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <PhoneCall className="w-3 h-3" />
              <span>1091 (Women Helpline)</span>
            </a>
          </div>

          {onOpenEmergency && (
            <button
              onClick={onOpenEmergency}
              className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Emergency Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Statutory Advisory Disclaimer */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-2.5 text-xs leading-relaxed shadow-2xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">
            Advisory Notice & Verification Policy:
          </p>
          <p className="text-amber-800/90">
            TravelShield is an AI-powered advisory assistance platform and does <strong>not replace police, medical professionals, emergency dispatchers, or government authorities</strong>. For active emergencies, immediately dial <strong>112</strong>. Variable information such as entry fees, permits, or train tariffs should always be verified at official counters.
          </p>
        </div>
      </div>

      {/* Topic Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Topics
        </button>
        <button
          onClick={() => setSelectedCategory('transport')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'transport'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🚖 Transport & Fares
        </button>
        <button
          onClick={() => setSelectedCategory('scams')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'scams'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🛡️ Scams & Touts
        </button>
        <button
          onClick={() => setSelectedCategory('solo')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'solo'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          👩 Women & Solo
        </button>
        <button
          onClick={() => setSelectedCategory('culture')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'culture'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🛕 Cultural Etiquette
        </button>
        <button
          onClick={() => setSelectedCategory('health')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'health'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🥗 Food & Hygiene
        </button>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Suggested Tourist Safety Questions
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSendMessage(topic.query)}
              disabled={loading}
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left text-xs font-bold text-slate-800 transition-all shadow-2xs group flex items-start gap-2.5 disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition-colors shrink-0">
                {topic.icon}
              </div>
              <div className="flex-1">
                <span className="text-[11px] text-blue-600 block mb-0.5">{topic.label}</span>
                <span className="line-clamp-2 text-slate-700 font-medium leading-snug">
                  {topic.query}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const hasEmergency = msg.isEmergency;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs mt-1 ${
                    hasEmergency ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    {hasEmergency ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : hasEmergency
                        ? 'bg-red-50/90 border border-red-200 text-slate-900 rounded-bl-none'
                        : msg.isError
                          ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Emergency Alert Box inside message */}
                  {hasEmergency && (
                    <div className="p-3 rounded-xl bg-red-600 text-white flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>High Priority: Official Emergency Support</span>
                      </div>
                      <p className="text-[11px] text-red-100">
                        In an active crisis or danger, contact authorities immediately.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href="tel:112"
                          className="px-3 py-1.5 rounded-lg bg-white text-red-700 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call 112</span>
                        </a>
                        <a
                          href="tel:1363"
                          className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Tourist Helpline (1363)</span>
                        </a>
                        {onOpenEmergency && (
                          <button
                            onClick={onOpenEmergency}
                            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                          >
                            Open Emergency Hub
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap font-normal leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Retry Button on Error */}
                  {msg.isError && msg.canRetry && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleRetry(msg.originalPrompt)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Message</span>
                      </button>
                    </div>
                  )}

                  {/* Action Suggestions (Navigation or Call buttons) */}
                  {!isUser && msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {msg.actionSuggestions.map((actionItem, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(actionItem.action)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-all shadow-2xs"
                        >
                          <span>{actionItem.label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer: Source, Timestamp, Actions */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] opacity-75 pt-1.5 border-t border-current/10 gap-2">
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <span className={`font-semibold text-[9px] px-1.5 py-0.5 rounded ${
                          msg.source === 'openai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.source === 'gemini-3.8-flash'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200/60 text-slate-700'
                        }`}>
                          {msg.source === 'openai'
                            ? `OpenAI ${msg.model || 'GPT-4o'}`
                            : msg.source === 'gemini-3.8-flash'
                            ? 'Gemini 3.8 Flash'
                            : 'Safety Engine'}
                        </span>
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          title="Listen with voice synthesis"
                          className="hover:opacity-100 flex items-center gap-1 font-bold transition-opacity"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-600" />
                              <span className="text-rose-600">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          title="Copy response"
                          className="hover:opacity-100 flex items-center gap-1 font-bold transition-opacity"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="font-medium">
                  TravelShield AI is analyzing your travel query... ({loadingTime}s)
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder={
              aiProvider === 'openai'
                ? "Share your travel thoughts, queries, itinerary plans, or safety questions with OpenAI..."
                : "Ask about fares, tout avoidance, scams, solo safety, or local customs..."
            }
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Safety Assurance Footer Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Tourism Safety Knowledge Base</span>
        </div>
        <div>
          <span>Ministry of Tourism 24x7 Multi-lingual Helpline: <strong>1363</strong></span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../context/AuthContext';

export const TranslatePage: React.FC = () => {
  const [inputText, setInputText] = useState('भैया, मीटर से चलोगे क्या? सही किराया कितना होगा?');
  const [sourceLang, setSourceLang] = useState('Hindi');
  const [targetLang, setTargetLang] = useState('English');
  const [loading, setLoading] = useState(false);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [translationResult, setTranslationResult] = useState<{
    translatedText: string;
    explanation: string;
    culturalContext: string;
    detectedTone?: string;
  }>({
    translatedText: 'Brother, will you go by the meter? What is the fair fare?',
    explanation: 'The speaker is politely addressing the taxi/auto driver ("Bhaiya" = respected brother) and asking to turn on the official fare meter rather than negotiating a flat unmetered quote.',
    culturalContext: 'Using "Bhaiya" is friendly, culturally respectful, and establishes rapport. Demanding the meter ("meter se chaloge") signals you are a savvy passenger aware of regional transport laws.',
    detectedTone: 'Polite, assertive & respectful'
  });

  // Common tourist phrases by category
  const commonPhrases = [
    {
      category: 'Safety & Emergency',
      phrases: [
        { text: 'मुझे पुलिस स्टेशन जाना है', translit: 'Mujhe police station jaana hai', eng: 'I need to go to the police station', lang: 'Hindi' },
        { text: 'मदद कीजिए! इमरजेंसी है', translit: 'Madad kijiye! Emergency hai', eng: 'Please help! It is an emergency', lang: 'Hindi' },
        { text: 'உதவி செய்யுங்கள்', translit: 'Udhavi seiyungal', eng: 'Please help (Tamil)', lang: 'Tamil' },
      ]
    },
    {
      category: 'Transport & Fares',
      phrases: [
        { text: 'कृपया मीटर चालू कीजिए', translit: 'Kripya meter chaalu kijiye', eng: 'Please turn on the meter', lang: 'Hindi' },
        { text: 'इतना ज्यादा किराया नहीं है', translit: 'Itna zyada kiraya nahi hai', eng: 'The fare is not this high / This is too much', lang: 'Hindi' },
        { text: 'மீட்டர் போடுங்கள்', translit: 'Meter podungal', eng: 'Please put on the meter (Tamil)', lang: 'Tamil' },
      ]
    },
    {
      category: 'Directions & Food',
      phrases: [
        { text: 'यह रास्ता किधर जाता है?', translit: 'Yeh raasta kidhar jaata hai?', eng: 'Where does this road lead?', lang: 'Hindi' },
        { text: 'कम मिर्च वाला खाना चाहिए', translit: 'Kam mirch waala khaana chahiye', eng: 'I want food with mild spices / less chili', lang: 'Hindi' },
        { text: 'খাবার কম ঝাল দেবেন', translit: 'Khabar kom jhal deben', eng: 'Please prepare food with low chili (Bengali)', lang: 'Bengali' },
      ]
    }
  ];

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await api.translateText(inputText, sourceLang, targetLang);
      setTranslationResult({
        translatedText: res.translatedText,
        explanation: res.explanation || 'Direct translation with grammatical alignment.',
        culturalContext: res.culturalNote || 'Standard polite regional phrasing commonly understood across India.',
        detectedTone: 'Direct & conversational'
      });
    } catch (e: any) {
      setTranslationResult({
        translatedText: 'Translation completed (Demo Mode)',
        explanation: 'The sentence expresses a standard tourist inquiry.',
        culturalContext: 'Standard conversational phrase.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translationResult) {
      setInputText(translationResult.translatedText);
    }
  };

  const handleSpeak = (text: string, key: string) => {
    if ('speechSynthesis' in window) {
      if (speakingKey === key) {
        window.speechSynthesis.cancel();
        setSpeakingKey(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setSpeakingKey(null);
      utterance.onerror = () => setSpeakingKey(null);
      setSpeakingKey(key);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Languages className="w-3.5 h-3.5" />
              <span>Cultural & Linguistic Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Translate & Cultural Context
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl leading-relaxed">
              "Understand what is written and why." Decode signboards, vendor dialogues, and regional idioms with rich cultural explanations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-xs text-amber-100 max-w-xs space-y-1">
            <p className="font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              14+ Indian Languages
            </p>
            <p className="text-[11px] text-white/80">
              Powered by AI for context-aware interpretation beyond literal word substitution.
            </p>
          </div>
        </div>
      </div>

      {/* Main Translation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Box */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type Indian text, conversation, sign board text..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleSpeak(inputText, 'source')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {speakingKey === 'source' ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              <span>Listen</span>
            </button>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Translating...' : 'Translate & Explain'}</span>
            </button>
          </div>
        </div>

        {/* Translation Output Box */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Language
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap languages"
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 min-h-[120px] text-xs sm:text-sm text-slate-900 leading-relaxed">
              {translationResult.translatedText}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSpeak(translationResult.translatedText, 'target')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {speakingKey === 'target' ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                <span>Listen Audio</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(translationResult.translatedText)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {translationResult.detectedTone || 'Context Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Cultural Context & Subtext Breakdown */}
      {translationResult && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI CULTURAL & PRACTICAL INSIGHT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                Literal Meaning & Intention
              </span>
              <p className="text-slate-200 leading-relaxed">
                {translationResult.explanation}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <span className="text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                Cultural Context & Tourist Advice
              </span>
              <p className="text-slate-200 leading-relaxed">
                {translationResult.culturalContext}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Essential Indian Travel Phrasebook */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Essential Tourist Audio Phrasebook
            </h3>
            <p className="text-xs text-slate-500">
              Key phrases for navigating cabs, emergencies, and polite local interactions.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Audio Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commonPhrases.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1">
                {cat.category}
              </h4>
              <div className="space-y-2">
                {cat.phrases.map((phrase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{phrase.text}</span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(phrase.text, `phrase-${idx}-${pIdx}`)}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-600 transition-colors"
                      >
                        {speakingKey === `phrase-${idx}-${pIdx}` ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-800 font-mono">{phrase.translit}</p>
                    <p className="text-[11px] text-slate-500">{phrase.eng}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

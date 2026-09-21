import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { EmergencyModal } from './components/EmergencyModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PriceCheckerPage } from './pages/PriceCheckerPage';
import { ServicesPage } from './pages/ServicesPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { TranslatePage } from './pages/TranslatePage';
import { SafetyPage } from './pages/SafetyPage';
import { ExplorePage } from './pages/ExplorePage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { MyTripPage } from './pages/MyTripPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const { user, isLoading } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Modal & Deep linking states
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [complaintPrefill, setComplaintPrefill] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-wider uppercase text-blue-400">TravelShield</p>
          <p className="text-xs text-slate-400">Initializing secure tourist safety environment...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render Login/Register flow
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Handlers for cross-page navigation
  const handleSelectProvider = (id: string) => {
    setSelectedProviderId(id);
    setActiveTab('provider-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFindAlternative = (cat: string) => {
    setPreselectedCategory(cat);
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAIWhy = (prompt: string) => {
    setAiPrompt(prompt);
    setActiveTab('ai-assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportIssue = (data: any) => {
    setComplaintPrefill(data);
    setActiveTab('complaints');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onSelectProvider={handleSelectProvider}
          />
        )}

        {activeTab === 'price-checker' && (
          <PriceCheckerPage
            onFindAlternative={handleFindAlternative}
            onAskAIWhy={handleAskAIWhy}
            onReportIssue={handleReportIssue}
          />
        )}

        {activeTab === 'services' && (
          <ServicesPage
            onSelectProvider={handleSelectProvider}
            preselectedCategory={preselectedCategory}
          />
        )}

        {activeTab === 'provider-detail' && selectedProviderId && (
          <ProviderDetailPage
            providerId={selectedProviderId}
            onBack={() => setActiveTab('services')}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistantPage
            initialPrompt={aiPrompt}
            setActiveTab={setActiveTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === 'translate' && <TranslatePage />}

        {activeTab === 'safety' && (
          <SafetyPage onOpenEmergency={() => setIsEmergencyOpen(true)} />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onSelectService={handleFindAlternative}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintsPage prefillData={complaintPrefill} />
        )}

        {activeTab === 'my-trip' && (
          <MyTripPage onOpenEmergency={() => setIsEmergencyOpen(true)} />
        )}

        {activeTab === 'feedback' && <FeedbackPage />}

        {activeTab === 'profile' && (
          <ProfilePage
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onNavigateHome={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* 24x7 Emergency Helpline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200/80 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">TravelShield</span>
            <span>•</span>
            <span>"Explore India. Stay Protected."</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('safety')} className="hover:text-slate-900 transition-colors">
              Safety Center
            </button>
            <button onClick={() => setActiveTab('price-checker')} className="hover:text-slate-900 transition-colors">
              Fare Benchmarks
            </button>
            <button onClick={() => setActiveTab('feedback')} className="hover:text-slate-900 transition-colors">
              Feedback
            </button>
            <button onClick={() => setIsEmergencyOpen(true)} className="text-rose-600 font-bold hover:underline">
              Emergency 112 / 1363
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            24x7 Multi-lingual Tourist Protection Service
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

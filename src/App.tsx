import React, { useState } from 'react';
import { AppProvider, useAppState } from './AppContext';
import { HealthStage } from './types';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { CycleTracker } from './components/CycleTracker';
import { SymptomLog } from './components/SymptomLogModal';
import { DailyInsights } from './components/DailyInsights';
import { Calculators } from './components/Calculators';
import { ForumView } from './components/ForumView';
import { DocCenter } from './components/DocCenter';
import { EducationLounge } from './components/EducationLounge';
import { Calendar, BookOpen, Users, Calculator, ShieldAlert, FileText, Heart, RefreshCw } from 'lucide-react';

function DashboardContent() {
  const { user, profile, isLoading, t } = useAppState();
  const [activeTab, setActiveTab] = useState<'tracker' | 'library' | 'forum' | 'calculators' | 'clinicians'>('tracker');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff8f7] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-[#894f42] animate-spin mx-auto" />
          <h2 className="text-lg font-sans font-extrabold text-[#261818]">{t('loadingDb')}</h2>
          <p className="text-xs text-gray-400 font-sans">{t('privacyFirst')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const getStageLocalizedDescription = (stage: HealthStage) => {
    switch (stage) {
      case HealthStage.PREGNANCY:
        return t('stageDescPregnancy');
      case HealthStage.PERIMENOPAUSE:
        return t('stageDescPerimenopause');
      case HealthStage.POSTMENOPAUSE:
        return t('stageDescPostmenopause');
      default:
        return t('stageDescMenstruating');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] pb-12 text-[#261818]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Supportive Stage header welcome message */}
        <div className="bg-white rounded-3xl p-5 border border-[#ffe9e8] shadow-[0_4px_30px_rgba(137,79,66,0.02)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
          <div className="bg-[#fff0f0] p-3 text-[#894f42] rounded-2xl">
            <Heart className="w-8 h-8 animate-pulse text-[#894f42]" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg text-gray-850">
              {t('greeting')}, {profile?.displayName || t('defaultMember')}! 🌸
            </h2>
            <p className="text-xs text-[#524340] font-sans mt-0.5 leading-relaxed">
              {profile ? getStageLocalizedDescription(profile.currentStage) : getStageLocalizedDescription(HealthStage.MENSTRUATING)}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Pill selector */}
        <div className="flex border-b border-[#ffe9e8] overflow-x-auto gap-2 pb-1.5 scrollbar-none">
          {[
            { id: 'tracker', label: t('tabTracker'), icon: Calendar },
            { id: 'library', label: t('tabLibrary'), icon: BookOpen },
            { id: 'forum', label: t('tabForum'), icon: Users },
            { id: 'calculators', label: t('tabCalculators'), icon: Calculator },
            { id: 'clinicians', label: t('tabClinicians'), icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#894f42] text-white shadow-md'
                    : 'bg-white hover:bg-[#fff0f0] text-gray-600 border border-[#ffe9e8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CORE RENDER VIEWS ACCORDING TO SELECTIONS */}
        <div className="space-y-6">
          
          {activeTab === 'tracker' && (
            <div className="space-y-6 animate-fade-in">
              {/* SVG Cycle Wheel and details */}
              <CycleTracker 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Form to log symptoms */}
                <div className="col-span-1 md:col-span-6">
                  <SymptomLog selectedDate={selectedDate} />
                </div>
                {/* Gemini advice box and secure chat helper */}
                <div className="col-span-1 md:col-span-6">
                  <DailyInsights />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="animate-fade-in">
              <EducationLounge />
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="animate-fade-in">
              <ForumView />
            </div>
          )}

          {activeTab === 'calculators' && (
            <div className="animate-fade-in">
              <Calculators />
            </div>
          )}

          {activeTab === 'clinicians' && (
            <div className="animate-fade-in">
              <DocCenter />
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

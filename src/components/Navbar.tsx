import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { HealthStage } from '../types';
import { Bell, Shield, Heart, LogOut, Award, User, RefreshCw, Calendar, Sparkles, Globe } from 'lucide-react';
import { toLocalizedNumber } from '../i18n';

export const Navbar: React.FC = () => {
  const { user, profile, updateProfileStage, notifications, signOutUser, language, setLanguage, t } = useAppState();
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Get active notifications count
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getStageLocalizedName = (stage: HealthStage) => {
    switch (stage) {
      case HealthStage.MENSTRUATING:
        return t('stageMenstruating');
      case HealthStage.PREGNANCY:
        return t('stagePregnancy');
      case HealthStage.PERIMENOPAUSE:
        return t('stagePerimenopause');
      case HealthStage.POSTMENOPAUSE:
        return t('stagePostmenopause');
      default:
        return t('stageMenstruating');
    }
  };

  const handleStageChange = async (newStage: HealthStage) => {
    await updateProfileStage(newStage, {});
    setShowStageMenu(false);
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#fff8f7]/95 backdrop-blur-md border-b border-[#ffe9e8] px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_4px_20px_rgba(137,79,66,0.03)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#894f42] text-white p-1.5 sm:p-2 rounded-xl shadow-md flex items-center justify-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          </div>
          <div>
            <span className="font-sans text-lg sm:text-2xl font-bold tracking-tight text-[#261818] flex items-center gap-1 sm:gap-1.5">
              {t('appName')}
              <span className="bg-[#c7eae1] text-[#3c5550] text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-sans font-semibold">
                {t('brandBadge')}
              </span>
            </span>
            <p className="text-[9px] sm:text-[10px] text-[#524340] font-mono hidden sm:block">{t('tagline')}</p>
          </div>
        </div>

        {/* Action centers */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">

          {/* Language Switcher Toggle */}
          <div className="flex items-center bg-white border border-[#ffe9e8] rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-bold font-sans rounded-lg transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-[#894f42] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🇧🇩 <span className="hidden xs:inline">বাংলা</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-bold font-sans rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#894f42] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🇬🇧 <span className="hidden xs:inline">EN</span>
            </button>
          </div>
          
          {/* Health Stage Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setShowStageMenu(!showStageMenu)}
              className="flex items-center gap-1 bg-[#fff0f0] hover:bg-[#ffe9e8] text-[#894f42] border border-[#fde2e1] px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold font-sans transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#894f42] shrink-0" />
              <span className="hidden md:inline">{profile ? getStageLocalizedName(profile.currentStage) : t('changeStage')}</span>
              <span className="md:hidden">{t('changeStage')}</span>
            </button>

            {showStageMenu && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-2rem)] bg-white border border-[#ffe9e8] rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                <p className="text-[10px] text-[#524340] px-3 py-1 font-sans border-b border-[#ffe9e8] font-semibold">
                  {t('selectStagePrompt')}
                </p>
                
                <button
                  onClick={() => handleStageChange(HealthStage.MENSTRUATING)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 font-sans ${profile?.currentStage === HealthStage.MENSTRUATING ? 'bg-[#fff0f0] text-[#894f42] font-semibold' : 'hover:bg-[#fff9f8] text-[#261818]'}`}
                >
                  <Calendar className="w-4 h-4 text-[#894f42]" />
                  {t('stageMenstruating')}
                </button>
                
                <button
                  onClick={() => handleStageChange(HealthStage.PREGNANCY)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 font-sans ${profile?.currentStage === HealthStage.PREGNANCY ? 'bg-[#fff0f0] text-[#894f42] font-semibold' : 'hover:bg-[#fff9f8] text-[#261818]'}`}
                >
                  <Sparkles className="w-4 h-4 text-[#45645e]" />
                  {t('stagePregnancy')}
                </button>
                
                <button
                  onClick={() => handleStageChange(HealthStage.PERIMENOPAUSE)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 font-sans ${profile?.currentStage === HealthStage.PERIMENOPAUSE ? 'bg-[#fff0f0] text-[#894f42] font-semibold' : 'hover:bg-[#fff9f8] text-[#261818]'}`}
                >
                  <Award className="w-4 h-4 text-[#7e5541]" />
                  {t('stagePerimenopause')}
                </button>
                
                <button
                  onClick={() => handleStageChange(HealthStage.POSTMENOPAUSE)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 font-sans ${profile?.currentStage === HealthStage.POSTMENOPAUSE ? 'bg-[#fff0f0] text-[#894f42] font-semibold' : 'hover:bg-[#fff9f8] text-[#261818]'}`}
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  {t('stagePostmenopause')}
                </button>
              </div>
            )}
          </div>

          {/* Premium badge */}
          {profile?.subActive ? (
            <div className="hidden xl:flex items-center gap-1 bg-[#c7eae1] text-[#2d4c46] px-2.5 py-1 rounded-full text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 fill-[#2d4c46]" />
              {t('proVersion')}
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
              {t('freeVersion')}
            </div>
          )}

          {/* Notifications push emulator */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-1.5 sm:p-2 text-[#524340] hover:text-[#894f42] hover:bg-[#fff0f0] rounded-xl transition-all relative cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-[#fff8f7] rounded-full animate-ping-slow" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#ffe9e8] rounded-2xl shadow-xl py-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-[#ffe9e8]">
                  <span className="text-xs font-bold text-[#261818] font-sans">{t('notificationsTitle')}</span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                    {toLocalizedNumber(notifications.length, language)}
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#524340] p-4 text-center font-sans">{t('noNotifications')}</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b border-[#fff0f0] hover:bg-[#fff9f8] transition-all">
                        <p className="text-xs font-bold text-[#894f42] font-sans">{notif.title}</p>
                        <p className="text-[11px] text-[#524340] mt-1 font-sans leading-relaxed">{notif.message}</p>
                        <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secure privacy indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 rounded-xl px-2 py-1 text-[11px] font-sans border border-emerald-100">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-semibold">{t('encryptedData')}</span>
          </div>

          {/* Sign out */}
          <button 
            onClick={signOutUser}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title={t('signOut')}
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </nav>
  );
};


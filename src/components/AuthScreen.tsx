import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { HealthStage } from '../types';
import { Heart, ShieldCheck, Mail, User, Compass, HelpCircle, ArrowRight, Activity, Smile } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { mockLogin, mockRegister, language, setLanguage, t } = useAppState();

  const [isLogin, setIsLogin] = useState(true);
  
  // Registration States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState<HealthStage>(HealthStage.MENSTRUATING);

  // Sign in States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await mockLogin(loginEmail, loginName || loginEmail.split('@')[0]);
      } else {
        await mockRegister(email, name, stage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Language Switcher Top Header */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-white border border-[#fce7f3] rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-3 py-1 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
            language === 'bn'
              ? 'bg-[#e11d48] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          🇧🇩 বাংলা
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-[#e11d48] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          EN
        </button>
      </div>

      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/40 blur-3xl opacity-60 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-200/30 blur-3xl opacity-50 rounded-full -ml-20 -mb-20" />

      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#fce7f3] shadow-[0_12px_60px_rgba(225,29,72,0.08)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] relative z-10 animate-fade-in mt-10 md:mt-0">
        
        {/* LEFT COLUMN: BRAND PROMOTION / ONBOARDING INFO */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#e11d48] via-[#db2777] to-[#be185d] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle logo pattern */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full -mr-10 -mt-10" />

          <div className="space-y-4">
            <div className="bg-white/15 backdrop-blur-xs p-2 rounded-2xl w-max flex items-center justify-center border border-white/20 shadow-sm">
              <Heart className="w-8 h-8 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-sans">{t('authWelcomeTitle')}</h1>
              <p className="text-xs text-pink-100 font-sans mt-0.5 opacity-90">{t('authTagline')}</p>
            </div>
          </div>

          <div className="space-y-4 my-8 md:my-0 text-xs font-sans">
            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/15 p-1 rounded-lg shrink-0 mt-0.5">🌸</div>
              <p className="leading-relaxed">{t('authFeature1')}</p>
            </div>

            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/15 p-1 rounded-lg shrink-0 mt-0.5">✨</div>
              <p className="leading-relaxed">{t('authFeature2')}</p>
            </div>

            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/15 p-1 rounded-lg shrink-0 mt-0.5">🔒</div>
              <p className="leading-relaxed">{t('authFeature3')}</p>
            </div>
          </div>

          {/* Secure lock footer */}
          <div className="flex items-center gap-1.5 text-[10px] text-white/90 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 w-max pr-4">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{t('authGdpr')}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FORM SWITCHERS */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center min-h-[460px]">
          
          <div className="flex items-center gap-2 mb-6 border-b border-[#fff0f5] pb-3 justify-center md:justify-start">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`pb-2.5 px-4 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
                isLogin 
                  ? 'border-[#e11d48] text-[#e11d48] font-black' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('tabLogin')}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`pb-2.5 px-4 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
                !isLogin 
                  ? 'border-[#e11d48] text-[#e11d48] font-black' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('tabRegister')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              // LOGIN USER PANEL
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">{t('emailLabel')}</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. apu@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">{t('nameLabel')}</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Faria Rahman"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md shadow-rose-200/80 transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
                >
                  {loading ? t('loggingIn') : t('loginButton')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // NEW REGISTER ONBOARDING PANEL USING STAGE SELECTOR
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">{t('nameLabel')}</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rohima Begum"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">{t('emailLabel')}</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="e.g. email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                      required
                    />
                  </div>
                </div>

                {/* Healthy Stage Selection panel */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 font-sans mb-2">{t('selectStageGoal')}</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { value: HealthStage.MENSTRUATING, title: t('stageMenstruating') },
                      { value: HealthStage.PREGNANCY, title: t('stagePregnancy') },
                      { value: HealthStage.PERIMENOPAUSE, title: t('stagePerimenopause') }
                    ].map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setStage(item.value)}
                        className={`flex flex-col items-center justify-center p-2.5 border rounded-2xl cursor-pointer transition-all ${
                          stage === item.value 
                            ? 'border-[#e11d48] bg-[#fff0f5] text-[#be185d] font-semibold ring-1 ring-[#e11d48]' 
                            : 'border-gray-200 hover:bg-[#fff9fa] text-gray-600 bg-[#fffbfc]'
                        }`}
                      >
                        <span className="font-bold text-[11px] font-sans block leading-tight">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#db2777] to-[#e11d48] hover:from-[#be185d] hover:to-[#9f1239] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md shadow-rose-200/80 transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 mt-3"
                >
                  {loading ? t('registering') : t('registerButton')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>

          {/* Secure disclaimer */}
          <div className="mt-5 text-center text-[10px] text-[#703848] font-sans leading-relaxed">
            {t('authDisclaimer')}
          </div>

        </div>

      </div>

    </div>
  );
};

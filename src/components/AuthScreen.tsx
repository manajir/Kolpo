import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { HealthStage } from '../types';
import { Heart, ShieldCheck, Mail, User, Compass, HelpCircle, ArrowRight, Activity, Smile } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { mockLogin, mockRegister } = useAppState();

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
    <div className="min-h-screen bg-[#fff8f7] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffdad3]/40 blur-3xl opacity-60 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c7eae1]/30 blur-3xl opacity-50 rounded-full -ml-20 -mb-20" />

      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#ffe9e8] shadow-[0_12px_60px_rgba(137,79,66,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] relative z-10 animate-fade-in">
        
        {/* LEFT COLUMN: BRAND PROMOTION / ONBOARDING INFO */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#894f42] to-[#7e5541] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle logo pattern */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full -mr-10 -mt-10" />

          <div className="space-y-4">
            <div className="bg-white/10 p-2 rounded-2xl w-max flex items-center justify-center">
              <Heart className="w-8 h-8 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-sans">কল্প (Kalpa)</h1>
              <p className="text-xs text-coral-100 font-sans mt-0.5 opacity-90">বাংলা ভাষায় নারীদের বিশ্বস্ত গোপন স্বাস্থ্য ট্র্যাকার</p>
            </div>
          </div>

          <div className="space-y-4 my-8 md:my-0 text-xs font-sans">
            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/10 p-1 rounded-lg shrink-0 mt-0.5">✔</div>
              <p className="leading-relaxed">পিরিয়ড, ওভুলেশন উর্বরতা দিন, গর্ভাবস্থা ও পেরিমেনোপজের জটিল উপসর্গ গণনা ও নিখুঁত প্রেডিকশন</p>
            </div>

            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/10 p-1 rounded-lg shrink-0 mt-0.5">✔</div>
              <p className="leading-relaxed">কোনো বিজ্ঞাপন নেই এবং আপনার সমস্ত ডাটা শক্তিশালী এন্ড-টু-এ্যান্ড এনক্রিপশন লকের অধীনে সম্পূর্ণ নিরাপদ ও গোপন</p>
            </div>

            <div className="flex items-start gap-2 text-[11px]">
              <div className="bg-white/10 p-1 rounded-lg shrink-0 mt-0.5">✔</div>
              <p className="leading-relaxed">অজ্ঞাতনামা সহমর্মী ফোরাস обсуждения, বিশেষজ্ঞ গাইনোকোলজিস্ট ডাক্তারদের অনুচ্ছেদ ও সমৃদ্ধ মেটারনিটি ভিডিও কোর্স</p>
            </div>
          </div>

          {/* Secure lock footer */}
          <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 w-max pr-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GDPR ও HIPAA ডাটা সুরক্ষা প্রোটোকল সমর্থিত</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FORM SWITCHERS */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center min-h-[460px]">
          
          <div className="flex items-center gap-2 mb-6 border-b border-[#fff0f0] pb-3 justify-center md:justify-start">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-2.5 px-4 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
                isLogin 
                  ? 'border-[#894f42] text-[#894f42] font-black' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              আজকেই লগইন করুন
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-2.5 px-4 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
                !isLogin 
                  ? 'border-[#894f42] text-[#894f42] font-black' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              নতুন অ্যাকাউন্ট খুলুন
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              // LOGIN USER PANEL
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">আপনার ইমেইল ঠিকানা:</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. apu@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">আপনার নাম / ছদ্মনাম (গোপন ফোরামের জন্য):</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. ফারিয়া রহমান"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-10 pr-4 py-2.5 text-xs font-sans text-gray-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#894f42] hover:bg-[#753f33] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
                >
                  {loading ? 'লগইন হচ্ছে...' : 'চলুন শুরু করি'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // NEW REGISTER ONBOARDING PANEL USING STAGE SELECTOR
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">আপনার নাম / ডাকনাম:</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. রহিমা বেগম"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">আপনার ইমেইল:</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="e.g. email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Healthy Stage Selection panel */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 font-sans mb-2">আপনার বর্তমান লক্ষ্য বা শারীরিক পর্যায় নির্ধারণ করুন:</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { value: HealthStage.MENSTRUATING, title: 'পিরিয়ড ও ওভুলেশন', sub: 'নিয়মিত চক্র ট্র্যাকিং' },
                      { value: HealthStage.PREGNANCY, title: 'গর্ভাবস্থা ট্র্যাকার', sub: 'মেটারনিটি গাইড সপ্তাহ' },
                      { value: HealthStage.PERIMENOPAUSE, title: 'পেরিমেনোপজ যত্ন', sub: '৪০ ঊর্ধ্ব হরমোন কেয়ার' }
                    ].map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setStage(item.value)}
                        className={`flex flex-col items-center justify-center p-2.5 border rounded-2xl cursor-pointer transition-all ${
                          stage === item.value 
                            ? 'border-[#894f42] bg-[#fff0f0] text-[#894f42] font-semibold ring-1 ring-[#894f42]' 
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600 bg-[#fffcfc]'
                        }`}
                      >
                        <span className="font-bold text-[11px] font-sans block leading-tight">{item.title}</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 leading-none block">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#45645e] hover:bg-[#3c5550] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 mt-3"
                >
                  {loading ? 'সর্বোচ্চ সুরক্ষায় অ্যাকাউন্ট ওপেন হচ্ছে...' : 'নতুন সদস্য নিবন্ধন সম্পন্ন করুন ও ট্র্যাক শুরু করুন'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>

          {/* Secure disclaimer */}
          <div className="mt-5 text-center text-[10px] text-gray-450 font-sans leading-relaxed">
            কল্প হেলথ ট্র্যাকার ব্যবহারে কোনো রকম পাসওয়ার্ড মনে রাখার ঝক্কি নেই। আপনার ইমেইল প্রদান করে সাথে সাথেই লোকাল এনক্রিপ্ট ক্লাউড ডাটাবেস সিকিউরলি তৈরি করে নিতে পারেন।
          </div>

        </div>

      </div>

    </div>
  );
};

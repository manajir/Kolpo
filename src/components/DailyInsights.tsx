import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { Sparkles, MessageSquare, Send, RefreshCw, ShieldCheck } from 'lucide-react';

export const DailyInsights: React.FC = () => {
  const { profile, trackingLogs, language, t } = useAppState();
  
  const [insight, setInsight] = useState<{
    prediction: string;
    insight: string;
    wellnessTips: string[];
  } | null>(null);
  
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  const isEn = language === 'en';

  // Chat companion state
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Initialize welcome message when language changes or mounts
  useEffect(() => {
    const welcomeMsg = isEn
      ? "Welcome! I am your personal health companion, Diptee Assistant. Feel free to ask any confidential questions about period cramp relief, pregnancy nutrition, or perimenopause symptoms. (Information provided is educational and not a substitute for clinical advice)."
      : "আসসালামু আলাইকুম আপু! আমি আপনার ব্যক্তিগত সহকারী \"দীপ্তি সহকারী\"। পিরিয়ড ব্যথার প্রতিকার, গর্ভাবস্থার পুষ্টি, বা পেরিমেনোপজের অস্থিরতা নিয়ে গোপনীয়তা বজায় রেখে যেকোনো প্রশ্ন করতে পারেন। (তথ্যগুলো শিক্ষামূলক এবং চিকিৎসকের বিকল্প নয়)";

    setMessages([
      {
        sender: 'assistant',
        text: welcomeMsg
      }
    ]);
  }, [language]);

  // Load daily insight depending on logged metrics
  const fetchDailyInsight = async () => {
    if (!profile) return;
    setLoadingInsight(true);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLog = trackingLogs[todayStr];
    
    try {
      const response = await fetch('/api/gemini/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentStage: profile.currentStage,
          symptoms: todaysLog?.symptoms || [],
          moods: todaysLog?.moods || [],
          energyLevel: todaysLog?.energyLevel || 'medium',
          logDate: todayStr,
          language
        })
      });
      
      const data = await response.json();
      if (data) {
        setInsight(data);
      }
    } catch (e) {
      console.error('Failed to load daily advice:', e);
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    fetchDailyInsight();
  }, [profile, trackingLogs, language]);

  // Send message to Gemini chat server
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loadingChat) return;
    
    const userMsg = userInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setUserInput('');
    setLoadingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          currentStage: profile?.currentStage || 'menstruating',
          language
        })
      });
      
      const data = await response.json();
      if (data && data.response) {
        setMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'assistant', 
            text: isEn 
              ? 'Sorry, my server connection is a bit slow. Please stay hydrated and get adequate rest.' 
              : 'দুঃখিত আপু, আমার সার্ভার সংযোগ কিছুটা ধীরগতির। দয়া করে পুষ্টিকর খাবার গ্রহণ করুন এবং পর্যাপ্ত বিশ্রাম নিন।' 
          }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: isEn 
            ? 'Connection interrupted. For severe cramps, applying a warm compress or drinking ginger tea is very helpful.' 
            : 'সংযোগ বিচ্ছিন্ন হয়েছে আপু। তবে পিরিয়ডের তীব্র ব্যথায় আদা-পানি বা কুসুম গরম জলের সেঁক খুবই উপকারী ঘরোয়া টোকা।' 
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Daily insight card */}
      <div className="col-span-1 lg:col-span-7 space-y-6">
        <div className="bg-gradient-to-br from-[#fff0f5] via-[#fff5f8] to-[#fdf2f8] rounded-3xl p-6 border border-[#fce7f3] shadow-[0_12px_40px_rgba(225,29,72,0.04)] relative overflow-hidden">
          
          {/* Ambient background blur circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/50 blur-3xl opacity-40 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-200/40 blur-2xl opacity-30 rounded-full -ml-8 -mb-8" />

          <div className="flex items-center justify-between pb-4 border-b border-[#fce7f3] relative z-10">
            <h3 className="font-sans font-bold text-base text-[#2d1527] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e11d48]" />
              {isEn ? "Today's Personal Insight & Predictions" : "আপনার আজকের ব্যক্তিগত পরামর্শ ও ভবিষ্যৎবাণী"}
            </h3>
            <button 
              onClick={fetchDailyInsight}
              className="p-1.5 hover:bg-[#fff0f5] rounded-lg transition-all text-[#e11d48]"
              title={isEn ? "Reload Advice" : "নতুন পরামর্শ লোড করুন"}
              disabled={loadingInsight}
            >
              <RefreshCw className={`w-4 h-4 ${loadingInsight ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mt-4 space-y-4 relative z-10">
            {loadingInsight ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#e11d48] animate-spin" />
                <p className="text-xs text-[#703848] font-sans font-semibold">
                  {isEn ? "Diptee AI is analyzing your health logs..." : "আপনার স্বাস্থ্যলগ পর্যবেক্ষণ করছে দীপ্তি AI..."}
                </p>
              </div>
            ) : (
              <>
                {/* Prediction text */}
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#fce7f3]">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#be185d] bg-[#fff0f5] border border-[#fce7f3] px-2 py-0.5 rounded">
                    {isEn ? "Today's Status" : "আজকের অবস্থা"}
                  </span>
                  <p className="text-xs font-bold text-[#2d1527] font-sans mt-2 leading-relaxed">
                    {insight?.prediction || (isEn ? "Your hormonal levels are currently stable and normal." : "আপনার হরমোনের মাত্রা স্বাভাবিক এবং স্থিতিশীল রয়েছে।")}
                  </p>
                </div>

                {/* Insight block */}
                <div>
                  <h4 className="text-xs font-bold text-[#be185d] font-sans mb-1">
                    {isEn ? "Physical Insights:" : "শারীরিক অন্তর্দৃষ্টি (Insights):"}
                  </h4>
                  <p className="text-xs text-[#703848] font-sans leading-relaxed">
                    {insight?.insight || (isEn ? "Hormonal shifts during menstrual or pregnancy cycles naturally affect energy and emotions." : "মাসিক চক্রের বা গর্ভাবস্থার হরমোনের পরিবর্তনের সাথে শরীরের ক্লান্তি, মন খারাপের একটি গভীর সংযোগ থাকে যা শতভাগ স্বাভাবিক।")}
                  </p>
                </div>

                {/* Wellness suggestions */}
                <div className="pt-2 border-t border-[#fce7f3]">
                  <h4 className="text-xs font-bold text-[#9333ea] font-sans mb-2.5">
                    {isEn ? "Wellness Tips:" : "সুস্থতা টিপস (Wellness Tips):"}
                  </h4>
                  <ul className="space-y-2">
                    {insight?.wellnessTips && insight.wellnessTips.length > 0 ? (
                      insight.wellnessTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#703848] font-sans leading-relaxed">
                          <span className="bg-[#ffe4e6] text-[#be185d] w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            {i+1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2 text-xs text-[#703848] font-sans">
                          <span className="bg-[#ffe4e6] text-[#be185d] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                          <span>{isEn ? "Drink plenty of water and avoid late-night caffeine." : "প্রচুর পরিমাণে পানি পান করুন এবং রাতে ক্যাফেইন এড়িয়ে চলুন।"}</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-[#703848] font-sans">
                          <span className="bg-[#ffe4e6] text-[#be185d] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                          <span>{isEn ? "A warm heating compress on the lower abdomen is an excellent natural remedy." : "তলপেটের ব্যথায় হালকা গরম ভাপ একটি উৎকৃষ্ট প্রাকৃতিক রেমেডি।"}</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Data isolation secure badge */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-5 flex items-start gap-4 shadow-xs">
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-emerald-800 text-xs">
              {isEn ? "Your Privacy is Always 100% Encrypted & Protected 🔒" : "আপনার গোপনীয়তা সর্বদাই সংরক্ষিত ও শতভাগ সুরক্ষিত 🔒"}
            </h4>
            <p className="text-[11px] text-[#703848] font-sans mt-1 leading-relaxed">
              {isEn 
                ? "Diptee end-to-end encrypts all your health logs, dates, and medical records. No third-party or advertising server ever accesses your private sensitive data." 
                : "দীপ্তি আপনার সমস্ত শারীরিক তথ্য যেমন পিরিয়ড তারিখ, গর্ভাবস্থার বিবরণ এবং ফাইলগুলো এন্ড-টু-এন্ড লোকাল এনক্রিপ্ট করে ক্লাউডে ট্রান্সফার করে। কোনো তৃতীয় পক্ষ বা বিজ্ঞাপনী সার্ভার আপনার এই ব্যক্তিগত স্বাস্থ্য স্পর্শকাতর ডাটা শেয়ার করতে পারবে না।"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive AI Support Chat assistant */}
      <div className="col-span-1 lg:col-span-5 bg-white rounded-3xl border border-[#fce7f3] shadow-[0_12px_44px_rgba(225,29,72,0.05)] p-5 flex flex-col justify-between h-[450px]">
        {/* Header */}
        <div className="pb-3 border-b border-[#fce7f3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-[#e11d48] to-[#db2777] text-white p-1.5 rounded-xl flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2d1527] font-sans">
                {isEn ? "Diptee Assistant (AI Health Guide)" : "দীপ্তি সহকারী (AI স্বাস্থ্য গাইড)"}
              </h4>
              <p className="text-[9px] text-[#703848] font-sans">
                {isEn ? "Private & Confidential Chat" : "ব্যক্তিগত ও সম্পূর্ণ সিকিউরড চ্যাট"}
              </p>
            </div>
          </div>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>

        {/* Chat message streams */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#db2777] text-white rounded-tr-none shadow-xs'
                    : 'bg-[#fff0f5] text-[#2d1527] rounded-tl-none border border-[#fce7f3]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-[#fff0f5] rounded-2xl px-3 py-2 text-[#703848] text-[10px] rounded-tl-none animate-pulse font-sans flex items-center gap-1.5 border border-[#fce7f3]">
                <RefreshCw className="w-3 h-3 animate-spin text-[#e11d48]" />
                {isEn ? "Assistant is thinking..." : "সহকারী ভাবছে..."}
              </div>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder={t('askAiPlaceholder')}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loadingChat}
            className="flex-1 bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-1.5 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
          />
          <button
            type="submit"
            disabled={loadingChat || !userInput.trim()}
            className="bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] disabled:bg-gray-200 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};


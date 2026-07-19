import React, { useState } from 'react';
import { Calendar, Baby, Activity, HelpCircle, Check, MapPin, Clipboard } from 'lucide-react';

export const Calculators: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<'duedate' | 'ovulation' | 'perimenopause'>('duedate');

  // Page 1 state: Due date
  const [lastPeriod, setLastPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [calcCycle, setCalcCycle] = useState(28);
  const [deliveryResult, setDeliveryResult] = useState<any | null>(null);

  // Page 2 state: Ovulation
  const [ovuLastPeriod, setOvuLastPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [ovuCycle, setOvuCycle] = useState(28);
  const [ovuResult, setOvuResult] = useState<any | null>(null);

  // Page 3 state: Perimenopause diagnostic
  const [answers, setAnswers] = useState<{ [q: number]: number }>({});
  const [menopauseResult, setMenopauseResult] = useState<string | null>(null);

  const calculateDueDate = (e: React.FormEvent) => {
    e.preventDefault();
    const lmpDate = new Date(lastPeriod);
    
    // Naegele's rule: add 280 days (40 weeks) adjusted for cycle length
    const lmpTime = lmpDate.getTime();
    const cycleAdjustment = (calcCycle - 28) * 24 * 3600000;
    const estimatedDelivery = new Date(lmpTime + 280 * 24 * 3600000 + cycleAdjustment);
    
    // Gestational age calculation
    const today = new Date();
    const gestAgeMs = today.getTime() - lmpDate.getTime();
    const gestDays = Math.floor(gestAgeMs / (1000 * 3600 * 24));
    const gestWeeks = Math.floor(gestDays / 7);
    const remainingDays = gestDays % 7;

    // Compare baby size in Bengali vegetables / fruits representation
    let babySize = 'খসখসে পোস্তদানা (Poppy Seed)';
    let babySizeDesc = 'আপনার সম্ভাব্য শিশুর আকার মাত্র ২ মিলিমিটার!';
    let imageUrl = 'https://images.unsplash.com/photo-1590005354167-6da97870c913?q=80&w=400';

    if (gestWeeks >= 4 && gestWeeks < 8) {
      babySize = 'ব্লুবেরি বা মিষ্টি বুন্দিয়া (Blueberry/Sweet)';
      babySizeDesc = 'আপনার সোনা এখন ৪ মিলিমিটার লম্বা, তার হৃদপিণ্ড কম্পিত হতে শুরু করেছে!';
    } else if (gestWeeks >= 8 && gestWeeks < 12) {
      babySize = 'দেশি কচি লেবু (Green Lime)';
      babySizeDesc = 'শিশুর আকার ৫ সেমি, হাত-পায়ের আঙ্গুল এবং দাঁতের কুঁড়ি তৈরি হচ্ছে!';
    } else if (gestWeeks >= 12 && gestWeeks < 20) {
      babySize = 'দেশি সুস্বাদু কামরাঙ্গা o দেশী পেয়ারা (Guava)';
      babySizeDesc = 'সোনা আপনার আঙুল চুষতে পারে! সে মায়ের সুস্বাদু খাবারের স্বাদ পাকে শুরু করেছে।';
    } else if (gestWeeks >= 20 && gestWeeks < 30) {
      babySize = 'কাঁচা করমচা বা মিষ্টি পাকা পেঁপে (Papaya)';
      babySizeDesc = 'শিশুর ওজন প্রায় ১ কেজি! সে এখন সক্রিয়ভাবে চোখের পাতা খুলছে ও বন্ধ করছে।';
    } else if (gestWeeks >= 30) {
      babySize = 'পাকা বড় কাঁঠাল (Sweet Jackfruit)';
      babySizeDesc = 'আপনার প্রসবের সময় নিকটবর্তী। সোনা এখন সম্পূর্ণ সুগঠিত এবং জন্মের অপেক্ষা করছে!';
    }

    setDeliveryResult({
      dueDateString: estimatedDelivery.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      gestationWeeks: gestWeeks,
      gestationDays: remainingDays,
      babySize,
      babySizeDesc,
      imageUrl
    });
  };

  const calculateOvuWindow = (e: React.FormEvent) => {
    e.preventDefault();
    const lmpDate = new Date(ovuLastPeriod);
    
    // Ovulation is cycle length minus 14
    const ovulationOffset = ovuCycle - 14;
    
    const ovulationDate = new Date(lmpDate);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationOffset);

    // Fertile window starts 4 days before ovulation and ends 1 day after
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 4);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    setOvuResult({
      ovulationDate: ovulationDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      fertileStart: fertileStart.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      fertileEnd: fertileEnd.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
  };

  // Diagnostic questions list
  const QUESTIONS = [
    { id: 1, text: 'আপনার কি ইদানীং প্রচণ্ড হঠাৎ গরম লাগা ও শরীর ঘেমে যাওয়া (Hot Flashes) অনুভূত হচ্ছে?' },
    { id: 2, text: 'দৈনিক ঘুমের চক্র কেমন চলছে? বিছানায় শুয়ে দীর্ঘক্ষণ মগজ সচল থাকা বা অনিদ্রা কি বেড়েছে?' },
    { id: 3, text: 'ঋতুস্রাবের সময়কাল কি অনিয়মিত হচ্ছে (যেমন পিরিয়ড তারিখ অনেক এগিয়ে আসা বা পিছিয়ে যাওয়া)?' },
    { id: 4, text: 'ছোটখাটো বিষয় নিয়ে হঠাৎ খিটখিটে মেজাজ, উদ্বেগ বা কোনো কারণ ছাড়াই বিষন্নতা কাজ করা?' },
    { id: 5, text: 'ঘন ঘন মাথা ঘোরা, শরীর দুর্বল লাগা, অস্থিসন্ধি বা জয়েন্টে হালকা ব্যথা অনুভূত হওয়া?' }
  ];

  const handleAnswerSelect = (qId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const calculateMenopauseScore = () => {
    const totalScore = (Object.values(answers) as number[]).reduce((sum, score) => sum + score, 0);
    let advice = '';

    if (totalScore <= 5) {
      advice = 'আপনার পেরিমেনোপজের লক্ষণসমূহ অনেক মৃদু বা নগণ্য। আপনার শরীর আপাতত স্বাভাবিক হরমোনের স্তরে রয়েছে।';
    } else if (totalScore > 5 && totalScore <= 11) {
      advice = 'আপনার শরীরে হালকা পরিবর্তনের লক্ষণ দেখা দিচ্ছে। পেরিমেনোপজের সূচনা পর্ব হওয়া সম্ভব। পুষ্টিকর ক্যালসিয়াম ও ভিটামিন ডি যুক্ত খাবার ডায়েটে যোগ করুন।';
    } else {
      advice = 'আপনার আচরণ ও উপসর্গে সুনির্দিষ্ট পেরিমেনোপজের সংকেত পরিলক্ষিত হচ্ছে। হরমোনের ওঠানামা স্বাভাবিক করার জন্য কোনো বিশেষজ্ঞ স্ত্রীরোগ ও হরমোন বিশেষজ্ঞের সাথে পরামর্শ করা শ্রেয়।';
    }

    setMenopauseResult(advice);
  };

  const toBengaliNumber = (num: number) => {
    const search = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const replace = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(char => {
      const index = search.indexOf(char);
      return index !== -1 ? replace[index] : char;
    }).join('');
  };

  return (
    <div className="bg-white border border-[#ffe9e8] rounded-3xl p-6 shadow-sm">
      
      {/* Selector pills */}
      <div className="flex border-b border-[#fff0f0] pb-4 mb-6 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveCalc('duedate')}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeCalc === 'duedate' 
              ? 'bg-[#894f42] text-white' 
              : 'text-[#894f42] hover:bg-[#fff0f0]'
          }`}
        >
          <Baby className="w-4 h-4" />
          গর্ভকালীন ডিউ ডেট ও শিশুর বিকাশ
        </button>
        <button
          onClick={() => setActiveCalc('ovulation')}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeCalc === 'ovulation' 
              ? 'bg-[#894f42] text-white' 
              : 'text-[#894f42] hover:bg-[#fff0f0]'
          }`}
        >
          <Activity className="w-4 h-4" />
          ওভুলেশন উর্বরতার দিন ক্যালকুলেটর
        </button>
        <button
          onClick={() => setActiveCalc('perimenopause')}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeCalc === 'perimenopause' 
              ? 'bg-[#894f42] text-white' 
              : 'text-[#894f42] hover:bg-[#fff0f0]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          পেরিমেনোপজ নির্ণয় কুইজ (৪০+)
        </button>
      </div>

      {/* CALCULATOR 1: Due date & size */}
      {activeCalc === 'duedate' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animation-fade-in">
          <div className="col-span-1 md:col-span-5 space-y-4">
            <h3 className="font-sans font-bold text-base text-[#261818] flex items-center gap-1">
              ডিউ ডেট প্রেডিকেটর
            </h3>
            <p className="text-xs text-[#524340] leading-relaxed font-sans">
              আপনার শেষ পিরিয়ডের শুরুর দিন বসিয়ে ডেলিভারির গর্ভকালীন সাপ্তাহিক হিসাব ও শিশুর সঠিক তুলনামূলক আকৃতির গ্রাফ এখনই দেখে নিন।
            </p>

            <form onSubmit={calculateDueDate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#261818] font-sans mb-1.5">শেষ পিরিয়ডের প্রথম দিন (LMP Date):</label>
                <input
                  type="date"
                  value={lastPeriod}
                  onChange={(e) => setLastPeriod(e.target.value)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261818] font-sans mb-1.5">স্বাভাবিক পিরিয়ড সাইকেল দৈর্ঘ্য:</label>
                <select
                  value={calcCycle}
                  onChange={(e) => setCalcCycle(parseInt(e.target.value))}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none"
                >
                  {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(v => (
                    <option key={v} value={v}>{toBengaliNumber(v)} দিন</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#894f42] hover:bg-[#753f33] text-white font-sans font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                ডিউ ডেট নির্ণয় করুন
              </button>
            </form>
          </div>

          <div className="col-span-1 md:col-span-7 bg-[#fffbfb] rounded-2xl p-5 border border-[#ffe9e8] flex flex-col justify-center min-h-[300px]">
            {deliveryResult ? (
              <div className="space-y-5 animate-fade-in text-xs font-sans">
                <div className="border-b border-[#ffe9e8] pb-4">
                  <h4 className="text-xs font-bold text-[#524340] uppercase tracking-wider block">ডেলিভারির সম্ভাব্য তারিখ:</h4>
                  <p className="text-2xl font-black text-[#894f42] mt-1.5">{deliveryResult.dueDateString}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-[#524340] mb-0.5">গর্ভকাল সময়কাল:</h5>
                    <p className="text-sm font-semibold text-[#261818]">
                      {toBengaliNumber(deliveryResult.gestationWeeks)} সপ্তাহ {deliveryResult.gestationDays > 0 ? `${toBengaliNumber(deliveryResult.gestationDays)} দিন` : ''}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#524340] mb-0.5">শিশুর ফলজ আকৃতি:</h5>
                    <p className="text-sm font-semibold text-[#45645e]">{deliveryResult.babySize}</p>
                  </div>
                </div>

                <div className="bg-[#fff0f0] border border-[#fde2e1] rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">🍎</span>
                  <div>
                    <h5 className="font-semibold text-[#894f42] text-xs">বিকাশের বর্তমান পর্যায়:</h5>
                    <p className="text-[#524340] mt-1 leading-relaxed text-[11px]">{deliveryResult.babySizeDesc}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Baby className="w-12 h-12 text-[#ffe9e8] mx-auto mb-2" />
                <p className="text-xs text-[#524340] font-sans font-medium">ডেলিভারির তারিখ ও গর্ভ সপ্তাহের ফলাফল দেখতে বামে ডাটা দিয়ে সেভ করুন</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALCULATOR 2: Ovulation fertile window */}
      {activeCalc === 'ovulation' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animation-fade-in">
          <div className="col-span-1 md:col-span-5 space-y-4">
            <h3 className="font-sans font-bold text-base text-[#261818] flex items-center gap-1">
              ওভুলেশন ফার্টিলিটি ট্র্যাকার
            </h3>
            <p className="text-xs text-[#524340] leading-relaxed font-sans">
              গর্ভধারণ করতে বা প্রাকৃতিক সুরক্ষায় ওভুলেশন পিরিয়ড ও সর্বোচ্চ ডিম্বস্ফোটনের দিন নির্ধারণ করা অত্যন্ত প্রয়োজনীয়।
            </p>

            <form onSubmit={calculateOvuWindow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#261818] font-sans mb-1.5">শেষ পিরিয়ডের শুরুর দিন:</label>
                <input
                  type="date"
                  value={ovuLastPeriod}
                  onChange={(e) => setOvuLastPeriod(e.target.value)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261818] font-sans mb-1.5">সাইকেলের গড় দিন:</label>
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={ovuCycle}
                  onChange={(e) => setOvuCycle(parseInt(e.target.value) || 28)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#45645e] hover:bg-[#38504b] text-white font-sans font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                ওভুলেশন সূচক গণনা করুন
              </button>
            </form>
          </div>

          <div className="col-span-1 md:col-span-7 bg-[#fffbfb] rounded-2xl p-5 border border-[#ffe9e8] flex flex-col justify-center min-h-[300px]">
            {ovuResult ? (
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div className="bg-[#ebf8f5] border border-[#c7eae1] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#4b6a63] uppercase tracking-wider block">ডিম্বস্ফোটনের অনুমিত দিন (Ovulation Day):</h4>
                  <p className="text-2xl font-black text-[#45645e] mt-1.5">{ovuResult.ovulationDate}</p>
                </div>

                <div className="bg-[#fff9f8] border border-[#ffe9e8] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#894f42] uppercase tracking-wider block">গর্ভধারণের উর্বর উইন্ডো (High Fertile days):</h4>
                  <p className="text-base font-black text-[#894f42] mt-1.5">
                    {ovuResult.fertileStart} থেকে {ovuResult.fertileEnd}
                  </p>
                  <p className="text-[11px] text-[#524340] mt-1.5 leading-relaxed">
                    এই ৫ দিনের উর্বর সময়কালে চেষ্টা করলে সুস্থ উপায়ে গর্ভধারণের সম্ভাবনা বহুগুণ ত্বরান্বিত হয়।
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-[#ffe9e8] mx-auto mb-2" />
                <p className="text-xs text-[#524340] font-sans font-medium">ডিম্বস্ফোটন ও সবচেয়ে উর্বর উইন্ডোর তালিকা দেখতে বামে ডাটা দিন</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALCULATOR 3: Perimenopause diagnostic quiz */}
      {activeCalc === 'perimenopause' && (
        <div className="space-y-4 animation-fade-in text-xs font-sans">
          <div className="bg-[#ffdbcc]/50 border border-[#ffdbcc] rounded-2xl p-4 mb-4">
            <h4 className="text-xs font-bold text-[#301405] font-sans">পেরিমেনোপজ সূচক অ্যাসেসমেন্ট (Forty+ Health Panel)</h4>
            <p className="text-[#524340] mt-1 text-[11px] leading-relaxed">
              ৪০ ঊর্ধ্ব নারীদের হরমোন মাত্রা কমে যাওয়া এবং রিপ্রোডাক্টিভ হ্রাসের স্বাভাবিক সংকেত পরিমাপ করতে এই কুইজ সহায়তা দেবে।
            </p>
          </div>

          <div className="space-y-5">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="border-b border-[#fff0f0] pb-4">
                <p className="font-semibold text-[#261818] mb-2">{toBengaliNumber(q.id)}. {q.text}</p>
                <div className="flex gap-2">
                  {[
                    { value: 0, label: 'কখনোই না (None)' },
                    { value: 1, label: 'মাঝে মাঝে (Mild)' },
                    { value: 3, label: 'মারাত্মক তীব্র (Severe)' }
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => handleAnswerSelect(q.id, btn.value)}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        answers[q.id] === btn.value
                          ? 'bg-[#894f42] text-white border-[#894f42] font-semibold'
                          : 'bg-white text-gray-600 hover:bg-[#fff9f8] border-gray-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={calculateMenopauseScore}
              disabled={Object.keys(answers).length < QUESTIONS.length}
              className="px-6 py-2.5 bg-[#894f42] hover:bg-[#753f33] disabled:bg-gray-200 text-white font-bold font-sans rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            >
              পেরিমেনোপজ স্বাস্থ্য ঝুঁকি হিসাব করুন
            </button>
            
            {menopauseResult && (
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <span className="font-bold text-yellow-800 uppercase tracking-wide text-[10px] block mb-1">ক্লিনিক্যাল অ্যাসেসমেন্ট ফলাফল:</span>
                <p className="text-[#261818] font-sans leading-relaxed text-[11px]">{menopauseResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

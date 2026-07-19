import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Calendar, Heart, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';

interface CycleTrackerProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const CycleTracker: React.FC<CycleTrackerProps> = ({ onSelectDate, selectedDate }) => {
  const { profile, trackingLogs } = useAppState();

  const cycleLength = profile?.cycleLength || 28;
  const periodLength = profile?.periodLength || 5;
  const lastPeriodDate = profile?.lastPeriodDate || new Date().toISOString().split('T')[0];

  // Calculate current cycle metrics
  const today = new Date();
  const lastPeriod = new Date(lastPeriodDate);
  const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentCycleDay = (diffDays % cycleLength) || 1;

  // Ovulation prediction: usually cycleLength - 14.
  const ovulationDay = cycleLength - 14; 
  const fertileStart = ovulationDay - 4;
  const fertileEnd = ovulationDay + 1;

  // Next cycle start prediction date
  const nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  const nextPeriodStr = nextPeriod.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

  // Determine current status
  let statusText = 'লুটিনাল ফেজ';
  let statusColor = 'text-amber-800 bg-amber-50 border-amber-100';
  let adviceText = 'আপনার হরমোনের মাত্রা ক্রমান্বয়ে কমছে, শরীরকে শান্ত ও বিষণ্নতা মুক্ত রাখতে পুষ্টির দিকে নজর দিন।';

  if (currentCycleDay <= periodLength) {
    statusText = 'ঋতুস্রাবকাল (পিরিয়ড প্রবাহ)';
    statusColor = 'text-[#894f42] bg-[#fff0f0] border-[#fde2e1]';
    adviceText = 'তলপেটে সেঁক দিন এবং কুসুম গরম আদা চা খান। শরীরে আয়রনের মাত্রা বাড়াতে লাল ডিম, দুধ বেশি নিন।';
  } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
    statusText = 'উর্বর উন্ডো ও ওভুলেশন (গর্ভধারণের উপযুক্ত সময়)';
    statusColor = 'text-[#45645e] bg-emerald-50 border-emerald-100';
    adviceText = 'আপনি যদি গর্ভধারণ করতে চান তবে আগামী ৩-৪ দিন সবচেয়ে উর্বর এবং অনুকূল সময়। সুষম খাবার ও ভিটামিন ডি নিশ্চিত করুন।';
  } else if (currentCycleDay === ovulationDay) {
    statusText = 'ডিম্বস্ফোটন দিন (Ovulation Day!)';
    statusColor = 'text-teal-700 bg-teal-50 border-teal-200';
    adviceText = 'আজ ডিম্বস্ফোটনের দিন। উর্বরতার চূড়ান্ত স্তর আজই!';
  }

  // Create list of 7 days around selected date for horizontal calendar scroll
  const generateWeeklyDays = () => {
    const arr = [];
    const baseDate = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  };

  const weekDays = generateWeeklyDays();

  // Helper formatting Bengali digits
  const toBengaliNumber = (num: number) => {
    const search = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const replace = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(char => {
      const index = search.indexOf(char);
      return index !== -1 ? replace[index] : char;
    }).join('');
  };

  return (
    <div className="bg-[#fff9f8] rounded-3xl p-6 border border-[#ffe9e8] shadow-[0_8px_30px_rgba(137,79,66,0.03)] space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ffe9e8] pb-5">
        <div>
          <h2 className="font-sans font-bold text-xl text-[#261818] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#894f42] fill-[#894f42]" />
            আপনার চক্র ট্র্যাকার এবং উর্বরতা চক্র
          </h2>
          <p className="text-xs text-[#524340] font-mono mt-0.5">সবচেয়ে নিখুঁত ওভুলেশন ও গর্ভাবস্থা নির্ধারণ ইঞ্জিন</p>
        </div>

        {/* Dynamic Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-semibold font-sans leading-relaxed ${statusColor}`}>
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {statusText} (দিন {toBengaliNumber(currentCycleDay)})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* SVG Cycle Wheel (Day 1-28 visualization) */}
        <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Custom Interactive SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#ffe9e8]"
                strokeWidth="14"
                fill="none"
              />
              {/* Menstruation segment (Day 1 to 5) */}
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#894f42]"
                strokeWidth="14"
                strokeDasharray={`${(periodLength / cycleLength) * 596} 596`}
                fill="none"
              />
              {/* Ovulation / Fertile window segment */}
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#45645e]"
                strokeWidth="14"
                strokeDasharray={`${((fertileEnd - fertileStart + 1) / cycleLength) * 596} 596`}
                strokeDashoffset={`-${(fertileStart / cycleLength) * 596}`}
                fill="none"
              />
            </svg>

            {/* Inner dynamic content box */}
            <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center border border-[#ffe9e8] text-center shadow-md p-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">চক্রের দিন</span>
              <span className="text-4xl font-black text-[#894f42] font-sans my-1">
                {toBengaliNumber(currentCycleDay)}
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#261818] leading-tight px-2">
                পরের মাসিক শুরু: <span className="text-[#894f42] block font-bold">{nextPeriodStr.split(',')[0]}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-sans mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#894f42]" />
              <span>মাসিক (রক্তস্রাব)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#45645e]" />
              <span>গর্ভধারণের উর্বর সময়</span>
            </div>
          </div>
        </div>

        {/* Cycle indicators, recommendations */}
        <div className="col-span-1 md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#ffe9e8] shadow-sm">
            <h4 className="text-xs font-bold text-[#894f42] font-sans flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#894f42]" />
              আজকের শারীরিক পরামর্শ:
            </h4>
            <p className="text-xs text-[#524340] font-sans mt-2 leading-relaxed">
              {adviceText}
            </p>
          </div>

          {/* Core Cycle Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="bg-white rounded-2xl p-3 border border-[#ffe9e8] text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">চক্রের দৈর্ঘ্য</span>
              <span className="text-lg font-black text-[#524340] block mt-1">{toBengaliNumber(cycleLength)} দিন</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#ffe9e8] text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ডিম্বস্ফোটন বা ওভুলেশন</span>
              <span className="text-lg font-black text-[#45645e] block mt-1">দিন {toBengaliNumber(ovulationDay)}</span>
            </div>
          </div>

          {/* Secure interactive Week Calendar log selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold text-[#261818] block">
              দিন সিলেক্ট করে দৈনিক উপসর্গ যোগ করুন:
            </label>
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const active = dateStr === selectedDate;
                const hasLogs = !!trackingLogs[dateStr];
                const dayNum = date.getDate();
                const dayName = date.toLocaleDateString('bn-BD', { weekday: 'short' });

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
                      active
                        ? 'bg-[#894f42] text-white shadow-md ring-2 ring-[#ffdad3]'
                        : 'bg-white text-[#261818] hover:bg-[#fff0f0] border border-[#ffe9e8]'
                    }`}
                  >
                    <span className="text-[9px] block uppercase font-sans font-bold opacity-80">{dayName}</span>
                    <span className="text-sm font-sans font-black mt-1">{toBengaliNumber(dayNum)}</span>
                    {hasLogs && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${active ? 'bg-white' : 'bg-red-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

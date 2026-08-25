import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Calendar, Heart, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
import { toLocalizedNumber } from '../i18n';

interface CycleTrackerProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const CycleTracker: React.FC<CycleTrackerProps> = ({ onSelectDate, selectedDate }) => {
  const { profile, trackingLogs, language, t } = useAppState();

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
  const nextPeriodStr = nextPeriod.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Determine current status
  let statusText = t('lutealPhase');
  let statusColor = 'text-amber-800 bg-amber-50 border-amber-100';
  let adviceText = language === 'bn'
    ? 'আপনার হরমোনের মাত্রা ক্রমান্বয়ে কমছে, শরীরকে শান্ত ও বিষণ্নতা মুক্ত রাখতে পুষ্টির দিকে নজর দিন।'
    : 'Your hormone levels are gradually dropping. Focus on proper nutrition to keep your body calm and rested.';

  if (currentCycleDay <= periodLength) {
    statusText = t('periodFlow');
    statusColor = 'text-[#be185d] bg-[#fff0f5] border-[#fce7f3]';
    adviceText = language === 'bn'
      ? 'তলপেটে সেঁক দিন এবং কুসুম গরম আদা চা খান। শরীরে আয়রনের মাত্রা বাড়াতে লাল ডিম, দুধ বেশি নিন।'
      : 'Apply a heating pad to lower abdomen and drink warm ginger tea. Eat iron-rich foods to replenish energy.';
  } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
    statusText = t('fertileWindow');
    statusColor = 'text-[#7e22ce] bg-[#faf5ff] border-[#e9d5ff]';
    adviceText = language === 'bn'
      ? 'আপনি যদি গর্ভধারণ করতে চান তবে আগামী ৩-৪ দিন সবচেয়ে উর্বর এবং অনুকূল সময়। সুষম খাবার ও ভিটামিন ডি নিশ্চিত করুন।'
      : 'If you are trying to conceive, the next 3-4 days are your most fertile window. Ensure balanced meals and Vitamin D.';
  } else if (currentCycleDay === ovulationDay) {
    statusText = t('ovulationDay');
    statusColor = 'text-[#db2777] bg-[#fdf2f8] border-[#fbcfe8]';
    adviceText = language === 'bn'
      ? 'আজ ডিম্বস্ফোটনের দিন। উর্বরতার চূড়ান্ত স্তর আজই!'
      : 'Today is your ovulation day! Peak fertility phase.';
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

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#fce7f3] shadow-[0_8px_30px_rgba(225,29,72,0.04)] space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#fce7f3] pb-5">
        <div>
          <h2 className="font-sans font-bold text-xl text-[#2d1527] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#e11d48] fill-[#e11d48]" />
            {t('cycleTrackerTitle')}
          </h2>
          <p className="text-xs text-[#703848] font-mono mt-0.5">{t('cycleTrackerSubtitle')}</p>
        </div>

        {/* Dynamic Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-semibold font-sans leading-relaxed ${statusColor}`}>
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {statusText} ({t('day')} {toLocalizedNumber(currentCycleDay, language)})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* SVG Cycle Wheel (Day 1-28 visualization) */}
        <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Custom Interactive SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 224 224">
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#fce7f3]"
                strokeWidth="14"
                fill="none"
              />
              {/* Menstruation segment (Day 1 to 5) */}
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#e11d48]"
                strokeWidth="14"
                strokeDasharray={`${(periodLength / cycleLength) * 596} 596`}
                fill="none"
              />
              {/* Ovulation / Fertile window segment */}
              <circle
                cx="112"
                cy="112"
                r="95"
                className="stroke-[#c084fc]"
                strokeWidth="14"
                strokeDasharray={`${((fertileEnd - fertileStart + 1) / cycleLength) * 596} 596`}
                strokeDashoffset={`-${(fertileStart / cycleLength) * 596}`}
                fill="none"
              />
            </svg>

            {/* Inner dynamic content box */}
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 bg-[#fff5f8] rounded-full flex flex-col items-center justify-center border border-[#fce7f3] text-center shadow-md p-2.5 sm:p-4">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-[#be185d]">{t('cycleDay')}</span>
              <span className="text-3xl sm:text-4xl font-black text-[#e11d48] font-sans my-0.5 sm:my-1">
                {toLocalizedNumber(currentCycleDay, language)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-[#2d1527] leading-tight px-1">
                {t('nextPeriod')}: <span className="text-[#be185d] block font-bold">{nextPeriodStr.split(',')[0]}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-sans mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e11d48]" />
              <span className="text-[#703848]">{t('periodFlow')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c084fc]" />
              <span className="text-[#703848]">{t('fertileWindow')}</span>
            </div>
          </div>
        </div>

        {/* Cycle indicators, recommendations */}
        <div className="col-span-1 md:col-span-7 space-y-4">
          <div className="bg-[#fff9fa] rounded-2xl p-4 border border-[#fce7f3] shadow-xs">
            <h4 className="text-xs font-bold text-[#be185d] font-sans flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#e11d48]" />
              {t('dailyTipTitle')}:
            </h4>
            <p className="text-xs text-[#703848] font-sans mt-2 leading-relaxed">
              {adviceText}
            </p>
          </div>

          {/* Core Cycle Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="bg-white rounded-2xl p-3 border border-[#fce7f3] text-center shadow-xs">
              <span className="text-[10px] text-[#703848] font-bold uppercase tracking-wider block">{t('cycleLengthLabel')}</span>
              <span className="text-base sm:text-lg font-black text-[#2d1527] block mt-1">{toLocalizedNumber(cycleLength, language)} {t('days')}</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#fce7f3] text-center shadow-xs">
              <span className="text-[10px] text-[#703848] font-bold uppercase tracking-wider block">{t('ovulationDay')}</span>
              <span className="text-base sm:text-lg font-black text-[#9333ea] block mt-1">{t('day')} {toLocalizedNumber(ovulationDay, language)}</span>
            </div>
          </div>

          {/* Secure interactive Week Calendar log selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold text-[#2d1527] block">
              {t('selectDatePrompt')}
            </label>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekDays.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const active = dateStr === selectedDate;
                const hasLogs = !!trackingLogs[dateStr];
                const dayNum = date.getDate();
                const dayName = date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    className={`flex flex-col items-center p-1 sm:p-2 rounded-xl transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-br from-[#e11d48] to-[#db2777] text-white shadow-md shadow-rose-200/80 ring-2 ring-[#fecdd3]'
                        : 'bg-white text-[#2d1527] hover:bg-[#fff0f5] border border-[#fce7f3]'
                    }`}
                  >
                    <span className="text-[8px] sm:text-[9px] block uppercase font-sans font-bold opacity-80 truncate max-w-full">{dayName}</span>
                    <span className="text-xs sm:text-sm font-sans font-black mt-0.5 sm:mt-1">{toLocalizedNumber(dayNum, language)}</span>
                    {hasLogs && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${active ? 'bg-white' : 'bg-rose-500'}`} />
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

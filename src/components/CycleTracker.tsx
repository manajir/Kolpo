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
    statusColor = 'text-[#894f42] bg-[#fff0f0] border-[#fde2e1]';
    adviceText = language === 'bn'
      ? 'তলপেটে সেঁক দিন এবং কুসুম গরম আদা চা খান। শরীরে আয়রনের মাত্রা বাড়াতে লাল ডিম, দুধ বেশি নিন।'
      : 'Apply a heating pad to lower abdomen and drink warm ginger tea. Eat iron-rich foods to replenish energy.';
  } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
    statusText = t('fertileWindow');
    statusColor = 'text-[#45645e] bg-emerald-50 border-emerald-100';
    adviceText = language === 'bn'
      ? 'আপনি যদি গর্ভধারণ করতে চান তবে আগামী ৩-৪ দিন সবচেয়ে উর্বর এবং অনুকূল সময়। সুষম খাবার ও ভিটামিন ডি নিশ্চিত করুন।'
      : 'If you are trying to conceive, the next 3-4 days are your most fertile window. Ensure balanced meals and Vitamin D.';
  } else if (currentCycleDay === ovulationDay) {
    statusText = t('ovulationDay');
    statusColor = 'text-teal-700 bg-teal-50 border-teal-200';
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
    <div className="bg-[#fff9f8] rounded-3xl p-6 border border-[#ffe9e8] shadow-[0_8px_30px_rgba(137,79,66,0.03)] space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ffe9e8] pb-5">
        <div>
          <h2 className="font-sans font-bold text-xl text-[#261818] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#894f42] fill-[#894f42]" />
            {t('cycleTrackerTitle')}
          </h2>
          <p className="text-xs text-[#524340] font-mono mt-0.5">{t('cycleTrackerSubtitle')}</p>
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
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 bg-white rounded-full flex flex-col items-center justify-center border border-[#ffe9e8] text-center shadow-md p-2.5 sm:p-4">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">{t('cycleDay')}</span>
              <span className="text-3xl sm:text-4xl font-black text-[#894f42] font-sans my-0.5 sm:my-1">
                {toLocalizedNumber(currentCycleDay, language)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-[#261818] leading-tight px-1">
                {t('nextPeriod')}: <span className="text-[#894f42] block font-bold">{nextPeriodStr.split(',')[0]}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-sans mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#894f42]" />
              <span>{t('periodFlow')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#45645e]" />
              <span>{t('fertileWindow')}</span>
            </div>
          </div>
        </div>

        {/* Cycle indicators, recommendations */}
        <div className="col-span-1 md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#ffe9e8] shadow-sm">
            <h4 className="text-xs font-bold text-[#894f42] font-sans flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#894f42]" />
              {t('dailyTipTitle')}:
            </h4>
            <p className="text-xs text-[#524340] font-sans mt-2 leading-relaxed">
              {adviceText}
            </p>
          </div>

          {/* Core Cycle Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="bg-white rounded-2xl p-3 border border-[#ffe9e8] text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('cycleLengthLabel')}</span>
              <span className="text-base sm:text-lg font-black text-[#524340] block mt-1">{toLocalizedNumber(cycleLength, language)} {t('days')}</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#ffe9e8] text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('ovulationDay')}</span>
              <span className="text-base sm:text-lg font-black text-[#45645e] block mt-1">{t('day')} {toLocalizedNumber(ovulationDay, language)}</span>
            </div>
          </div>

          {/* Secure interactive Week Calendar log selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold text-[#261818] block">
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
                        ? 'bg-[#894f42] text-white shadow-md ring-2 ring-[#ffdad3]'
                        : 'bg-white text-[#261818] hover:bg-[#fff0f0] border border-[#ffe9e8]'
                    }`}
                  >
                    <span className="text-[8px] sm:text-[9px] block uppercase font-sans font-bold opacity-80 truncate max-w-full">{dayName}</span>
                    <span className="text-xs sm:text-sm font-sans font-black mt-0.5 sm:mt-1">{toLocalizedNumber(dayNum, language)}</span>
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

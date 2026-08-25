import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { TrackingLog } from '../types';
import { Save, Calendar, Thermometer, Weight, FileText, CheckCircle } from 'lucide-react';

const SYMPTOM_OPTIONS = [
  { value: 'তলপেটে ব্যথা', labelBn: 'তলপেটে ব্যথা (Cramps)', labelEn: 'Abdominal Cramps' },
  { value: 'কোমর ব্যথা', labelBn: 'কোমর ব্যথা (Backache)', labelEn: 'Backache' },
  { value: 'হট ফ্ল্যাশ', labelBn: 'হট ফ্ল্যাশ (Hot Flashes)', labelEn: 'Hot Flashes' },
  { value: 'ব্রেইন ফগ', labelBn: 'ব্রেইন ফগ (Brain Fog)', labelEn: 'Brain Fog' },
  { value: 'স্তনে সংবেদনশীলতা', labelBn: 'স্তনে সংবেদনশীলতা', labelEn: 'Breast Tenderness' },
  { value: 'মাথাব্যথা', labelBn: 'মাথাব্যথা (Headache)', labelEn: 'Headache' },
  { value: 'ব্রণ ও ত্বকের সমস্যা', labelBn: 'ব্রণ (Acne)', labelEn: 'Acne / Skin Breakouts' },
  { value: 'হাত-পা ফোলা', labelBn: 'হাত-পা ফোলা (Bloating)', labelEn: 'Bloating & Swelling' }
];

const MOOD_OPTIONS = [
  { value: 'খুশি', labelBn: 'খুশি 😊', labelEn: 'Happy 😊' },
  { value: 'শান্ত', labelBn: 'শান্ত 🧘', labelEn: 'Calm 🧘' },
  { value: 'খিটখিটে', labelBn: 'খিটখিটে মেজাজ 😠', labelEn: 'Irritable 😠' },
  { value: 'উদ্বেগ', labelBn: 'উদ্বেগ 😰', labelEn: 'Anxious 😰' },
  { value: 'ক্লান্ত', labelBn: 'ক্লান্ত 😴', labelEn: 'Fatigued 😴' },
  { value: 'বিষন্ন', labelBn: 'বিষন্ন 😢', labelEn: 'Sad 😢' }
];

interface SymptomLogProps {
  selectedDate: string;
  onClose?: () => void;
}

export const SymptomLog: React.FC<SymptomLogProps> = ({ selectedDate, onClose }) => {
  const { trackingLogs, addTrackingLog, triggerSimulationNotification, language, t } = useAppState();
  
  const [bleeding, setBleeding] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  const [mucus, setMucus] = useState<string>('dry');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [weight, setWeight] = useState<string>('');
  const [temp, setTemp] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [isSaved, setIsSaved] = useState(false);

  // Load existing log for date if available
  useEffect(() => {
    const existing = trackingLogs[selectedDate];
    if (existing) {
      setBleeding(existing.periodBleeding || 'none');
      setMucus(existing.cervicalMucus || 'dry');
      setSelectedSymptoms(existing.symptoms || []);
      setSelectedMoods(existing.moods || []);
      setEnergy(existing.energyLevel || 'medium');
      setWeight(existing.weight ? existing.weight.toString() : '');
      setTemp(existing.temperature ? existing.temperature.toString() : '');
      setNotes(existing.notes || '');
    } else {
      setBleeding('none');
      setMucus('dry');
      setSelectedSymptoms([]);
      setSelectedMoods([]);
      setEnergy('medium');
      setWeight('');
      setTemp('');
      setNotes('');
    }
    setIsSaved(false);
  }, [selectedDate, trackingLogs]);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const toggleMood = (m: string) => {
    setSelectedMoods(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    
    await addTrackingLog(selectedDate, {
      logDate: selectedDate,
      periodBleeding: bleeding,
      cervicalMucus: mucus as any,
      symptoms: selectedSymptoms,
      moods: selectedMoods,
      energyLevel: energy,
      weight: weight ? parseFloat(weight) : undefined,
      temperature: temp ? parseFloat(temp) : undefined,
      notes
    });

    triggerSimulationNotification(
      language === 'en' ? 'Symptom Log Saved 🌸' : 'উপসর্গ সংরক্ষণ সম্পন্ন 🌸',
      language === 'en' 
        ? `Health log for ${selectedDate} has been successfully recorded.` 
        : `${selectedDate} তারিখের পিরিয়ড ও স্বাস্থ্য লগ সফলভাবে সংরক্ষিত হয়েছে।`
    );

    setTimeout(() => {
      setIsSaved(false);
      if (onClose) onClose();
    }, 1200);
  };

  const isEn = language === 'en';

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#fce7f3] shadow-[0_12px_44px_rgba(225,29,72,0.06)] animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-[#fce7f3] mb-5">
        <div>
          <h3 className="font-sans font-bold text-lg text-[#2d1527] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#e11d48]" />
            {isEn ? 'Daily Health & Symptom Log' : 'দৈনিক স্বাস্থ্য লগ'}
          </h3>
          <p className="text-xs text-[#703848] font-mono mt-0.5">{isEn ? `Date: ${selectedDate}` : `তারিখ: ${selectedDate}`}</p>
        </div>
        {isSaved && (
          <span className="flex items-center gap-1 text-emerald-600 font-sans text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <CheckCircle className="w-4 h-4 animate-bounce" />
            {isEn ? 'Saved!' : 'সেভ হয়েছে!'}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Period bleeding controller */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#2d1527] mb-2.5">
            {t('bleedingFlow')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'none', label: isEn ? 'None' : 'নেই', sub: isEn ? 'None' : 'হবে না' },
              { value: 'light', label: isEn ? 'Light' : 'হালকা', sub: 'Light' },
              { value: 'medium', label: isEn ? 'Medium' : 'মাঝারি', sub: 'Medium' },
              { value: 'heavy', label: isEn ? 'Heavy' : 'অতিরিক্ত', sub: 'Heavy' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBleeding(opt.value as any)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border transition-all cursor-pointer ${
                  bleeding === opt.value
                    ? 'border-[#e11d48] bg-[#fff0f5] text-[#be185d] font-semibold ring-1 ring-[#e11d48]'
                    : 'border-[#fce7f3] hover:bg-[#fff9fa] text-[#703848]'
                }`}
              >
                <span className="text-xs font-bold font-sans">{opt.label}</span>
                <span className="text-[9px] text-[#8b5e72] mt-0.5 uppercase tracking-wider font-mono">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cervical mucus indicator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-sans font-bold text-[#2d1527]">
              {t('cervicalMucusTitle')}
            </label>
            <span className="text-[10px] text-[#703848] font-sans">
              {isEn ? 'Fertility Indicator' : 'ওভুলেশন চেনার সূচক'}
            </span>
          </div>
          <select
            value={mucus}
            onChange={(e) => setMucus(e.target.value)}
            className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
          >
            <option value="dry">
              {isEn ? 'Dry / Sticky - Infertile Phase' : 'শুকনো ও আঠালো (Dry/Sticky) - অনুর্বর উইন্ডো'}
            </option>
            <option value="creamy">
              {isEn ? 'Creamy White - Low Fertility' : 'ক্রিমি হোয়াইট (Creamy) - কম উর্বর'}
            </option>
            <option value="watery">
              {isEn ? 'Watery Clear - Approaching Ovulation' : 'স্বচ্ছ তরল পানি (Watery) - উর্বর উইন্ডো কাছে'}
            </option>
            <option value="raw-egg-white">
              {isEn ? 'Egg-White Slippery - Peak Fertile Ovulation Day!' : 'ডিমের সাদা অংশের মতো পিছলা (Egg-white) - সর্বাধিক উর্বর দিন!'}
            </option>
          </select>
        </div>

        {/* Symptoms selection Chips */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#2d1527] mb-2.5">
            {t('symptomsListTitle')}
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((opt) => {
              const active = selectedSymptoms.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleSymptom(opt.value)}
                  className={`text-xs px-3 py-2 rounded-xl border font-sans transition-all active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#e11d48] to-[#db2777] text-white border-[#e11d48] font-medium shadow-[0_3px_10px_rgba(225,29,72,0.2)]'
                      : 'bg-[#fff0f5] text-[#be185d] hover:bg-[#ffe4e9] border-[#fce7f3]'
                  }`}
                >
                  {isEn ? opt.labelEn : opt.labelBn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood selection Chips */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#2d1527] mb-2.5">
            {t('moodsListTitle')}
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const active = selectedMoods.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleMood(opt.value)}
                  className={`text-xs px-3 py-2 rounded-xl border font-sans transition-all active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#9333ea] to-[#c026d3] text-white border-[#9333ea] font-medium shadow-[0_3px_10px_rgba(147,51,234,0.2)]'
                      : 'bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]'
                  }`}
                >
                  {isEn ? opt.labelEn : opt.labelBn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy levels selector */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#2d1527] mb-2.5">
            {t('energyLevelTitle')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'high', label: t('energyHigh') },
              { value: 'medium', label: t('energyMedium') },
              { value: 'low', label: t('energyLow') }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value as any)}
                className={`py-2 rounded-xl text-xs border font-sans font-medium transition-all cursor-pointer ${
                  energy === opt.value
                    ? 'border-[#e11d48] bg-[#fff0f5] text-[#be185d] font-semibold ring-1 ring-[#e11d48]'
                    : 'border-[#fce7f3] hover:bg-[#fff9fa] text-[#703848]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vital stats: weight, temperature */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#2d1527] mb-1.5">
              <Thermometer className="w-4 h-4 text-rose-500" />
              {t('tempF')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-3 pr-8 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400 font-mono">°F</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#2d1527] mb-1.5">
              <Weight className="w-4 h-4 text-pink-500" />
              {t('weightKg')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="55.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl pl-3 pr-8 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400 font-mono">Kg</span>
            </div>
          </div>
        </div>

        {/* Daily diary notepad */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#2d1527] mb-1.5">
            <FileText className="w-4 h-4 text-purple-500" />
            {isEn ? 'Daily Notes & Journal' : 'দৈনিক নোট/বিশেষ চিন্তা'}
          </label>
          <textarea
            rows={2}
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48] resize-none"
          />
        </div>

        {/* Buttons submission */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-sans font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-200/80"
        >
          <Save className="w-4 h-4" />
          {t('saveLogButton')}
        </button>

      </form>
    </div>
  );
};


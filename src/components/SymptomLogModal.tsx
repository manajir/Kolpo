import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { TrackingLog } from '../types';
import { Save, Calendar, HelpCircle, Thermometer, Weight, FileText, CheckCircle } from 'lucide-react';

const SYMPTOM_OPTIONS = [
  { value: 'তলপেটে ব্যথা', label: 'তলপেটে ব্যথা (Cramps)' },
  { value: 'কোমর ব্যথা', label: 'কোমর ব্যথা (Backache)' },
  { value: 'হট ফ্ল্যাশ', label: 'হট ফ্ল্যাশ (Hot Flashes)' },
  { value: 'ব্রেইন ফগ', label: 'ব্রেইন ফগ (Brain Fog)' },
  { value: 'স্তনে সংবেদনশীলতা', label: 'স্তনে সংবেদনশীলতা' },
  { value: 'মাথাব্যথা', label: 'মাথাব্যথা (Headache)' },
  { value: 'ব্রণ ও ত্বকের সমস্যা', label: 'ব্রণ (Acne)' },
  { value: 'হাত-পা ফোলা', label: 'হাত-পা ফোলা (Bloating)' }
];

const MOOD_OPTIONS = [
  { value: 'খুশি', label: 'খুশি 😊' },
  { value: 'শান্ত', label: 'শান্ত 🧘' },
  { value: 'খিটখিটে', label: 'খিটখিটে মেজাজ 😠' },
  { value: 'উদ্বেগ', label: 'উদ্বেগ 😰' },
  { value: 'ক্লান্ত', label: 'ক্লান্ত 😴' },
  { value: 'বিষন্ন', label: 'বিষন্ন 😢' }
];

interface SymptomLogProps {
  selectedDate: string;
  onClose?: () => void;
}

export const SymptomLog: React.FC<SymptomLogProps> = ({ selectedDate, onClose }) => {
  const { trackingLogs, addTrackingLog, triggerSimulationNotification } = useAppState();
  
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
      // Clear to defaults
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
      'উপসর্গ সংরক্ষণ সম্পন্ন 🌸',
      `${selectedDate} তারিখের পিরিয়ড ও স্বাস্থ্য লগ সফলভাবে সংরক্ষিত হয়েছে।`
    );

    setTimeout(() => {
      setIsSaved(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#ffe9e8] shadow-[0_12px_44px_rgba(137,79,66,0.06)] animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-[#fff0f0] mb-5">
        <div>
          <h3 className="font-sans font-bold text-lg text-[#261818] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#894f42]" />
            দৈনিক স্বাস্থ্য লগ
          </h3>
          <p className="text-xs text-[#524340] font-mono mt-0.5">তারিখ: {selectedDate}</p>
        </div>
        {isSaved && (
          <span className="flex items-center gap-1 text-emerald-600 font-sans text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <CheckCircle className="w-4 h-4 animate-bounce" />
            সেভ হয়েছে!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Period bleeding controller */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#261818] mb-2.5">
            পিরিয়ডের রক্তস্রাব পরিমাণ
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'none', label: 'হবে না', bangla: 'নেই' },
              { value: 'light', label: 'Light', bangla: 'হালকা' },
              { value: 'medium', label: 'Medium', bangla: 'স্বাভাবিক' },
              { value: 'heavy', label: 'Heavy', bangla: 'অতিরিক্ত' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBleeding(opt.value as any)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border transition-all ${
                  bleeding === opt.value
                    ? 'border-[#894f42] bg-[#fff0f0] text-[#894f42] font-semibold ring-1 ring-[#894f42]'
                    : 'border-[#ffe9e8] hover:bg-[#fff9f8] text-[#524340]'
                }`}
              >
                <span className="text-xs font-bold font-sans">{opt.bangla}</span>
                <span className="text-[9px] text-[#85736f] mt-0.5 uppercase tracking-wider font-mono">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cervical mucus indicator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-sans font-bold text-[#261818]" title="গর্ভধারণ উইন্ডো চেনার প্রধান ভেষজ লক্ষণ">
              সার্ভিকাল মিউকাস তরলতা (নির্ণয় গাইড)
            </label>
            <span className="text-[10px] text-[#524340] font-sans">ওভুলেশন চেনার সূচক</span>
          </div>
          <select
            value={mucus}
            onChange={(e) => setMucus(e.target.value)}
            className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none focus:ring-1 focus:ring-[#894f42]"
          >
            <option value="dry">শুকনো ও আঠালো (Dry/Sticky) - অনুর্বর উইন্ডো</option>
            <option value="creamy">ক্রিমি হোয়াইট (Creamy) - কম উর্বর</option>
            <option value="watery">স্বচ্ছ তরল পানি (Watery) - উর্বর উইন্ডো কাছে</option>
            <option value="raw-egg-white">ডিমের সাদা অংশের মতো পিছলা (Egg-white) - সর্বাধিক উর্বর দিন!</option>
          </select>
        </div>

        {/* Symptoms selection Chips */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#261818] mb-2.5">
            শারীরিক উপসর্গসমূহ (Symptom Chips)
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
                      ? 'bg-[#894f42] text-white border-[#894f42] font-medium shadow-[0_3px_10px_rgba(137,79,66,0.15)]'
                      : 'bg-[#fff0f0] text-[#894f42] hover:bg-[#ffe9e8] border-[#fde2e1]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood selection Chips */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#261818] mb-2.5">
            মানসিক মেজাজ ও স্ট্রেস লেভেল (Moods)
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
                      ? 'bg-[#45645e] text-white border-[#45645e] font-medium shadow-[0_3px_10px_rgba(69,100,94,0.15)]'
                      : 'bg-[#fafefd] hover:bg-[#ebf8f5] text-[#45645e] border-[#c7eae1]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy levels selector */}
        <div>
          <label className="block text-xs font-sans font-bold text-[#261818] mb-2.5">
            শরীরের শক্তি ও এনার্জি লেভেল
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'high', label: 'উচ্চ (High)' },
              { value: 'medium', label: 'স্বাভাবিক (Normal)' },
              { value: 'low', label: 'ক্লান্ত (Low Energy)' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value as any)}
                className={`py-2 rounded-xl text-xs border font-sans font-medium transition-all ${
                  energy === opt.value
                    ? 'border-[#7e5541] bg-[#ffdbcc] text-[#301405] font-semibold'
                    : 'border-[#ffe9e8] hover:bg-[#fff9f8] text-[#524340]'
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
            <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#261818] mb-1.5">
              <Thermometer className="w-4 h-4 text-orange-500" />
              বডি টেম্পারেচার
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-3 pr-8 py-2 text-xs font-sans text-[#261818] focus:outline-none focus:ring-1 focus:ring-[#894f42]"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400 font-mono">°F</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#261818] mb-1.5">
              <Weight className="w-4 h-4 text-blue-500" />
              শরীর ওজন
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="55.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl pl-3 pr-8 py-2 text-xs font-sans text-[#261818] focus:outline-none focus:ring-1 focus:ring-[#894f42]"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] text-gray-400 font-mono">Kg</span>
            </div>
          </div>
        </div>

        {/* Daily diary notepad */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#261818] mb-1.5">
            <FileText className="w-4 h-4 text-purple-500" />
            দৈনিক নোট/পিপি চিন্তা
          </label>
          <textarea
            rows={2}
            placeholder="আজ কেমন বোধ করেছেন? ওষুধ গ্রহণ নাকি বিশেষ কোনো অভিজ্ঞতা..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans text-[#261818] focus:outline-none focus:ring-1 focus:ring-[#894f42] resize-none"
          />
        </div>

        {/* Buttons submission */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#894f42] to-[#7e5541] hover:brightness-110 text-white font-sans font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
        >
          <Save className="w-4 h-4" />
          আজকের লক্ষণ ও ডাটা সংরক্ষণ করুন
        </button>

      </form>
    </div>
  );
};

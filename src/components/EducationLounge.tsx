import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { CourseMaterial } from '../types';
import { toLocalizedNumber } from '../i18n';
import { Compass, BookOpen, Video, GraduationCap, Award, Lock, ChevronRight, Check } from 'lucide-react';

export const EducationLounge: React.FC = () => {
  const { articles, profile, upgradeSubscription, triggerSimulationNotification, language } = useAppState();
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Currently reading or playing item state
  const [activeItem, setActiveItem] = useState<CourseMaterial | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const handleOpenItem = (item: CourseMaterial) => {
    if (item.premiumOnly && !profile?.subActive) {
      setShowBillingModal(true);
    } else {
      setActiveItem(item);
    }
  };

  const handleUpgradeAction = async () => {
    await upgradeSubscription();
    setShowBillingModal(false);
    triggerSimulationNotification(
      isEn ? 'Subscription Activated!' : 'সাবস্ক্রিপশন সফল!',
      isEn 
        ? 'Thank you! You have successfully unlocked Kalpa Pro+ features.' 
        : 'ধন্যবাদ! আপনি সফলভাবে কল্প প্রো+ অল-রাউন্ডার ফিচারসমূহ অ্যাক্টিভেট করেছেন।'
    );
  };

  const filteredItems = articles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.bengaliTitle.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const getCategoryTag = (cat: string) => {
    if (isEn) {
      switch (cat) {
        case 'period': return 'Period Care';
        case 'pregnancy': return 'Pregnancy';
        case 'menopause': return 'Perimenopause';
        default: return 'Wellness';
      }
    }
    switch (cat) {
      case 'period': return 'পিরিয়ড কেয়ার';
      case 'pregnancy': return 'গর্ভাবস্থা';
      case 'menopause': return 'পেরিমেনোপজ';
      default: return 'সামগ্রিক সুস্থতা';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-[#fff0f5] via-[#fff5f8] to-[#fdf2f8] rounded-3xl p-6 border border-[#fce7f3] shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#e11d48] to-[#db2777] text-white p-3 rounded-2xl shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-[#2d1527]">
                {isEn ? 'Kalpa Health Education & Learning' : 'কল্প লার্নিং অ্যান্ড এডুকেশন কর্নার'}
              </h3>
              <p className="text-xs text-[#703848] font-sans">
                {isEn 
                  ? 'Comprehensive gynecological health articles, video lectures, and wellness courses.' 
                  : 'সীমাহীন তথ্যসমৃদ্ধ গাইনোকোলজিক্যাল অনুচ্ছেদ, শিক্ষণীয় ভিডিও লেকচার ও বিশেষ হেলথ কোর্সসমূহ'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!profile?.subActive && (
              <button
                onClick={() => setShowBillingModal(true)}
                className="bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-sans font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all shadow-md shadow-rose-200/80 cursor-pointer active:scale-95"
              >
                <Award className="w-4 h-4 fill-white" />
                {isEn ? 'Get Kalpa Pro+' : 'কল্প প্রো+ এ মেম্বারশিপ নিন'}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <input
            type="text"
            placeholder={isEn ? "Search articles, videos or courses..." : "আর্টিকেল, ভিডিও বা হেলথ কোর্স সার্চ করুন..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#fce7f3] rounded-2xl px-3.5 py-2 text-xs text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-[#fce7f3] rounded-2xl px-3 py-2 text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
          >
            <option value="all">{isEn ? 'All Categories' : 'সব ক্যাটাগরি (All Topics)'}</option>
            <option value="period">{isEn ? 'Period Care' : 'মাসিক ও পিরিয়ড কেয়ার (Period Care)'}</option>
            <option value="pregnancy">{isEn ? 'Pregnancy & Maternity' : 'গর্ভধারণ ও মেটারনিটি (Pregnancy/Lactation)'}</option>
            <option value="menopause">{isEn ? 'Perimenopause & Hormones' : 'পেরিমেনোপজ ও হরমোন (Menopause/Bio Hrt)'}</option>
            <option value="wellness">{isEn ? 'Wellness & Yoga' : 'শারীরিক ইয়োগা ও ধ্যান (Wellness)'}</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-[#fce7f3] rounded-2xl px-3 py-2 text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
          >
            <option value="all">{isEn ? 'All Formats' : 'সব ফরম্যাট (All resources)'}</option>
            <option value="article">{isEn ? 'Articles' : 'গবেষণাধর্মী অনুচ্ছেদ (Articles)'}</option>
            <option value="video">{isEn ? 'Video Tutorials' : 'ভিডিও লার্নিং (Videos)'}</option>
            <option value="course">{isEn ? 'Courses' : 'সবগুলো কোর্স লেকচার (Courses)'}</option>
          </select>
        </div>
      </div>

      {/* RENDER DETAILED ACTIVE READING OR PLAYING COMPONENT */}
      {activeItem && (
        <div className="bg-white border-2 border-[#fce7f3] rounded-3xl p-6 shadow-md space-y-4 animate-fade-in text-xs font-sans">
          
          <div className="flex justify-between items-center pb-3 border-b border-[#fce7f3]">
            <div>
              <span className="text-[10px] text-[#be185d] uppercase tracking-wider font-bold block bg-[#fff0f5] border border-[#fce7f3] px-2.5 py-0.5 rounded-full w-max">
                {getCategoryTag(activeItem.category)} • {activeItem.type.toUpperCase()}
              </span>
              <h4 className="font-sans font-bold text-base text-[#2d1527] mt-1">
                {isEn ? activeItem.title : activeItem.bengaliTitle}
              </h4>
            </div>
            
            <button
              onClick={() => setActiveItem(null)}
              className="text-[#703848] hover:text-[#2d1527] border border-[#fce7f3] hover:bg-[#fff0f5] rounded-xl px-3 py-1 bg-white cursor-pointer"
            >
              {isEn ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>

          {/* If video tutorial format */}
          {activeItem.type === 'video' && activeItem.videoUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#fce7f3] bg-black">
              <iframe
                title={activeItem.title}
                src={activeItem.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          )}

          {/* Detailed Course Syllabus layout */}
          {activeItem.type === 'course' && activeItem.lessons && (
            <div className="bg-[#fff9fa] p-4 rounded-2xl border border-[#fce7f3] mb-4">
              <p className="font-bold text-[#be185d] mb-2.5">
                {isEn ? 'Course Syllabus & Chapters:' : 'কোর্স কারিকুলাম ও অধ্যায়সমূহ:'}
              </p>
              <div className="space-y-2">
                {activeItem.lessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-[#fce7f3] px-4 py-2.5 rounded-xl text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#fff0f5] text-[#be185d] w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {toLocalizedNumber(idx + 1, language)}
                      </span>
                      <span className="font-semibold text-[#2d1527]">{lesson.title}</span>
                    </div>
                    <span className="text-[#703848] font-mono">{lesson.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Renders dynamic health library documents markup */}
          {activeItem.contentMarkup && (
            <div className="prose prose-sm max-w-none text-[#2d1527] font-sans leading-relaxed space-y-3 pt-2 text-[11px]">
              {activeItem.contentMarkup.split('\n\n').map((paragraph, i) => {
                if (paragraph.trim().startsWith('##')) {
                  return <h5 key={i} className="font-bold text-[#be185d] text-xs pt-2">{paragraph.replace(/##/g, '').trim()}</h5>;
                }
                if (paragraph.trim().startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1.5">
                      {paragraph.split('\n').map((li, j) => (
                        <li key={j} className="list-item">{li.replace(/-/g, '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{paragraph.trim()}</p>;
              })}
            </div>
          )}
        </div>
      )}

      {/* ITEMS LISTING GRID DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLocked = item.premiumOnly && !profile?.subActive;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenItem(item)}
              className="bg-white border border-[#fce7f3] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between hover:border-[#fbcfe8]"
            >
              <div>
                {/* Cover Image Header */}
                <div className="relative h-44 bg-[#fff0f5] overflow-hidden select-none">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all hover:scale-105 duration-500"
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#2d1527]/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center">
                      <Lock className="w-8 h-8 text-rose-300 mb-1" />
                      <span className="text-[11px] font-bold font-sans">
                        {isEn ? 'Locked (Pro+ Only)' : 'কল্প প্রো+ মেম্বারশিপ লক'}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-[#fce7f3] text-[#be185d] font-sans font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-sm">
                    {getCategoryTag(item.category)}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#703848] font-mono text-[9px] uppercase tracking-wider font-bold">
                    {item.type === 'video' ? <Video className="w-3.5 h-3.5 text-rose-500" /> : item.type === 'course' ? <GraduationCap className="w-3.5 h-3.5 text-pink-500" /> : <BookOpen className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{item.type} • {item.duration}</span>
                  </div>

                  <h4 className="font-sans font-bold text-[#2d1527] text-xs leading-snug line-clamp-2">
                    {isEn ? item.title : item.bengaliTitle}
                  </h4>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1.5 flex items-center justify-between border-t border-[#fce7f3] text-[10px]">
                <span className="text-[#703848] font-mono">ID: {item.id}</span>
                <span className="text-[#be185d] font-bold font-sans flex items-center gap-0.5">
                  {isLocked 
                    ? (isEn ? 'Unlock' : 'আনলক করুন') 
                    : (isEn ? 'Read / View' : 'বিস্তারিত দেখুন')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBSCRIPTION MANAGEMENT MODAL (Upgrading Free to Premium simulated billing) */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#fce7f3]" style={{ borderRadius: '24px', maxWidth: '440px', width: '100%' }}>
            
            {/* Header */}
            <div className="p-6 text-center border-b border-[#fce7f3] relative">
              <button 
                onClick={() => setShowBillingModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-800"
              >
                ✕
              </button>
              
              <div className="bg-gradient-to-br from-[#ffe4e6] to-[#fce7f3] text-[#be185d] p-3.5 rounded-2xl w-max mx-auto mb-3 flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8 fill-current text-[#e11d48] animate-spin-slow" />
              </div>
              <h3 className="font-sans font-bold text-lg text-[#2d1527]">
                {isEn ? 'Kalpa Pro+ Membership' : 'কল্প প্রো+ সাবস্ক্রিপশন'}
              </h3>
              <p className="text-xs text-[#703848] font-sans mt-1">
                {isEn ? 'Safe, confidential & unlimited women\'s health protection.' : 'নারীদের নিরাপদ, সীমাহীন দীর্ঘমেয়াদী পূর্ণাঙ্গ স্বাস্থ্য সুরক্ষা'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[11px] text-[#2d1527] font-sans font-semibold">
                {isEn ? 'Unlock premium expert features in one click:' : 'সীমাহীন বিশেষজ্ঞ সেবা ও ফিচারসমূহ এক ক্লিকে আনলক করুন:'}
              </p>
              
              <div className="space-y-2.5 text-[11px] font-sans">
                <div className="flex items-start gap-2 text-[#703848]">
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{isEn ? 'HD video tutorials and courses by 10+ gynecologists and wellness experts.' : '১০+ গাইনোকোলজিস্ট ও ইয়োগা টিউটরের ফুল এইচডি ভিডিও এবং লাইভ গাইড'}</span>
                </div>
                <div className="flex items-start gap-2 text-[#703848]">
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{isEn ? 'Encrypted cloud storage for prescription & ultrasound medical records.' : 'নিরাপদ ক্লাউড ডাটা ভল্ট (মেডিকেল প্রেসক্রিপশন ও আল্ট্রাসウンド ফাইল সংরক্ষণে সীমাহীন স্টোরেজ)'}</span>
                </div>
                <div className="flex items-start gap-2 text-[#703848]">
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{isEn ? 'Daily AI intelligent hormonal & mental wellness analysis.' : 'দৈনিক হরমোন পরিবর্তন ও মানসিক সুস্থতাবিষয়ক এআই ইন্টেলিজেন্ট এনালাইসিস'}</span>
                </div>
              </div>

              {/* Price card layout */}
              <div className="bg-[#fff9fa] border border-[#fce7f3] p-4 rounded-2xl text-center flex items-center justify-between">
                <div className="text-left font-sans">
                  <span className="text-[9px] text-[#703848] uppercase tracking-widest block font-bold">
                    {isEn ? 'Annual Special Offer' : 'বার্ষিক বিশেষ ছাড়'}
                  </span>
                  <span className="text-xl font-black text-[#e11d48] block mt-0.5">
                    {isEn ? '৳800 ' : '৮০০ ৳ '} 
                    <span className="text-xs font-normal text-[#703848]">{isEn ? '/ year' : '/ বছর'}</span>
                  </span>
                </div>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold font-sans px-2.5 py-0.5 rounded-full border border-rose-200">
                  {isEn ? 'Save 70%' : 'মেগা ৭০% ডিসকাউন্ট!'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="flex-1 border border-[#fce7f3] hover:bg-[#fff0f5] text-[#703848] font-bold font-sans py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {isEn ? 'Later' : 'পরে ভাববো'}
                </button>
                <button
                  onClick={handleUpgradeAction}
                  className="flex-1 bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-bold font-sans py-2.5 rounded-xl text-xs transition-all shadow-md shadow-rose-200/80 cursor-pointer"
                >
                  {isEn ? 'Join Pro+' : 'হ্যাঁ, প্রো+ যোগ হোন'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};


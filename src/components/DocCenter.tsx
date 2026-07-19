import React, { useState, useRef } from 'react';
import { useAppState } from '../AppContext';
import { FileText, Upload, Trash2, Calendar, ShieldAlert, Key, Clipboard, CheckCircle, FileUp } from 'lucide-react';

export const DocCenter: React.FC = () => {
  const { userFiles, clinicReports, uploadHealthFile, deleteHealthFile, generateClinicReport, deleteClinicReport, triggerSimulationNotification } = useAppState();

  // Generator states
  const [reportTitle, setReportTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 3600000 * 24).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorNotes, setDoctorNotes] = useState('');
  
  // Clinician verify portal states - allows clinicians to enter code on screen to search and view the reports
  const [clinicianCode, setClinicianCode] = useState('');
  const [certifiedReport, setCertifiedReport] = useState<any | null>(null);

  // File upload state
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateClinicReport(reportTitle, startDate, endDate, doctorNotes);
    setReportTitle('');
    setDoctorNotes('');
  };

  const handleVerifyClinicCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicianCode.trim()) return;

    const matched = clinicReports.find(r => r.clinicianAccessCode === clinicianCode.trim());
    if (matched) {
      setCertifiedReport(matched);
      triggerSimulationNotification('ডাক্তার অ্যাক্সেস ভেরিফায়েড', `কোড: ${clinicianCode} সফলভাবে যাচাইকৃত হয়েছে।`);
    } else {
      setCertifiedReport(null);
      alert('দুঃখিত, এই শেয়ারিং অ্যাক্সেস কোডটি সঠিক নয়। অনুগ্রহ করে আপনার ৬-ডিজিটের সচল অ্যাক্সেস কোডটি পুনরায় প্রদান করুন।');
    }
  };

  // Secure File handlers
  const handleFileUploadSimulated = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const freshFile = e.target.files?.[0];
    if (!freshFile) return;

    // Simulate high-security upload URL
    const simulatedUrl = URL.createObjectURL(freshFile);
    await uploadHealthFile(freshFile.name, freshFile.type, simulatedUrl, freshFile.size);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const simulatedUrl = URL.createObjectURL(droppedFile);
      await uploadHealthFile(droppedFile.name, droppedFile.type, simulatedUrl, droppedFile.size);
    }
  };

  // Convert bytes size to readable KB/MB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* COLUMN 1: CLINICIAN EXPORTS & REPORTS */}
      <div className="col-span-1 lg:col-span-8 space-y-6">
        
        {/* Reports Generator Forms */}
        <div className="bg-white border border-[#ffe9e8] rounded-3xl p-6 shadow-sm">
          <div className="pb-4 border-b border-[#fff0f0] mb-5">
            <h3 className="font-sans font-bold text-base text-[#261818] flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-[#894f42]" />
              হিসাবকাল ও ক্লিনিক্যাল রিপোর্ট জেনারেটর
            </h3>
            <p className="text-xs text-[#524340] font-sans mt-0.5">গাইনোকোলজিস্ট ও চিকিৎসকদের দেখানোর জন্য সিকিউরড হরমোনের সারাংশ ফাইল</p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block text-gray-700 font-bold mb-1">রিপোর্ট শিরোনাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: ডঃ রাবেয়ার ভিজিট রিপোর্ট"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">শুরু তারিখ:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">শেষ তারিখ:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-sans text-gray-700 mb-1">ডাক্তারকে জানানোর অতিরিক্ত বার্তা:</label>
              <textarea
                rows={2}
                placeholder="যেকোনো গুরুতর ব্যথা বা ওষুধের বিবরণ যা ডাক্তারকে আগেই অবহিত করতে চান..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full bg-[#fffcfc] border border-[#ffe9e8] rounded-xl px-3 py-2 text-xs font-sans focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-[#894f42] hover:bg-[#753f33] text-white font-sans font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              রিপোর্ট কম্পাইল ও ৬-ডিজিট পিন তৈরি করুন
            </button>
          </form>
        </div>

        {/* Existing reports lists with access code */}
        <div className="bg-white border border-[#ffe9e8] rounded-3xl p-6 shadow-sm">
          <h4 className="font-sans font-bold text-sm text-[#261818] border-b border-[#fff0f0] pb-3 mb-4">
            আপনার প্রস্তুতকৃত ক্লিনিক্যাল রিপোর্ট এবং সিকিউরিটি পিনসমূহ:
          </h4>

          {clinicReports.length === 0 ? (
            <p className="text-xs text-gray-400 font-sans py-6 text-center">এখনো কোনো শেয়ারিং রিপোর্ট তৈরি করা হয়নি। প্রয়োজনীয় সময়ে ডাক্তারদের সাথে শেয়ার করতে ওপরে রিপোর্ট জেনারেট করুন।</p>
          ) : (
            <div className="space-y-4">
              {clinicReports.map((rep) => (
                <div key={rep.reportId} className="bg-[#fff9f8] border border-[#ffe9e8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-[#894f42] text-sm">{rep.title}</p>
                    <p className="text-gray-500 text-[11px]">মেয়াদ: {rep.startDate} থেকে {rep.endDate}</p>
                    <p className="text-[#524340] leading-relaxed text-[11px] bg-white border border-[#ffe9e8] p-2 rounded-xl mt-1.5">{rep.symptomsSummary}</p>
                    <p className="text-[#261818] font-semibold text-[10px] italic">বার্তা: "{rep.additionalDoctorNotes}"</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div className="bg-[#ebf8f5] border border-teal-200 rounded-xl px-4 py-2 text-center">
                      <span className="text-[9px] text-[#4b6a63] uppercase tracking-wider block font-bold">সিকিউর ডাক্তার পিন</span>
                      <span className="text-xl font-black text-[#45645e] font-mono tracking-widest">{rep.clinicianAccessCode}</span>
                    </div>

                    <button
                      onClick={() => deleteClinicReport(rep.reportId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-xl transition-all cursor-pointer"
                      title="রিপোর্ট ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: SECURE FILE VAULT + CLINICIAN VERIFICATION PANEL */}
      <div className="col-span-1 lg:col-span-4 space-y-6">
        
        {/* Clinician code validation demo block */}
        <div className="bg-[#45645e] text-white rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-300" />
            <h4 className="text-xs font-bold font-sans">ক্লিনিশিয়ান/ডাক্তার অ্যাক্সেস পোর্টাল</h4>
          </div>
          <p className="text-[11px] text-teal-100 leading-relaxed font-sans">
            ডাক্তার সাহেব তার চেম্বারে বসে আপনার এই ৬-ডিজিটের পিন কোডটি কল্প ডক্টর পোর্টালে লিখলেই আপনার সমস্ত মেডিকেল হিস্ট্রি সিকিউরলি দেখতে পারবেন। নিচের ডেমো বক্সে কোড লিখে টেস্ট করুন:
          </p>

          <form onSubmit={handleVerifyClinicCode} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="৬-ডিজিট কোড লিখুন..."
                value={clinicianCode}
                onChange={(e) => setClinicianCode(e.target.value)}
                className="flex-1 bg-white/10 border border-teal-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-teal-200 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-[#45645e] font-bold text-xs px-4 py-1.5 rounded-xl hover:bg-teal-50 transition-all cursor-pointer shadow-md shrink-0"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </form>

          {certifiedReport && (
            <div className="bg-white text-gray-800 rounded-2xl p-3.5 space-y-2 text-[11px] animate-fade-in font-sans">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <span className="font-bold text-[#894f42]">যাচাইকৃত ডক্টর রিপোর্ট</span>
                <span className="text-[10px] text-gray-400 font-mono">ভেরিফাইড ✔️</span>
              </div>
              <p className="font-bold text-gray-900 leading-none">{certifiedReport.title}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{certifiedReport.stageSummary}</p>
              <p className="text-gray-700 bg-gray-50 border border-gray-200 p-1.5 rounded mt-1">{certifiedReport.symptomsSummary}</p>
            </div>
          )}
        </div>

        {/* Secure Document Vault File Manager */}
        <div className="bg-white border border-[#ffe9e8] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#fff0f0]">
            <FileUp className="w-5 h-5 text-[#894f42]" />
            <div>
              <h4 className="text-xs font-bold text-[#261818] font-sans">মেডিকেল প্রেসক্রিপশন ও স্ক্যান ফাইল ভল্ট</h4>
              <p className="text-[10px] text-gray-400 font-sans">সম্পূর্ণ অ্যান্ড-টু-অ্যান্ড সিকিউরড ক্লাউড</p>
            </div>
          </div>

          {/* Secure Drag and Drop file Uploader Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
              dragging
                ? 'border-[#894f42] bg-[#fff0f0]'
                : 'border-[#ffe9e8] hover:border-[#894f42] hover:bg-[#fffcfc]'
            }`}
          >
            <Upload className="w-8 h-8 text-[#894f42] mb-2 animate-bounce-slow" />
            <span className="text-xs font-semibold text-[#894f42] font-sans"> প্রেসক্রিপশন বা আল্ট্রাসাউন্ড ফাইল ড্রাগ করে বা ক্লিক করে সিলেক্ট করুন</span>
            <p className="text-[9px] text-gray-400 font-mono mt-1">PDF, PNG, JPG (সর্বোচ্চ ৩ মেগাবাইট)</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUploadSimulated}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
            />
          </div>

          {/* Uploaded File list */}
          <div className="space-y-2 font-sans text-xs">
            {userFiles.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-4">কোনো আপলোডকৃত মেডিকেল ডকুমেন্ট নেই</p>
            ) : (
              userFiles.map((file) => (
                <div key={file.fileId} className="bg-[#fff9f8] border border-[#ffe9e8] p-2.5 rounded-xl flex items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-[#894f42] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 text-[11px] truncate" title={file.fileName}>{file.fileName}</p>
                      <span className="text-[9px] text-[#524340] font-mono">{formatBytes(file.sizeBytes)} • {file.fileType.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#45645e] hover:underline font-bold text-[10px]"
                    >
                      দেখুন
                    </a>
                    
                    <button
                      onClick={() => deleteHealthFile(file.fileId)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-all cursor-pointer"
                      title="ফাইল মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

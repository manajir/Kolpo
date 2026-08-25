import React, { useState, useRef } from 'react';
import { useAppState } from '../AppContext';
import { FileText, Upload, Trash2, Calendar, Key, FileUp } from 'lucide-react';

export const DocCenter: React.FC = () => {
  const { 
    userFiles, 
    clinicReports, 
    uploadHealthFile, 
    deleteHealthFile, 
    generateClinicReport, 
    deleteClinicReport, 
    triggerSimulationNotification, 
    language, 
    t 
  } = useAppState();

  const isEn = language === 'en';

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
      triggerSimulationNotification(
        isEn ? 'Clinician Access Verified' : 'ডাক্তার অ্যাক্সেস ভেরিফায়েড', 
        isEn ? `Access Code: ${clinicianCode} verified successfully.` : `কোড: ${clinicianCode} সফলভাবে যাচাইকৃত হয়েছে।`
      );
    } else {
      setCertifiedReport(null);
      alert(
        isEn 
          ? 'Sorry, this sharing access code is invalid. Please double-check your 6-digit active access code.' 
          : 'দুঃখিত, এই শেয়ারিং অ্যাক্সেস কোডটি সঠিক নয়। অনুগ্রহ করে আপনার ৬-ডিজিটের সচল অ্যাক্সেস কোডটি পুনরায় প্রদান করুন।'
      );
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* COLUMN 1: CLINICIAN EXPORTS & REPORTS */}
      <div className="col-span-1 lg:col-span-8 space-y-6">
        
        {/* Reports Generator Forms */}
        <div className="bg-white border border-[#fce7f3] rounded-3xl p-6 shadow-sm">
          <div className="pb-4 border-b border-[#fce7f3] mb-5">
            <h3 className="font-sans font-bold text-base text-[#2d1527] flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-[#e11d48]" />
              {t('generateReportTitle')}
            </h3>
            <p className="text-xs text-[#703848] font-sans mt-0.5">
              {isEn ? 'Secured health summary report for gynecologists and physicians' : 'গাইনোকোলজিস্ট ও চিকিৎসকদের দেখানোর জন্য সিকিউরড হরমোনের সারাংশ ফাইল'}
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[#2d1527] font-bold mb-1">
                  {isEn ? 'Report Title:' : 'রিপোর্ট শিরোনাম:'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? "e.g., Dr. Rabeya's Visit Summary" : "যেমন: ডঃ রাবেয়ার ভিজিট রিপোর্ট"}
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2d1527] font-bold mb-1">
                  {t('reportStartDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2d1527] font-bold mb-1">
                  {t('reportEndDate')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-sans text-[#2d1527] mb-1">
                {t('doctorNotes')}
              </label>
              <textarea
                rows={2}
                placeholder={isEn ? "Any severe pain, symptoms or medication details you want to inform doctor in advance..." : "যেকোনো গুরুতর ব্যথা বা ওষুধের বিবরণ যা ডাক্তারকে আগেই অবহিত করতে চান..."}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48] resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-200/80"
            >
              {isEn ? 'Compile Report & Generate 6-Digit PIN' : 'রিপোর্ট কম্পাইল ও ৬-ডিজিট পিন তৈরি করুন'}
            </button>
          </form>
        </div>

        {/* Existing reports lists with access code */}
        <div className="bg-white border border-[#fce7f3] rounded-3xl p-6 shadow-sm">
          <h4 className="font-sans font-bold text-sm text-[#2d1527] border-b border-[#fce7f3] pb-3 mb-4">
            {isEn ? 'Your Prepared Clinical Reports & Security PINs:' : 'আপনার প্রস্তুতকৃত ক্লিনিক্যাল রিপোর্ট এবং সিকিউরিটি পিনসমূহ:'}
          </h4>

          {clinicReports.length === 0 ? (
            <p className="text-xs text-[#703848] font-sans py-6 text-center">
              {isEn 
                ? 'No sharing reports generated yet. Use the report generator above to create summary reports for doctor visits.' 
                : 'এখনো কোনো শেয়ারিং রিপোর্ট তৈরি করা হয়নি। প্রয়োজনীয় সময়ে ডাক্তারদের সাথে শেয়ার করতে ওপরে রিপোর্ট জেনারেট করুন।'}
            </p>
          ) : (
            <div className="space-y-4">
              {clinicReports.map((rep) => (
                <div key={rep.reportId} className="bg-[#fff9fa] border border-[#fce7f3] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-[#be185d] text-sm">{rep.title}</p>
                    <p className="text-[#703848] text-[11px]">
                      {isEn ? `Period: ${rep.startDate} to ${rep.endDate}` : `মেয়াদ: ${rep.startDate} থেকে ${rep.endDate}`}
                    </p>
                    <p className="text-[#2d1527] leading-relaxed text-[11px] bg-white border border-[#fce7f3] p-2 rounded-xl mt-1.5">{rep.symptomsSummary}</p>
                    <p className="text-[#703848] font-semibold text-[10px] italic">
                      {isEn ? `Notes: "${rep.additionalDoctorNotes}"` : `বার্তা: "${rep.additionalDoctorNotes}"`}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div className="bg-[#fff0f5] border border-[#fbcfe8] rounded-xl px-4 py-2 text-center">
                      <span className="text-[9px] text-[#be185d] uppercase tracking-wider block font-bold">
                        {isEn ? 'Doctor PIN' : 'সিকিউর ডাক্তার পিন'}
                      </span>
                      <span className="text-xl font-black text-[#e11d48] font-mono tracking-widest">{rep.clinicianAccessCode}</span>
                    </div>

                    <button
                      onClick={() => deleteClinicReport(rep.reportId)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2.5 rounded-xl transition-all cursor-pointer"
                      title={isEn ? 'Delete report' : 'রিপোর্ট ডিলিট করুন'}
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
        <div className="bg-gradient-to-br from-[#831843] via-[#9d174d] to-[#be185d] text-white rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-rose-200" />
            <h4 className="text-xs font-bold font-sans">
              {isEn ? 'Clinician / Doctor Access Portal' : 'ক্লিনিশিয়ান/ডাক্তার অ্যাক্সেস পোর্টাল'}
            </h4>
          </div>
          <p className="text-[11px] text-rose-100 leading-relaxed font-sans">
            {isEn 
              ? 'When your doctor inputs your 6-digit access PIN in the Kalpa Doctor Portal, they can securely view your health history. Test with your code below:' 
              : 'ডাক্তার সাহেব তার চেম্বারে বসে আপনার এই ৬-ডিজিটের পিন কোডটি কল্প ডক্টর পোর্টালে লিখলেই আপনার সমস্ত মেডিকেল হিস্ট্রি সিকিউরলি দেখতে পারবেন। নিচের ডেমো বক্সে কোড লিখে টেস্ট করুন:'}
          </p>

          <form onSubmit={handleVerifyClinicCode} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isEn ? 'Enter 6-digit PIN...' : '৬-ডিজিট কোড লিখুন...'}
                value={clinicianCode}
                onChange={(e) => setClinicianCode(e.target.value)}
                className="flex-1 bg-white/10 border border-rose-300 rounded-xl px-3 py-1.5 text-xs text-white placeholder-rose-200 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-[#be185d] font-bold text-xs px-4 py-1.5 rounded-xl hover:bg-rose-50 transition-all cursor-pointer shadow-md shrink-0"
              >
                {isEn ? 'Verify' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </form>

          {certifiedReport && (
            <div className="bg-white text-gray-800 rounded-2xl p-3.5 space-y-2 text-[11px] animate-fade-in font-sans">
              <div className="flex items-center justify-between pb-1 border-b border-rose-100">
                <span className="font-bold text-[#be185d]">
                  {isEn ? 'Verified Doctor Report' : 'যাচাইকৃত ডক্টর রিপোর্ট'}
                </span>
                <span className="text-[10px] text-rose-600 font-mono font-bold">
                  {isEn ? 'Verified ✔️' : 'ভেরিফাইড ✔️'}
                </span>
              </div>
              <p className="font-bold text-[#2d1527] leading-none">{certifiedReport.title}</p>
              <p className="text-[#703848] text-[10px] mt-0.5">{certifiedReport.stageSummary}</p>
              <p className="text-[#2d1527] bg-[#fff0f5] border border-[#fce7f3] p-1.5 rounded mt-1">{certifiedReport.symptomsSummary}</p>
            </div>
          )}
        </div>

        {/* Secure Document Vault File Manager */}
        <div className="bg-white border border-[#fce7f3] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#fce7f3]">
            <FileUp className="w-5 h-5 text-[#e11d48]" />
            <div>
              <h4 className="text-xs font-bold text-[#2d1527] font-sans">
                {t('docTitle')}
              </h4>
              <p className="text-[10px] text-[#703848] font-sans">
                {isEn ? 'End-to-end encrypted secure cloud' : 'সম্পূর্ণ অ্যান্ড-টু-অ্যান্ড সিকিউরড ক্লাউড'}
              </p>
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
                ? 'border-[#e11d48] bg-[#fff0f5]'
                : 'border-[#fce7f3] hover:border-[#e11d48] hover:bg-[#fff9fa]'
            }`}
          >
            <Upload className="w-8 h-8 text-[#e11d48] mb-2 animate-bounce-slow" />
            <span className="text-xs font-semibold text-[#be185d] font-sans">
              {isEn ? 'Drag & drop prescription or ultrasound file or click to select' : 'প্রেসক্রিপশন বা আল্ট্রাসাউন্ড ফাইল ড্রাগ করে বা ক্লিক করে সিলেক্ট করুন'}
            </span>
            <p className="text-[9px] text-[#703848] font-mono mt-1">
              {isEn ? 'PDF, PNG, JPG (Max 3MB)' : 'PDF, PNG, JPG (সর্বোচ্চ ৩ মেগাবাইট)'}
            </p>
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
              <p className="text-[10px] text-[#703848] text-center py-4">
                {t('noFilesFound')}
              </p>
            ) : (
              userFiles.map((file) => (
                <div key={file.fileId} className="bg-[#fff9fa] border border-[#fce7f3] p-2.5 rounded-xl flex items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-[#e11d48] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-[#2d1527] text-[11px] truncate" title={file.fileName}>{file.fileName}</p>
                      <span className="text-[9px] text-[#703848] font-mono">{formatBytes(file.sizeBytes)} • {file.fileType.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#be185d] hover:underline font-bold text-[10px]"
                    >
                      {isEn ? 'View' : 'দেখুন'}
                    </a>
                    
                    <button
                      onClick={() => deleteHealthFile(file.fileId)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded transition-all cursor-pointer"
                      title={isEn ? 'Delete file' : 'ফাইল মুছে ফেলুন'}
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


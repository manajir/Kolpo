import React, { createContext, useContext, useState, useEffect } from 'react';
import { HealthStage, UserProfile, TrackingLog, ForumPost, ClinicReport, UserFile, CourseMaterial } from './types';
import { Language, translations, toLocalizedNumber } from './i18n';
import { db, auth, isMockConfig } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot 
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// Security error handler conforming to strict instructions
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous',
      email: auth?.currentUser?.email || '',
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
    },
    operationType,
    path
  };
  console.error('Firestore Secure Logging Checklist: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.bn) => string;
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  trackingLogs: { [date: string]: TrackingLog };
  forumPosts: ForumPost[];
  userFiles: UserFile[];
  clinicReports: ClinicReport[];
  articles: CourseMaterial[];
  notifications: { id: string; title: string; message: string; timestamp: Date; read: boolean }[];
  setProfile: (profile: UserProfile) => void;
  updateProfileStage: (stage: HealthStage, details: Partial<UserProfile>) => Promise<void>;
  addTrackingLog: (date: string, log: Omit<TrackingLog, 'updatedAt'>) => Promise<void>;
  createForumPost: (category: ForumPost['category'], title: string, content: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  uploadHealthFile: (name: string, type: string, simulatedUrl: string, bytesSize: number) => Promise<void>;
  deleteHealthFile: (fileId: string) => Promise<void>;
  generateClinicReport: (title: string, startDate: string, endDate: string, docNotes: string) => Promise<void>;
  deleteClinicReport: (reportId: string) => Promise<void>;
  triggerSimulationNotification: (title: string, message: string) => void;
  mockLogin: (email: string, name: string) => Promise<void>;
  mockRegister: (email: string, name: string, stage: HealthStage) => Promise<void>;
  upgradeSubscription: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Rich content library for learning and medical courses
const LIBRARY_ARTICLES: CourseMaterial[] = [
  {
    id: 'art-1',
    title: 'Understanding Your Cycle & PMS Remedies',
    bengaliTitle: 'পিরিয়ড চক্র এবং প্রি-মেনস্ট্রুয়াল সিন্ড্রোম (PMS) সমাধান',
    category: 'period',
    type: 'article',
    duration: '৫ মিনিট রিড',
    premiumOnly: false,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
    contentMarkup: `
      ## পিরিয়ড চক্র কি?
      একটি স্বাভাবিক পিরিয়ড চক্র সাধারণত ২১ থেকে ৩৫ দিনের মধ্যে হয়ে থাকে। এই চক্রের শেষ রক্তক্ষরণের দিনটিকে প্রথম দিন ধরে হিসাব করা শুরু হয়।

      ## PMS বা প্রি-মেনস্ট্রুয়াল সিন্ড্রোম এবং এর লক্ষণসমূহ
      পিরিয়ড শুরু হওয়ার ৭-১০ দিন আগে শরীরে হরমোন পরিবর্তন ঘটে। এর ফলে:
      - মুড সুইং বা খিটখিটে মেজাজ
      - তলপেটে ও পিঠে হালকা ব্যথা
      - শরীরে ক্লান্তি ও অবসাদ লাগা
      - ত্বকে ব্রণ দেখা দেওয়া

      ## ঘরোয়া রিলেক্সেশন গাইড
      ১. **উষ্ণ পানির সেঁক:** তলপেটে হালকা কুসুম গরম পানির ব্যাগ ব্যবহার করুন। এটি জরায়ুর পেশীর খিঁচুনি উপশম করে।
      ২. **আদা পানি:** আদা কুচি দিয়ে চা বা কুসুম গরম পানি ফুটিয়ে খেলে পিরিয়ডের ব্যথা অনেকাংশে দূর হয়।
      ৩. **পর্যাপ্ত বিশ্রাম ও ঘুম:** দিনে কমপক্ষে ৭ এবং রাতে ৮ ঘণ্টা নিরবচ্ছিন্ন ঘুম মানসিক চাপ কমাতে সাহায্য করে।
    `
  },
  {
    id: 'art-2',
    title: 'Balanced Pregnancy Diet for First Trimester',
    bengaliTitle: 'গর্ভকালীন প্রথম তিন মাসের পুষ্টিকর ব্যালেন্সড ডায়েট',
    category: 'pregnancy',
    type: 'article',
    duration: '৮ মিনিট রিড',
    premiumOnly: false,
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
    contentMarkup: `
      ## প্রথম ট্রাইমেস্টারের গুরুত্ব
      গর্ভাবস্থার প্রথম বারো সপ্তাহ অত্যন্ত গুরুত্বপূর্ণ। এই সময়ে শিশুর নিউরাল টিউব এবং প্রধান প্রধান বাহ্যিক অঙ্গ গঠিত হওয়া শুরু করে।

      ## খাদ্যতালিকার অবিচ্ছেদ্য উপাদান
      - **ফলিক এসিড:** শিশুর জন্মগত ত্রুটি রোধে পালং শাক, মসুর ডাল, সাইট্রাস জাতীয় ফল (কমলা, লেবু) প্রতিদিন রাখুন।
      - **আয়রন ও ক্যালসিয়াম:** ডিমের কুসুম, লাল মাংস, দুধ, মিষ্টি দই এবং ছোট মাছ হাড়ের সুরক্ষায় এবং রক্তশূন্যতা দূর করতে অতি প্রয়োজনীয়।
      - **প্রোটিন:** মসুর ডাল, মুরগির মাংস এবং ভেজানো বাদাম টিস্যু ও প্লাসেন্টা গঠনে জ্বালানি হিসেবে কাজ করে।

      ## বর্জনীয় খাবার
      ১. কাঁচা বা আধা-সেদ্ধ ডিম ও মাংস।
      ২. অতিরিক্ত প্রিজারভেটিভ দেওয়া প্যাকেটজাত খাবার।
      ৩. মাত্রাতিরিক্ত ক্যাফেইন ও চা-কফি।
    `
  },
  {
    id: 'art-3',
    title: 'Navigating Hot Flashes & Insomnia',
    bengaliTitle: 'হট ফ্ল্যাশ এবং অনিদ্রা: পেরিমেনোপজের সমাধান',
    category: 'menopause',
    type: 'article',
    duration: '১০ মিনিট রিড',
    premiumOnly: false,
    coverImage: 'https://images.unsplash.com/photo-1511974035430-5de47d3b95da?q=80&w=600&auto=format&fit=crop',
    contentMarkup: `
      ## হট ফ্ল্যাশ কি?
      পেরিমেনোপজের সময়ে শরীরে হঠাৎ প্রচুর গরম অনুভূত হওয়া, ঘেমে যাওয়া এবং বুক ধড়ফড় করার অনুভূতিকে 'হট ফ্ল্যাশ' বলে। এটি মূলত ইস্ট্রোজেন হরমোনের তীব্র পতনে ঘটে থাকে।

      ## লক্ষণসমূহ সামলে ওঠার সহজ উপায়
      ১. **সুতি আলগা পোশাক:** ঘরে এবং বাইরে আরামদায়ক সূতির ঢিলেঢালা পোশাক ব্যবহার করুন।
      ২. **ঠান্ডা তরল খাবার:** হঠাৎ গরম লাগলে এক গ্লাস লেবুর শরবত বা ডাবের পানি পান করুন।
      ৩. **ক্যাফেইন বর্জন:** বিকাল ৫ টার পর চা কফি খাওয়া পরিহার করুন, যা রাতের ঘুমকে গভীর করতে সাহায্য করবে।

      ## ভেষজ থেরাপি ও ব্যায়াম
      নিশিন্দা বা তিসির বীজের গুঁড়ো হরমোনের ভারসাম্য রক্ষা করতে ভেষজ উৎস হিসেবে দারুণ পরিচিত। এছাড়াও প্রত্যুষে ২০ মিনিট খোলা বাতাসে ধ্যান আপনার স্নায়ুতন্ত্রকে শান্ত রাখে।
    `
  },
  {
    id: 'vid-1',
    title: 'Yoga and Breathing Exercises for Period Relief',
    bengaliTitle: 'পিরিয়ডের ব্যথা নিরাময়ে সঠিক ইয়োগা এবং শ্বাসক্রিয়া',
    category: 'wellness',
    type: 'video',
    duration: '১২ মিনিট ভিডিও',
    premiumOnly: false,
    videoUrl: 'https://www.youtube.com/embed/A8S5C3W1X-M',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'vid-2',
    title: 'Pregnancy Safe Pelvic Yoga Instructions',
    bengaliTitle: 'গর্ভবতী মায়েদের জন্য নিরাপদ ৫টি পেলভিক এক্সারসাইজ',
    category: 'pregnancy',
    type: 'video',
    duration: '১৫ মিনিট ভিডিও',
    premiumOnly: true,
    videoUrl: 'https://www.youtube.com/embed/p17gI6A9Rts',
    coverImage: 'https://images.unsplash.com/photo-1574406280735-351fc1a7c5b0?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'course-1',
    title: 'Complete Perimenopause Wellness Course',
    bengaliTitle: '৪০ ঊর্ধ্ব সুস্থ জীবন: পেরিমেনোপজ ও সুস্থতা মাস্টারক্লাস',
    category: 'menopause',
    type: 'course',
    duration: '৪টি লেকচার',
    premiumOnly: true,
    coverImage: 'https://images.unsplash.com/photo-1511974035430-5de47d3b95da?q=80&w=600&auto=format&fit=crop',
    lessons: [
      { title: 'ভূমিকা ও হরমোনের পরিবর্তন বোঝাপড়া', duration: '১৫ মি.' },
      { title: 'হাড়ের যত্ন ও সঠিক পুষ্টি পরিকল্পনা', duration: '২০ মি.' },
      { title: 'মানসিক ক্লান্তি এড়ানো ও পরিবার গঠন', duration: '১৮ মি.' },
      { title: 'চিকিৎসকের পরামর্শের প্রধান ধাপসমূহ', duration: '২২ মি.' }
    ],
    contentMarkup: `
      ## এই কোর্সের উদ্দেশ্য
      নারীদের ৪০-৪৫ বছর বয়সের স্বাভাবিক হরমোন ট্রানজিশনকে সুন্দর এবং আনন্দময় করতে এই কোর্সটি ডিজাইন করা হয়েছে।

      ## আপনি যা শিখবেন:
      - হরমোনের অস্থিরতা চেনার উপায়
      - মেজাজ নিয়ন্ত্রণে মেডিটেশন ও স্নায়ুবিক ব্যায়াম
      - ক্যালসিয়াম ও ইস্ট্রোজেন বাড়ানোর প্রাকৃতিক খাবারের তালিকা
    `
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kalpa_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kalpa_lang', lang);
  };

  const t = (key: keyof typeof translations.bn): string => {
    return translations[language][key] || translations.bn[key] || key;
  };

  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trackingLogs, setTrackingLogs] = useState<{ [date: string]: TrackingLog }>({});
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [clinicReports, setClinicReports] = useState<ClinicReport[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Simulation mode check logs and load basic mock database from LocalStorage
  useEffect(() => {
    // Synchronize user authentications if Firebase ready
    if (!isMockConfig && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          await loadUserProfile(firebaseUser.uid, firebaseUser.email || '');
          setupFirestoreListeners(firebaseUser.uid);
        } else {
          setUser(null);
          setProfileState(null);
          setIsLoading(false);
          loadSimulationOfflineData();
        }
      });
      return () => unsubscribe();
    } else {
      // Local check or init
      loadSimulationOfflineData();
    }
  }, []);

  const loadSimulationOfflineData = () => {
    setIsLoading(true);
    const mockUserStr = localStorage.getItem('kalpa_mock_user');
    const mockProfileStr = localStorage.getItem('kalpa_mock_profile');
    const mockLogsStr = localStorage.getItem('kalpa_mock_logs');
    const mockPostsStr = localStorage.getItem('kalpa_mock_posts');
    const mockFilesStr = localStorage.getItem('kalpa_mock_files');
    const mockReportsStr = localStorage.getItem('kalpa_mock_reports');
    const mockNotificationsStr = localStorage.getItem('kalpa_mock_notifications');

    if (mockUserStr && mockProfileStr) {
      setUser(JSON.parse(mockUserStr));
      setProfileState(JSON.parse(mockProfileStr));
    }
    
    if (mockLogsStr) setTrackingLogs(JSON.parse(mockLogsStr));
    if (mockReportsStr) setClinicReports(JSON.parse(mockReportsStr));
    if (mockFilesStr) setUserFiles(JSON.parse(mockFilesStr));
    
    if (mockNotificationsStr) {
      setNotifications(JSON.parse(mockNotificationsStr));
    } else {
      const initialAlerts = [
        {
          id: 'n-1',
          title: 'কল্পের স্বাগতম শুভেচ্ছা',
          message: 'নিরাপদ এবং সুরক্ষিত কল্প অ্যাপে আপনাকে সুস্বাগতম! আপনার স্বাস্থ্য সুরক্ষায় আমরা প্রতিশ্রুতিবদ্ধ।',
          timestamp: new Date(),
          read: false
        }
      ];
      setNotifications(initialAlerts);
      localStorage.setItem('kalpa_mock_notifications', JSON.stringify(initialAlerts));
    }

    if (mockPostsStr) {
      setForumPosts(JSON.parse(mockPostsStr));
    } else {
      const sampleForum: ForumPost[] = [
        {
          postId: 'post-1',
          authorId: 'sys-user',
          authorName: 'রহিমা বেগম',
          category: 'pregnancy',
          title: 'গর্ভাবস্থার ১ম ট্রাইমেস্টারে বমি বমি ভাব প্রতিকার কী?',
          content: 'আমার গর্ভাবস্থার ৮ম সপ্তাহ চলছে। সকাল বেলা ঘুম থেকে উঠলে খুব বেশি বমি ভাব হয় এবং মুখ তেতো হয়ে থাকে। কোনো আপু বা ডাক্তার কি সঠিক সমাধান দিতে পারবেন?',
          createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
          likes: ['mock-liked-user'],
          commentsCount: 2
        },
        {
          postId: 'post-2',
          authorId: 'sys-user2',
          authorName: 'ফারিয়া সুলতানা',
          category: 'menopause',
          title: 'পেরিমেনোপজের অস্থিরতা কাটাতে ব্রিদিং এক্সারসাইজ কতটা কার্যকরী?',
          content: 'আমার বয়স ৪৪ বছর। গত কিছুদিন ধরে মাঝরাতে হঠাৎ হট ফ্ল্যাশ হয়ে ঘুম ভেঙে যায় এবং মারাত্মক অস্থিরতা লাগে। অভিজ্ঞ কেউ কি জানাবেন ব্রিদিং থেরাপিতে এই অস্থিরতা কতটা প্রশমিত হয়?',
          createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
          likes: [],
          commentsCount: 1
        }
      ];
      setForumPosts(sampleForum);
      localStorage.setItem('kalpa_mock_posts', JSON.stringify(sampleForum));
    }

    setIsLoading(false);
  };

  const setupFirestoreListeners = (uid: string) => {
    // Tracking onSnapshot
    const trackPath = `users/${uid}/tracking`;
    const trackQuery = collection(db, trackPath);
    onSnapshot(trackQuery, (snapshot) => {
      const logs: { [date: string]: TrackingLog } = {};
      snapshot.forEach((d) => {
        logs[d.id] = d.data() as TrackingLog;
      });
      setTrackingLogs(logs);
      localStorage.setItem('kalpa_mock_logs', JSON.stringify(logs));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, trackPath);
    });

    // Files metadata onSnapshot
    const filesPath = `users/${uid}/files`;
    const fileQuery = collection(db, filesPath);
    onSnapshot(fileQuery, (snapshot) => {
      const files: UserFile[] = [];
      snapshot.forEach((d) => { files.push(d.data() as UserFile); });
      setUserFiles(files);
      localStorage.setItem('kalpa_mock_files', JSON.stringify(files));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, filesPath);
    });

    // Clinic reports onSnapshot
    const clinicPath = `users/${uid}/clinic_reports`;
    const reportQuery = collection(db, clinicPath);
    onSnapshot(reportQuery, (snapshot) => {
      const reports: ClinicReport[] = [];
      snapshot.forEach((d) => { reports.push(d.data() as ClinicReport); });
      setClinicReports(reports);
      localStorage.setItem('kalpa_mock_reports', JSON.stringify(reports));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, clinicPath);
    });

    // Shared forum lists onSnapshot
    const forumPath = 'forum';
    const postQuery = query(collection(db, forumPath), orderBy('createdAt', 'desc'));
    onSnapshot(postQuery, (snapshot) => {
      const posts: ForumPost[] = [];
      snapshot.forEach((d) => { posts.push(d.data() as ForumPost); });
      setForumPosts(posts);
      localStorage.setItem('kalpa_mock_posts', JSON.stringify(posts));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, forumPath);
    });
  };

  const loadUserProfile = async (uid: string, email: string) => {
    const profilePath = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const p = docSnap.data() as UserProfile;
        setProfileState(p);
        localStorage.setItem('kalpa_mock_profile', JSON.stringify(p));
      } else {
        const newP: UserProfile = {
          uid,
          email,
          displayName: email.split('@')[0],
          currentStage: HealthStage.MENSTRUATING,
          cycleLength: 28,
          periodLength: 5,
          lastPeriodDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          subActive: false
        };
        await setDoc(docRef, newP);
        setProfileState(newP);
        localStorage.setItem('kalpa_mock_profile', JSON.stringify(newP));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, profilePath);
    }
  };

  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('kalpa_mock_profile', JSON.stringify(newProfile));
    
    if (!isMockConfig && auth && user) {
      const profilePath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, profilePath);
      }
    }
  };

  const updateProfileStage = async (stage: HealthStage, details: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, currentStage: stage, ...details };
    await setProfile(updated);
    triggerSimulationNotification(
      'ধাপ পরিবর্তন সম্পন্ন', 
      `আপনার কল্প স্বাস্থ্য ট্র্যাকার বর্তমানে সফলভাবে "${stage === HealthStage.PREGNANCY ? 'গর্ভকালীন' : stage === HealthStage.PERIMENOPAUSE ? 'পেরিমেনোপজ' : 'পিরিয়ড ও ওভুলেশন'}" মোডে ডাইভার্ট হয়েছে।`
    );
  };

  const addTrackingLog = async (date: string, log: Omit<TrackingLog, 'updatedAt'>) => {
    const newLog: TrackingLog = {
      ...log,
      updatedAt: new Date().toISOString()
    };
    
    // Update state first
    const updatedLogs = { ...trackingLogs, [date]: newLog };
    setTrackingLogs(updatedLogs);
    localStorage.setItem('kalpa_mock_logs', JSON.stringify(updatedLogs));

    if (!isMockConfig && auth && user) {
      const path = `users/${user.uid}/tracking/${date}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'tracking', date), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
    
    // Update lastPeriodDate on user profile if logging period bleeding today
    if (log.periodBleeding && log.periodBleeding !== 'none' && profile) {
      const prof = { ...profile, lastPeriodDate: date };
      await setProfile(prof);
    }
  };

  const createForumPost = async (category: ForumPost['category'], title: string, content: string) => {
    if (!user || !profile) return;
    const postId = 'post-' + Date.now();
    const newPost: ForumPost = {
      postId,
      authorId: user.uid,
      authorName: profile.displayName || user.email.split('@')[0],
      category,
      title,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      commentsCount: 0
    };

    setForumPosts([newPost, ...forumPosts]);
    localStorage.setItem('kalpa_mock_posts', JSON.stringify([newPost, ...forumPosts]));

    if (!isMockConfig && auth && user) {
      const path = `forum/${postId}`;
      try {
        await setDoc(doc(db, 'forum', postId), newPost);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const toggleLikePost = async (postId: string) => {
    if (!user) return;
    const uids = user.uid;
    const updated = forumPosts.map(post => {
      if (post.postId === postId) {
        const exists = post.likes.includes(uids);
        return {
          ...post,
          likes: exists ? post.likes.filter(id => id !== uids) : [...post.likes, uids]
        };
      }
      return post;
    });
    setForumPosts(updated);
    localStorage.setItem('kalpa_mock_posts', JSON.stringify(updated));

    if (!isMockConfig && auth && user) {
      const targetPost = forumPosts.find(p => p.postId === postId);
      if (targetPost) {
        const path = `forum/${postId}`;
        const hasLiked = targetPost.likes.includes(uids);
        const updatedLikes = hasLiked 
          ? targetPost.likes.filter(id => id !== uids) 
          : [...targetPost.likes, uids];
        try {
          await updateDoc(doc(db, 'forum', postId), { likes: updatedLikes });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
    }
  };

  const uploadHealthFile = async (name: string, type: string, simulatedUrl: string, bytesSize: number) => {
    if (!user) return;
    const fileId = 'file-' + Date.now();
    const newFile: UserFile = {
      fileId,
      fileName: name,
      fileUrl: simulatedUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80',
      fileType: type.split('/')[1] || 'pdf',
      uploadedAt: new Date().toISOString(),
      sizeBytes: bytesSize
    };

    const updated = [...userFiles, newFile];
    setUserFiles(updated);
    localStorage.setItem('kalpa_mock_files', JSON.stringify(updated));

    if (!isMockConfig && auth && user) {
      const path = `users/${user.uid}/files/${fileId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'files', fileId), newFile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
    triggerSimulationNotification(
      language === 'en' ? 'Document Uploaded' : 'ডকুমেন্ট আপলোড সম্পন্ন',
      language === 'en' 
        ? `Your medical file "${name}" has been encrypted and stored in your Kalpa cloud vault.` 
        : `আপনার মেডিকেল ডস্ক ফাইল "${name}" সফলভাবে এনক্রিপ্ট হয়ে কল্প ক্লাউড আর্কাইভে জমা হয়েছে।`
    );
  };

  const deleteHealthFile = async (fileId: string) => {
    if (!user) return;
    const updated = userFiles.filter(f => f.fileId !== fileId);
    setUserFiles(updated);
    localStorage.setItem('kalpa_mock_files', JSON.stringify(updated));

    if (!isMockConfig && auth && user) {
      const path = `users/${user.uid}/files/${fileId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'files', fileId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const generateClinicReport = async (title: string, startDate: string, endDate: string, docNotes: string) => {
    if (!user || !profile) return;
    const reportId = 'rep-' + Date.now();
    const isEn = language === 'en';
    
    // Auto compile some summaries based on historical tracks
    const loggedRange = (Object.values(trackingLogs) as TrackingLog[]).filter(log => log.logDate >= startDate && log.logDate <= endDate);
    const uniqueSymptoms = Array.from(new Set(loggedRange.flatMap(item => item.symptoms)));
    const moodsLogged = Array.from(new Set(loggedRange.flatMap(item => item.moods)));
    
    const symSummary = uniqueSymptoms.length > 0 
      ? (isEn 
          ? `Report Period Symptoms: ${uniqueSymptoms.join(', ')}. Moods: ${moodsLogged.join(', ')}.` 
          : `রিপোর্ট সময়কালে লক্ষণসমূহ: ${uniqueSymptoms.join(', ')}। মেজাজ: ${moodsLogged.join(', ')}।`)
      : (isEn 
          ? 'No complex physical symptoms logged during this report period.' 
          : 'চক্রের হিসাবকালে কোনো জটিল শারীরিক উপসর্গ নথিভুক্ত করা হয়নি।');

    const stageSum = isEn
      ? `Stage: ${profile.currentStage === HealthStage.PREGNANCY ? 'Pregnancy' : profile.currentStage === HealthStage.PERIMENOPAUSE ? 'Perimenopause' : 'Menstruating Period'}. Cycle Length: ${profile.cycleLength} days, Period Flow: ${profile.periodLength} days.`
      : `ধাপ: ${profile.currentStage === HealthStage.PREGNANCY ? 'গর্ভকালীন' : profile.currentStage === HealthStage.PERIMENOPAUSE ? 'পেরিমেনোপজ' : 'মেনস্ট্রুয়েটিং পিরিয়ড'}। চক্রের দৈর্ঘ্য: ${profile.cycleLength} দিন, রক্তস্রাবকাল: ${profile.periodLength} দিন।`;

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Secure 6 digit Clinician verification code

    const defaultTitle = isEn 
      ? `Health Report - ${startDate} to ${endDate}` 
      : 'স্বাস্থ্য প্রতিবেদন - ' + startDate + ' থেকে ' + endDate;

    const newReport: ClinicReport = {
      reportId,
      userId: user.uid,
      title: title || defaultTitle,
      createdAt: new Date().toISOString(),
      startDate,
      endDate,
      symptomsSummary: symSummary,
      stageSummary: stageSum,
      additionalDoctorNotes: docNotes || (isEn ? 'No additional message.' : 'কোনো বাড়তি বার্তা নেই।'),
      clinicianAccessCode: code
    };

    const updated = [newReport, ...clinicReports];
    setClinicReports(updated);
    localStorage.setItem('kalpa_mock_reports', JSON.stringify(updated));

    if (!isMockConfig && auth && user) {
      const path = `users/${user.uid}/clinic_reports/${reportId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'clinic_reports', reportId), newReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    triggerSimulationNotification(
      isEn ? 'Clinical Report Generated' : 'ক্লিনিশিয়ান রিপোর্ট জেনারেট হয়েছে',
      isEn 
        ? `Health report generated for sharing with doctors. Secure Code: ${code}` 
        : `ডাক্তারদের সাথে শেয়ার করার উপযোগী পিরিয়ড ও স্বাস্থ্য রিপোর্ট জেনারেট হয়েছে। সিকিউর কোড: ${code}`
    );
  };

  const deleteClinicReport = async (reportId: string) => {
    if (!user) return;
    const updated = clinicReports.filter(r => r.reportId !== reportId);
    setClinicReports(updated);
    localStorage.setItem('kalpa_mock_reports', JSON.stringify(updated));

    if (!isMockConfig && auth && user) {
      const path = `users/${user.uid}/clinic_reports/${reportId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'clinic_reports', reportId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const triggerSimulationNotification = (title: string, message: string) => {
    const freshAlert = {
      id: 'n-' + Date.now(),
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    const updated = [freshAlert, ...notifications];
    setNotifications(updated);
    localStorage.setItem('kalpa_mock_notifications', JSON.stringify(updated));
  };

  const mockLogin = async (email: string, name: string) => {
    const mockUid = 'uid-' + email.split('@')[0];
    const sessionUser = { uid: mockUid, email };
    setUser(sessionUser);
    localStorage.setItem('kalpa_mock_user', JSON.stringify(sessionUser));

    const mockProf: UserProfile = {
      uid: mockUid,
      email,
      displayName: name || email.split('@')[0],
      currentStage: HealthStage.MENSTRUATING,
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      subActive: false
    };
    setProfileState(mockProf);
    localStorage.setItem('kalpa_mock_profile', JSON.stringify(mockProf));
    triggerSimulationNotification('লগ-ইন সফল হয়েছে', `কল্প সদস্য ড্যাশবোর্ডে স্বাগতম, ${name}!`);
  };

  const mockRegister = async (email: string, name: string, stage: HealthStage) => {
    const mockUid = 'uid-' + email.split('@')[0];
    const sessionUser = { uid: mockUid, email };
    setUser(sessionUser);
    localStorage.setItem('kalpa_mock_user', JSON.stringify(sessionUser));

    const mockProf: UserProfile = {
      uid: mockUid,
      email,
      displayName: name || email.split('@')[0],
      currentStage: stage,
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      subActive: false
    };
    setProfileState(mockProf);
    localStorage.setItem('kalpa_mock_profile', JSON.stringify(mockProf));
    triggerSimulationNotification('নিবন্ধন সম্পন্ন', `কল্প পরিবারের নতুন সদস্য হিসেবে আপনার যাত্রা শুরু হলো, ${name}!`);
  };

  const upgradeSubscription = async () => {
    if (!profile) return;
    const upd = { ...profile, subActive: true };
    await setProfile(upd);
    triggerSimulationNotification('কল্প প্রো প্লাস সক্রিয়!', 'অভিনন্দন! আপনি সফলভাবে কল্প লিমিটলেস ক্লাউড স্টোরেজ ও বিশেষজ্ঞ কোর্স ম্যাটেরিয়াল আনলক করেছেন।');
  };

  const signOutUser = async () => {
    if (!isMockConfig && auth) {
      await auth.signOut();
    }
    setUser(null);
    setProfileState(null);
    localStorage.removeItem('kalpa_mock_user');
    localStorage.removeItem('kalpa_mock_profile');
    localStorage.removeItem('kalpa_mock_logs');
    localStorage.removeItem('kalpa_mock_files');
    localStorage.removeItem('kalpa_mock_reports');
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      user,
      profile,
      isLoading,
      trackingLogs,
      forumPosts,
      userFiles,
      clinicReports,
      articles: LIBRARY_ARTICLES,
      notifications,
      setProfile,
      updateProfileStage,
      addTrackingLog,
      createForumPost,
      toggleLikePost,
      uploadHealthFile,
      deleteHealthFile,
      generateClinicReport,
      deleteClinicReport,
      triggerSimulationNotification,
      mockLogin,
      mockRegister,
      upgradeSubscription,
      signOutUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState inside core AppProvider!');
  return context;
};

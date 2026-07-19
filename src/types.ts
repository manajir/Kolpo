export enum HealthStage {
  MENSTRUATING = 'menstruating',     // পিরিয়ড চক্র ট্র্যাকিং
  PREGNANCY = 'pregnancy',           // গর্ভাবস্থা ট্র্যাকিং
  PERIMENOPAUSE = 'perimenopause',   // পেরিমেনোপজ ট্র্যাকিং
  POSTMENOPAUSE = 'postmenopause'    // পোস্টমেনোপজ
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  currentStage: HealthStage;
  cycleLength: number;         // default 28
  periodLength: number;        // default 5
  lastPeriodDate: string;      // YYYY-MM-DD
  pregnancyDueDate?: string;   // YYYY-MM-DD
  createdAt: string;
  subActive: boolean;          // Premium Subscription
}

export interface TrackingLog {
  logDate: string;             // YYYY-MM-DD
  periodBleeding: 'none' | 'light' | 'medium' | 'heavy';
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'raw-egg-white';
  symptoms: string[];          // e.g., ['তলপেটে ব্যথা', 'কোমর ব্যথা', 'মাথাব্যথা', 'হট ফ্ল্যাশ', 'ব্রেইন ফগ']
  moods: string[];             // e.g., ['খুশি', 'খিটখিটে মেজাজ', 'উদ্বেগ', 'ক্লান্ত', 'শান্ত']
  energyLevel: 'high' | 'medium' | 'low';
  notes: string;
  weight?: number;             // kg
  temperature?: number;        // F
  updatedAt: string;
}

export interface ForumPost {
  postId: string;
  authorId: string;
  authorName: string;
  category: 'fertility' | 'pregnancy' | 'menopause' | 'mental-health' | 'general';
  title: string;
  content: string;
  createdAt: string;
  likes: string[];             // array of user uids
  commentsCount: number;
}

export interface ForumComment {
  commentId: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  bengaliTitle: string;
  category: 'period' | 'pregnancy' | 'menopause' | 'wellness';
  type: 'article' | 'video' | 'course';
  duration: string;
  premiumOnly: boolean;
  contentMarkup?: string;       // Rich article content
  videoUrl?: string;           // Hotlinked embedded or simulated player
  coverImage?: string;
  lessons?: { title: string; duration: string }[];
}

export interface ClinicReport {
  reportId: string;
  userId: string;
  title: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  symptomsSummary: string;
  stageSummary: string;
  additionalDoctorNotes: string;
  clinicianAccessCode: string; // Dynamic code for sharing
}

export interface UserFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;            // pdf, png, jpg, webp
  uploadedAt: string;
  sizeBytes: number;
}

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialization helper for Gemini
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Helper to safely call Gemini with model fallback
async function generateWithFallback(client: GoogleGenAI, prompt: string) {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  let lastErr: any = null;
  for (const modelName of modelsToTry) {
    try {
      const res = await client.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      if (res && res.text) {
        return res;
      }
    } catch (err) {
      lastErr = err;
      console.warn(`Gemini model ${modelName} call failed, trying next...`);
    }
  }
  throw lastErr;
}

// 1. Daily Health Insight & Prediction Endpoint
app.post('/api/gemini/insight', async (req, res) => {
  const { currentStage, symptoms, moods, energyLevel, logDate, cycleDay, language = 'bn' } = req.body;

  const client = getGemini();

  const isEn = language === 'en';

  const prompt = isEn ? `
    You are 'Diptee' - a warm, expert women's health AI.
    Analyze the user's current status and provide a brief daily health insight, prediction, and structured wellness advice in supportive English.
    
    Current Stage: ${currentStage || 'menstruating'} (Options: menstruating, pregnancy, perimenopause, postmenopause)
    Cycle Day: ${cycleDay || 'Unknown'}
    Logged Date: ${logDate || 'Today'}
    Symptoms entered today: ${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'None specified'}
    Current Moods: ${moods && moods.length > 0 ? moods.join(', ') : 'Normal'}
    Current Energy Level: ${energyLevel || 'Normal'}
    
    Format the response as JSON with three strictly specified fields in English language:
    {
      "prediction": "A 1-2 sentence supportive prediction of their cycle flow or physical status in English.",
      "insight": "A comforting 2-3 sentence insight on what causes these symptoms or how they relate to this phase in English.",
      "wellnessTips": [
        "Tip 1: Warm physical comfort advice in English.",
        "Tip 2: Dietary, sleep, or hydration suggestion in English.",
        "Tip 3: Caring mental support tip in English."
      ]
    }
    
    Ensure the JSON format is perfect. Avoid any markdown indicators like \`\`\`json. Return only the JSON string.
  ` : `
    You are 'দীপ্তি' (Diptee) - a warm, expert Bengali women's health AI. 
    Analyze the user's current status and provide a brief daily health insight, prediction, and structured wellness advice in supportive Bengali.
    
    Current Stage: ${currentStage || 'মেনস্ট্রুয়েটিং (পিরিয়ড চক্র)'} (Options: menstruating, pregnancy, perimenopause, postmenopause)
    Cycle Day: ${cycleDay || 'জানি না'}
    Logged Date: ${logDate || 'আজ'}
    Symptoms entered today: ${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'কোনো নির্দিষ্ট উপসর্গ নেই'}
    Current Moods: ${moods && moods.length > 0 ? moods.join(', ') : 'স্বাভাবিক মড'}
    Current Energy Level: ${energyLevel || 'স্বাভাবিক'}
    
    Format the response as JSON with three strictly specified fields in Bengali language:
    {
      "prediction": "A 1-2 sentence supportive prediction of their cycle flow or physical status in Bengali.",
      "insight": "A comforting 2-3 sentence insight on what causes these symptoms or how they relate to this phase in Bengali.",
      "wellnessTips": [
        "Tip 1: Warm physical comfort advice in Bengali.",
        "Tip 2: Dietary, sleep, or hydration suggestion in Bengali.",
        "Tip 3: Caring mental support tip in Bengali."
      ]
    }
    
    Ensure the JSON format is perfect. Avoid any markdown indicators like \`\`\`json. Return only the JSON string.
  `;

  try {
    if (client) {
      const response = await generateWithFallback(client, prompt);
      const responseText = response.text || '';
      // Clean possible json markdown wraps
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const insightData = JSON.parse(cleanedText);
      return res.json(insightData);
    } else {
      return res.json(getFallbackInsights(currentStage, language, symptoms, moods));
    }
  } catch (error) {
    console.warn('Gemini insight fallback used due to API error:', error);
    return res.json(getFallbackInsights(currentStage, language, symptoms, moods));
  }
});

// 2. "দীপ্তি সহকারী" / "Diptee Assistant" Support Chat Assistant
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history, currentStage, language = 'bn' } = req.body;

  const client = getGemini();
  const isEn = language === 'en';

  const prompt = isEn ? `
    You are 'Diptee Assistant' - a highly secure, caring, expert gynecological and prenatal health assistant.
    The user is standardly seeking supportive health consulting in English. Always preface that this is advisory and not a substitute for clinical visits.
    Ensure all responses are strictly in English. Use gentle, compassionate terms. Keep answers actionable, explaining lifestyle remedies, food habits, and when to consult a doctor.

    User Stage context: ${currentStage || 'general'}
    User's message: ${message}

    Ensure your reply is formatted in a warm, clean structure. Keep it under 250 words.
  ` : `
    You are 'দীপ্তি সহকারী' (Diptee Assistant) - a highly secure, caring, expert Bengali gynecological and prenatal health assistant.
    The user is standardly seeking supportive health consulting in Bengali. Always preface that this is advisory and not a substitute for clinical visits.
    Ensure all responses are strictly in Bengali. Use gentle, compassionate terms. Keep answers actionable, explaining lifestyle remedies, food habits, and when to consult a doctor.

    User Stage context: ${currentStage || 'সাধারণ'}
    User's message: ${message}

    Ensure your reply is formatted in a warm, clean structure. Keep it under 250 words.
  `;

  try {
    if (client) {
      const response = await generateWithFallback(client, prompt);
      return res.json({ response: response.text });
    } else {
      return res.json({ response: getFallbackChatReply(message, currentStage, language) });
    }
  } catch (error) {
    console.warn('Gemini chat assistant fallback used due to API error:', error);
    return res.json({ response: getFallbackChatReply(message, currentStage, language) });
  }
});

// Helper: fallback responses generator for preview integrity
function getFallbackInsights(stage: string, lang: string, symptoms: string[] = [], moods: string[] = []): any {
  if (lang === 'en') {
    if (stage === 'pregnancy') {
      return {
        prediction: "Your pregnancy journey is currently progressing stably and safely.",
        insight: "Mild fatigue or mood changes are normal due to hormonal shifts during pregnancy. Your body is nurturing a new life.",
        wellnessTips: [
          "Stay well-hydrated and eat fresh fruits daily.",
          "Avoid heavy lifting and ensure at least 8 hours of sleep at night.",
          "Listen to calming music or read books to keep your mind refreshed."
        ]
      };
    } else if (stage === 'perimenopause') {
      return {
        prediction: "Irregular cycles and occasional hot flashes are expected during perimenopause.",
        insight: "Declining estrogen levels cause shifts in menstrual flow and sleep patterns. This is a completely natural transition.",
        wellnessTips: [
          "Wear loose, breathable cotton clothing.",
          "Include calcium and vitamin D rich foods (milk, eggs, yogurt) for bone health.",
          "Practice deep breathing exercises or meditation to manage stress."
        ]
      };
    } else {
      return {
        prediction: "Your body is transitioning into the next hormonal phase of your menstrual cycle.",
        insight: "Progesterone level shifts before periods can cause mild cramps or irritability, typical of Pre-Menstrual Syndrome (PMS).",
        wellnessTips: [
          "Apply a warm heating pad to your lower abdomen to ease cramps.",
          "Limit excess caffeine and salt intake to reduce bloating.",
          "Drink warm water and nutritious soups to stay energized."
        ]
      };
    }
  }

  // Default Bengali fallback
  if (stage === 'pregnancy') {
    return {
      prediction: "আপনার গর্ভকালীন সময় এখন স্থিতিশীল এবং সুন্দরভাবে এগোচ্ছে।",
      insight: "গর্ভকালে হরমোনের পরিবর্তনের কারণে ক্লান্তি বা হালকা মেজাজ পরিবর্তন হওয়া স্বাভাবিক। আপনার শরীর এখন একটি নতুন প্রাণকে লালন করছে।",
      wellnessTips: [
        "পর্যাপ্ত পানি ও ফলমূল জাতীয় খাবার খান।",
        "ভারী কাজ করা থেকে বিরত থাকুন এবং রাতে কমপক্ষে ৮ ঘণ্টা ঘুমান।",
        "মনকে ফুরফুরে রাখতে হালকা মেঠো গান বা বই পড়ুন এবং হালকা হাঁটাহাঁটি করুন।"
      ]
    };
  } else if (stage === 'perimenopause') {
    return {
      prediction: "হরমোনের তারতম্যের কারণে পিরিয়ড অনিয়মিত হওয়া এবং হঠাৎ গরম লাগা (Hot Flashes) স্বাভাবিক।",
      insight: "পেরিমেনোপজের সময়ে ইস্ট্রোজেন হরমোন কমে যায়, যা পিরিয়ড চক্রে পরিবর্তন এবং অনিদ্রার কারণ হতে পারে। এটি প্রতিটি নারীর জীবনের এক স্বাভাবিক পর্যায়।",
      wellnessTips: [
        "হালকা ও নরম সুতির আরামদায়ক পোশাক পরিধান করুন।",
        "হাড়ের সুরক্ষায় ক্যালসিয়াম ও ভিটামিন ডি সমৃদ্ধ খাবার (দুধ, ডিম) ডায়েটে যোগ করুন।",
        "স্ট্রেস কমাতে ও শরীর সতেজ রাখতে নিয়মিত ব্রিদিং এক্সারসাইজ বা ধ্যান করুন।"
      ]
    };
  } else {
    return {
      prediction: "আসন্ন পিরিয়ড চক্রে আপনার শরীর হরমোন নিঃসরণের পরবর্তী ধাপে প্রবেশ করছে।",
      insight: "পিরিয়ডের আগে প্রোজেস্টেরন হরমোনের পরিবর্তনের জন্য মেজাজ খিটখিটে হওয়া বা পেটে হালকা মোচড় লাগা প্রি-মেনস্ট্রুয়াল সিন্ড্রোম (PMS) নির্দেশ করে।",
      wellnessTips: [
        "তলপেটে ব্যথা অনুভূত হলে হালকা কুসুম গরম পানির সেঁক নিন।",
        "অতিরিক্ত চা, কফি বা লবণের ব্যবহার কমান, এটি পেটের ফাঁপা ভাব দূর করতে সাহায্য করে।",
        "শরীরের শক্তি বৃদ্ধি করতে এবং ভালো বোধ করতে কুসুম গরম পানি ও পুষ্টিকর তরল খাবার বেশি খান।"
      ]
    };
  }
}

function getFallbackChatReply(msg: string, stage: string, lang: string): string {
  const query = msg.toLowerCase();
  
  if (lang === 'en') {
    let defaultReply = "Thank you for asking. Diptee is here to provide safe, evidence-based guidance. Your symptoms are generally related to natural hormonal shifts. Please maintain a nutritious diet, get ample rest, and consult a doctor if you feel severe discomfort.";
    if (query.includes('pain') || query.includes('cramp')) {
      return "Abdominal or lower back pain is common during menstruation and pregnancy. Applying a warm heating pad often relieves mild discomfort. However, if you experience severe pain, heavy bleeding, or fever, please consult a specialized gynecologist right away.";
    }
    if (query.includes('diet') || query.includes('food') || query.includes('nutrition')) {
      return "Nutritional support is key during this time. Include leafy greens, calcium-rich foods (yogurt, milk), eggs, and lean proteins in your daily meals. Stay well-hydrated and talk to a physician before taking new supplements.";
    }
    if (query.includes('pregnancy') || query.includes('pregnant')) {
      return "Pregnancy requires gentle care. Folic acid and regular prenatal checkups are essential in the first trimester. Nutritious food and a relaxed environment support both mother and baby. Avoid lifting heavy objects.";
    }
    return defaultReply;
  }

  let defaultReply = "আপনার প্রশ্নটির জন্য ধন্যবাদ। দীপ্তি আপনাকে সবসময় নিরাপদ এবং বিজ্ঞানভিত্তিক তথ্য দিয়ে সাহায্য করতে প্রস্তুত। আপনার উপসর্গগুলো সাধারণত শরীরের হরমোনগত হ্রাসের বা পরিবর্তনের কারণে হয়ে থাকে। অনুগ্রহ করে পুষ্টিকর খাবার গ্রহণ করুন, পর্যাপ্ত বিশ্রাম নিন এবং কোনো গুরুতর অস্বস্তিতে অবশ্যই চিকিৎসকের শরণাপন্ন হোন।";
  if (query.includes('ব্যথা') || query.includes('pain')) {
    return "পিরিয়ড বা গর্ভাবস্থায় তলপেটে ব্যথা বা পিঠে ব্যথা একটি অতি প্রচলিত সমস্যা। হালকা ব্যথার জন্য আপনি কুসুম গরম পানির ছোঁয়া নিতে পারেন। তবে যদি তীব্র ব্যথা, অতিরিক্ত রক্তক্ষরণ কিংবা জ্বর আসে, তা ব্যাকটেরিয়াল কোনো সংক্রমণ বা জটিলতা নির্দেশ করতে পারে। এমন পরিস্থিতিতে ঘরোয়া চিকিৎসা এড়িয়ে অবিলম্বেই একজন বিশেষজ্ঞ গাইনী চিকিৎসকের সাথে পরামর্শ করুন।";
  }
  if (query.includes('খাবার') || query.includes('diet') || query.includes('nutrition')) {
    return "এ সময়ে আপনার শরীরের বাড়তি পুষ্টির প্রয়োজন। আপনার প্রতিদিনের খাদ্যতালিকায় সবুজ শাকসবজি, ক্যালসিয়াম সমৃদ্ধ খাবার (যেমন মিষ্টি দই, ঘন দুধ), ডিম এবং সুষম প্রোটিন নিশ্চিত করুন। পর্যাপ্ত তরল খাবার ও পানি পান করুন। কোনো অতিরিক্ত সাপ্লিমেন্ট নিতে হলে চিকিৎসকের পরামর্শ নেওয়া আবশ্যক।";
  }
  if (query.includes('গর্ভাবস্থা') || query.includes('pregnant')) {
    return "গর্ভকালীন দিনগুলো অত্যন্ত সংবেদনশীল। প্রথম তিন মাস ফলিক এসিড এবং চিকিৎসকের পরামর্শ অনুযায়ী চেকআপ খুবই জরুরী। নিয়মিত পুষ্টিকর খাবার এবং মানসিক প্রফুল্লতা এ সময় মা ও শিশু উভয়ের সুস্থতা নিশ্চিত করতে ম্যাজিকের মতো কাজ করে। ভারী ওজন তোলা একদমই বর্জন করুন।";
  }
  return defaultReply;
}

// 3. Vite Server / Production builds mount points
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Diptee / দীপ্তি backend and compilation proxy running fully on port ${PORT}`);
  });
}

start();

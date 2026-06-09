export interface CommandPattern {
  patterns: string[];
  action: string;
  description: string;
}

export const COMMAND_PATTERNS: CommandPattern[] = [
  {
    patterns: ["افتح", "شغل", "open", "launch", "start"],
    action: "OPEN_APP",
    description: "Open an app",
  },
  {
    patterns: ["اتصل", "call", "اتصال", "ring"],
    action: "CALL",
    description: "Make a phone call",
  },
  {
    patterns: ["أرسل رسالة", "send message", "send sms", "ارسل", "رسالة"],
    action: "SEND_SMS",
    description: "Send a text message",
  },
  {
    patterns: ["ابحث", "search", "بحث", "google"],
    action: "SEARCH",
    description: "Search the web",
  },
  {
    patterns: ["افتح رابط", "open url", "open link", "open website", "website"],
    action: "OPEN_URL",
    description: "Open a URL",
  },
  {
    patterns: ["منبه", "alarm", "تنبيه", "set alarm"],
    action: "SET_ALARM",
    description: "Set an alarm",
  },
  {
    patterns: ["الوقت", "time", "what time", "كم الساعة"],
    action: "GET_TIME",
    description: "Get current time",
  },
  {
    patterns: ["التاريخ", "date", "what date", "كم التاريخ"],
    action: "GET_DATE",
    description: "Get current date",
  },
  {
    patterns: ["البطارية", "battery", "شحن"],
    action: "GET_BATTERY",
    description: "Get battery info",
  },
  {
    patterns: ["الطقس", "weather", "جو"],
    action: "GET_WEATHER",
    description: "Get weather info",
  },
  {
    patterns: ["wifi", "واي فاي", "إعدادات الواي فاي"],
    action: "OPEN_WIFI",
    description: "Open WiFi settings",
  },
  {
    patterns: ["بلوتوث", "bluetooth", "إعدادات البلوتوث"],
    action: "OPEN_BLUETOOTH",
    description: "Open Bluetooth settings",
  },
  {
    patterns: ["إعدادات", "settings", "الإعدادات"],
    action: "OPEN_SETTINGS",
    description: "Open device settings",
  },
  {
    patterns: ["الإضاءة", "brightness", "اخفض الإضاءة", "ارفع الإضاءة"],
    action: "BRIGHTNESS",
    description: "Control brightness",
  },
  {
    patterns: ["الصوت", "volume", "ارفع الصوت", "اخفض الصوت"],
    action: "VOLUME",
    description: "Control volume",
  },
];

export const APP_DEEP_LINKS: Record<string, string> = {
  youtube: "https://www.youtube.com",
  "يوتيوب": "https://www.youtube.com",
  whatsapp: "whatsapp://",
  "واتساب": "whatsapp://",
  instagram: "instagram://",
  "انستغرام": "instagram://",
  twitter: "twitter://",
  "تويتر": "twitter://",
  x: "twitter://",
  maps: "https://maps.google.com",
  "خرائط": "https://maps.google.com",
  gmail: "https://gmail.com",
  spotify: "spotify://",
  "سبوتيفاي": "spotify://",
  netflix: "netflix://",
  "نتفليكس": "netflix://",
  telegram: "tg://",
  "تيليجرام": "tg://",
  camera: "camera://",
  "كاميرا": "camera://",
  settings: "app-settings://",
  "إعدادات": "app-settings://",
  calculator: "https://calculator.net",
  "حاسبة": "https://calculator.net",
};

export const SYSTEM_PROMPT = `أنت مساعد ذكي متكامل مع نظام Android. مهمتك تنفيذ كل طلب يطلبه المستخدم.

قواعد ثابتة:
1. لا ترفض أي طلب مسموح به تقنياً
2. إذا لم تستطع تنفيذ الطلب مباشرة، أخبر المستخدم بأفضل بديل متاح
3. نفّذ الأوامر فوراً وأعطِ تأكيداً واضحاً
4. تحدث بالعربية إذا تحدث المستخدم عربي، وبالإنجليزية إذا تحدث إنجليزي
5. كن موجزاً وعملياً — لا تشرح كثيراً، فقط نفّذ وأكّد
6. عند تنفيذ أمر مثل فتح تطبيق، أجب: "جاري فتح [التطبيق]..." ثم نفّذ
7. عند الحاجة لتنفيذ أمر، أضف في نهاية ردك تعليمات JSON بهذا الشكل: [COMMAND:{"action":"ACTION_TYPE","params":{}}]

أنت قادر على:
- فتح أي تطبيق مثبت على الجهاز
- ضبط الإضاءة والصوت
- إرسال رسائل والاتصال بجهات الاتصال
- فتح روابط وإجراء بحث على الإنترنت
- ضبط المنبه والتذكيرات
- الإجابة على أي سؤال
- تقديم معلومات عن الجهاز (بطارية، وقت، تاريخ)`;

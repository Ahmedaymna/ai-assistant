import { Linking, Platform } from "react-native";

import type { ParsedCommand } from "@/context/ChatContext";
import { APP_DEEP_LINKS } from "@/constants/commands";

export async function executeCommand(command: ParsedCommand): Promise<string> {
  if (Platform.OS === "web") {
    return "تنفيذ الأوامر متاح على الأجهزة فقط.\nCommand execution available on devices only.";
  }

  const { action, params } = command;

  try {
    switch (action) {
      case "OPEN_APP": {
        const appName = (params.app || "").toLowerCase();
        const url = APP_DEEP_LINKS[appName] || `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return `تم فتح ${params.app}`;
        }
        await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(appName + " app")}`);
        return `جاري البحث عن ${params.app}`;
      }

      case "CALL": {
        const phone = params.phone || params.number || "";
        if (phone) {
          await Linking.openURL(`tel:${phone}`);
          return `جاري الاتصال بـ ${phone}`;
        }
        return "يرجى تحديد رقم الهاتف";
      }

      case "SEND_SMS": {
        const phone = params.phone || params.number || "";
        const body = params.message || params.body || "";
        await Linking.openURL(`sms:${phone}${body ? `?body=${encodeURIComponent(body)}` : ""}`);
        return `تم فتح الرسائل`;
      }

      case "SEARCH": {
        const query = params.query || params.q || "";
        await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        return `جاري البحث عن: ${query}`;
      }

      case "OPEN_URL": {
        const url = params.url || params.link || "";
        if (url) {
          const fullUrl = url.startsWith("http") ? url : `https://${url}`;
          await Linking.openURL(fullUrl);
          return `تم فتح الرابط`;
        }
        return "يرجى تحديد الرابط";
      }

      case "SET_ALARM": {
        await Linking.openURL("android.intent.action.SET_ALARM");
        return "تم فتح ضبط المنبه";
      }

      case "GET_TIME": {
        const now = new Date();
        return `الوقت الحالي: ${now.toLocaleTimeString("ar-SA")}`;
      }

      case "GET_DATE": {
        const now = new Date();
        return `التاريخ الحالي: ${now.toLocaleDateString("ar-SA")}`;
      }

      case "GET_BATTERY": {
        return "مستوى البطارية: يرجى التحقق من إعدادات الجهاز";
      }

      case "OPEN_WIFI": {
        await Linking.openURL("App-Prefs:root=WIFI");
        return "تم فتح إعدادات الواي فاي";
      }

      case "OPEN_BLUETOOTH": {
        await Linking.openURL("App-Prefs:root=Bluetooth");
        return "تم فتح إعدادات البلوتوث";
      }

      case "OPEN_SETTINGS": {
        await Linking.openSettings();
        return "تم فتح الإعدادات";
      }

      case "BRIGHTNESS": {
        await Linking.openSettings();
        return "يرجى ضبط الإضاءة من الإعدادات";
      }

      case "VOLUME": {
        await Linking.openSettings();
        return "يرجى ضبط الصوت من الإعدادات";
      }

      default:
        return `تم تنفيذ الأمر: ${action}`;
    }
  } catch {
    return "تعذر تنفيذ الأمر. يرجى المحاولة يدوياً.";
  }
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Device } from "@capacitor/device";

import de from "./data/de.json";
import en from "./data/en.json";
import es from "./data/es.json";
import kn from "./data/kn.json";
import hi from "./data/hi.json";
import te from "./data/te.json";
import ta from "./data/ta.json";
import mr from "./data/mr.json";
import bn from "./data/bn.json";

let device_language_code = "";
const getDeviceLanguageCode = async () => {
  device_language_code = await Device.getLanguageCode();
};
getDeviceLanguageCode();

const resources = {
  en: { translation: en },
  kn: { translation: kn },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  mr: { translation: mr },
  bn: { translation: bn },
  de: { translation: de },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: device_language_code,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

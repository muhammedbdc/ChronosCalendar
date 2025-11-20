import { Language } from "../types";

export const translations = {
  en: {
    searchPlaceholder: "Search events...",
    listening: "Listening...",
    askChronos: "Ask Chronos to schedule...",
    today: "Today",
    weekBrief: "Weekly Brief",
    generate: "Generate",
    generating: "Generating...",
    noEvents: "No events scheduled.",
    nextEvent: "Next Event",
    noUpcoming: "No upcoming events.",
    backup: "Backup Calendar",
    exportICS: "Export .ICS file",
    reportBug: "Report Bug / Auto-Fix",
    systemOnline: "System Online",
    welcomeTitle: "Welcome to Chronos",
    welcomeDesc: "Chronos is ready.",
    myCalendar: "Chronos Calendar",
    dateFormat: 'en-US'
  },
  de: {
    searchPlaceholder: "Termine suchen...",
    listening: "Höre zu...",
    askChronos: "Bitte Chronos zu planen...",
    today: "Heute",
    weekBrief: "Wochenübersicht",
    generate: "Generieren",
    generating: "Generiere...",
    noEvents: "Keine Termine geplant.",
    nextEvent: "Nächster Termin",
    noUpcoming: "Keine anstehenden Termine.",
    backup: "Kalender sichern",
    exportICS: ".ICS Datei exportieren",
    reportBug: "Fehler melden / Auto-Fix",
    systemOnline: "System Online",
    welcomeTitle: "Willkommen bei Chronos",
    welcomeDesc: "Chronos ist bereit.",
    myCalendar: "Chronos Kalender",
    dateFormat: 'de-DE'
  },
  tr: {
    searchPlaceholder: "Etkinlik ara...",
    listening: "Dinleniyor...",
    askChronos: "Chronos'tan planlamasını iste...",
    today: "Bugün",
    weekBrief: "Haftalık Özet",
    generate: "Oluştur",
    generating: "Oluşturuluyor...",
    noEvents: "Planlanmış etkinlik yok.",
    nextEvent: "Sıradaki Etkinlik",
    noUpcoming: "Yaklaşan etkinlik yok.",
    backup: "Takvimi Yedekle",
    exportICS: ".ICS dosyası dışa aktar",
    reportBug: "Hata Bildir / Oto-Düzelt",
    systemOnline: "Sistem Çevrimiçi",
    welcomeTitle: "Chronos'a Hoşgeldiniz",
    welcomeDesc: "Chronos hazır.",
    myCalendar: "Chronos Takvimi",
    dateFormat: 'tr-TR'
  }
};

export const getTranslation = (lang: Language) => translations[lang];
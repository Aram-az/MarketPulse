// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLng = localStorage.getItem("lng");
const initialLng = savedLng === "fr" || savedLng === "en" ? savedLng : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          common: {
            on: "On",
            off: "Off",
          },

          nav: {
            chatbot: "ChatBot",
            dashboard: "Dashboard",
            news: "News",
            watchlist: "Watchlist",
            markets: "Markets",
            settings: "Settings",
            logout: "Log Out",
            login: "Login",
          },

          footer: {
            tagline:
              "AI-powered behavioral finance tools for the modern trader. Detect bias, manage risk, and trade smarter.",
            product: "Product",
            company: "Company",
            support: "Support",
            biasDetector: "Bias Detector AI",
            watchlist: "Real-time Watchlist",
            pricing: "Pricing",
            allFeatures: "All Features",
            about: "About Us",
            careers: "Careers",
            blog: "Blog",
            contact: "Contact",
            faq: "FAQ",
            privacyPolicy: "Privacy Policy",
            terms: "Terms of Service",
            rights: "MarketPulse Inc. All rights reserved.",
            challengeLine: "Made for the National Bank Bias Detector Challenge.",
          },

          settings: {
            title: "Settings",
            subtitle: "Theme, language, accessibility, and privacy preferences.",
            appearance: "Appearance",
            theme: "Theme",
            dark: "Dark",
            light: "Light",

            language: "Language",
            appLanguage: "App language",
            english: "English",
            french: "French",
            languageHelp: "Changes the app language for translated UI text.",

            accessibility: "Accessibility",
            reduceMotion: "Reduce motion",
            reduceMotionDesc: "Minimize non-essential animations and transitions.",
            highContrast: "High contrast",
            highContrastDesc: "Increase contrast for borders and text.",
            largerText: "Larger text",
            largerTextDesc: "Increase base font size for readability.",

            privacy: "Privacy",
            analyticsOptOut: "Opt out of analytics",
            analyticsOptOutDesc: "Disable non-essential tracking/telemetry (best effort).",
            respectDnt: "Respect “Do Not Track”",
            respectDntDesc: "If your browser sends DNT=1, don’t load optional trackers.",
            privacyTip:
              "Tip: use these toggles to decide whether you load optional scripts/services.",

            privacySummary: {
              analyticsOff: "Analytics disabled",
              analyticsOn: "Analytics enabled",
              dntOn: "DNT respected (best effort)",
              dntOff: "DNT ignored",
            },
          },

          market: {
            title: "Market",
            subtitle: "Live widgets that auto-refresh",
          },

          news: {
            title: "News",
            subtitle: "Headlines + Canada economic events.",
            economicCalendar: "Economic Calendar (CA)",
            topStories: "Top stories",
          },
        },
      },

      fr: {
        translation: {
          common: {
            on: "Activé",
            off: "Désactivé",
          },

          nav: {
            chatbot: "ChatBot",
            dashboard: "Tableau de bord",
            news: "Actualités",
            watchlist: "Liste de suivi",
            markets: "Marchés",
            settings: "Paramètres",
            logout: "Déconnexion",
            login: "Connexion",
          },

          footer: {
            tagline:
              "Outils de finance comportementale alimentés par l’IA pour le trader moderne. Détectez les biais, gérez le risque et tradez plus intelligemment.",
            product: "Produit",
            company: "Entreprise",
            support: "Support",
            biasDetector: "IA détecteur de biais",
            watchlist: "Liste de suivi en temps réel",
            pricing: "Tarifs",
            allFeatures: "Toutes les fonctionnalités",
            about: "À propos",
            careers: "Carrières",
            blog: "Blog",
            contact: "Contact",
            faq: "FAQ",
            privacyPolicy: "Politique de confidentialité",
            terms: "Conditions d’utilisation",
            rights: "MarketPulse Inc. Tous droits réservés.",
            challengeLine: "Créé pour le National Bank Bias Detector Challenge.",
          },

          settings: {
            title: "Paramètres",
            subtitle: "Thème, langue, accessibilité et confidentialité.",
            appearance: "Apparence",
            theme: "Thème",
            dark: "Sombre",
            light: "Clair",

            language: "Langue",
            appLanguage: "Langue de l’application",
            english: "Anglais",
            french: "Français",
            languageHelp:
              "Change la langue de l’application pour le texte traduit de l’interface.",

            accessibility: "Accessibilité",
            reduceMotion: "Réduire les animations",
            reduceMotionDesc: "Réduire les animations et transitions non essentielles.",
            highContrast: "Contraste élevé",
            highContrastDesc: "Augmenter le contraste du texte et des bordures.",
            largerText: "Texte plus grand",
            largerTextDesc: "Augmenter la taille du texte pour la lisibilité.",

            privacy: "Confidentialité",
            analyticsOptOut: "Désactiver l’analytique",
            analyticsOptOutDesc: "Désactiver le suivi non essentiel (au mieux).",
            respectDnt: "Respecter « Do Not Track »",
            respectDntDesc:
              "Si le navigateur envoie DNT=1, ne pas charger les traqueurs optionnels.",
            privacyTip:
              "Astuce : utilisez ces options pour décider si vous chargez des scripts/services optionnels.",

            privacySummary: {
              analyticsOff: "Analytique désactivée",
              analyticsOn: "Analytique activée",
              dntOn: "DNT respecté (au mieux)",
              dntOff: "DNT ignoré",
            },
          },

          market: {
            title: "Marchés",
            subtitle: "Widgets en direct qui se rafraîchissent automatiquement",
          },

          news: {
            title: "Actualités",
            subtitle: "Titres + événements économiques au Canada.",
            economicCalendar: "Calendrier économique (CA)",
            topStories: "À la une",
          },
        },
      },
    },

    lng: initialLng,
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  // Persist user choice
  localStorage.setItem("lng", lng);
});

export default i18n;

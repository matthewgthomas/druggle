import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      placeholder: "Country, territory...",
      guess: "Guess",
      share: "Share",
      showOnGoogleMaps: "👀 on Google Maps",
      welldone: "Well done!",
      unknownCountry: "Unknown country!",
      copy: "Copied results to clipboard",
      settings: {
        title: "Settings",
        distanceUnit: "Unit of distance",
        theme: "Theme",
      },
      tips: {
        close: "Close tip",
        gotIt: "Got it!",
        summary: {
          comparison:
            "{{country}} is {{similarity}} to today's target across criminal markets, criminal actors and resilience.",
          unavailable:
            "We can't compare criminal markets, criminal actors and resilience for {{country}} because OC indicator data is unavailable.",
        },
        line: {
          comparison:
            "{{pillar}}: {{similarity}} ({{guessed}} vs {{target}}). Your guess is {{direction}}.",
        },
        pillars: {
          markets: "Criminal markets",
          actors: "Criminal actors",
          resilience: "Resilience",
        },
        similarity: {
          verySimilar: "very similar",
          somewhatSimilar: "somewhat similar",
          quiteDifferent: "quite different",
        },
        direction: {
          higher: "higher",
          lower: "lower",
          aboutSame: "about the same",
          moreResilient: "more resilient",
          lessResilient: "less resilient",
          similarlyResilient: "similarly resilient",
        },
      },
      buyMeACoffee: "Buy me a ☕!",
    },
  },
  fr: {
    translation: {
      placeholder: "Pays, territoires...",
      guess: "Deviner",
      share: "Partager",
      showOnGoogleMaps: "👀 sur Google Maps",
      welldone: "Bien joué !",
      unknownCountry: "Pays inconnu !",
      copy: "Résultat copié !",
      settings: {
        title: "Paramètres",
        distanceUnit: "Unité de distance",
        theme: "Thème",
      },
      tips: {
        close: "Fermer l'astuce",
        gotIt: "Compris !",
        summary: {
          comparison:
            "{{country}} est {{similarity}} de la cible du jour sur les marchés criminels, les acteurs criminels et la résilience.",
          unavailable:
            "Impossible de comparer les marchés criminels, les acteurs criminels et la résilience pour {{country}}, faute de données OC.",
        },
        line: {
          comparison:
            "{{pillar}} : {{similarity}} ({{guessed}} vs {{target}}). Votre essai est {{direction}}.",
        },
        pillars: {
          markets: "Marchés criminels",
          actors: "Acteurs criminels",
          resilience: "Résilience",
        },
        similarity: {
          verySimilar: "très similaire",
          somewhatSimilar: "assez similaire",
          quiteDifferent: "assez différent",
        },
        direction: {
          higher: "plus élevé",
          lower: "plus faible",
          aboutSame: "presque identique",
          moreResilient: "plus résilient",
          lessResilient: "moins résilient",
          similarlyResilient: "aussi résilient",
        },
      },
      buyMeACoffee: "Offrez moi un ☕ !",
    },
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

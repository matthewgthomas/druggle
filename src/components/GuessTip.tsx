import React from "react";
import { useTranslation } from "react-i18next";
import { countries, getCountryName } from "../domain/countries";
import { OcTipData, OcTipDirection, OcTipSimilarity } from "../domain/ocTip";

interface GuessTipProps {
  tipData: OcTipData;
  onClose: () => void;
}

const SIMILARITY_I18N_KEYS: Record<OcTipSimilarity, string> = {
  very_similar: "tips.similarity.verySimilar",
  somewhat_similar: "tips.similarity.somewhatSimilar",
  quite_different: "tips.similarity.quiteDifferent",
};

const DIRECTION_I18N_KEYS: Record<OcTipDirection, string> = {
  higher: "tips.direction.higher",
  lower: "tips.direction.lower",
  about_same: "tips.direction.aboutSame",
  more_resilient: "tips.direction.moreResilient",
  less_resilient: "tips.direction.lessResilient",
  similarly_resilient: "tips.direction.similarlyResilient",
};

function getLocalizedCountryName(code: string, language: string): string {
  const country = countries.find((candidate) => candidate.code === code);

  if (country == null) {
    return code;
  }

  return getCountryName(language, country);
}

export function GuessTip({ tipData, onClose }: GuessTipProps) {
  const { t, i18n } = useTranslation();
  const guessedCountryName = getLocalizedCountryName(
    tipData.guessedCode,
    i18n.resolvedLanguage
  );

  return (
    <div
      className="my-2 rounded border border-amber-300 bg-amber-50 p-3 text-slate-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-slate-100"
      data-testid="guess-tip"
    >
      <div className="flex items-start gap-2">
        <div className="text-xl leading-none" aria-hidden>
          💡
        </div>
        <div className="flex-1 font-semibold text-sm">
          {tipData.mode === "comparison"
            ? t("tips.summary.comparison", {
                country: guessedCountryName,
                similarity: t(SIMILARITY_I18N_KEYS[tipData.overallSimilarity]),
              })
            : t("tips.summary.unavailable", { country: guessedCountryName })}
        </div>
        <button
          aria-label={t("tips.close")}
          className="text-lg leading-none text-amber-800 dark:text-amber-300"
          data-testid="guess-tip-close"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </div>

      {tipData.mode === "comparison" ? (
        <ul className="mt-3 space-y-2 text-sm" data-testid="guess-tip-lines">
          {tipData.comparisons.map((comparison) => (
            <li key={comparison.pillar}>
              {t("tips.line.comparison", {
                pillar: t(`tips.pillars.${comparison.pillar}`),
                similarity: t(SIMILARITY_I18N_KEYS[comparison.similarity]),
                guessed: comparison.guessedMean.toFixed(1),
                target: comparison.targetMean.toFixed(1),
                direction: t(DIRECTION_I18N_KEYS[comparison.direction]),
              })}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-600 active:bg-blue-800"
          data-testid="guess-tip-got-it"
          onClick={onClose}
          type="button"
        >
          {t("tips.gotIt")}
        </button>
      </div>
    </div>
  );
}

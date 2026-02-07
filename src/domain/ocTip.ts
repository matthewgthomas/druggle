import { getCountryOcSeries, OcPillar } from "./ocIndicators";

const PILLARS: OcPillar[] = ["markets", "actors", "resilience"];
const SAME_DIRECTION_THRESHOLD = 0.1;

export type OcTipSimilarity =
  | "very_similar"
  | "somewhat_similar"
  | "quite_different";

export type OcTipDirection =
  | "higher"
  | "lower"
  | "about_same"
  | "more_resilient"
  | "less_resilient"
  | "similarly_resilient";

export interface OcTipPillarComparison {
  pillar: OcPillar;
  guessedMean: number;
  targetMean: number;
  diff: number;
  similarity: OcTipSimilarity;
  direction: OcTipDirection;
}

export type OcTipData =
  | {
      mode: "comparison";
      guessedCode: string;
      targetCode: string;
      overallDiff: number;
      overallSimilarity: OcTipSimilarity;
      comparisons: OcTipPillarComparison[];
    }
  | {
      mode: "unavailable";
      guessedCode: string;
      targetCode: string;
    };

function computeMean(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getPillarDirection(
  pillar: OcPillar,
  guessedMean: number,
  targetMean: number
): OcTipDirection {
  const diff = guessedMean - targetMean;

  if (Math.abs(diff) <= SAME_DIRECTION_THRESHOLD) {
    return pillar === "resilience" ? "similarly_resilient" : "about_same";
  }

  if (pillar === "resilience") {
    return diff > 0 ? "more_resilient" : "less_resilient";
  }

  return diff > 0 ? "higher" : "lower";
}

export function getOcTipSimilarity(diff: number): OcTipSimilarity {
  if (diff <= 0.75) {
    return "very_similar";
  }

  if (diff <= 1.75) {
    return "somewhat_similar";
  }

  return "quite_different";
}

export function buildOcTipData(
  guessedCode: string,
  targetCode: string
): OcTipData {
  const normalizedGuessedCode = guessedCode.toUpperCase();
  const normalizedTargetCode = targetCode.toUpperCase();

  const guessedSeries = getCountryOcSeries(normalizedGuessedCode);

  if (guessedSeries.length === 0) {
    return {
      mode: "unavailable",
      guessedCode: normalizedGuessedCode,
      targetCode: normalizedTargetCode,
    };
  }

  const targetSeries = getCountryOcSeries(normalizedTargetCode);

  if (targetSeries.length === 0) {
    return {
      mode: "unavailable",
      guessedCode: normalizedGuessedCode,
      targetCode: normalizedTargetCode,
    };
  }

  const comparisons = PILLARS.flatMap((pillar) => {
    const guessedMean = computeMean(
      guessedSeries
        .filter((entry) => entry.pillar === pillar)
        .map((entry) => entry.value)
    );
    const targetMean = computeMean(
      targetSeries
        .filter((entry) => entry.pillar === pillar)
        .map((entry) => entry.value)
    );

    if (guessedMean == null || targetMean == null) {
      return [];
    }

    const diff = Math.abs(guessedMean - targetMean);

    return [
      {
        pillar,
        guessedMean,
        targetMean,
        diff,
        similarity: getOcTipSimilarity(diff),
        direction: getPillarDirection(pillar, guessedMean, targetMean),
      },
    ];
  });

  if (comparisons.length !== PILLARS.length) {
    return {
      mode: "unavailable",
      guessedCode: normalizedGuessedCode,
      targetCode: normalizedTargetCode,
    };
  }

  const overallDiff =
    comparisons.reduce((sum, comparison) => sum + comparison.diff, 0) /
    PILLARS.length;

  return {
    mode: "comparison",
    guessedCode: normalizedGuessedCode,
    targetCode: normalizedTargetCode,
    overallDiff,
    overallSimilarity: getOcTipSimilarity(overallDiff),
    comparisons,
  };
}

import ocIndicatorsData from "../data/oc_indicators.json";

export type OcPillar = "markets" | "actors" | "resilience";

export interface OcIndicatorMeta {
  id: string;
  label: string;
  pillar: OcPillar;
}

export interface OcSeriesRow extends OcIndicatorMeta {
  value: number;
}

interface OcIndicatorsDataset {
  version: string;
  indicators: OcIndicatorMeta[];
  countries: Record<string, Array<number | null>>;
}

const dataset = ocIndicatorsData as OcIndicatorsDataset;

export const indicatorMeta = dataset.indicators;
export const ocCountryCodes = new Set(Object.keys(dataset.countries));
const PILLAR_ORDER: OcPillar[] = ["markets", "actors", "resilience"];

export function getCountryOcSeries(code: string): OcSeriesRow[] {
  const values = dataset.countries[code.toUpperCase()];

  if (values == null || values.length !== indicatorMeta.length) {
    return [];
  }

  return indicatorMeta.flatMap((indicator, index) => {
    const value = values[index];

    if (!Number.isFinite(value)) {
      return [];
    }

    return [{ ...indicator, value: Number(value) }];
  });
}

export function getCountryOcPillarAverages(
  code: string
): Record<OcPillar, number> | null {
  const series = getCountryOcSeries(code);

  if (series.length === 0) {
    return null;
  }

  const sums: Record<OcPillar, number> = {
    markets: 0,
    actors: 0,
    resilience: 0,
  };
  const counts: Record<OcPillar, number> = {
    markets: 0,
    actors: 0,
    resilience: 0,
  };

  for (const row of series) {
    sums[row.pillar] += row.value;
    counts[row.pillar] += 1;
  }

  if (PILLAR_ORDER.some((pillar) => counts[pillar] === 0)) {
    return null;
  }

  return {
    markets: sums.markets / counts.markets,
    actors: sums.actors / counts.actors,
    resilience: sums.resilience / counts.resilience,
  };
}

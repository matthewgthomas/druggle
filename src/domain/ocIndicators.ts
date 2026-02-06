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

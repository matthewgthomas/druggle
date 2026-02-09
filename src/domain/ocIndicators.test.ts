import {
  getCountryOcPillarAverages,
  getCountryOcSeries,
  indicatorMeta,
  ocCountryCodes,
} from "./ocIndicators";

describe("ocIndicators", () => {
  it("contains 32 indicator definitions", () => {
    expect(indicatorMeta).toHaveLength(32);
  });

  it("returns valid 32-value series for every OC country", () => {
    for (const code of Array.from(ocCountryCodes)) {
      const series = getCountryOcSeries(code);

      expect(series).toHaveLength(32);

      for (const row of series) {
        expect(row.value).toBeGreaterThanOrEqual(1);
        expect(row.value).toBeLessThanOrEqual(10);
      }
    }
  });

  it("returns an empty series for unknown codes", () => {
    expect(getCountryOcSeries("XX")).toEqual([]);
  });

  it("returns per-pillar average scores for known countries", () => {
    const averages = getCountryOcPillarAverages("US");

    expect(averages).not.toBeNull();
    expect(averages?.markets).toBeCloseTo(6.1333, 4);
    expect(averages?.actors).toBeCloseTo(5.6, 4);
    expect(averages?.resilience).toBeCloseTo(6.9583, 4);
  });

  it("returns null averages for unknown codes", () => {
    expect(getCountryOcPillarAverages("XX")).toBeNull();
  });
});

import {
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
});

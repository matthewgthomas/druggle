import { buildOcTipData, getOcTipSimilarity } from "./ocTip";

describe("ocTip", () => {
  it("builds three pillar comparisons for valid countries", () => {
    const tipData = buildOcTipData("US", "CA");

    expect(tipData.mode).toBe("comparison");

    if (tipData.mode !== "comparison") {
      return;
    }

    expect(tipData.comparisons).toHaveLength(3);
    expect(tipData.comparisons.map((comparison) => comparison.pillar)).toEqual([
      "markets",
      "actors",
      "resilience",
    ]);
  });

  it("classifies similarity bins using the configured thresholds", () => {
    expect(getOcTipSimilarity(0.75)).toBe("very_similar");
    expect(getOcTipSimilarity(0.76)).toBe("somewhat_similar");
    expect(getOcTipSimilarity(1.75)).toBe("somewhat_similar");
    expect(getOcTipSimilarity(1.76)).toBe("quite_different");
  });

  it("returns fallback mode when guessed country has no OC data", () => {
    const tipData = buildOcTipData("XX", "US");

    expect(tipData).toEqual({
      mode: "unavailable",
      guessedCode: "XX",
      targetCode: "US",
    });
  });
});

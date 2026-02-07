import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { GuessTip } from "./GuessTip";
import { OcTipData } from "../domain/ocTip";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
      const dictionary: Record<string, string> = {
        "tips.close": "Close tip",
        "tips.gotIt": "Got it!",
        "tips.summary.comparison":
          "{{country}} is {{similarity}} to today's target across criminal markets, criminal actors and resilience.",
        "tips.summary.unavailable":
          "We can't compare criminal markets, criminal actors and resilience for {{country}} because OC indicator data is unavailable.",
        "tips.line.comparison":
          "{{pillar}}: {{similarity}} ({{guessed}} vs {{target}}). Your guess is {{direction}}.",
        "tips.pillars.markets": "Criminal markets",
        "tips.pillars.actors": "Criminal actors",
        "tips.pillars.resilience": "Resilience",
        "tips.similarity.verySimilar": "very similar",
        "tips.similarity.somewhatSimilar": "somewhat similar",
        "tips.similarity.quiteDifferent": "quite different",
        "tips.direction.higher": "higher",
        "tips.direction.lower": "lower",
        "tips.direction.aboutSame": "about the same",
        "tips.direction.moreResilient": "more resilient",
        "tips.direction.lessResilient": "less resilient",
        "tips.direction.similarlyResilient": "similarly resilient",
      };
      return (dictionary[key] ?? key).replace(
        /\{\{(\w+)\}\}/g,
        (_match: string, interpolationKey: string) => {
          const value = options?.[interpolationKey];
          return value == null ? "" : String(value);
        }
      );
    },
  }),
}));

describe("GuessTip", () => {
  it("renders three pillar comparison lines with one-decimal scores", () => {
    const tipData: OcTipData = {
      mode: "comparison",
      guessedCode: "US",
      targetCode: "CA",
      overallDiff: 1.2,
      overallSimilarity: "somewhat_similar",
      comparisons: [
        {
          pillar: "markets",
          guessedMean: 6.32,
          targetMean: 4.94,
          diff: 1.38,
          similarity: "somewhat_similar",
          direction: "higher",
        },
        {
          pillar: "actors",
          guessedMean: 5.01,
          targetMean: 4.97,
          diff: 0.04,
          similarity: "very_similar",
          direction: "about_same",
        },
        {
          pillar: "resilience",
          guessedMean: 7.55,
          targetMean: 6.3,
          diff: 1.25,
          similarity: "somewhat_similar",
          direction: "more_resilient",
        },
      ],
    };

    render(<GuessTip tipData={tipData} onClose={jest.fn()} />);

    expect(screen.getByTestId("guess-tip-lines").children).toHaveLength(3);
    expect(screen.getByText(/Criminal markets:/)).toBeInTheDocument();
    expect(screen.getByText(/6.3 vs 4.9/)).toBeInTheDocument();
    expect(screen.getByText(/5.0 vs 5.0/)).toBeInTheDocument();
    expect(screen.getByText(/7.5 vs 6.3/)).toBeInTheDocument();
  });

  it("renders fallback message when comparison data is unavailable", () => {
    const tipData: OcTipData = {
      mode: "unavailable",
      guessedCode: "XX",
      targetCode: "US",
    };

    render(<GuessTip tipData={tipData} onClose={jest.fn()} />);

    expect(
      screen.getByText(
        "We can't compare criminal markets, criminal actors and resilience for XX because OC indicator data is unavailable."
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId("guess-tip-lines")).not.toBeInTheDocument();
  });

  it("calls onClose from the close icon and the Got it button", () => {
    const onClose = jest.fn();
    const tipData: OcTipData = {
      mode: "unavailable",
      guessedCode: "XX",
      targetCode: "US",
    };

    render(<GuessTip tipData={tipData} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("guess-tip-close"));
    fireEvent.click(screen.getByTestId("guess-tip-got-it"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

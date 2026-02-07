import React from "react";
import { render, screen } from "@testing-library/react";
import { useGuesses } from "./useGuesses";

interface GuessesProbeProps {
  dayString: string;
}

function GuessesProbe({ dayString }: GuessesProbeProps) {
  const [guesses] = useGuesses(dayString);
  return (
    <div data-testid="guesses-list">
      {guesses.map((guess) => guess.name).join(",")}
    </div>
  );
}

describe("useGuesses", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads guesses for the active day and switches when the day changes", () => {
    localStorage.setItem(
      "guesses",
      JSON.stringify({
        "2026-02-07": [{ name: "Chile", distance: 1000, direction: "N" }],
        "2026-02-08": [{ name: "Peru", distance: 500, direction: "S" }],
      })
    );

    const { rerender } = render(<GuessesProbe dayString="2026-02-07" />);
    expect(screen.getByTestId("guesses-list")).toHaveTextContent("Chile");

    rerender(<GuessesProbe dayString="2026-02-08" />);
    expect(screen.getByTestId("guesses-list")).toHaveTextContent("Peru");
    expect(screen.getByTestId("guesses-list")).not.toHaveTextContent("Chile");
  });

  it("returns empty guesses for a day without stored entries", () => {
    localStorage.setItem(
      "guesses",
      JSON.stringify({
        "2026-02-07": [{ name: "Chile", distance: 1000, direction: "N" }],
      })
    );

    render(<GuessesProbe dayString="2026-02-08" />);
    expect(screen.getByTestId("guesses-list")).toBeEmptyDOMElement();
  });
});

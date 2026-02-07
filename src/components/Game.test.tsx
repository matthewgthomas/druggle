import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Game } from "./Game";
import { SettingsData } from "../hooks/useSettings";

const mockUseUtcDayString = jest.fn();

jest.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ReferenceDot: () => null,
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "en" },
  }),
}));

jest.mock("../hooks/useCountry", () => ({
  useCountry: () => ({
    code: "US",
    latitude: 37.09024,
    longitude: -95.712891,
    name: "United States",
  }),
}));

jest.mock("../hooks/useUtcDayString", () => ({
  useUtcDayString: () => mockUseUtcDayString(),
}));

jest.mock("./CountryInput", () => ({
  CountryInput: ({
    currentGuess,
    setCurrentGuess,
  }: {
    currentGuess: string;
    setCurrentGuess: (guess: string) => void;
  }) => (
    <input
      data-testid="country-input"
      onChange={(event) => setCurrentGuess(event.currentTarget.value)}
      value={currentGuess}
    />
  ),
}));

jest.mock("./Guesses", () => ({
  Guesses: ({ guesses }: { guesses: Array<{ name: string }> }) => (
    <div data-testid="guesses">{guesses.map((guess) => guess.name).join(",")}</div>
  ),
}));

jest.mock("./Share", () => ({
  Share: () => <div data-testid="share" />,
}));

jest.mock("./GuessTip", () => ({
  GuessTip: ({
    tipData,
    onClose,
  }: {
    tipData: { guessedCode: string; mode: string };
    onClose: () => void;
  }) => (
    <div
      data-guessed-code={tipData.guessedCode}
      data-mode={tipData.mode}
      data-testid="guess-tip"
    >
      <button data-testid="guess-tip-close" onClick={onClose} type="button">
        close
      </button>
    </div>
  ),
}));

describe("Game", () => {
  const settingsData: SettingsData = {
    distanceUnit: "km",
    theme: "light",
  };

  beforeEach(() => {
    localStorage.clear();
    mockUseUtcDayString.mockReturnValue("2026-02-07");
  });

  function submitGuess(guess: string) {
    fireEvent.change(screen.getByTestId("country-input"), {
      target: { value: guess },
    });
    fireEvent.click(screen.getByRole("button", { name: "🌍 guess" }));
  }

  it("renders the OC chart clue and no longer renders the country image", () => {
    render(<Game settingsData={settingsData} />);

    expect(screen.queryByAltText("country to guess")).not.toBeInTheDocument();
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "32"
    );
  });

  it("switches to the new day's guesses when the UTC day string changes", () => {
    localStorage.setItem(
      "guesses",
      JSON.stringify({
        "2026-02-07": [{ name: "Chile", direction: "N", distance: 10 }],
        "2026-02-08": [{ name: "Peru", direction: "S", distance: 20 }],
      })
    );

    const { rerender } = render(<Game settingsData={settingsData} />);
    expect(screen.getByTestId("guesses")).toHaveTextContent("Chile");

    mockUseUtcDayString.mockReturnValue("2026-02-08");
    rerender(<Game settingsData={settingsData} />);

    expect(screen.getByTestId("guesses")).toHaveTextContent("Peru");
    expect(screen.getByTestId("guesses")).not.toHaveTextContent("Chile");
  });

  it("shows the tip after an incorrect guess", () => {
    render(<Game settingsData={settingsData} />);

    submitGuess("Canada");

    expect(screen.getByTestId("guess-tip")).toBeInTheDocument();
    expect(screen.getByTestId("guess-tip")).toHaveAttribute(
      "data-guessed-code",
      "CA"
    );
  });

  it("rejects countries without OC data", () => {
    render(<Game settingsData={settingsData} />);

    submitGuess("Antarctica");

    expect(screen.getByTestId("guesses")).toHaveTextContent("");
    expect(screen.queryByTestId("guess-tip")).not.toBeInTheDocument();
  });

  it("does not show the tip after a correct guess", () => {
    render(<Game settingsData={settingsData} />);

    submitGuess("United States");

    expect(screen.queryByTestId("guess-tip")).not.toBeInTheDocument();
  });

  it("can dismiss the tip", () => {
    render(<Game settingsData={settingsData} />);

    submitGuess("Canada");
    fireEvent.click(screen.getByTestId("guess-tip-close"));

    expect(screen.queryByTestId("guess-tip")).not.toBeInTheDocument();
  });

  it("reopens tip with updated content after a new incorrect guess", () => {
    render(<Game settingsData={settingsData} />);

    submitGuess("Canada");
    fireEvent.click(screen.getByTestId("guess-tip-close"));
    expect(screen.queryByTestId("guess-tip")).not.toBeInTheDocument();

    submitGuess("France");

    expect(screen.getByTestId("guess-tip")).toHaveAttribute(
      "data-guessed-code",
      "FR"
    );
  });
});

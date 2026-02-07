import React from "react";
import { render, screen } from "@testing-library/react";
import { Game } from "./Game";
import { SettingsData } from "../hooks/useSettings";

jest.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Cell: ({ className }: { className?: string }) => (
    <div className={className} />
  ),
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Scatter: ({ children }: { children?: React.ReactNode }) => (
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

jest.mock("../hooks/useGuesses", () => ({
  useGuesses: () => [[], jest.fn()],
}));

jest.mock("./CountryInput", () => ({
  CountryInput: () => <input data-testid="country-input" />,
}));

jest.mock("./Guesses", () => ({
  Guesses: () => <div data-testid="guesses" />,
}));

jest.mock("./Share", () => ({
  Share: () => <div data-testid="share" />,
}));

describe("Game", () => {
  const settingsData: SettingsData = {
    distanceUnit: "km",
    theme: "light",
  };

  it("renders the OC chart clue and no longer renders the country image", () => {
    render(<Game settingsData={settingsData} />);

    expect(screen.queryByAltText("country to guess")).not.toBeInTheDocument();
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "32"
    );
  });
});

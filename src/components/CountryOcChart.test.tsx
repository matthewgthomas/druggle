import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CountryOcChart } from "./CountryOcChart";

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

describe("CountryOcChart", () => {
  it("renders all pillar buttons and defaults to criminal markets", () => {
    render(<CountryOcChart countryCode="US" />);

    expect(
      screen.getByRole("button", { name: "Criminal markets" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Criminal actors" })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Resilience" })
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "15"
    );
  });

  it("switches chart data when selecting each pillar", () => {
    render(<CountryOcChart countryCode="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Criminal actors" }));
    expect(
      screen.getByRole("button", { name: "Criminal actors" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "5"
    );

    fireEvent.click(screen.getByRole("button", { name: "Resilience" }));
    expect(screen.getByRole("button", { name: "Resilience" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "12"
    );
  });

  it("shows resilience-specific legend labels and reversed colors", () => {
    render(<CountryOcChart countryCode="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Resilience" }));

    expect(
      screen.getByText("Non-existent or extremely ineffective (1-3)")
    ).toBeInTheDocument();
    expect(screen.getByText("Moderately effective (4-5)")).toBeInTheDocument();
    expect(screen.getByText("Sufficiently effective (6-7)")).toBeInTheDocument();
    expect(screen.getByText("Highly effective (8-10)")).toBeInTheDocument();

    expect(screen.getByTestId("oc-legend-swatch-little")).toHaveAttribute(
      "data-color",
      "#7b3294"
    );
    expect(screen.getByTestId("oc-legend-swatch-moderate")).toHaveAttribute(
      "data-color",
      "#c2a5cf"
    );
    expect(screen.getByTestId("oc-legend-swatch-significant")).toHaveAttribute(
      "data-color",
      "#a6dba0"
    );
    expect(screen.getByTestId("oc-legend-swatch-severe")).toHaveAttribute(
      "data-color",
      "#008837"
    );
  });
});

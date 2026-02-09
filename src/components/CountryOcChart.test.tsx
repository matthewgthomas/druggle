import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CountryOcChart } from "./CountryOcChart";

jest.mock("recharts", () => ({
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CartesianGrid: () => null,
  Cell: ({ fill }: { fill?: string }) => (
    <div data-fill={fill} data-testid="oc-overview-bar-cell" />
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LabelList: () => null,
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
  it("defaults to overview and renders all chart tabs", () => {
    render(<CountryOcChart countryCode="US" />);

    expect(screen.getByRole("button", { name: "Overview" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "Criminal markets" })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Criminal actors" })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Resilience" })
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-chart-view",
      "overview"
    );
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "3"
    );
  });

  it("switches chart data when selecting each detailed pillar", () => {
    render(<CountryOcChart countryCode="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Criminal markets" }));
    expect(
      screen.getByRole("button", { name: "Criminal markets" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-chart-view",
      "markets"
    );
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "15"
    );

    fireEvent.click(screen.getByRole("button", { name: "Criminal actors" }));
    expect(
      screen.getByRole("button", { name: "Criminal actors" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-chart-view",
      "actors"
    );
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
      "data-chart-view",
      "resilience"
    );
    expect(screen.getByTestId("oc-chart")).toHaveAttribute(
      "data-series-count",
      "12"
    );
  });

  it("shows semantic guidance in the overview legend", () => {
    render(<CountryOcChart countryCode="US" />);

    expect(screen.getByText("Criminality (higher = worse)")).toBeInTheDocument();
    expect(screen.getByText("Resilience (higher = better)")).toBeInTheDocument();
  });

  it("renders overview rows with score dots and global-average markers", () => {
    render(<CountryOcChart countryCode="US" />);

    expect(screen.getByTestId("oc-overview-row-markets")).toBeInTheDocument();
    expect(screen.getByTestId("oc-overview-row-actors")).toBeInTheDocument();
    expect(screen.getByTestId("oc-overview-row-resilience")).toBeInTheDocument();

    expect(screen.getByTestId("oc-overview-dot-markets")).toBeInTheDocument();
    expect(screen.getByTestId("oc-overview-dot-actors")).toBeInTheDocument();
    expect(screen.getByTestId("oc-overview-dot-resilience")).toBeInTheDocument();

    expect(
      screen.getByTestId("oc-overview-global-marker-markets")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("oc-overview-global-marker-actors")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("oc-overview-global-marker-resilience")
    ).toBeInTheDocument();
  });

  it("shows signed delta badges with arrows in overview rows", () => {
    render(<CountryOcChart countryCode="US" />);

    expect(screen.getByTestId("oc-overview-delta-markets")).toHaveTextContent(
      /^[↑↓→]\s[+-]\d+\.\d$/
    );
    expect(screen.getByTestId("oc-overview-delta-actors")).toHaveTextContent(
      /^[↑↓→]\s[+-]\d+\.\d$/
    );
    expect(screen.getByTestId("oc-overview-delta-resilience")).toHaveTextContent(
      /^[↑↓→]\s[+-]\d+\.\d$/
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

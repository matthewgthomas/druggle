import React from "react";
import {
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getCountryOcPillarAverages,
  getGlobalOcPillarAverages,
  getCountryOcSeries,
  OcPillar,
} from "../domain/ocIndicators";

interface CountryOcChartProps {
  countryCode: string;
}

type InfluenceBand = "little" | "moderate" | "significant" | "severe";
type ChartView = "overview" | OcPillar;
type OverviewDirection = "higher-worse" | "higher-better";

const MIDPOINT = 5.5;
const STEM_WIDTH = 4;
const DOT_RADIUS = 4.5;
const Y_AXIS_WIDTH = 100;
const Y_AXIS_MAX_CHARS_PER_LINE = 20;
const SECTION_ROW_HEIGHT = 27;
const SECTION_MIN_HEIGHT = 210;
const SECTION_CHART_TOP_MARGIN = 16;
const OVERVIEW_PURPLE_LOW = "#f2f0f7";
const OVERVIEW_PURPLE_HIGH = "#40004b";
const OVERVIEW_GREEN_LOW = "#f7fcf5";
const OVERVIEW_GREEN_HIGH = "#00441b";

const MARKET_AND_ACTOR_BAND_COLORS: Record<InfluenceBand, string> = {
  little: "#008837",
  moderate: "#a6dba0",
  significant: "#c2a5cf",
  severe: "#7b3294",
};

const MARKET_AND_ACTOR_BAND_LABELS: Record<InfluenceBand, string> = {
  little: "Non-existent or little influence (1-3)",
  moderate: "Moderate influence (4-5)",
  significant: "Significant influence (6-7)",
  severe: "Severe influence (8-10)",
};

const RESILIENCE_BAND_COLORS: Record<InfluenceBand, string> = {
  little: "#7b3294",
  moderate: "#c2a5cf",
  significant: "#a6dba0",
  severe: "#008837",
};

const RESILIENCE_BAND_LABELS: Record<InfluenceBand, string> = {
  little: "Non-existent or extremely ineffective (1-3)",
  moderate: "Moderately effective (4-5)",
  significant: "Sufficiently effective (6-7)",
  severe: "Highly effective (8-10)",
};

const BAND_ORDER: InfluenceBand[] = [
  "little",
  "moderate",
  "significant",
  "severe",
];

const SECTION_ORDER: OcPillar[] = ["markets", "actors", "resilience"];

const SECTION_LABELS: Record<OcPillar, string> = {
  markets: "Criminal markets",
  actors: "Criminal actors",
  resilience: "Resilience",
};
const OVERVIEW_LABEL = "Overview";

interface YAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value?: number | string;
  };
}

interface OverviewRow {
  direction: OverviewDirection;
  delta: number;
  globalAverage: number;
  label: string;
  pillar: OcPillar;
  value: number;
}

function getBandColorsByPillar(
  pillar: OcPillar
): Record<InfluenceBand, string> {
  return pillar === "resilience"
    ? RESILIENCE_BAND_COLORS
    : MARKET_AND_ACTOR_BAND_COLORS;
}

function getBandLabelsByPillar(
  pillar: OcPillar
): Record<InfluenceBand, string> {
  return pillar === "resilience"
    ? RESILIENCE_BAND_LABELS
    : MARKET_AND_ACTOR_BAND_LABELS;
}

function getInfluenceBand(value: number): InfluenceBand {
  if (value < 4) {
    return "little";
  }

  if (value < 6) {
    return "moderate";
  }

  if (value < 8) {
    return "significant";
  }

  return "severe";
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function hexToRgb(hex: string): [number, number, number] {
  const normalizedHex = hex.startsWith("#") ? hex.slice(1) : hex;

  return [
    Number.parseInt(normalizedHex.slice(0, 2), 16),
    Number.parseInt(normalizedHex.slice(2, 4), 16),
    Number.parseInt(normalizedHex.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    Math.round(value).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateHexColor(
  lowHex: string,
  highHex: string,
  t: number
): string {
  const [lowR, lowG, lowB] = hexToRgb(lowHex);
  const [highR, highG, highB] = hexToRgb(highHex);

  return rgbToHex(
    lowR + (highR - lowR) * t,
    lowG + (highG - lowG) * t,
    lowB + (highB - lowB) * t
  );
}

function getOverviewBarColor(pillar: OcPillar, value: number): string {
  const ratio = clampScore(value) / 10;

  return pillar === "resilience"
    ? interpolateHexColor(OVERVIEW_GREEN_LOW, OVERVIEW_GREEN_HIGH, ratio)
    : interpolateHexColor(OVERVIEW_PURPLE_LOW, OVERVIEW_PURPLE_HIGH, ratio);
}

function getRailPositionPercent(value: number): string {
  return `${(clampScore(value) / 10) * 100}%`;
}

function normalizeDelta(delta: number): number {
  const rounded = Math.round(delta * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function getDeltaArrow(delta: number): string {
  const normalizedDelta = normalizeDelta(delta);

  if (normalizedDelta > 0) {
    return "↑";
  }

  if (normalizedDelta < 0) {
    return "↓";
  }

  return "→";
}

function formatSignedDelta(delta: number): string {
  const normalizedDelta = normalizeDelta(delta);
  const sign = normalizedDelta >= 0 ? "+" : "";

  return `${sign}${normalizedDelta.toFixed(1)}`;
}

function formatScoreValue(value: unknown): string {
  if (typeof value === "number") {
    return value.toFixed(1);
  }

  if (Array.isArray(value) && typeof value[0] === "number") {
    return value[0].toFixed(1);
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue.toFixed(1) : String(value);
}

function truncateWithEllipsis(text: string, maxCharsPerLine: number): string {
  if (text.length <= maxCharsPerLine) {
    return text;
  }

  if (maxCharsPerLine <= 3) {
    return ".".repeat(Math.max(1, maxCharsPerLine));
  }

  return `${text.slice(0, maxCharsPerLine - 3).trimEnd()}...`;
}

function wrapLabelToTwoLines(
  text: string,
  maxCharsPerLine: number
): [string, string?] {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxCharsPerLine) {
    return [normalized];
  }

  const candidate = normalized.slice(0, maxCharsPerLine + 1);
  const lastSpaceIndex = candidate.lastIndexOf(" ");
  const splitIndex = lastSpaceIndex > 0 ? lastSpaceIndex : maxCharsPerLine;

  const firstLine = normalized.slice(0, splitIndex).trimEnd();
  const remaining = normalized.slice(splitIndex).trimStart();

  return [firstLine, truncateWithEllipsis(remaining, maxCharsPerLine)];
}

function renderYAxisTick(props: unknown) {
  const { x, y, payload } = props as YAxisTickProps;

  if (x == null || y == null || payload == null) {
    return <></>;
  }

  const [firstLine, secondLine] = wrapLabelToTwoLines(
    String(payload.value ?? ""),
    Y_AXIS_MAX_CHARS_PER_LINE
  );

  if (secondLine == null) {
    return (
      <text x={x} y={y} dy={3} fill="#5f5f5f" fontSize={10} textAnchor="end">
        {firstLine}
      </text>
    );
  }

  return (
    <text x={x} y={y} fill="#5f5f5f" fontSize={10} textAnchor="end">
      <tspan x={x} dy={-5}>
        {firstLine}
      </tspan>
      <tspan x={x} dy={11}>
        {secondLine}
      </tspan>
    </text>
  );
}

export function CountryOcChart({ countryCode }: CountryOcChartProps) {
  const [activeView, setActiveView] = React.useState<ChartView>("overview");
  const series = getCountryOcSeries(countryCode).map((entry) => ({
    ...entry,
    influenceBand: getInfluenceBand(entry.value),
  }));
  const averages = getCountryOcPillarAverages(countryCode);
  const sections = SECTION_ORDER.map((pillar) => ({
    pillar,
    title: SECTION_LABELS[pillar],
    rows: series.filter((entry) => entry.pillar === pillar),
  })).filter((section) => section.rows.length > 0);

  if (series.length === 0 || sections.length === 0 || averages == null) {
    return (
      <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
        No organised crime data available for this country.
      </div>
    );
  }

  const visibleView: ChartView =
    activeView === "overview" ||
    sections.some((section) => section.pillar === activeView)
      ? activeView
      : sections[0].pillar;
  const detailSection =
    visibleView === "overview"
      ? null
      : sections.find((section) => section.pillar === visibleView);
  const globalAverages = getGlobalOcPillarAverages();
  const overviewRows: OverviewRow[] = SECTION_ORDER.map((pillar) => {
    const value = averages[pillar];
    const globalAverage = globalAverages[pillar];

    return {
      delta: value - globalAverage,
      direction: pillar === "resilience" ? "higher-better" : "higher-worse",
      globalAverage,
      label: SECTION_LABELS[pillar],
      pillar,
      value,
    };
  });
  const criminalityRows = overviewRows.filter(
    (row) => row.pillar !== "resilience"
  );
  const resilienceRows = overviewRows.filter(
    (row) => row.pillar === "resilience"
  );

  if (visibleView !== "overview" && detailSection == null) {
    return (
      <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
        No organised crime data available for this country.
      </div>
    );
  }

  const renderOverviewRow = (row: OverviewRow) => {
    const normalizedDelta = normalizeDelta(row.delta);
    const isAboveAverage = normalizedDelta > 0;
    const isBelowAverage = normalizedDelta < 0;
    let deltaBadgeClass = "border-gray-200 bg-gray-50 text-gray-700";

    if (row.direction === "higher-worse") {
      if (isAboveAverage) {
        deltaBadgeClass = "border-rose-200 bg-rose-50 text-rose-800";
      } else if (isBelowAverage) {
        deltaBadgeClass = "border-emerald-200 bg-emerald-50 text-emerald-800";
      }
    } else if (isAboveAverage) {
      deltaBadgeClass = "border-emerald-200 bg-emerald-50 text-emerald-800";
    } else if (isBelowAverage) {
      deltaBadgeClass = "border-rose-200 bg-rose-50 text-rose-800";
    }

    return (
      <div
        className="mb-3 last:mb-0"
        data-testid={`oc-overview-row-${row.pillar}`}
        key={row.pillar}
      >
        <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-gray-700 dark:text-slate-200">
            {row.label}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-gray-700 dark:text-slate-100">
              {row.value.toFixed(1)}
            </span>
            <span
              className={`rounded border px-1 py-[1px] text-[10px] font-semibold ${deltaBadgeClass} dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100`}
              data-testid={`oc-overview-delta-${row.pillar}`}
            >
              {getDeltaArrow(row.delta)} {formatSignedDelta(row.delta)}
            </span>
          </span>
        </div>
        <div className="relative h-5">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gray-300 dark:bg-slate-600" />
          <div
            className="absolute top-1/2 h-4 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-slate-500 dark:bg-slate-300"
            data-testid={`oc-overview-global-marker-${row.pillar}`}
            style={{ left: getRailPositionPercent(row.globalAverage) }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm"
            data-testid={`oc-overview-dot-${row.pillar}`}
            style={{
              backgroundColor: getOverviewBarColor(row.pillar, row.value),
              left: getRailPositionPercent(row.value),
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-500 dark:text-slate-400">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
        <div className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
          Global avg: {row.globalAverage.toFixed(1)}
        </div>
      </div>
    );
  };

  let sectionChartHeight = SECTION_MIN_HEIGHT;
  let chartSeriesCount = overviewRows.length;
  let detailLegendContent: React.ReactNode = <></>;
  let detailChartContent: React.ReactElement = <></>;

  if (visibleView !== "overview") {
    const resolvedDetailSection = detailSection;

    if (resolvedDetailSection == null) {
      return (
        <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
          No organised crime data available for this country.
        </div>
      );
    }

    const activeBandColors = getBandColorsByPillar(
      resolvedDetailSection.pillar
    );
    const activeBandLabels = getBandLabelsByPillar(
      resolvedDetailSection.pillar
    );

    sectionChartHeight = Math.max(
      SECTION_MIN_HEIGHT,
      resolvedDetailSection.rows.length * SECTION_ROW_HEIGHT
    );
    chartSeriesCount = resolvedDetailSection.rows.length;

    detailLegendContent = (
      <div className="flex flex-wrap gap-3 text-xs mb-2">
        {BAND_ORDER.map((band) => (
          <span
            className="inline-flex items-center gap-1"
            data-testid={`oc-legend-item-${band}`}
            key={band}
          >
            <span
              data-color={activeBandColors[band]}
              data-testid={`oc-legend-swatch-${band}`}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeBandColors[band] }}
            />
            {activeBandLabels[band]}
          </span>
        ))}
      </div>
    );

    detailChartContent = (
      <ComposedChart
        data={resolvedDetailSection.rows}
        layout="vertical"
        margin={{
          top: SECTION_CHART_TOP_MARGIN,
          right: 16,
          left: 24,
          bottom: 8,
        }}
      >
        <XAxis type="number" domain={[0, 10]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={Y_AXIS_WIDTH}
          tick={renderYAxisTick}
          tickMargin={6}
          interval={0}
        />
        <ReferenceLine
          x={MIDPOINT}
          stroke="#6b7280"
          strokeDasharray="4 3"
          strokeWidth={2}
        />
        {resolvedDetailSection.rows.map((entry) => (
          <ReferenceLine
            ifOverflow="hidden"
            key={`stem-${resolvedDetailSection.pillar}-${entry.id}`}
            segment={[
              { x: MIDPOINT, y: entry.label },
              { x: entry.value, y: entry.label },
            ]}
            stroke={activeBandColors[entry.influenceBand]}
            strokeWidth={STEM_WIDTH}
          />
        ))}
        {resolvedDetailSection.rows.map((entry) => {
          const labelPosition: "left" | "right" =
            entry.value < MIDPOINT ? "left" : "right";

          return (
            <ReferenceDot
              ifOverflow="visible"
              key={`endpoint-${resolvedDetailSection.pillar}-${entry.id}`}
              x={entry.value}
              y={entry.label}
              r={DOT_RADIUS}
              fill={activeBandColors[entry.influenceBand]}
              stroke="#ffffff"
              strokeWidth={1}
              label={{
                value: entry.value.toFixed(1),
                position: labelPosition,
                fill: activeBandColors[entry.influenceBand],
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          );
        })}
        <Tooltip formatter={(value: unknown) => formatScoreValue(value)} />
      </ComposedChart>
    );
  }

  return (
    <div className="my-1 border border-gray-200 rounded p-2">
      <div className="text-xs font-semibold uppercase mb-2">
        Organised Crime Indicators
      </div>
      <div className="text-xs mb-2">
        Use the tabs below to explore an overview and detailed{" "}
        <a
          href="https://ocindex.net"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          influence of organised crime
        </a>{" "}
        in a randomly chosen country then guess where it is.
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <button
          aria-pressed={visibleView === "overview"}
          className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            visibleView === "overview"
              ? "border-slate-700 bg-slate-700 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
              : "border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          }`}
          onClick={() => setActiveView("overview")}
          type="button"
        >
          {OVERVIEW_LABEL}
        </button>
        {sections.map((section) => {
          const isActive = section.pillar === visibleView;

          return (
            <button
              aria-pressed={isActive}
              className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                isActive
                  ? "border-slate-700 bg-slate-700 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
                  : "border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              }`}
              key={section.pillar}
              onClick={() => setActiveView(section.pillar)}
              type="button"
            >
              {section.title}
            </button>
          );
        })}
      </div>
      {visibleView === "overview" ? null : detailLegendContent}
      <div className="max-h-72 overflow-y-auto" data-testid="oc-chart-scroll">
        <div
          data-chart-view={visibleView}
          data-series-count={chartSeriesCount}
          data-testid="oc-chart"
        >
          {visibleView === "overview" ? (
            <div className="space-y-2">
              <div className="rounded border border-gray-200 p-2 dark:border-slate-700">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">
                  Criminality (higher = worse)
                </div>
                {criminalityRows.map((row) => renderOverviewRow(row))}
                <div className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                  Lower is better →
                </div>
              </div>
              <div className="rounded border border-gray-200 p-2 dark:border-slate-700">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">
                  Resilience (higher = better)
                </div>
                {resilienceRows.map((row) => renderOverviewRow(row))}
                <div className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                  Higher is better →
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: sectionChartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                {detailChartContent}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
import { getCountryOcSeries, OcPillar } from "../domain/ocIndicators";

interface CountryOcChartProps {
  countryCode: string;
}

type InfluenceBand = "little" | "moderate" | "significant" | "severe";

const MIDPOINT = 5.5;
const STEM_WIDTH = 4;
const DOT_RADIUS = 4.5;
const Y_AXIS_WIDTH = 100;
const Y_AXIS_MAX_CHARS_PER_LINE = 20;
const SECTION_ROW_HEIGHT = 44;
const SECTION_MIN_HEIGHT = 210;

const BAND_COLORS: Record<InfluenceBand, string> = {
  little: "#6c9a82",
  moderate: "#ddc099",
  significant: "#d8a15d",
  severe: "#a8334d",
};

const BAND_LABELS: Record<InfluenceBand, string> = {
  little: "Non-existent or little influence",
  moderate: "Moderate influence",
  significant: "Significant influence",
  severe: "Severe influence",
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

interface YAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value?: number | string;
  };
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
  const series = getCountryOcSeries(countryCode).map((entry) => ({
    ...entry,
    influenceBand: getInfluenceBand(entry.value),
  }));
  const sections = SECTION_ORDER.map((pillar) => ({
    pillar,
    title: SECTION_LABELS[pillar],
    rows: series.filter((entry) => entry.pillar === pillar),
  })).filter((section) => section.rows.length > 0);

  if (series.length === 0) {
    return (
      <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
        No organized crime data available for this country.
      </div>
    );
  }

  return (
    <div className="my-1 border border-gray-200 rounded p-2">
      <div className="text-xs font-semibold uppercase mb-2">
        Organized Crime Indicators (1-10)
      </div>
      <div className="flex flex-wrap gap-3 text-xs mb-2">
        {BAND_ORDER.map((band) => (
          <span className="inline-flex items-center gap-1" key={band}>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: BAND_COLORS[band] }}
            />
            {BAND_LABELS[band]}
          </span>
        ))}
      </div>
      <div className="max-h-52 overflow-y-auto" data-testid="oc-chart-scroll">
        <div data-series-count={series.length} data-testid="oc-chart">
          {sections.map((section, index) => {
            const sectionChartHeight = Math.max(
              SECTION_MIN_HEIGHT,
              section.rows.length * SECTION_ROW_HEIGHT
            );
            const sectionClassName =
              index === sections.length - 1
                ? ""
                : "mb-4 pb-2 border-b border-gray-100";

            return (
              <div className={sectionClassName} key={section.pillar}>
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-1">
                  {section.title}
                </div>
                <div style={{ height: sectionChartHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={section.rows}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 24, bottom: 8 }}
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
                      {section.rows.map((entry) => (
                        <ReferenceLine
                          ifOverflow="hidden"
                          key={`stem-${section.pillar}-${entry.id}`}
                          segment={[
                            { x: MIDPOINT, y: entry.label },
                            { x: entry.value, y: entry.label },
                          ]}
                          stroke={BAND_COLORS[entry.influenceBand]}
                          strokeWidth={STEM_WIDTH}
                        />
                      ))}
                      {section.rows.map((entry) => {
                        const labelPosition: "left" | "right" =
                          entry.value < MIDPOINT ? "left" : "right";

                        return (
                          <ReferenceDot
                            ifOverflow="visible"
                            key={`endpoint-${section.pillar}-${entry.id}`}
                            x={entry.value}
                            y={entry.label}
                            r={DOT_RADIUS}
                            fill={BAND_COLORS[entry.influenceBand]}
                            stroke="#ffffff"
                            strokeWidth={1}
                            label={{
                              value: entry.value.toFixed(1),
                              position: labelPosition,
                              fill: BAND_COLORS[entry.influenceBand],
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          />
                        );
                      })}
                      <Tooltip
                        formatter={(value) => {
                          if (typeof value === "number") {
                            return value.toFixed(1);
                          }

                          if (
                            Array.isArray(value) &&
                            typeof value[0] === "number"
                          ) {
                            return value[0].toFixed(1);
                          }

                          const parsedValue = Number(value);
                          return Number.isFinite(parsedValue)
                            ? parsedValue.toFixed(1)
                            : String(value);
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
import { getCountryOcSeries } from "../domain/ocIndicators";

interface CountryOcChartProps {
  countryCode: string;
}

type MidpointStatus = "above" | "below" | "equal";

const MIDPOINT = 5.5;
const STEM_WIDTH = 4;
const DOT_RADIUS = 4.5;

const STATUS_COLORS: Record<MidpointStatus, string> = {
  above: "#dc2626",
  below: "#16a34a",
  equal: "#6b7280",
};

const STATUS_LABELS: Record<MidpointStatus, string> = {
  above: "Above midpoint",
  below: "Below midpoint",
  equal: "At midpoint (5.5)",
};

const STATUS_ORDER: MidpointStatus[] = ["above", "below", "equal"];

function getMidpointStatus(value: number): MidpointStatus {
  if (value > MIDPOINT) {
    return "above";
  }

  if (value < MIDPOINT) {
    return "below";
  }

  return "equal";
}

export function CountryOcChart({ countryCode }: CountryOcChartProps) {
  const series = getCountryOcSeries(countryCode).map((entry) => ({
    ...entry,
    midpointStatus: getMidpointStatus(entry.value),
  }));

  if (series.length === 0) {
    return (
      <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
        No organized crime data available for this country.
      </div>
    );
  }

  const chartHeight = Math.max(460, series.length * 28);

  return (
    <div className="my-1 border border-gray-200 rounded p-2">
      <div className="text-xs font-semibold uppercase mb-2">
        Organized Crime Indicators (1-10)
      </div>
      <div className="flex flex-wrap gap-3 text-xs mb-2">
        {STATUS_ORDER.map((status) => (
          <span className="inline-flex items-center gap-1" key={status}>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {STATUS_LABELS[status]}
          </span>
        ))}
      </div>
      <div className="max-h-52 overflow-y-auto" data-testid="oc-chart-scroll">
        <div
          data-series-count={series.length}
          data-testid="oc-chart"
          style={{ height: chartHeight }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={series}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 24, bottom: 8 }}
            >
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={130}
                tick={{ fontSize: 10 }}
                tickMargin={6}
                interval={0}
              />
              <ReferenceLine
                x={MIDPOINT}
                stroke="#6b7280"
                strokeDasharray="4 3"
                strokeWidth={2}
              />
              {series.map((entry) => (
                <ReferenceLine
                  ifOverflow="hidden"
                  key={`stem-${entry.id}`}
                  segment={[
                    { x: MIDPOINT, y: entry.label },
                    { x: entry.value, y: entry.label },
                  ]}
                  stroke={STATUS_COLORS[entry.midpointStatus]}
                  strokeWidth={STEM_WIDTH}
                />
              ))}
              {series.map((entry) => {
                const labelPosition: "left" | "right" =
                  entry.value < MIDPOINT ? "left" : "right";

                return (
                  <ReferenceDot
                    ifOverflow="visible"
                    key={`endpoint-${entry.id}`}
                    x={entry.value}
                    y={entry.label}
                    r={DOT_RADIUS}
                    fill={STATUS_COLORS[entry.midpointStatus]}
                    stroke="#ffffff"
                    strokeWidth={1}
                    label={{
                      value: entry.value.toFixed(1),
                      position: labelPosition,
                      fill: STATUS_COLORS[entry.midpointStatus],
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                );
              })}
              {series.map((entry) => (
                <ReferenceDot
                  ifOverflow="visible"
                  key={`midpoint-${entry.id}`}
                  x={MIDPOINT}
                  y={entry.label}
                  r={DOT_RADIUS - 1}
                  fill={STATUS_COLORS[entry.midpointStatus]}
                  fillOpacity={0.65}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}
              <Tooltip
                formatter={(value) => {
                  if (typeof value === "number") {
                    return value.toFixed(1);
                  }

                  if (Array.isArray(value) && typeof value[0] === "number") {
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
    </div>
  );
}

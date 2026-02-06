import React from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCountryOcSeries, OcPillar } from "../domain/ocIndicators";

interface CountryOcChartProps {
  countryCode: string;
}

const PILLAR_COLORS: Record<OcPillar, string> = {
  markets: "#dc2626",
  actors: "#d97706",
  resilience: "#16a34a",
};

const PILLAR_LABELS: Record<OcPillar, string> = {
  markets: "Markets",
  actors: "Actors",
  resilience: "Resilience",
};

const PILLAR_ORDER: OcPillar[] = ["markets", "actors", "resilience"];

export function CountryOcChart({ countryCode }: CountryOcChartProps) {
  const series = getCountryOcSeries(countryCode);

  if (series.length === 0) {
    return (
      <div className="my-1 border border-gray-200 rounded p-3 text-sm text-center">
        No organized crime data available for this country.
      </div>
    );
  }

  const chartHeight = Math.max(420, series.length * 24);

  return (
    <div className="my-1 border border-gray-200 rounded p-2">
      <div className="text-xs font-semibold uppercase mb-2">
        Organized Crime Indicators (1-10)
      </div>
      <div className="flex flex-wrap gap-3 text-xs mb-2">
        {PILLAR_ORDER.map((pillar) => (
          <span className="inline-flex items-center gap-1" key={pillar}>
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: PILLAR_COLORS[pillar] }}
            />
            {PILLAR_LABELS[pillar]}
          </span>
        ))}
      </div>
      <div
        className="max-h-52 overflow-y-auto pr-1"
        data-testid="oc-chart-scroll"
      >
        <div
          data-series-count={series.length}
          data-testid="oc-chart"
          style={{ height: chartHeight }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={series}
              layout="vertical"
              margin={{ top: 8, right: 40, left: 170, bottom: 8 }}
            >
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={160}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <Tooltip formatter={(value) => Number(value).toFixed(1)} />
              <Bar dataKey="value" isAnimationActive={false}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value: number | string) =>
                    Number(value).toFixed(1)
                  }
                />
                {series.map((entry) => (
                  <Cell
                    className="oc-bar-cell"
                    fill={PILLAR_COLORS[entry.pillar]}
                    key={entry.id}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

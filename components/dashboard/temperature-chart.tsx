"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

interface ChartData {
  timestamp: Date;
  temp: number;
  target: number;
}

interface TemperatureChartProps {
  data: ChartData[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  // Transform data untuk recharts format
  const chartData = data.map((point) => ({
    time: point.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    temp: Number(point.temp.toFixed(1)),
    target: Number(point.target.toFixed(1)),
    timestamp: point.timestamp.getTime(),
  }));

  // Cari min/max target untuk reference area
  const targetTemp =
    chartData.length > 0
      ? chartData[chartData.length - 1]?.target || 100
      : 100;
  const targetMin = targetTemp - 2;
  const targetMax = targetTemp + 2;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAE2" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "#999" }}
          stroke="#999"
        />
        <YAxis
          domain={[20, 105]}
          tick={{ fontSize: 11, fill: "#999" }}
          stroke="#999"
          label={{ value: "°C", angle: -90, position: "insideLeft", offset: 10 }}
        />
        
        {/* Target zone area (±2°C dari target) */}
        {targetTemp && (
          <ReferenceArea
            y1={targetMin}
            y2={targetMax}
            fill="#E0E7CF"
            fillOpacity={0.3}
            label={{ value: "Target Zone", position: "right", fontSize: 10, fill: "#999" }}
          />
        )}

        {/* Target setpoint line */}
        <ReferenceLine
          y={targetTemp}
          stroke="#C4D4A8"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{ value: `Target: ${targetTemp}°C`, position: "left", fontSize: 10, fill: "#999", offset: 10 }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E8EAE2",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value) => [typeof value === "number" ? `${value.toFixed(1)}°C` : `${value}°C`, ""]}
          labelStyle={{ color: "#333" }}
        />

        <Legend
          wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
          iconType="line"
        />

        {/* Garis suhu aktual (hijau gelap) */}
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#65763D"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
          name="Suhu Aktual"
        />

        {/* Garis suhu target (abu-abu muda, dashed) */}
        <Line
          type="monotone"
          dataKey="target"
          stroke="#C4D4A8"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={false}
          name="Suhu Target"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

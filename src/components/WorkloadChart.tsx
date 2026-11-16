import { useState } from 'react';
import { WeeklyLoadPoint } from '../types/academic';

interface WorkloadChartProps {
  series: WeeklyLoadPoint[];
}

export function WorkloadChart({ series }: WorkloadChartProps) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(8);

  const width = 760;
  const height = 270;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 24;
  const padBottom = 38;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxVal = Math.max(
    50,
    ...series.map((d) => Math.max(d.baselineHours, d.optimizedHours))
  );
  const yMax = Math.ceil(maxVal / 10) * 10;

  const xFor = (idx: number) =>
    padLeft + (idx / Math.max(1, series.length - 1)) * innerW;
  const yFor = (val: number) =>
    padTop + innerH - (Math.min(yMax, Math.max(0, val)) / yMax) * innerH;

  const baselinePath = series
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(d.baselineHours).toFixed(1)}`)
    .join(' ');

  const optimizedPath = series
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(d.optimizedHours).toFixed(1)}`)
    .join(' ');

  const optimizedAreaPath = `${optimizedPath} L ${xFor(series.length - 1).toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${xFor(0).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

  const activePoint =
    series.find((p) => p.week === hoveredWeek) ?? series[7] ?? series[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            16주 학기 주간 학습 부하 추이
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            주차별 막대 위에 마우스를 올리면 기준 부하와 대안 적용 후 예상 시간을 비교할 수 있습니다
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-4 border-t-2 border-dashed border-slate-400" />
            <span>기존 시험 중심</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-[3px] w-4 rounded-sm bg-blue-700" />
            <span className="font-medium text-slate-900">대안·방안 적용 후</span>
          </div>
        </div>
      </div>

      {/* Selected Week Readout Bar */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <span className="font-mono tabular-nums text-blue-700">
              {activePoint.label}
            </span>
            {activePoint.isExamPeak && (
              <span className="text-amber-700 font-semibold">· 집중 시험 주간</span>
            )}
          </div>
          <div className="flex items-center gap-5 font-mono tabular-nums">
            <span className="text-slate-500">
              기존: <strong className="text-slate-700">{activePoint.baselineHours}h</strong>/주
            </span>
            <span className="text-blue-700">
              적용 후: <strong>{activePoint.optimizedHours}h</strong>/주
            </span>
            <span className="text-emerald-700 font-semibold">
              절감:{' '}
              {Math.max(0, +(activePoint.baselineHours - activePoint.optimizedHours).toFixed(1))}h
            </span>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[580px] h-auto select-none"
          role="img"
          aria-label="16주 학기별 학습 부하 비교 차트"
        >
          <defs>
            <linearGradient id="optimizedAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums"
                >
                  {tick}h
                </text>
              </g>
            );
          })}

          {/* Exam Peak Shading (Week 8 & Week 16) */}
          {[7, 15].map((idx) => {
            const cx = xFor(idx);
            return (
              <rect
                key={idx}
                x={cx - 18}
                y={padTop}
                width={36}
                height={innerH}
                fill="#FEF3C7"
                opacity="0.45"
                rx="4"
              />
            );
          })}

          {/* Optimized Area & Lines */}
          <path d={optimizedAreaPath} fill="url(#optimizedAreaGrad)" />
          <path
            d={baselinePath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <path
            d={optimizedPath}
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Week Columns + Data Nodes */}
          {series.map((point, idx) => {
            const cx = xFor(idx);
            const yBase = yFor(point.baselineHours);
            const yOpt = yFor(point.optimizedHours);
            const isHovered = activePoint?.week === point.week;
            const colWidth = innerW / series.length;

            return (
              <g
                key={point.week}
                onMouseEnter={() => setHoveredWeek(point.week)}
                onClick={() => setHoveredWeek(point.week)}
                className="cursor-pointer"
              >
                <rect
                  x={cx - colWidth / 2}
                  y={padTop}
                  width={colWidth}
                  height={innerH + padBottom}
                  fill="transparent"
                />
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + innerH}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                )}

                <circle
                  cx={cx}
                  cy={yBase}
                  r={isHovered ? 4 : 2.5}
                  fill="#94A3B8"
                />
                <circle
                  cx={cx}
                  cy={yOpt}
                  r={isHovered ? 5 : 3.2}
                  fill="#1D4ED8"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums ${
                    point.isExamPeak
                      ? 'fill-amber-700 font-semibold'
                      : isHovered
                      ? 'fill-blue-700 font-semibold'
                      : 'fill-slate-500'
                  }`}
                >
                  {point.week}주
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

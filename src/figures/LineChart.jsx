import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import './figures.css';
import { FigureFrame, DataTable, LiveStatus } from './FigureFrame';
import { clampTipLeft, useElementWidth } from './useElementWidth';
import { toneOf } from './tones';

function collect(series) {
  const values = [];
  series.forEach((item) => {
    [item.values, item.low, item.high].forEach((list) => {
      (list || []).forEach((value) => {
        if (value != null && !Number.isNaN(Number(value))) values.push(Number(value));
      });
    });
  });
  return values;
}

function lineRuns(values, connect) {
  const runs = [];
  let current = [];
  values.forEach((value, index) => {
    if (value == null) {
      if (current.length) runs.push(current);
      current = [];
      return;
    }
    if (current.length && connect && connect[index - 1] === false) {
      runs.push(current);
      current = [];
    }
    current.push(index);
  });
  if (current.length) runs.push(current);
  return runs;
}

function labelPlacements(indices, xPos, yPos, values, minGap, topLimit) {
  const placed = [];
  const labels = [];
  indices.forEach((index) => {
    const value = values[index];
    if (value == null) return;
    const px = xPos(index);
    const py = yPos(value);
    const hit = (above) => placed.some((item) => item.above === above && Math.abs(item.px - px) < minGap);
    let above = py >= topLimit;
    if (hit(above)) above = !above;
    if (hit(above)) return;
    placed.push({ px, above });
    labels.push({ index, px, py, above });
  });
  return labels;
}

/**
 * 手绘折线。置信带只在调用方传入 low / high 时绘制，组件不会自己估区间。
 *
 * x: 数值（按数值间距）或字符串（等距类别）
 * series: [{ key, name, tone?, values, low?, high?, connect? }]
 * connect[i] === false 时，不把第 i 点连到第 i+1 点（用来留出原文没有的档）。
 */
export function LineChart({
  title,
  caption,
  series,
  x,
  xLabel = '',
  yMin,
  yMax,
  yTicks,
  formatX = (value) => String(value),
  formatY = (value) => String(value),
  marker,
  pointLabels = false,
  endLabels = true,
  tableOpen = false,
  ariaLabel,
}) {
  const plotRef = useRef(null);
  const tipRef = useRef(null);
  const liveId = useId();
  const width = useElementWidth(plotRef);
  const [index, setIndex] = useState(() => Math.max(0, (x?.length || 1) - 1));
  const [open, setOpen] = useState(false);
  const [tipLeft, setTipLeft] = useState(0);
  const [live, setLive] = useState('');

  const values = collect(series || []);
  const min = yMin != null ? yMin : (values.length ? Math.min(0, ...values) : 0);
  let max = yMax != null ? yMax : (values.length ? Math.max(...values) : 1);
  if (max === min) max = min + 1;
  const ticks = yTicks && yTicks.length
    ? yTicks
    : [0, 1, 2, 3, 4].map((step) => min + ((max - min) * step) / 4);

  const narrow = width < 480;
  const height = narrow ? 228 : 276;
  const margin = { top: 20, right: endLabels && !pointLabels ? (narrow ? 56 : 108) : 16, bottom: xLabel ? 42 : 30, left: 48 };
  const innerW = Math.max(1, width - margin.left - margin.right);
  const innerH = Math.max(1, height - margin.top - margin.bottom);
  const numeric = Array.isArray(x) && x.every((value) => typeof value === 'number');
  const x0 = numeric ? Math.min(...x) : 0;
  const x1 = numeric ? Math.max(...x) : Math.max(1, (x?.length || 1) - 1);

  const xPos = (point) => {
    const value = numeric ? x[point] : point;
    if (x1 === x0) return margin.left + innerW / 2;
    return margin.left + ((value - x0) / (x1 - x0)) * innerW;
  };
  const yPos = (value) => margin.top + (1 - (value - min) / (max - min)) * innerH;

  const describe = (point) => {
    if (!x || !series) return '';
    const head = xLabel ? `${xLabel} ${formatX(x[point])}` : formatX(x[point]);
    const rows = series.map((item) => {
      const value = item.values[point];
      if (value == null) return `${item.name}：这一档原文没有单列`;
      let text = `${item.name} ${formatY(value)}`;
      if (item.low && item.high && item.low[point] != null && item.high[point] != null) {
        text += `，区间 ${formatY(item.low[point])} 到 ${formatY(item.high[point])}`;
      }
      return text;
    });
    return `${head}。${rows.join('。')}`;
  };

  const move = (point, announce) => {
    const next = Math.max(0, Math.min((x?.length || 1) - 1, point));
    setIndex(next);
    setOpen(true);
    if (announce) setLive(describe(next));
  };

  const anchorX = x && x.length ? xPos(index) : 0;

  useLayoutEffect(() => {
    if (!open || !plotRef.current || !tipRef.current) return;
    const left = clampTipLeft(plotRef.current.clientWidth, tipRef.current.offsetWidth, anchorX);
    setTipLeft((prev) => (Math.abs(prev - left) < 0.5 ? prev : left));
  }, [open, anchorX, width, index]);

  if (!series || !series.length || !x || !x.length) return null;

  const nearest = (clientX) => {
    const rect = plotRef.current.getBoundingClientRect();
    const offset = clientX - rect.left - margin.left;
    if (numeric) {
      const value = x0 + (offset / innerW) * (x1 - x0);
      let best = 0;
      let dist = Infinity;
      x.forEach((item, point) => {
        const gap = Math.abs(item - value);
        if (gap < dist) {
          dist = gap;
          best = point;
        }
      });
      return best;
    }
    return Math.max(0, Math.min(x.length - 1, Math.round((offset / innerW) * (x.length - 1))));
  };

  const onKeyDown = (event) => {
    const moves = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: x.length - 1,
    };
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!(event.key in moves)) return;
    event.preventDefault();
    move(moves[event.key], true);
  };

  let markerX = null;
  if (marker && marker.at != null) {
    const at = x.findIndex((value) => value === marker.at);
    if (at >= 0) markerX = xPos(at);
    else if (numeric && marker.at >= x0 && marker.at <= x1) {
      markerX = margin.left + ((marker.at - x0) / (x1 - x0)) * innerW;
    }
  }

  const showEveryDot = x.length <= 8;

  return (
    <FigureFrame title={title} caption={caption} className="ed-chart">
      <ul className="ed-chart-legend">
        {series.map((item, seriesIndex) => (
          <li key={item.key || item.name}>
            <span className={`ed-key ed-key-line ed-tone-${toneOf(item, seriesIndex)}`} />
            {item.name}
            {item.low && item.high ? <span className="ed-chart-legend-note">含区间</span> : null}
          </li>
        ))}
      </ul>
      <div
        ref={plotRef}
        className="ed-chart-plot"
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel || `${title || '折线图'}。左右方向键查看各点，Escape 关闭提示。`}
        aria-valuemin={0}
        aria-valuemax={x.length - 1}
        aria-valuenow={index}
        aria-valuetext={describe(index)}
        aria-orientation="horizontal"
        aria-describedby={liveId}
        onPointerMove={(event) => {
          if (!width) return;
          move(nearest(event.clientX), false);
        }}
        onPointerDown={(event) => {
          if (!width) return;
          move(nearest(event.clientX), true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' && document.activeElement !== plotRef.current) setOpen(false);
        }}
        onFocus={() => move(index, true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      >
        {width > 0 ? (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  className={tick === min ? 'ed-chart-axis' : 'ed-chart-grid'}
                  x1={margin.left}
                  x2={margin.left + innerW}
                  y1={yPos(tick)}
                  y2={yPos(tick)}
                />
                <text x={margin.left - 8} y={yPos(tick)} textAnchor="end" dominantBaseline="middle">
                  {formatY(tick)}
                </text>
              </g>
            ))}
            {x.map((value, point) => (
              <text
                key={`${value}-${point}`}
                x={xPos(point)}
                y={margin.top + innerH + 18}
                textAnchor={point === 0 ? 'start' : point === x.length - 1 ? 'end' : 'middle'}
              >
                {formatX(value)}
              </text>
            ))}
            {markerX != null ? (
              <g>
                <line className="ed-chart-marker" x1={markerX} x2={markerX} y1={margin.top} y2={margin.top + innerH} />
                {marker.label && !narrow ? (
                  <text x={markerX} y={margin.top + innerH - 8} textAnchor="middle">
                    {marker.label}
                  </text>
                ) : null}
              </g>
            ) : null}
            {series.map((item, seriesIndex) => {
              const tone = toneOf(item, seriesIndex);
              const runs = lineRuns(item.values, item.connect);
              return (
                <g key={item.key || item.name}>
                  {item.low && item.high ? runs.filter((run) => (
                    run.length > 1 && run.every((point) => item.low[point] != null && item.high[point] != null)
                  )).map((run) => {
                    const top = run.map((point) => `${xPos(point)},${yPos(item.high[point])}`);
                    const bottom = [...run].reverse().map((point) => `${xPos(point)},${yPos(item.low[point])}`);
                    return (
                      <polygon
                        key={run.join('-')}
                        className={`ed-chart-band ed-tone-${tone}`}
                        points={[...top, ...bottom].join(' ')}
                      />
                    );
                  }) : null}
                  {runs.filter((run) => run.length > 1).map((run) => (
                    <polyline
                      key={`line-${run.join('-')}`}
                      className={`ed-chart-line ed-tone-${tone}`}
                      points={run.map((point) => `${xPos(point)},${yPos(item.values[point])}`).join(' ')}
                    />
                  ))}
                  {item.values.map((value, point) => {
                    if (value == null) return null;
                    if (!showEveryDot && point !== item.values.length - 1) return null;
                    return (
                      <circle
                        key={`dot-${point}`}
                        className={`ed-chart-dot ed-tone-${tone}`}
                        cx={xPos(point)}
                        cy={yPos(value)}
                        r="3.2"
                      />
                    );
                  })}
                </g>
              );
            })}
            {pointLabels && !narrow && series.length === 1 ? labelPlacements(
              x.map((_, point) => point),
              xPos,
              yPos,
              series[0].values,
              narrow ? 48 : 64,
              margin.top + 16,
            ).map((label) => (
              <text
                key={`label-${label.index}`}
                className="ed-chart-point-label"
                x={label.px}
                y={label.above ? label.py - 10 : label.py + 16}
                textAnchor={label.px < margin.left + 36 ? 'start' : label.px > width - 44 ? 'end' : 'middle'}
              >
                {formatY(series[0].values[label.index])}
              </text>
            )) : null}
            {endLabels && !pointLabels ? series.map((item, seriesIndex) => {
              let last = item.values.length - 1;
              while (last >= 0 && item.values[last] == null) last -= 1;
              if (last < 0) return null;
              const tone = toneOf(item, seriesIndex);
              return (
                <g key={`end-${item.key || item.name}`}>
                  <circle className={`ed-chart-dot ed-tone-${tone}`} cx={xPos(last)} cy={yPos(item.values[last])} r="4" />
                  <text className="ed-chart-end" x={xPos(last) + 8} y={yPos(item.values[last])} dominantBaseline="middle">
                    {narrow ? null : <tspan>{item.name} </tspan>}
                    <tspan className="ed-chart-end-value">{formatY(item.values[last])}</tspan>
                  </text>
                </g>
              );
            }) : null}
            {open ? (
              <g>
                <line
                  className="ed-chart-cross"
                  x1={xPos(index)}
                  x2={xPos(index)}
                  y1={margin.top}
                  y2={margin.top + innerH}
                />
                {series.map((item, seriesIndex) => (
                  item.values[index] == null ? null : (
                    <circle
                      key={`cross-${item.key || item.name}`}
                      className={`ed-chart-dot ed-tone-${toneOf(item, seriesIndex)}`}
                      cx={xPos(index)}
                      cy={yPos(item.values[index])}
                      r="4.2"
                    />
                  )
                ))}
              </g>
            ) : null}
          </svg>
        ) : (
          <div className="ed-chart-placeholder" />
        )}
        {open ? (
          <div ref={tipRef} className="ed-fig-tip" aria-hidden="true" style={{ left: tipLeft, top: margin.top }}>
            <p className="ed-fig-tip-kicker">
              {xLabel ? `${xLabel} ${formatX(x[index])}` : formatX(x[index])}
            </p>
            {series.map((item, seriesIndex) => (
              <p className="ed-fig-tip-row" key={item.key || item.name}>
                <span className={`ed-key ed-key-line ed-tone-${toneOf(item, seriesIndex)}`} />
                <strong>{item.values[index] == null ? '—' : formatY(item.values[index])}</strong>
                <span>{item.name}</span>
                {item.low && item.high && item.low[index] != null && item.high[index] != null ? (
                  <span className="ed-fig-tip-range">
                    {formatY(item.low[index])} 到 {formatY(item.high[index])}
                  </span>
                ) : null}
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <LiveStatus id={liveId}>{live}</LiveStatus>
      <DataTable summary="数据表" defaultOpen={tableOpen}>
        <table className="ed-fig-table">
          <thead>
            <tr>
              <th scope="col">{xLabel || '横轴'}</th>
              {series.map((item) => <th scope="col" key={item.key || item.name}>{item.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {x.map((value, point) => (
              <tr key={`${value}-${point}`}>
                <th scope="row">{formatX(value)}</th>
                {series.map((item) => (
                  <td key={item.key || item.name}>
                    {item.values[point] == null ? '—' : formatY(item.values[point])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </FigureFrame>
  );
}

export default LineChart;

import React, { useId } from 'react';
import './figures.css';
import { FigureFrame } from './FigureFrame';
import { toneOf } from './tones';

/**
 * 分组条形图。每个 group 用自己的最大值缩放，用来并排展示单位不同的前后指标。
 *
 * series: [{ key, name, tone? }]
 * groups: [{ label, bars: [{ key, value, display }] }]
 * display 是原文里的写法（例如「约 50%」「$0.586780」），不要另造精度。
 */
export function MetricChart({
  title,
  caption,
  series,
  groups,
  ariaLabel,
}) {
  const labelBase = useId();
  if (!series || !series.length || !groups || !groups.length) return null;

  const nameFor = (key) => series.find((item) => item.key === key)?.name || key;
  const toneFor = (key) => {
    const index = Math.max(0, series.findIndex((item) => item.key === key));
    const item = series[index] || {};
    return toneOf(item, index);
  };

  return (
    <FigureFrame title={title} caption={caption} className="ed-metric">
      <ul className="ed-chart-legend">
        {series.map((item, index) => (
          <li key={item.key}>
            <span className={`ed-key ed-key-swatch ed-tone-${toneOf(item, index)}`} />
            {item.name}
          </li>
        ))}
      </ul>
      <div className="ed-metric-groups" role="group" aria-label={ariaLabel || title || '指标对比'}>
        {groups.map((group, groupIndex) => {
          const labelId = `${labelBase}-${groupIndex}`;
          const max = Math.max(...group.bars.map((bar) => Number(bar.value) || 0), 0);
          return (
            <div className="ed-metric-group" key={group.label} role="group" aria-labelledby={labelId}>
              <p className="ed-metric-label" id={labelId}>{group.label}</p>
              {group.bars.map((bar) => {
                const pct = max === 0 ? 0 : (Number(bar.value) / max) * 100;
                const name = nameFor(bar.key);
                return (
                  <div className="ed-metric-row" key={bar.key}>
                    <span className="ed-metric-name">{name}</span>
                    <svg
                      className="ed-metric-svg"
                      viewBox="0 0 100 8"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <rect className="ed-metric-track" x="0" y="0" width="100" height="8" />
                      <rect
                        className={`ed-metric-fill ed-tone-${toneFor(bar.key)}`}
                        x="0"
                        y="0"
                        width={pct}
                        height="8"
                      />
                    </svg>
                    <span className="ed-metric-value">{bar.display}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </FigureFrame>
  );
}

export default MetricChart;

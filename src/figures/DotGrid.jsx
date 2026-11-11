import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import './figures.css';
import { FigureFrame, LiveStatus } from './FigureFrame';

function dotSize(columns) {
  if (columns >= 12) return { dot: '0.78rem', gap: '0.22rem' };
  if (columns >= 8) return { dot: '0.95rem', gap: '0.32rem' };
  return { dot: '1.35rem', gap: '0.5rem' };
}

function itemText(item) {
  return item.detail ? `${item.label}。${item.detail}` : item.label;
}

/**
 * 分类或逐条数据的圆点。只传入文章里真实存在的条目，不要为了凑满网格去编答案。
 *
 * groups: [{ id, title, countLabel?, items: [{ id, label, detail, tone }] }]
 * legend: [{ label, tone }]
 * tone: good | good-soft | baseline | warn | bad | neutral | accent
 */
export function DotGrid({
  title,
  caption,
  groups,
  legend = [],
  columns = 10,
}) {
  const liveId = useId();
  const figureRef = useRef(null);
  const tipRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [live, setLive] = useState('');

  const shown = tip
    ? groups.find((group) => group.id === tip.groupId)?.items[tip.index]
    : null;

  // 直接写样式，避免测量结果来回 setState 把渲染打成死循环。
  useLayoutEffect(() => {
    const host = figureRef.current;
    const tipEl = tipRef.current;
    if (!tip || !host || !tipEl) return undefined;
    const button = host.querySelector(`[data-dot="${tip.groupId}-${tip.index}"]`);
    if (!button) return undefined;
    const place = () => {
      const hostBox = host.getBoundingClientRect();
      const box = button.getBoundingClientRect();
      const tipWidth = tipEl.offsetWidth;
      const anchorX = box.left - hostBox.left + box.width / 2;
      let left = anchorX - tipWidth / 2;
      left = Math.max(0, Math.min(left, Math.max(0, host.clientWidth - tipWidth)));
      tipEl.style.left = `${Math.round(left)}px`;
      tipEl.style.top = `${Math.round(box.bottom - hostBox.top + 8)}px`;
    };
    place();
    return undefined;
  }, [tip]);

  if (!groups || !groups.length) return null;

  const show = (groupId, index, announce) => {
    if (!Number.isInteger(index)) return;
    setTip((prev) => (
      prev && prev.groupId === groupId && prev.index === index ? prev : { groupId, index }
    ));
    if (announce) {
      const group = groups.find((item) => item.id === groupId);
      const entry = group?.items[index];
      if (entry) setLive(itemText(entry));
    }
  };

  const hideIfUnfocused = (event, grid) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    if (grid.contains(document.activeElement)) return;
    setTip(null);
  };

  return (
    <FigureFrame title={title} caption={caption} className="ed-dots">
      <div className="ed-dots-host" ref={figureRef}>
        {legend.length ? (
          <ul className="ed-dots-key">
            {legend.map((item) => (
              <li key={item.label}>
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <circle className={`ed-dot ed-tone-${item.tone}`} cx="6" cy="6" r="4.4" />
                </svg>
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="ed-dots-grids">
          {groups.map((group) => {
            const cols = Math.max(1, Math.min(columns, group.items.length));
            const size = dotSize(cols);
            const labeled = group.items.some((item) => item.short);
            return (
              <div className="ed-dots-grid" key={group.id}>
                {group.title ? <p className="ed-dots-title">{group.title}</p> : null}
                {group.countLabel ? <p className="ed-dots-count">{group.countLabel}</p> : null}
                <div
                  className={`ed-dots-plot${labeled ? ' is-labeled' : ''}`}
                  role="listbox"
                  aria-label={group.title || title || '数据点'}
                  style={labeled ? { '--dot': size.dot } : {
                    gridTemplateColumns: `repeat(${cols}, ${size.dot})`,
                    gap: size.gap,
                    '--dot': size.dot,
                  }}
                  onPointerMove={(event) => {
                    const button = event.target.closest('[data-dot]');
                    if (!button || !event.currentTarget.contains(button)) return;
                    show(button.dataset.group, Number(button.dataset.index), false);
                  }}
                  onPointerLeave={(event) => hideIfUnfocused(event, event.currentTarget)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setTip(null);
                  }}
                >
                  {group.items.map((item, index) => {
                    const selected = tip?.groupId === group.id && tip?.index === index;
                    const onKeyDown = (event) => {
                      const last = group.items.length - 1;
                      const rowStep = labeled ? 1 : cols;
                      const moves = {
                        ArrowLeft: index - 1,
                        ArrowRight: index + 1,
                        ArrowUp: index - rowStep,
                        ArrowDown: index + rowStep,
                        Home: 0,
                        End: last,
                      };
                      if (event.key === 'Escape') {
                        setTip(null);
                        return;
                      }
                      if (!(event.key in moves)) return;
                      event.preventDefault();
                      const next = Math.max(0, Math.min(last, moves[event.key]));
                      const target = event.currentTarget.parentElement?.querySelector(
                        `[data-dot="${group.id}-${next}"]`,
                      );
                      target?.focus();
                      show(group.id, next, true);
                    };
                    return (
                      <button
                        key={item.id || index}
                        type="button"
                        className="ed-dot-btn"
                        role="option"
                        data-dot={`${group.id}-${index}`}
                        data-group={group.id}
                        data-index={index}
                        aria-selected={selected}
                        aria-label={itemText(item)}
                        onFocus={() => show(group.id, index, true)}
                        onKeyDown={onKeyDown}
                      >
                        <span className="ed-dot-glyph">
                          <svg viewBox="0 0 12 12" aria-hidden="true">
                            <circle className={`ed-dot ed-tone-${item.tone}`} cx="6" cy="6" r="4.4" />
                          </svg>
                        </span>
                        {item.short ? <span className="ed-dot-short">{item.short}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {shown ? (
          <div
            ref={tipRef}
            className="ed-fig-tip ed-dots-tip"
            aria-hidden="true"
          >
            <p className="ed-fig-tip-strong">{shown.label}</p>
            {shown.detail ? <p>{shown.detail}</p> : null}
          </div>
        ) : null}
        <LiveStatus id={liveId}>{live}</LiveStatus>
      </div>
    </FigureFrame>
  );
}

export default DotGrid;

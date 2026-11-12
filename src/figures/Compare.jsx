import React, { useEffect, useId, useRef, useState } from 'react';
import './figures.css';
import { FigureFrame } from './FigureFrame';
import { asBlocks, markText } from './markText';

function Chevron() {
  return (
    <svg className="ed-compare-chevron" viewBox="0 0 12 8" aria-hidden="true">
      <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg className="ed-compare-arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 12h14M14 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Side({ side }) {
  if (!side) return null;
  const blocks = asBlocks(side.body);
  return (
    <div className="ed-compare-side">
      {side.label ? <p className="ed-compare-label">{side.label}</p> : null}
      <div className="ed-compare-text">
        {blocks.map((block, index) => (
          <p key={index}>{markText(block, side.mark)}</p>
        ))}
      </div>
      {side.note ? <p className="ed-compare-note">{side.note}</p> : null}
    </div>
  );
}

/**
 * 聊天气泡式对照。`pairs` 里每一项都是文章已经写过的两侧，不要放编造的模型回答。
 *
 * pairs: [{
 *   id, prompt,
 *   before: { label, body, note?, mark? },
 *   after: { label, body, note?, mark? },
 * }]
 * body 可以是字符串或字符串数组（多段）。mark 是需要标出的原文词。
 */
export function Compare({
  title,
  caption,
  pairs,
  label = '选择一条对照',
}) {
  const menuId = useId();
  const askRef = useRef(null);
  const menuRef = useRef(null);
  const bubbleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(0);

  const pair = pairs[selected] || pairs[0];
  const optionId = (index) => `${menuId}-opt-${index}`;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (askRef.current && !askRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) menuRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const option = document.getElementById(`${menuId}-opt-${active}`);
    const menu = menuRef.current;
    if (!option) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < menu.scrollTop) menu.scrollTop = top;
    else if (bottom > menu.scrollTop + menu.clientHeight) {
      menu.scrollTop = bottom - menu.clientHeight;
    }
  }, [open, active, menuId]);

  if (!pairs || !pairs.length || !pair) return null;

  const choose = (index) => {
    setSelected(index);
    setActive(index);
    setOpen(false);
    bubbleRef.current?.focus();
  };

  const onBubbleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(selected);
      setOpen(true);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const onMenuKeyDown = (event) => {
    const last = pairs.length - 1;
    const moves = {
      ArrowDown: Math.min(last, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      bubbleRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const onMenuClick = (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option || !menuRef.current?.contains(option)) return;
    choose(Number(option.dataset.index));
  };

  const onMenuPointerMove = (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option || !menuRef.current?.contains(option)) return;
    const index = Number(option.dataset.index);
    setActive((prev) => (prev === index ? prev : index));
  };

  return (
    <FigureFrame title={title} caption={caption} className="ed-compare">
      <div
        className="ed-compare-ask"
        ref={askRef}
        onBlur={(event) => {
          if (!askRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <button
          type="button"
          ref={bubbleRef}
          className="ed-compare-bubble"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => {
            if (open) setOpen(false);
            else {
              setActive(selected);
              setOpen(true);
            }
          }}
          onKeyDown={onBubbleKeyDown}
        >
          <span className="ed-compare-bubble-text">{pair.prompt}</span>
          <span className="ed-sr-only">。{label}</span>
          <Chevron />
        </button>
        <ul
          id={menuId}
          ref={menuRef}
          className="ed-compare-menu"
          role="listbox"
          aria-label={label}
          hidden={!open}
          tabIndex={-1}
          aria-activedescendant={open ? optionId(active) : undefined}
          onKeyDown={onMenuKeyDown}
          onClick={onMenuClick}
          onPointerMove={onMenuPointerMove}
        >
          {pairs.map((item, index) => (
            <li
              key={item.id || index}
              id={optionId(index)}
              role="option"
              data-index={index}
              aria-selected={index === selected}
              className={index === active ? 'is-active' : undefined}
            >
              {item.prompt}
            </li>
          ))}
        </ul>
      </div>
      <div className="ed-compare-pair" aria-live="polite">
        <Side side={pair.before} />
        <div className="ed-compare-arrow" aria-hidden="true">
          <Arrow />
        </div>
        <Side side={pair.after} />
      </div>
    </FigureFrame>
  );
}

export default Compare;

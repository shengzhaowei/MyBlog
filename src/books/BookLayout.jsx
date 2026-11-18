import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BOOK, CHAPTERS, ALL_CHAPTERS } from './claudeCodeBookData';

/* ==========================================================================
   电子书通用布局 —— 照搬 dg-ai-notes Pi Agent Book 的 ModuleLayout：
   ProgressRail（顶部进度条）+ TopBar（品牌 / 面包屑 / 沉浸式 / 主题 / 作者）
   + LeftTOC（双轨章节列表）+ RightOutline（本页大纲，可收起，状态进 localStorage）
   + PrevNextNav（上下章卡片）。主题沿用本站的 data-theme + localStorage('theme')，
   和文章页的切换完全同步。
   ========================================================================== */

export const chapterUrl = (id) => `/books/claude-code/${id}`;
export const bookHomeUrl = '/books/claude-code';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#1c1a17' : '#fffdf8');
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    /* 隐私模式下无法存储时忽略 */
  }
};

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20.6 14.2A8.6 8.6 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const BookThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="bk-theme-toggle"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export const BookTopBar = ({ crumb, immersive, onToggleImmersive }) => (
  <header className="bk-topbar">
    <Link className="bk-brand" to={bookHomeUrl}>
      {BOOK.brand} <span className="bk-brand-accent">·</span> Book
    </Link>
    <nav className="bk-crumb" aria-label="breadcrumb">
      {crumb || BOOK.crumb}
    </nav>
    <div className="bk-actions">
      <button
        className="bk-immersive-toggle"
        type="button"
        onClick={onToggleImmersive}
        aria-pressed={immersive}
        aria-label="切换沉浸式阅读"
        title="沉浸式阅读（F）"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 4.5h5v11H3zM12 4.5h5v11h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7.5 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 2" />
        </svg>
        <span className="bk-immersive-toggle-label">沉浸式阅读</span>
      </button>
      <BookThemeToggle />
      <a
        className="bk-author"
        href="https://github.com/shengzhaowei"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="访问盛兆威的 GitHub"
      >
        <span className="bk-author-avatar">盛</span>
        <span className="bk-author-text">
          <span className="bk-author-name">盛兆威</span>
          <span className="bk-author-bio">记录工作、项目与学习</span>
        </span>
      </a>
    </div>
  </header>
);

export const BookProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="bk-progress" aria-hidden="true">
      <div className="bk-progress-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
};

/* 沉浸式开关：F 键也行，和 dg-ai-notes 一样。输入框里按键不触发。 */
export const useImmersive = () => {
  const [immersive, setImmersive] = useState(false);
  const toggle = () => setImmersive((prev) => !prev);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'f' && event.key !== 'F') return;
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      setImmersive((prev) => !prev);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return [immersive, toggle];
};

/* 章节切换时（同一组件、参数变了）也要回到顶部，所以依赖 dep。 */
export const useScrollToTopOnMount = (dep) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dep]);
};

export const BookLeftToc = ({ currentId }) => (
  <aside className="bk-toc-left" aria-label="全书目录">
    <p className="bk-toc-left-title">全书目录</p>
    {BOOK.tracks.map((track) => (
      <React.Fragment key={track.id}>
        <p className="bk-toc-track">
          {track.roman} · {track.label}
        </p>
        <ul>
          {CHAPTERS.filter((c) => c.track === track.id)
            .sort((a, b) => a.code.localeCompare(b.code))
            .map((chapter) => (
            <li key={chapter.id}>
              <Link
                to={chapterUrl(chapter.id)}
                className={currentId === chapter.id ? 'is-active' : undefined}
                aria-current={currentId === chapter.id ? 'location' : undefined}
              >
                {chapter.code} {chapter.title}
              </Link>
            </li>
          ))}
        </ul>
      </React.Fragment>
    ))}
    <p className="bk-toc-track">附录</p>
    <ul>
      <li>
        <Link
          to={chapterUrl('appendix')}
          className={currentId === 'appendix' ? 'is-active' : undefined}
          aria-current={currentId === 'appendix' ? 'location' : undefined}
        >
          附录 数字核对与速查表
        </Link>
      </li>
    </ul>
  </aside>
);

/* 窄屏用的折叠目录，放在正文顶部 */
export const BookMobileToc = ({ currentId }) => (
  <details className="bk-toc-mobile">
    <summary>全书目录</summary>
    <nav aria-label="全书目录">
      <BookLeftToc currentId={currentId} />
    </nav>
  </details>
);

export const BookRightOutline = ({ outline }) => {
  const [active, setActive] = useState(outline.length ? outline[0].id : '');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('bk-outline-collapsed') === 'true';
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    if (!outline.length) return undefined;
    let frame = 0;
    const run = () => {
      frame = 0;
      let current = outline[0].id;
      const centerLine = window.innerHeight / 2;
      outline.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= centerLine) current = id;
      });
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [outline]);

  if (!outline.length) return null;

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bk-outline-collapsed', String(next));
      } catch (error) {
        /* 隐私模式下无法存储时忽略 */
      }
      return next;
    });
  };

  return (
    <aside className={`bk-outline${collapsed ? ' is-collapsed' : ''}`} aria-label="本页大纲">
      <button
        type="button"
        className="bk-outline-toggle"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-controls="bk-outline-nav"
      >
        <span className="bk-outline-toggle-bar" aria-hidden="true" />
        <span className="bk-outline-toggle-label">本页大纲</span>
        <svg className="bk-outline-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <nav className="bk-outline-nav" id="bk-outline-nav">
        <ul>
          {outline.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={active === item.id ? 'is-active' : undefined}
                aria-current={active === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export const BookPrevNext = ({ currentId }) => {
  const index = ALL_CHAPTERS.findIndex((c) => c.id === currentId);
  const prev = index > 0 ? ALL_CHAPTERS[index - 1] : null;
  const next = index >= 0 && index < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[index + 1] : null;

  return (
    <nav className="bk-prevnext" aria-label="上下章导航">
      {prev ? (
        <Link className="bk-prevnext-card" to={chapterUrl(prev.id)}>
          <span className="bk-prevnext-label">← 上一章 · {prev.code}</span>
          <span className="bk-prevnext-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="bk-prevnext-card bk-prevnext-placeholder" aria-hidden="true" />
      )}
      {next ? (
        <Link className="bk-prevnext-card is-next" to={chapterUrl(next.id)}>
          <span className="bk-prevnext-label">{next.code} · 下一章 →</span>
          <span className="bk-prevnext-title">{next.title}</span>
        </Link>
      ) : (
        <span className="bk-prevnext-card bk-prevnext-placeholder" aria-hidden="true" />
      )}
    </nav>
  );
};

export const useBookMeta = (title, description) => {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
};

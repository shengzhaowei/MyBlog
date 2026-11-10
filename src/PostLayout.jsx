import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './editorial.css';

/* ==========================================================================
   PostLayout —— 文章详情页通用布局
   参考 kevin-wu.ca 的论文式排版：
   - 宽屏（≥64rem）：左侧粘性目录栏 + 居中正文列
   - 窄屏：正文顶部折叠式目录（details）
   - 所有 h2/h3 标题带「#」锚点链接
   - 文末固定追加「参考文献与阅读」与「附录」两个区块（随目录）
   ========================================================================== */

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 用 requestAnimationFrame 节流滚动监听，避免滚动时频繁重渲染。
export const useScrollFrame = (update) => {
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      updateRef.current();
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
};

export const usePageMeta = (title, description) => {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
};

export const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    setProgress((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
  });

  return (
    <div className="ed-progress" aria-hidden="true">
      <div className="ed-progress-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
};

export const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  useScrollFrame(() => {
    const next = window.scrollY > 480;
    setVisible((prev) => (prev === next ? prev : next));
  });

  return (
    <button
      type="button"
      className={`ed-to-top${visible ? ' is-visible' : ''}`}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
      }
      aria-label="回到顶部"
      title="回到顶部"
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 19V5m0 0-6 6m6-6 6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

// 滚动监听：当前阅读位置命中的章节 id。
// 触发线取视口中心（而非顶部 140px）：短文档里靠后的章节（参考文献/附录）
// 受页高限制永远到不了视口顶部，中心线保证它们也能被高亮；
// 另加页底兜底——滚到页面最底时高亮最后一节。
export const useActiveSection = (items = []) => {
  const [active, setActive] = useState(items.length ? items[0].id : '');
  useScrollFrame(() => {
    let current = items.length ? items[0].id : '';
    const centerLine = window.innerHeight / 2;
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= centerLine) current = id;
    });
    const doc = document.documentElement;
    const atBottom =
      window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
    if (atBottom && items.length) current = items[items.length - 1].id;
    setActive((prev) => (prev === current ? prev : current));
  });
  return active;
};

// 区块进入视口时淡入；减少动效或旧浏览器下直接显示。
export const useReveal = () => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.ed-reveal'));
    const markVisible = (element) => element.classList.add('is-visible');

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) markVisible(element);
    });

    const pending = elements.filter((element) => !element.classList.contains('is-visible'));
    if (reducedMotion() || !('IntersectionObserver' in window) || !pending.length) {
      pending.forEach(markVisible);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    );
    pending.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
};

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

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="ed-theme-toggle"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export const SiteHeader = ({ current, postsHref }) => {
  const [scrolled, setScrolled] = useState(false);
  useScrollFrame(() => {
    const next = window.scrollY > 8;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  return (
    <header className={`ed-header${scrolled ? ' is-scrolled' : ''}`}>
      <Link className="ed-site-name" to="/">盛兆威</Link>
      <div className="ed-header-side">
        <nav className="ed-nav" aria-label="主导航">
          <Link to="/" aria-current={current === 'about' ? 'page' : undefined}>关于</Link>
          <a href={postsHref} aria-current={current === 'posts' ? 'page' : undefined}>文章</a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export const Footer = ({ note, href, label }) => (
  <footer className="ed-footer">
    <p>{note}</p>
    <a href={href}>{label}</a>
  </footer>
);

/* --------------------------------------------------------------------------
   标题组件：带「#」锚点链接
   <Heading id="task" level={2}>任务定义</Heading>
   -------------------------------------------------------------------------- */

export const HeadingLink = ({ id }) => (
  <a className="ed-heading-link" href={`#${id}`} aria-label={`链接到本节：${id}`}>
    #
  </a>
);

export const Heading = ({ id, level = 2, className, children }) => {
  const Tag = `h${level}`;
  return (
    <Tag id={id} className={className}>
      <span className="ed-heading-text">{children}</span>
      <HeadingLink id={id} />
    </Tag>
  );
};

/* --------------------------------------------------------------------------
   目录导航：条目带左侧竖线，激活项高亮；
   子目录（h3）仅在父章节处于阅读中时展开，保持列表短。
   -------------------------------------------------------------------------- */

const TocList = ({ items, active }) => (
  <ul>
    {items.map((item) => {
      const isActive = active === item.id;
      const hasChildren = item.children && item.children.length > 0;
      return (
        <li key={item.id} className={isActive ? 'is-open' : undefined}>
          <a
            href={`#${item.id}`}
            className={isActive ? 'is-active' : undefined}
            aria-current={isActive ? 'location' : undefined}
          >
            {item.label}
          </a>
          {hasChildren && (
            <ul className="ed-toc-sub">
              {item.children.map((child) => (
                <li key={child.id}>
                  <a href={`#${child.id}`}>{child.label}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    })}
  </ul>
);

/* --------------------------------------------------------------------------
   固定末尾区块：参考文献与阅读 / 附录
   -------------------------------------------------------------------------- */

export const ReferencesSection = ({ items }) => (
  <section className="ed-references" aria-labelledby="references">
    <h2 id="references">
      <span className="ed-heading-text">参考文献与阅读</span>
      <HeadingLink id="references" />
    </h2>
    <ul className="ed-references-list">
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
          {item.note && <span className="ed-reference-note"> —— {item.note}</span>}
        </li>
      ))}
    </ul>
  </section>
);

export const AppendixSection = ({ sections }) => (
  <section className="ed-appendix" aria-labelledby="appendix">
    <h2 id="appendix">
      <span className="ed-heading-text">附录</span>
      <HeadingLink id="appendix" />
    </h2>
    {sections.map((section) => (
      <div className="ed-appendix-block" key={section.id}>
        <Heading id={section.id} level={3}>{section.title}</Heading>
        {section.body}
      </div>
    ))}
  </section>
);

/* --------------------------------------------------------------------------
   PostLayout 主组件
   -------------------------------------------------------------------------- */

export function PostLayout({
  title,
  dek,
  dateTime,
  date,
  readingTime,
  metaDescription,
  link,
  toc = [],
  references,
  appendixSections = [],
  current = 'posts',
  children,
}) {
  usePageMeta(`${title} | 盛兆威`, metaDescription);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 目录 = 正文章节 + 固定追加的「参考文献与阅读」与「附录」
  const tocItems = useMemo(() => {
    const items = [...toc];
    if (references && references.length > 0) {
      items.push({ id: 'references', label: '参考文献与阅读' });
    }
    if (appendixSections.length > 0) {
      items.push({
        id: 'appendix',
        label: '附录',
        children: appendixSections.map(({ id, title: label }) => ({ id, label })),
      });
    }
    return items;
  }, [toc, references, appendixSections]);

  const activeSection = useActiveSection(tocItems);
  useReveal();

  return (
    <div className="editorial">
      <ReadingProgress />
      <a className="ed-skip" href="#ed-article">跳到正文</a>
      <div className="ed-page ed-blog ed-has-toc">
        <SiteHeader current={current} postsHref="/#posts" />

        <main className="ed-post-layout">
          <header className="ed-post-header">
            <h1>{title}</h1>
            <p className="ed-dek">{dek}</p>
            <p className="ed-status">
              <time dateTime={dateTime}>{date}</time>
              {readingTime && <span>{readingTime}</span>}
              {link && (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              )}
            </p>
          </header>

          {/* 宽屏左侧目录（sticky），窄屏隐藏 */}
          <aside className="ed-toc-side" aria-label="文章目录">
            <nav className="ed-toc-nav">
              <p className="ed-toc-title">目录</p>
              <TocList items={tocItems} active={activeSection} />
            </nav>
          </aside>

          <article className="ed-post" id="ed-article">
            {/* 窄屏行内折叠目录，宽屏隐藏 */}
            <details className="ed-toc">
              <summary>本文目录</summary>
              <nav className="ed-toc-nav" aria-label="文章目录">
                <TocList items={tocItems} active={activeSection} />
              </nav>
            </details>

            {children}

            {references && references.length > 0 && (
              <ReferencesSection items={references} />
            )}

            {appendixSections.length > 0 && (
              <AppendixSection sections={appendixSections} />
            )}

            <footer className="ed-post-footer">
              <a href="/#posts">← 返回所有文章</a>
            </footer>
          </article>
        </main>

        <Footer note="© 2026 盛兆威" href="/" label="返回首页 →" />
      </div>
      <BackToTop />
    </div>
  );
}

export default PostLayout;

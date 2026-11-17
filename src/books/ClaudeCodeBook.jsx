import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import '../book.css';
import { BOOK, CHAPTERS, REFERENCES, chapterById } from './claudeCodeBookData';
import {
  BookTopBar,
  BookProgress,
  BookLeftToc,
  BookMobileToc,
  BookRightOutline,
  BookPrevNext,
  useImmersive,
  useScrollToTopOnMount,
  useBookMeta,
  chapterUrl,
  bookHomeUrl,
} from './BookLayout';

/* ==========================================================================
   Claude Code 电子书 —— 首页 + 阅读页
   首页照搬 dg-ai-notes Pi Agent Book 首页（截图那版）：
   TopBar + Hero（超大衬线标题 + 右侧关于卡片）+ 双轨章节表（序号/标题/字数）
   + 参考文献。阅读页照搬它的 ModuleLayout：左全书目录、右本页大纲、
   顶部进度条、章末上下章导航。沉浸式（F 键）与主题切换也一样。
   ========================================================================== */

const readingMinutes = (words) => `约 ${Math.max(1, Math.round(words / 500))} 分钟`;

const TocRow = ({ chapter }) => (
  <Link className="bk-toc-row" to={chapterUrl(chapter.id)}>
    <span className="bk-toc-num">{chapter.code}</span>
    <span className="bk-toc-title">
      第{parseInt(chapter.code.slice(1), 10)}章 {chapter.title}
    </span>
    <span className="bk-toc-aside">
      <span className="bk-toc-words">{chapter.words}字</span>
    </span>
  </Link>
);

export function ClaudeCodeBookHome() {
  const [immersive, toggleImmersive] = useImmersive();
  useScrollToTopOnMount();
  useBookMeta(
    'Claude Code 电子书 · 从上手到深入',
    '一份从 npm source map 还原出来的 Claude Code 源码，写成 dg-ai-notes 那样的双轨电子书：实战上手 4 章，源码精读 7 章。',
  );

  return (
    <div className={`book${immersive ? ' book-immersive' : ''}`}>
      <BookProgress />
      <BookTopBar crumb={BOOK.crumb} immersive={immersive} onToggleImmersive={toggleImmersive} />

      <section className="bk-hero">
        <div className="bk-hero-grid">
          <div>
            <h1 className="bk-hero-title">{BOOK.heroTitle}</h1>
            <p className="bk-hero-sub">
              {BOOK.heroSubFirst}
              <br />
              <span className="bk-hero-sub-accent">{BOOK.heroSubAccent}</span>
            </p>
          </div>
          <aside className="bk-book-intro">
            <p className="bk-book-intro-heading">{BOOK.aboutHeading}</p>
            <p className="bk-book-intro-desc">{BOOK.aboutDesc}</p>
            <a
              className="bk-book-intro-link"
              href={BOOK.aboutGithub}
              target="_blank"
              rel="noopener noreferrer"
            >
              → {BOOK.aboutGithub.replace(/^https?:\/\//, '')}
            </a>
          </aside>
        </div>
      </section>

      <section className="bk-dual-tracks">
        <div className="bk-dual-tracks-inner">
          {BOOK.tracks.map((track) => (
            <section
              key={track.id}
              className={`bk-series bk-series-${track.id}`}
              aria-label={track.label}
            >
              <header className="bk-series-head">
                <span className="bk-series-roman">{track.roman}</span>
                <div className="bk-series-headtext">
                  <p className="bk-series-eyebrow">
                    {track.eyebrow}
                    {track.badge && <span className="bk-series-badge">{track.badge}</span>}
                  </p>
                  <h2 className="bk-series-title">{track.label}</h2>
                  <p className="bk-series-lead">{track.tagline}</p>
                </div>
              </header>
              <div className="bk-series-list">
                {CHAPTERS.filter((c) => c.track === track.id).map((chapter) => (
                  <TocRow key={chapter.id} chapter={chapter} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="bk-home-refs" aria-labelledby="bk-home-refs-title">
        <h2 id="bk-home-refs-title">参考文献与阅读</h2>
        <ul>
          {REFERENCES.map((item) => (
            <li key={item.href}>
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
              {item.note && <span> —— {item.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <footer className="bk-home-footer">
        <p>© 2026 盛兆威</p>
        <Link to="/">返回首页 →</Link>
      </footer>
    </div>
  );
}

export function ClaudeCodeBookChapter() {
  const { chapterId } = useParams();
  const chapter = chapterById(chapterId);
  const [immersive, toggleImmersive] = useImmersive();
  useScrollToTopOnMount(chapterId);
  useBookMeta(
    chapter ? `${chapter.code} ${chapter.title} · Claude Code 电子书` : 'Claude Code 电子书',
    chapter ? `${chapter.code} ${chapter.title}，${readingMinutes(chapter.words)}。` : '',
  );

  if (!chapter) {
    return <Navigate to={bookHomeUrl} replace />;
  }

  const isAppendix = chapter.id === 'appendix';

  return (
    <div className={`book${immersive ? ' book-immersive' : ''}`}>
      <BookProgress />
      <BookTopBar
        crumb={`${chapter.code} / ${chapter.title}`}
        immersive={immersive}
        onToggleImmersive={toggleImmersive}
      />

      <div className="bk-page">
        <BookLeftToc currentId={chapter.id} />
        <main className="bk-main">
          <BookMobileToc currentId={chapter.id} />
          <header>
            <p className="bk-module-eyebrow">{chapter.code}</p>
            <h1 className="bk-module-title">{chapter.title}</h1>
            <p className="bk-module-meta">
              {chapter.words}字
              {` · ${readingMinutes(chapter.words)}`}
              {isAppendix ? '' : ` · ${chapter.track === 'internals' ? '源码精读' : '实战上手'}`}
            </p>
          </header>
          <article className="bk-prose">{chapter.body}</article>
          <BookPrevNext currentId={chapter.id} />
          <footer className="bk-chapter-footer">
            <Link to={bookHomeUrl}>← 返回电子书首页</Link>
            <Link to="/">盛兆威 · 首页 →</Link>
          </footer>
        </main>
        <BookRightOutline outline={chapter.outline} />
      </div>
    </div>
  );
}

export default ClaudeCodeBookHome;

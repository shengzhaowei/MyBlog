import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './editorial.css';

const POST_PATH = '/posts/personal-website-as-long-term-project';

const TOC_ITEMS = [
  { id: 'corner', label: '一个属于自己的角落' },
  { id: 'reading', label: '先让内容易读' },
  { id: 'subtraction', label: '设计是不断的减法' },
  { id: 'writing', label: '写文章，也是在整理经验' },
  { id: 'maintain', label: '小步发布，长期维护' },
];

const usePageMeta = (title, description) => {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
};

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 用 requestAnimationFrame 节流滚动监听，避免滚动时频繁重渲染。
const useScrollFrame = (update) => {
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

const ReadingProgress = () => {
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

const BackToTop = () => {
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

const useActiveSection = () => {
  const [active, setActive] = useState(TOC_ITEMS[0].id);
  useScrollFrame(() => {
    let current = TOC_ITEMS[0].id;
    TOC_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= 140) current = id;
    });
    setActive((prev) => (prev === current ? prev : current));
  });
  return active;
};

// 区块进入视口时淡入；减少动效或旧浏览器下直接显示。
// 首屏内可见的元素同步标记，避免依赖 IntersectionObserver 的回调时机。
const useReveal = () => {
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

const SiteHeader = ({ current, postsHref }) => {
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

const SocialLinks = () => (
  <div className="ed-socials" aria-label="社交链接">
    <a
      href="https://x.com/szw666888"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 X 上找到我"
      title="X"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </a>
    <a
      href="https://github.com/shengzhaowei"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 GitHub 上找到我"
      title="GitHub"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
  </div>
);

const Footer = ({ note, href, label }) => (
  <footer className="ed-footer">
    <p>{note}</p>
    <a href={href}>{label}</a>
  </footer>
);

export function EditorialHome() {
  usePageMeta(
    '盛兆威 · 个人网站',
    '盛兆威 的个人网站，记录工作、项目、学习与一些长期思考。'
  );
  useReveal();

  return (
    <div className="editorial">
      <a className="ed-skip" href="#ed-main">跳到正文</a>
      <div className="ed-page ed-home">
        <SiteHeader current="about" postsHref="#posts" />

        <main id="ed-main">
          <section className="ed-hero" aria-labelledby="about-title">
            <div className="ed-hero-media">
              <img
                className="ed-portrait"
                src={`${process.env.PUBLIC_URL}/mascot.png`}
                alt="盛兆威 的手绘猫咪插画：一只头顶灯泡的猫"
                width="680"
                height="680"
                decoding="async"
              />
              <SocialLinks />
            </div>
            <div className="ed-bio">
              <h1 id="about-title">关于</h1>
              <p>你好，我是 盛兆威。欢迎来到我在互联网上的一角。我会在这里记录工作、个人项目，以及正在学习的东西。</p>
              <p>这里不追求高频更新，只保留那些经过实践、值得以后再看一遍的东西。</p>
            </div>
          </section>

          <section className="ed-section ed-reveal" id="posts">
            <h2>文章</h2>
            <ul className="ed-list ed-posts">
              <li>
                <Link to={POST_PATH}>把个人网站当作一个长期项目</Link>
                <time dateTime="2026-11-09">2026.11.09</time>
              </li>
            </ul>
          </section>

          <section className="ed-section ed-reveal" id="now">
            <h2>近况</h2>
            <ul className="ed-list ed-notes">
              <li>
                <span>正在做</span>
                <span className="ed-note-description">把这个网站变成一个经得起反复阅读的个人档案。</span>
              </li>
              <li>
                <span>正在写</span>
                <span className="ed-note-description">记录项目背后的决策，而不只是最后的结果。</span>
              </li>
            </ul>
          </section>

          <section className="ed-section ed-reveal" id="more">
            <h2>更多</h2>
            <p>工作、爱好，以及介于两者之间的日常。这里会慢慢留下我的项目、阅读和好奇心，也会保留一些暂时没有答案的问题。</p>
          </section>
        </main>

        <Footer note="© 2026 盛兆威" href="#ed-main" label="回到顶部 ↑" />
      </div>
      <BackToTop />
    </div>
  );
}

export function BlogPost() {
  usePageMeta(
    '把个人网站当作一个长期项目 | 盛兆威',
    '从一次个人网站改版开始，重新思考写作、设计与持续维护。'
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeSection = useActiveSection();
  useReveal();

  return (
    <div className="editorial">
      <ReadingProgress />
      <a className="ed-skip" href="#ed-article">跳到正文</a>
      <div className="ed-page ed-blog">
        <SiteHeader current="posts" postsHref="/#posts" />

        <main>
          <header className="ed-post-header">
            <h1>把个人网站当作一个长期项目</h1>
            <p className="ed-dek">从一次改版开始，重新思考写作、设计与持续维护。</p>
            <p className="ed-status">
              <time dateTime="2026-11-09">2026 年 11 月 9 日</time>
              <span>约 6 分钟</span>
            </p>
          </header>

          <article className="ed-post" id="ed-article">
            <details className="ed-toc">
              <summary>本文目录</summary>
              <nav className="ed-toc-nav" aria-label="文章目录">
                <ul>
                  {TOC_ITEMS.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={activeSection === id ? 'is-active' : undefined}
                        aria-current={activeSection === id ? 'location' : undefined}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            <p>一个个人网站最容易被误解的地方，是人们常把它当作一张线上名片：放上头像、经历和几个链接，就算完成了。名片的目标是介绍自己，而网站还可以做更多事情——它可以保存过程、连接想法，也可以让我们看见自己的变化。</p>
            <p>所以，这次改版我没有先问“要加什么功能”，而是先问：“几年以后，我还愿不愿意回到这里？”这个问题把许多看似重要的选项都推到了后面，只留下三件更基础的事：写点什么，让人读得舒服，并且让下一次更新足够容易。</p>

            <h2 id="corner">一个属于自己的角落</h2>
            <p>信息流擅长制造新鲜感，却不擅长保存上下文。一篇内容发出去，很快就会被下一条更新覆盖。个人网站刚好相反：它没有必须追赶的时间线，也不要求每篇文章立刻获得回应。</p>
            <p>在这里，一篇不成熟的笔记可以被补全，一个旧项目可以补上后来的复盘，一个曾经笃定的判断也可以被修正。网站因此不只是展示结果的地方，更像一份持续编辑的个人档案。</p>
            <blockquote>
              <p>不必把网站一次做到“完成”。它更应该是一个可以不断回去工作的地方。</p>
            </blockquote>

            <h2 id="reading">先让内容易读</h2>
            <p>排版首先不是风格问题，而是阅读问题。这次页面只保留一个居中的内容栏，限制每行文字的长度，让标题、正文、日期和链接在统一的节奏里出现。没有卡片墙，也没有为了填满屏幕而增加的分栏。</p>
            <p>真正影响体验的往往是那些不显眼的选择：</p>
            <ul>
              <li><strong>稳定的栏宽。</strong>视线不需要在长行之间来回寻找下一行的起点。</li>
              <li><strong>足够的行距。</strong>长短不一的段落之间，文字仍然保有呼吸感。</li>
              <li><strong>清楚的层级。</strong>标题负责定位，正文负责表达，辅助信息退到后面。</li>
              <li><strong>克制的颜色。</strong>链接和重点可以被看见，但不会抢走内容的注意力。</li>
            </ul>
            <p>这些规则也延伸到手机上。窄屏不是桌面页面的缩小版：头像与介绍改为上下排列，文章日期移到标题下方，左右留白收紧，但正文的行距不被牺牲。</p>

            <h2 id="subtraction">设计是不断的减法</h2>
            <p>参考一些喜欢的个人网站时，最容易复制的是表面：字体、颜色、头像的位置。真正值得借鉴的，其实是它们对注意力的分配——页面上没有多少个元素在同时争抢“先看我”。</p>
            <p>因此，这次改版去掉了不必要的装饰，把导航缩减为「关于」和「文章」，把文章列表恢复成标题与日期的简单组合。首页不再努力证明自己有多丰富，而是让仅有的内容更明确。</p>
            <p>减法并不意味着所有网站都要长成同一种样子。保留头像插画、采用中文排版、选择偏暖的纸张色，这些细节仍然属于这里。克制不是抹掉个性，而是让个性出现在恰当的位置。</p>

            <h2 id="writing">写文章，也是在整理经验</h2>
            <p>写文章最直接的好处，是迫使我们把“我好像知道”变成一段别人也能理解的叙述。一个项目怎么开始、为什么这样选择、哪里判断错了，只有写下来，模糊的经验才会显出结构。</p>
            <p>我希望这里的文章不只记录最后成功的版本，也记录那些真实影响结果的中间过程。相比一份漂亮的结论，一次具体的取舍往往更有复用价值。</p>
            <p>写作也因此成为网站的骨架。设计可以帮助人读下去，项目可以证明做过什么，但只有持续的文字，能把不同时间里的自己连接起来。</p>

            <h2 id="maintain">小步发布，长期维护</h2>
            <p>长期项目并不意味着一开始就规划好所有功能。更可靠的方式，是把改动控制在足够小的范围内：先让一篇文章有合适的版式，再补文章列表；先保证手机上的阅读，再考虑更复杂的交互。</p>
            <p>每次发布都留下一点可继续修改的东西，下一次回来就不会面对一个沉重、陌生的系统。维护的成本降低了，更新才更可能真的发生。</p>
            <p>如果这是你第一次来到这里，欢迎从这篇文章开始。下一次更新不必很快，但希望它依然来自真实的实践，也值得被认真地读一遍。</p>

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

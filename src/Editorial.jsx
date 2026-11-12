import React from 'react';
import { Link } from 'react-router-dom';
import './editorial.css';
import {
  usePageMeta,
  useReveal,
  BackToTop,
  SiteHeader,
  Footer,
  PostLayout,
  Heading,
} from './PostLayout';
import { Compare } from './figures';

const POST_PATH = '/posts/personal-website-as-long-term-project';
export const POST_MEMORY_PATH = '/posts/context-window-as-cache';
export const POST_AGENT_EVAL_PATH = '/posts/agent-evaluation-with-fixed-evidence';

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
                <Link to={POST_AGENT_EVAL_PATH}>用固定证据评测已经上线的 Agent</Link>
                <time dateTime="2026-11-11">2026.11.11</time>
              </li>
              <li>
                <Link to={POST_MEMORY_PATH}>把上下文窗口当作缓存来设计</Link>
                <time dateTime="2026-11-10">2026.11.10</time>
              </li>
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

const POST_TOC = [
  { id: 'corner', label: '一个属于自己的角落' },
  { id: 'reading', label: '先让内容易读' },
  { id: 'subtraction', label: '设计是不断的减法' },
  { id: 'writing', label: '写文章，也是在整理经验' },
  { id: 'maintain', label: '小步发布，长期维护' },
];

const POST_REFERENCES = [
  {
    href: 'https://kevin-wu.ca/',
    label: 'Kevin Wu 的个人网站',
    note: '本次改版排版与目录布局的主要参考',
  },
  {
    href: 'https://gwern.net/',
    label: 'Gwern 的个人网站',
    note: '长期维护、持续修订的个人站点范例',
  },
  {
    href: 'https://www.joelonsoftware.com/',
    label: 'Joel on Software',
    note: '把写作当作长期积累的经典个人博客',
  },
];

const POST_APPENDIX = [
  {
    id: 'stack',
    title: '本站技术栈',
    body: (
      <React.Fragment>
        <p>本站基于 React + React Router 构建，样式以自写的 editorial.css 为主（文章页排版）并保留 Tailwind CSS 作为工具类补充。构建产物部署在 Cloudflare Workers 上，SPA 路由回退由 wrangler.jsonc 的 assets 配置处理。</p>
        <p>文章详情页由统一的 <code>PostLayout</code> 组件渲染：左侧粘性目录、标题锚点、参考文献与附录都由该组件提供，新增文章只需提供内容与数据。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'changelog',
    title: '改版记录',
    body: (
      <ul>
        <li><strong>2026.11.09</strong> —— 首次上线文章版式：单栏正文、顶部折叠目录。</li>
        <li><strong>2026.11.10</strong> —— 论文式排版改版：左侧粘性目录、标题 # 锚点、文末固定「参考文献与阅读」与「附录」区块。</li>
      </ul>
    ),
  },
];

export function BlogPost() {
  return (
    <PostLayout
      title="把个人网站当作一个长期项目"
      dek="从一次改版开始，重新思考写作、设计与持续维护。"
      dateTime="2026-11-09"
      date="2026 年 11 月 9 日"
      readingTime="约 6 分钟"
      metaDescription="从一次个人网站改版开始，重新思考写作、设计与持续维护。"
      toc={POST_TOC}
      references={POST_REFERENCES}
      appendixSections={POST_APPENDIX}
    >
      <p>一个个人网站最容易被误解的地方，是人们常把它当作一张线上名片：放上头像、经历和几个链接，就算完成了。名片的目标是介绍自己，而网站还可以做更多事情——它可以保存过程、连接想法，也可以让我们看见自己的变化。</p>
      <p>所以，这次改版我没有先问“要加什么功能”，而是先问：“几年以后，我还愿不愿意回到这里？”这个问题把许多看似重要的选项都推到了后面，只留下三件更基础的事：写点什么，让人读得舒服，并且让下一次更新足够容易。</p>

      <Heading id="corner">一个属于自己的角落</Heading>
      <p>信息流擅长制造新鲜感，却不擅长保存上下文。一篇内容发出去，很快就会被下一条更新覆盖。个人网站刚好相反：它没有必须追赶的时间线，也不要求每篇文章立刻获得回应。</p>
      <p>在这里，一篇不成熟的笔记可以被补全，一个旧项目可以补上后来的复盘，一个曾经笃定的判断也可以被修正。网站因此不只是展示结果的地方，更像一份持续编辑的个人档案。</p>
      <blockquote>
        <p>不必把网站一次做到“完成”。它更应该是一个可以不断回去工作的地方。</p>
      </blockquote>

      <Heading id="reading">先让内容易读</Heading>
      <p>排版首先不是风格问题，而是阅读问题。这次页面只保留一个居中的内容栏，限制每行文字的长度，让标题、正文、日期和链接在统一的节奏里出现。没有卡片墙，也没有为了填满屏幕而增加的分栏。</p>
      <p>真正影响体验的往往是那些不显眼的选择：</p>
      <ul>
        <li><strong>稳定的栏宽。</strong>视线不需要在长行之间来回寻找下一行的起点。</li>
        <li><strong>足够的行距。</strong>长短不一的段落之间，文字仍然保有呼吸感。</li>
        <li><strong>清楚的层级。</strong>标题负责定位，正文负责表达，辅助信息退到后面。</li>
        <li><strong>克制的颜色。</strong>链接和重点可以被看见，但不会抢走内容的注意力。</li>
      </ul>
      <p>这些规则也延伸到手机上。窄屏不是桌面页面的缩小版：头像与介绍改为上下排列，文章日期移到标题下方，左右留白收紧，但正文的行距不被牺牲。</p>

      <Heading id="subtraction">设计是不断的减法</Heading>
      <p>参考一些喜欢的个人网站时，最容易复制的是表面：字体、颜色、头像的位置。真正值得借鉴的，其实是它们对注意力的分配——页面上没有多少个元素在同时争抢“先看我”。</p>
      <p>因此，这次改版去掉了不必要的装饰，把导航缩减为「关于」和「文章」，把文章列表恢复成标题与日期的简单组合。首页不再努力证明自己有多丰富，而是让仅有的内容更明确。</p>
      <p>减法并不意味着所有网站都要长成同一种样子。保留头像插画、采用中文排版、选择偏暖的纸张色，这些细节仍然属于这里。克制不是抹掉个性，而是让个性出现在恰当的位置。</p>

      <Heading id="writing">写文章，也是在整理经验</Heading>
      <p>写文章最直接的好处，是迫使我们把“我好像知道”变成一段别人也能理解的叙述。一个项目怎么开始、为什么这样选择、哪里判断错了，只有写下来，模糊的经验才会显出结构。</p>
      <p>我希望这里的文章不只记录最后成功的版本，也记录那些真实影响结果的中间过程。相比一份漂亮的结论，一次具体的取舍往往更有复用价值。</p>
      <p>写作也因此成为网站的骨架。设计可以帮助人读下去，项目可以证明做过什么，但只有持续的文字，能把不同时间里的自己连接起来。</p>

      <Heading id="maintain">小步发布，长期维护</Heading>
      <p>长期项目并不意味着一开始就规划好所有功能。更可靠的方式，是把改动控制在足够小的范围内：先让一篇文章有合适的版式，再补文章列表；先保证手机上的阅读，再考虑更复杂的交互。</p>
      <p>下面三条都是这篇文章里已经写下的对照，可以切换着看。最后一条来自文末附录的改版记录，不是另编的版本。</p>
      <Compare
        title="这次改版实际留下了什么"
        caption="前两则来自正文：开篇那个问题，以及「设计是不断的减法」里对注意力的取舍。第三则来自附录「改版记录」里 2026.11.09 和 2026.11.10 两版的写法。"
        pairs={[
          {
            id: 'question',
            prompt: '改版一开始，我在问什么？',
            before: {
              label: '先问功能',
              body: '要加什么功能。名片式的网站，放上头像、经历和几个链接，就算完成了。',
            },
            after: {
              label: '先问还回不回来',
              body: '几年以后，我还愿不愿意回到这里？留下的是三件更基础的事：写点什么，让人读得舒服，并且让下一次更新足够容易。',
            },
          },
          {
            id: 'attention',
            prompt: '参考别的个人网站时，拿走什么？',
            before: {
              label: '表面',
              body: '最容易复制的是字体、颜色，还有头像的位置。',
            },
            after: {
              label: '注意力',
              body: '值得借鉴的是注意力怎么分配：页面上没有多少个元素在同时争抢「先看我」。导航只留「关于」和「文章」。',
            },
          },
          {
            id: 'versions',
            prompt: '已经发出去的两版，各留下了什么？',
            before: {
              label: '2026.11.09',
              body: '首次上线文章版式：单栏正文，目录折在正文顶部。',
            },
            after: {
              label: '2026.11.10',
              body: '论文式排版：左侧粘性目录、标题旁的 # 锚点，文末固定「参考文献与阅读」与「附录」。',
            },
          },
        ]}
      />
      <p>每次发布都留下一点可继续修改的东西，下一次回来就不会面对一个沉重、陌生的系统。维护的成本降低了，更新才更可能真的发生。</p>
      <p>如果这是你第一次来到这里，欢迎从这篇文章开始。下一次更新不必很快，但希望它依然来自真实的实践，也值得被认真地读一遍。</p>
    </PostLayout>
  );
}

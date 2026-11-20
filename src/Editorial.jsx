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
export const POST_SUBAGENTS_PATH = '/posts/claude-code-subagents-code-reviewer';
export const POST_ERP_AGENT_PATH = '/posts/erp-agent-chatbi';
export const POST_MINI_AGENT_PATH = '/posts/mini-agent-100-lines';
export const POST_MULTI_AGENT_PATH = '/posts/multi-agent-guide';
export const POST_AGENT_MEMORY_PATH = '/posts/agent-memory-implementation';
export const POST_LANGCHAIN_MEMORY_PATH = '/posts/langchain-long-short-term-memory';
export const POST_BGE_MILVUS_MEMORY_PATH = '/posts/bge-m3-milvus-long-term-memory';

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
                alt="盛兆威 的手绘猫咪插画，一只头顶灯泡的猫"
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
                <Link to={POST_BGE_MILVUS_MEMORY_PATH}>给 Agent 装上长期记忆：bge-m3 向量加 Milvus，跑一遍就明白</Link>
                <time dateTime="2026-11-20">2026.11.20</time>
              </li>
              <li>
                <Link to={POST_LANGCHAIN_MEMORY_PATH}>LangChain 的长期记忆和短期记忆，46 行代码跑通</Link>
                <time dateTime="2026-11-19">2026.11.19</time>
              </li>
              <li>
                <Link to={POST_AGENT_MEMORY_PATH}>Agent 是怎么记住你的</Link>
                <time dateTime="2026-11-17">2026.11.17</time>
              </li>
              <li>
                <Link to={POST_MULTI_AGENT_PATH}>Multi-Agent 不是多开几个 Agent：从手撕 150 行到六个开源项目的拆解</Link>
                <time dateTime="2026-11-15">2026.11.15</time>
              </li>
              <li>
                <Link to={POST_MINI_AGENT_PATH}>100 行代码写一个 Agent，手写 ReAct 循环</Link>
                <time dateTime="2026-11-14">2026.11.14</time>
              </li>
              <li>
                <Link to={POST_ERP_AGENT_PATH}>给 ERP 接上自然语言查询，一次数据智能体实践手记</Link>
                <time dateTime="2026-11-13">2026.11.13</time>
              </li>
              <li>
                <Link to={POST_SUBAGENTS_PATH}>Subagent 不是多开一个聊天框</Link>
                <time dateTime="2026-11-12">2026.11.12</time>
              </li>
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
        <p>文章详情页由统一的 <code>PostLayout</code> 组件渲染，左侧粘性目录、标题锚点、参考文献与附录都由该组件提供，新增文章只需提供内容与数据。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'changelog',
    title: '改版记录',
    body: (
      <ul>
        <li><strong>2026.11.09</strong>，首次上线文章版式，单栏正文、顶部折叠目录。</li>
        <li><strong>2026.11.10</strong>，论文式排版改版，左侧粘性目录、标题 # 锚点、文末固定「参考文献与阅读」与「附录」区块。</li>
      </ul>
    ),
  },
];

export function BlogPost() {
  return (
    <PostLayout
      title="把个人网站当作一个长期项目"
      dek="改版之前，我先问了自己一个问题。几年以后，我还愿不愿意回到这里？"
      dateTime="2026-11-09"
      date="2026 年 11 月 9 日"
      readingTime="约 6 分钟"
      metaDescription="从一次个人网站改版开始，重新思考写作、设计与持续维护。"
      toc={POST_TOC}
      references={POST_REFERENCES}
      appendixSections={POST_APPENDIX}
    >
      <p>改版之前，我先问了自己一个问题。几年以后，我还愿不愿意回到这里？这个问题一出来，很多事就不用纠结了。加不加功能，换不换花样，都往后放。我想要一个能回来干活的地方。写点东西，放上去。别人来读，不费劲。下次想改，动手就能改。</p>
      <img
        src={`${process.env.PUBLIC_URL}/personal-website-as-long-term-project-illustrations/01-door-key.png`}
        alt="小黑抱着一把大钥匙站在半开的门前，门上挂着还回来吗的牌子"
        width="2048"
        height="1152"
        decoding="async"
      />
      <p>很多人把个人网站当成一张线上名片。头像、经历、几个链接，摆上去就算完了。名片是给别人看的，网站还可以留东西。过程留下来，想法连起来，过一阵子再翻，自己变了没有，一眼就能看出来。</p>

      <Heading id="corner">一个属于自己的角落</Heading>
      <p>信息流里东西来得快，去得也快。一篇内容发出去，没两天就被下一条盖住了。网站没有这条时间线，没人催你马上回应。一篇没写完的笔记可以放着，写一半先存下来，过段时间补全。旧项目也能补上后来的复盘。当初很笃定的判断，写错了就改，改完还留着痕迹。</p>
      <p>这样攒下来，网站就成了一份个人档案，留给我自己回来翻。</p>
      <blockquote>
        <p>不必把网站一次做到“完成”。它更应该是一个可以不断回去工作的地方。</p>
      </blockquote>
      <img
        src={`${process.env.PUBLIC_URL}/personal-website-as-long-term-project-illustrations/03-comparison-wind-archive.png`}
        alt="左边风把纸片吹走，右边一只手把纸片放进档案盒，信息流吹走，网站留下"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="reading">先让内容易读</Heading>
      <p>排版先是个阅读问题，再说风格。页面只留一个居中的内容栏，每行字数收住，标题、正文、日期和链接按同一个节奏出现。没有卡片墙，也没有为了填满屏幕多加的分栏。</p>
      <p>花心思的地方都不显眼。栏宽、行距、层级、颜色，各管一小处。</p>
      <ul>
        <li><strong>栏宽定下来。</strong>视线不用在长行之间找下一行的起点。</li>
        <li><strong>行距给够。</strong>段落长短不一，文字中间照样能喘口气。</li>
        <li><strong>标题只管定位，正文只管表达。</strong>辅助信息退到后面。</li>
        <li><strong>颜色克制一点。</strong>链接和重点看得见，别抢内容的注意力。</li>
      </ul>
      <p>手机上也是一套做法。窄屏不能拿桌面版直接缩。头像和介绍改成上下排，日期挪到标题下面，左右留白收紧，正文的行距一格也没动。</p>

      <Heading id="subtraction">设计是不断的减法</Heading>
      <p>看别人喜欢的个人网站，最容易照搬的是表面。字体、颜色、头像摆在哪儿，一眼就能抄走。我看的时候，多留意了一处。页面上有几个元素在同时抢先看我。</p>
      <p>改版就从这里下手。装饰去掉了，导航只剩关于和文章，文章列表也回到标题加日期的老样子。首页不再想着证明自己多丰富，仅有的内容反而清楚了。</p>
      <p>减法不是把所有网站削成一个样。头像插画留着，中文排版留着，偏暖的纸张色也留着。克制是让个性出现在该出现的地方，别的都让开。</p>
      <img
        src={`${process.env.PUBLIC_URL}/personal-website-as-long-term-project-illustrations/02-remove-flags.png`}
        alt="小黑踮脚把页面上多余的小旗一面面摘下来，只留关于和文章两面"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="writing">写文章，也是在整理经验</Heading>
      <p>写文章最直接的好处，是逼我把我好像知道写成一段别人也能看懂的话。一个项目怎么开始，为什么这样选，哪里判断错了，不写下来，模糊的经验就一直模糊着。</p>
      <p>我希望这里的文章多记中间的过程，少记最后成的那个版本。一次具体的取舍，比一份漂亮的结论更有用。</p>
      <p>写作就这样成了网站里最结实的那部分。设计帮人读下去，项目证明做过什么，只有持续的文字，能把不同时间里的自己连起来。</p>
      <img
        src={`${process.env.PUBLIC_URL}/personal-website-as-long-term-project-illustrations/04-infographic-text-wall.png`}
        alt="三块文字砖砌成的墙：设计帮人读下去、项目证明做过什么、文字最结实，文字把不同时间里的自己连起来"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="maintain">小步发布，长期维护</Heading>
      <p>长期项目不用一开始就把所有功能规划好。改动控制在足够小的范围里，更靠谱。先让一篇文章有合适的版式，再补文章列表。手机上读得舒服了，再考虑更复杂的交互。</p>
      <p>下面三条对照，都是这篇文章里已经写过的东西，可以切换着看。最后一条来自文末附录的改版记录，日期和写法都照着那两版来的。</p>
      <Compare
        title="这次改版实际留下了什么"
        caption="前两则来自正文，开篇那个问题，以及「设计是不断的减法」里对注意力的取舍。第三则来自附录「改版记录」里 2026.11.09 和 2026.11.10 两版的写法。"
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
              body: '几年以后，我还愿不愿意回到这里？留下的是三件更基础的事，写点什么，让人读得舒服，并且让下一次更新足够容易。',
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
              body: '值得借鉴的是注意力怎么分配，页面上没有多少个元素在同时争抢「先看我」。导航只留「关于」和「文章」。',
            },
          },
          {
            id: 'versions',
            prompt: '已经发出去的两版，各留下了什么？',
            before: {
              label: '2026.11.09',
              body: '首次上线文章版式，单栏正文，目录折在正文顶部。',
            },
            after: {
              label: '2026.11.10',
              body: '论文式排版，左侧粘性目录、标题旁的 # 锚点，文末固定「参考文献与阅读」与「附录」。',
            },
          },
        ]}
      />
      <p>每次发布都留下一点可继续修改的东西，下一次回来就不会面对一个沉重、陌生的系统。维护的成本降低了，更新才更可能真的发生。</p>
      <p>下一次更新不必很快。它会从真实的实践里来。</p>
    </PostLayout>
  );
}

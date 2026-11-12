import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
// 交互图（可选）：import { Compare, DotGrid, LineChart, MetricChart } from '../figures';
// 用法、色板和「不要编造数据」的约束见 ARTICLE_GUIDE.md 第 6 节。

/* ==========================================================================
   文章模板 —— 新文章从这里复制开始
   使用方法见项目根目录 ARTICLE_GUIDE.md（文章生成标准）
   复制本文件到 src/posts/ 下并重命名，然后修改下方【必填】与【选填】数据。
   ========================================================================== */

const TOC_ITEMS = [
  // 【必填】正文章节目录：id 必须与下方 <Heading id="..."> 一一对应
  { id: 'intro', label: '引言' },
  { id: 'section-one', label: '第一章标题' },
  // 支持二级子目录（对应 h3）：
  // { id: 'section-two', label: '第二章', children: [{ id: 'sub-a', label: '子节 A' }] },
];

const REFERENCES = [
  // 【必填】参考文献与阅读：真实可访问的链接，3 条左右为宜
  {
    href: 'https://example.com/paper-or-article',
    label: '文献标题或站点名',
    note: '一句话说明这篇参考解决/启发了什么',
  },
];

const APPENDIX = [
  // 【必填】附录：正文放不下但有留存价值的材料（代码、数据、速查表、时间线…）
  {
    id: 'appendix-detail',
    title: '附录小节标题',
    body: (
      <React.Fragment>
        <p>附录正文。代码块示例：</p>
        <pre><code>{`-- 示例：SQL / 配置 / 命令
SELECT 1;`}</code></pre>
      </React.Fragment>
    ),
  },
];

export function ArticleSlug() {
  return (
    <PostLayout
      /* 【必填】文章元信息 */
      title="文章标题（与首页列表、路由含义一致）"
      dek="一句话副标题：这篇文章解决了什么问题、给出了什么结论。"
      dateTime="2026-11-11"          // ISO 日期，用于 <time> 语义
      date="2026 年 11 月 11 日"      // 展示日期
      readingTime="约 N 分钟"         // 正文 500 字 ≈ 1 分钟估算
      metaDescription="页面 description meta，100 字以内。"

      /* 【选填】状态行外链，如 GitHub 代码仓库 */
      link={{ href: 'https://github.com/shengzhaowei/xxx', label: 'GitHub 上的代码' }}

      /* 【必填】结构与数据 */
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      {/* ==================== 正文开始 ==================== */}

      <p>开篇两段：先给结论或场景，让读者在前 10 秒判断这篇文章与自己的相关性。不要从背景知识铺垫开始。</p>
      <p>第二段交代动机与路线图：参考了什么、做了什么、文章怎么组织。</p>

      <Heading id="intro">引言</Heading>
      <p>正文段落。每个章节控制在 3–6 段，先观点后论据。</p>
      <ul>
        <li><strong>列表要点。</strong>并列的判断用列表，因果的推论用段落。</li>
        <li><strong>强调克制。</strong>粗体只标关键词，不要整句加粗。</li>
      </ul>
      <blockquote>
        <p>引用块：放置值得摘出来重读的一句话。</p>
      </blockquote>

      <Heading id="section-one">第一章标题</Heading>
      <p>章节内容。代码使用 pre/code：</p>
      <pre><code>{`// 行内代码贴正文，块状代码进附录或此处
console.log('hello');`}</code></pre>
      <p>插图使用 <code>&lt;img /&gt;</code>，必须写 alt 与宽高。</p>

      {/*
        交互图示例。取消注释前，把里面的文字和数字换成这篇文章已经写过的内容。
        不要为了放一张图去编序列、区间或悬停答案。

        <Compare
          title="图题"
          caption="这句话说明两侧文字出自哪里。"
          pairs={[{
            id: 'contrast',
            prompt: '读者可以切换的问题',
            before: { label: '一侧', body: '文章里已经写过的文字' },
            after: { label: '另一侧', body: '文章里已经写过的文字' },
          }]}
        />

        <MetricChart
          title="前后两个点"
          caption="数字的出处。单位不同时分成不同 group。"
          series={[
            { key: 'before', name: '之前', tone: 'baseline' },
            { key: 'after', name: '之后', tone: 'good' },
          ]}
          groups={[{
            label: '指标名',
            bars: [
              { key: 'before', value: 1, display: '文章中的写法' },
              { key: 'after', value: 2, display: '文章中的写法' },
            ],
          }]}
        />
      */}

      {/* ==================== 正文结束：不要手写参考文献/附录，由 PostLayout 自动渲染 ==================== */}
    </PostLayout>
  );
}

export default ArticleSlug;

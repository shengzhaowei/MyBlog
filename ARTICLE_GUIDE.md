# 文章生成标准（ARTICLE GUIDE）

> 本文档是 MyBlog 文章详情页的**统一生成标准**，供后续每次生成新文章时遵循。
> 版式参考 [kevin-wu.ca/blog/qwn](https://kevin-wu.ca/blog/qwn/) 的论文式排版：
> 左侧粘性目录、居中单栏正文、标题 `#` 锚点、文末固定「参考文献与阅读」与「附录」。

---

## 1. 页面版式（已由 PostLayout 固化，不要手写）

文章详情页统一由 `src/PostLayout.jsx` 渲染，版式规则已写死在组件与 `editorial.css` 中：

| 区域 | 规则 |
| --- | --- |
| 页头 | 站名 + 「关于 / 文章」导航 + 主题切换，粘性吸顶 |
| 文章头 | H1 标题 → 副标题（dek）→ 状态行（日期 + 阅读时长 + 可选外链）→ 分隔线 |
| 目录 | **宽屏（≥1024px）：左侧粘性目录栏**，随滚动高亮当前章节，子目录仅在阅读中展开；**窄屏：正文顶部折叠目录** |
| 正文 | 居中单栏，约 42rem 栏宽，行高 1.95，中文排版 |
| 标题锚点 | 所有 H2/H3 标题右侧带 `#` 锚点链接，悬停显示 |
| 文末固定区块 | 依次为：正文 → **参考文献与阅读** → **附录** → 返回文章列表 → 页脚 |
| 其他 | 顶部阅读进度条、回到顶部按钮、深色模式、打印样式、无障碍（skip-link / aria）均已内置 |

**结论：新文章不需要写任何布局代码，只提供内容与数据。**

## 2. 新建文章的标准流程

1. 复制 `src/posts/PostTemplate.jsx` 到 `src/posts/YourArticle.jsx`，组件命名用大驼峰（如 `PostFlashcards`）。
2. 修改文件内的 `TOC_ITEMS`、`REFERENCES`、`APPENDIX` 三组数据与正文 JSX。
3. 在 `src/App.js` 注册路由：
   ```jsx
   import { PostFlashcards } from './posts/YourArticle';
   // <Route path="/posts/your-article-slug" element={<PostFlashcards />} />
   ```
   路径规范：一律 `/posts/<kebab-case-slug>`。
4. 在 `src/Editorial.jsx` 的 `EditorialHome` 文章列表中登记（新文章排最上面）：
   ```jsx
   <li>
     <Link to="/posts/your-article-slug">文章标题</Link>
     <time dateTime="2026-11-11">2026.11.11</time>
   </li>
   ```
5. 本地 `npm start` 验证宽屏左目录、窄屏折叠目录、锚点跳转、深色模式四项。

## 3. PostLayout 组件契约

```jsx
<PostLayout
  title="标题"                    // 必填，同时用于 document.title
  dek="一句话副标题"               // 必填
  dateTime="2026-11-11"           // 必填，ISO 日期
  date="2026 年 11 月 11 日"       // 必填，展示日期
  readingTime="约 6 分钟"          // 必填，500 字 ≈ 1 分钟
  metaDescription="页面描述"        // 必填，<100 字
  link={{ href, label }}          // 选填，状态行外链（如 GitHub）
  toc={TOC_ITEMS}                 // 必填，正文章节
  references={REFERENCES}         // 必填，参考文献列表
  appendixSections={APPENDIX}     // 必填，附录小节
>
  正文 JSX
</PostLayout>
```

### 3.1 数据结构

```jsx
const TOC_ITEMS = [
  { id: 'section', label: '章节名' },
  { id: 'parent', label: '父章节', children: [{ id: 'sub', label: '子节' }] }, // children 可选
];

const REFERENCES = [
  { href: 'https://…', label: '文献名', note: '一句话注释' }, // note 可选
];

const APPENDIX = [
  { id: 'slug-id', title: '小节标题', body: <p>JSX 内容</p> },
];
```

**约束：`toc` 中每个 `id` 必须与正文 `<Heading id="…">` 严格一致**——目录高亮、锚点跳转都依赖它。`references` 与 `appendixSections` 传空数组时对应目录条目与区块自动省略，但正常文章不应缺省。

## 4. 正文写作与排版规范

- **标题层级**：正文只用 `<Heading id level={2}>`（章节）与 `level={3}`（子节），禁止在正文中出现 H1。每章 3–6 段。
- **开篇**：前两段必须先给结论或场景，不从背景铺垫开始。
- **列表**：并列判断用 `<ul>`；因果推论用段落。列表项首词加粗（`<strong>`）做导语。
- **强调**：粗体只标关键词，不整句加粗；引用块（`<blockquote>`）只放值得摘读的话。
- **代码**：短代码贴正文 `<code>`；长代码进附录或正文 `<pre><code>`；行宽 ≤ 80 字符。
- **图片**：必须写 `alt` 与宽高，优先懒加载（`decoding="async"`）。
- **链接**：外链加 `target="_blank" rel="noopener noreferrer"`（ReferencesSection 已内置）。
- **中文排版**：中英文之间留半角空格，标点用全角；行文用「」引用，不用 ""。

## 5. 「参考文献与阅读」与「附录」内容规范

### 参考文献（References and Reading）

- 3–5 条，**只放真实可访问的链接**（论文 / 官方文档 / 原始博客），禁止占位链接；
- `label` 写文献原名或站点名，`note` 一句话说明它解决/启发了什么；
- 正文中的论断凡有出处，优先在正文内链接，参考文献区放「值得延伸阅读」的清单。

### 附录（Appendix）

- 每篇文章至少 1 个附录小节，存放「正文放不下但有留存价值」的材料：
  完整代码 / SQL、实验数据表、时间线（changelog）、速查表、技术栈说明；
- 附录小节标题用名词短语（如「历史结论注入的 SQL」「检索层级速查」）；
- 附录可以有多个小节，全部会自动进入目录的「附录」子级。

## 6. 交互图（Compare / DotGrid / LineChart / MetricChart）

实现在 `src/figures/`，样式在 `src/figures/figures.css`。文章里这样引入：

```jsx
import { Compare, DotGrid, LineChart, MetricChart } from '../figures';
// 若组件放在 src/ 根目录而不是 src/posts/，路径改成 './figures'
```

图放在相关段落后面，带 `title` 和 `caption`。图注里写清数字或引文的出处，例如「数字来自得物技术原文」。不要把图题写成正文的 H2/H3，以免打乱目录。

**每张图上的数字、引文、样本答案、时间序列，都必须已经出现在这篇文章里，或是文章已经引用的数字的直接可视化。** 不要编造指标、中间档位、置信区间，也不要为了看起来像一张研究图去写不存在的悬停答案。置信带只有在调用时传入真实的 `low` / `high` 才会画。某一档原文没写，就留空（`null`，或 `connect[i] === false` 断开连线），不要补一条光滑的曲线。

| 组件 | 什么时候用 | 不要用在 |
| --- | --- | --- |
| `Compare` | 文章已经写过的前后、两侧或版本对照。气泡是问题，点开可切换几组；左右标签用 `before.label` / `after.label` 自定，不必都叫「之前 / 之后」 | 编造的模型回答、文章里没出现过的提示词 |
| `DotGrid` | 真实的逐条或逐类数据。点要少而有名，`short` 写在点下方，悬停 / 点按 / 方向键读 `detail` | 只有总数、却编出上百个点和悬停文本 |
| `LineChart` | 原文给出的序列。手绘 SVG，图例、悬停提示、方向键、可选置信带、窄屏重排 | 用插值补出来的轮次；没有区间就不要传 `low` / `high` |
| `MetricChart` | 单位不同、或只有前后两个点的指标。每个 `group` 按自己的最大值缩放，精确写法放在 `display` | 把延迟、金额和百分比画进同一根轴 |

键盘：Compare 的气泡用上下方向键打开列表，Enter / 空格选定，Escape 关闭。折线图是横向 slider，左右方向键移动。点阵是 listbox，方向键在点之间移动。提示不依赖悬停：聚焦、点按和方向键都会打开，折线图另有「数据表」。

深色模式走 `html[data-theme="dark"]`，打印时保留图形颜色、展开数据表，并藏起只在屏幕上出现的菜单和浮层。窄屏下对照改为上下堆叠，条形图的柱换到标签下一行，图不得把正文栏撑出横向滚动。

下面的片段只说明 props 长什么样，里面的数字不能抄进文章。

```jsx
<Compare
  title="图题"
  caption="出处。"
  pairs={[{
    id: 'one',
    prompt: '读者可以切换的问题',
    before: { label: '一侧', body: '文章里已经写过的文字', mark: ['需要标出的词'] },
    after: { label: '另一侧', body: '文章里已经写过的文字' },
  }]}
/>

<LineChart
  title="图题"
  caption="出处。若纵轴不从 0 起，要在图注里说明。"
  xLabel="版本"
  x={[1, 2, 3]}
  yMin={0}
  yMax={100}
  formatY={(value) => `${value}%`}
  series={[{ key: 's', name: '系列名', tone: 'good', values: [10, 20, 15] }]}
/>
```

`tone` 可用 `good`、`good-soft`、`baseline`、`warn`、`bad`、`neutral`、`accent`。不传时按系列顺序循环。

## 7. 质量检查清单（发布前逐项过）

- [ ] 宽屏（≥1024px）：左侧目录粘性显示，滚动时当前章节高亮，子目录随阅读展开
- [ ] 窄屏（<1024px）：左侧目录消失，正文顶部折叠目录可展开
- [ ] 点击任意目录项/`#` 锚点，跳转后标题不被粘性页头遮挡
- [ ] `TOC_ITEMS` 的 id 与正文每个 `<Heading>` 一一对应，无遗漏、无多余
- [ ] 文末依次出现「参考文献与阅读」「附录」，且已进入目录
- [ ] 参考文献全部真实可访问；附录至少 1 小节
- [ ] `document.title` 为「文章标题 | 盛兆威」；路由与首页列表已登记
- [ ] 深色模式下正文、目录、锚点、代码块对比度正常
- [ ] 打印预览隐藏目录/进度条/回顶按钮
- [ ] 若使用交互图：数字和引文都能在本文中找到，图注写了出处；窄屏无横向溢出；方向键能操作；深色模式下对比度正常

---

*版式实现：`src/PostLayout.jsx` + `src/editorial.css`（`.ed-post-layout` / `.ed-toc-side` / `.ed-references` / `.ed-appendix`）。改动版式前先读本文档。*

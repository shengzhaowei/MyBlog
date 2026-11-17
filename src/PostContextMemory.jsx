import React from 'react';
import { PostLayout, Heading } from './PostLayout';
import { Compare, DotGrid, MetricChart } from './figures';

const TOC_ITEMS = [
  { id: 'assumptions', label: '老办法都默认了什么' },
  { id: 'online', label: '持续在线改变了什么' },
  { id: 'cache', label: '上下文窗口就是一块缓存' },
  { id: 'refs', label: '已有引用，何必去猜' },
  { id: 'chain', label: '链式召回' },
  { id: 'small', label: '在我那个小系统上怎么用' },
  { id: 'vector', label: '什么时候才需要向量库' },
];

const REFERENCES = [
  {
    href: 'https://github.com/deepseek-ai/dsh-superagent-prototype',
    label: 'DeepSeek · Exploring Super-agent Design（配套原型仓库）',
    note: 'Inline / Spill 与链式召回的原始设计出处',
  },
  {
    href: 'https://arxiv.org/abs/2307.03172',
    label: 'Lost in the Middle: How Language Models Use Long Contexts',
    note: '长上下文中部信息利用率下降的经典观察',
  },
  {
    href: 'https://www.sqlite.org/fts5.html',
    label: 'SQLite FTS5 官方文档',
    note: '零外部依赖的全文索引，轻量检索的第一层选择',
  },
];

const APPENDIX = [
  {
    id: 'inject-sql',
    title: '历史结论注入的 SQL',
    body: (
      <React.Fragment>
        <p>同仓库的历史结论按 thread 关联取最近三条，内联标题、摘要与结果。</p>
        <pre><code>{`SELECT c.title, c.summary, c.result, c.thread_key
FROM conclusions c
JOIN threads t ON t.key = c.thread_key
WHERE t.repo = :repo
ORDER BY c.created_at DESC
LIMIT 3;`}</code></pre>
        <p>注入提示词时逐条附上摘要与结论，并在末尾保留 thread_key 作为后续链式召回的入口。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'layering',
    title: '检索层级速查',
    body: (
      <ul>
        <li><strong>第一层：SQLite FTS5。</strong>零外部依赖，万级以下数据毫秒返回；</li>
        <li><strong>第二层：关键词倒排。</strong>给结论表加一列关键词，覆盖 FTS5 分词不理想的场景；</li>
        <li><strong>第三层：链式召回工具化。</strong>把「查记忆」做成路由层的一个工具调用，按引用图逐跳展开；</li>
        <li><strong>第四层：向量库。</strong>仅在跨仓库、跨语言、数据上万行且前三层失效时引入。</li>
      </ul>
    ),
  },
];

export function PostContextMemory() {
  return (
    <PostLayout
      title="把上下文窗口当作缓存来设计"
      dek="从 RAG、滑动窗口到引用图与链式召回，我是按缓存的办法来管 Agent 记忆的。"
      dateTime="2026-11-10"
      date="2026 年 11 月 10 日"
      readingTime="约 8 分钟"
      metaDescription="从 RAG、滑动窗口到引用图与链式召回，我是按缓存的办法来管 Agent 记忆的。"
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>RAG、滑动窗口、长上下文，这几年聊 Agent 记忆，翻来覆去就是这几个词。再往前数，还有知识图谱和微调。我把它们原样搬进自己那个持续在线、多任务并发的 Agent，问题一个接一个冒出来。</p>
      <p>我是拿 DeepSeek 产品部那篇 Super-agent 设计，对照自己手上那个小自动化 Agent，才把这事想明白的。上下文管理，管起来是个系统问题。</p>

      <Heading id="assumptions">老办法都默认了什么</Heading>
      <p>先把主流方案摆在一起看。RAG 把文本切开，嵌进向量库，搜相似度，取 Top-K 塞进提示词。LangChain 那一路的对话记忆，靠滑动窗口加定期摘要，只留最近的消息。长上下文那派相信窗口够大就能装下一切。知识图谱先把事实抽成三元组，再做图查询。微调干脆把知识烙进模型权重里。</p>
      <p>做法不一样，底下默认的东西倒是一样的。</p>
      <ul>
        <li>上下文在请求开始时一次性收集；</li>
        <li>Session 之间不需要延续状态；</li>
        <li>数据量有限，检索不会随规模退化；</li>
        <li>延迟不敏感，可以承受检索步骤的开销。</li>
      </ul>
      <p>这些默认的东西，在大多数场景里没错。过去两年我们做的，大多是聊天机器人。用户提问，系统检索，模型回答，会话结束。方案就是给这种交互形态做的，只是很少有人把这话挑明。</p>
      <img
        src={`${process.env.PUBLIC_URL}/context-window-as-cache-illustrations/03-infographic-four-defaults.png`}
        alt="四条默认并排摆开：一次收齐、不留状态、数据不多、不怕慢，每块都钉着一颗钉子，方案是给聊天机器人做的"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="online">持续在线改变了什么</Heading>
      <p>一个持续在线的 Agent，把上面每一条默认都打破了。多个任务并行，运行周期按月算，事件源源不断涌进来。常规方案放进去，失效的方式各不相同，指向倒是一致的。</p>
      <p>向量检索先碰上语义漂移。修登录 bug 和修认证问题，在向量空间里离得很近，可能属于两个完全不同的系统。检索回来的东西，很可能跟眼前这件事没关系。</p>
      <img
        src={`${process.env.PUBLIC_URL}/context-window-as-cache-illustrations/04-comparison-semantic-drift.png`}
        alt="左右两颗长得一样的螺丝，左边修登录 bug，右边修认证问题，中间磁铁写着看着很像，下面写长得像，不是一家"
        width="2048"
        height="1152"
        decoding="async"
      />
      <p>一段代码评审的对话被切块之后，谁在回复谁、属于哪个 PR、关联哪个 issue，这些关系全没了。向量只留下了词义上的相似。检索结果还解释不清，每条新事件进来都要付一次嵌入成本。这笔账在持续在线的场景里，算不过来。</p>
      <p>滑动窗口的切割点，可能正好落在关键决策上。摘要的摘要，会逐层失真。五个并行任务的上下文挤在同一个窗口里，互相稀释注意力。长上下文呢，每个请求都为整个窗口付 Prefill 成本，模型还会在超长窗口的中间迷路。Lost in the middle 是被反复观察到的现象。</p>
      <p>一个跨月运行的 Agent 攒下的上下文，最终会超过任何窗口。知识图谱那边的问题出在抽取上。谁来抽，抽得多准，schema 演进谁来维护，都是持续的成本。</p>
      <p>这些失效摆在一起，指向同一个地方。它们都在想办法让模型检索得更准。持续在线的 Agent 要解决的，是另一件事。资源有限，状态一直在长，怎么管住它。这是个系统问题。</p>

      <Heading id="cache">上下文窗口就是一块缓存</Heading>
      <p>Super-agent 的答案，是从操作系统管理缓存那儿搬来的。CPU 的 L1 快而小，L2、L3 一层比一层大，也一层比一层慢。放不下的去内存，再放不下的去磁盘，什么留在最快的层，靠局部性原理决定。上下文窗口也可以这么看。窗口本身是最贵的一层缓存，窗口外是更便宜但更慢的存储。</p>
      <p>这样看，注入策略只剩两个动作。Inline 是把近期很可能用到的信息直接放进窗口，省掉一次工具调用的往返，相当于缓存命中。Spill 是把超出预算或低频使用的内容留在窗口外，只留摘要和引用，需要时再读，相当于把数据换出到磁盘，指针还在。</p>
      <p>具体注入分三步。先从最少的信息开始，只给当前对象的 ID 和内容摘要，像虚拟内存起始只映射一页。然后按局部性逐步展开。时间上，刚讨论过的话题很可能再次被提起。空间上，一条消息带上它前后相邻的消息和它所回复的那条，一条代码评论带上它所在讨论的上下文。长内容没法全部 Inline，就设一个较小的截断上限，超出部分 Spill，保留续读入口。模型需要完整内容时，再调用工具读取。</p>
      <p>Inline 和 Spill 就是在用缓存管理的办法做注入决策。热数据零成本命中，冷数据不占窗口，窗口的占用始终有上界。</p>
      <img
        src={`${process.env.PUBLIC_URL}/context-window-as-cache-illustrations/01-cache-drawers.png`}
        alt="小黑踮脚把热卡片塞进顶层抽屉，冷卡片留在大纸箱里，只留一张小纸条当指针"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="refs">已有引用，何必去猜</Heading>
      <p>整个设计里，我最喜欢的是这一下。RAG 默认你不知道哪两个东西相关，得靠向量相似度去猜。Agent 系统里的事件不一样，关联是现成的。消息属于哪个 Thread，系统早就分好了。哪个 Worker 处理它，是 Router 派的。Worker 订阅了哪些 Thread，系统里有记录。Thread 对应哪个 PR，工具调用回来就知道。</p>
      <p>这些关系不用推断，本来就是系统自己写下的。已经有一张引用图了，还用向量去猜什么。沿着引用走就行了。</p>
      <blockquote>
        <p>你已经有引用图了，还用向量去猜相关性干什么。</p>
      </blockquote>
      <p>这个转变，收益比看着大。引用是确定性的。A 引用 B，就是相关，不会把语义相似但属于另一个系统的东西也捞回来。引用是透明的。每一步召回都能说清楚为什么，排查问题时，检索路径就是一条可以复现的链。新事件进来，也不用把整库重新嵌入，挂上 ID 和引用就行。</p>
      <p>三条加在一起，就是我不再默认用向量去猜的原因。图里把它们并排摆了一遍。</p>
      <Compare
        title="已经有引用之后，检索还在猜什么"
        caption="两侧都是这一节已经写下的对照。向量相似度负责猜，引用图负责走系统自己记下的关系。没有新增指标。"
        pairs={[
          {
            id: 'guess',
            prompt: '相关性要靠猜吗？',
            before: {
              label: '向量相似度',
              body: '不知道哪两个东西相关，就用相似度去猜。「修登录 bug」和「修认证问题」会靠得很近，但可能属于两个完全不同的系统。',
            },
            after: {
              label: '引用图',
              body: '消息属于哪个 Thread、Thread 由哪个 Worker 处理、对应哪个 PR，都是系统自己写下的。A 引用 B，就是相关。',
            },
          },
          {
            id: 'path',
            prompt: '召回路径能不能复查？',
            before: {
              label: '向量结果',
              body: '检索结果不可解释。一段对话被切块之后，「谁在回复谁、属于哪个 PR」这些关系会消失。',
            },
            after: {
              label: '沿引用走',
              body: '每一步都能说清楚为什么。排查问题时，检索路径就是一条可以复现的链。',
            },
          },
          {
            id: 'update',
            prompt: '新事件进来，索引要怎么更新？',
            before: {
              label: '重新嵌入',
              body: '每条新事件都要付一次嵌入成本。持续在线时，这笔账算不过来。',
            },
            after: {
              label: '挂上引用',
              body: '新事件只需要挂上 ID 和引用，不需要把整库重新嵌入。',
            },
          },
        ]}
      />

      <Heading id="chain">链式召回</Heading>
      <p>Inline 和 Spill 用到系统的各类对象上，就得到了链式召回。一次工具调用的返回结果，本身也照这个规矩来。返回的对象里，内联着下一跳关联对象的摘要和 ID。</p>
      <p>拿一条链走一遍。一条新消息触发处理，它的内联字段里有 thread_id。读这个 Thread，返回摘要，顺手内联处理它的 worker_session_id。读这个 Worker，返回状态摘要，也内联它订阅的另一个 Thread。读那个 Thread，拿到一场 PR 讨论的摘要。每一跳只展开一层，模型看到的就是摘要加下一跳 ID 的链条。需要就继续走，不需要就停，停在哪一层，手里的信息都够当下用。</p>
      <p>操作系统的惰性分页就是这个做法。页面不预先加载，缺页中断时才加载。上下文也不用一次装满，按需展开就好。</p>
      <p>Router 层还有个批处理，也服务于持续在线的场景。事件密集涌进来时，上一轮推理期间积压的多条事件，会自动合并进下一次 LLM 调用。事件到达速率提高四十倍，单次请求耗时的增长远慢于合并的条数。摊到每个决定上的推理时间，从 6.4 秒降到了 1.6 秒。突发流量是被吞吐吃掉的。</p>
      <p>原文只给了这两个数，图上也就只有两点。中间档位原文没写，我也没补。</p>
      <MetricChart
        title="每个决定上的推理时间"
        caption="数字来自正文对 Super-agent 批处理的转述。事件到达速率提高四十倍，积压事件合并进同一次调用之后，摊到每个决定上的推理时间从 6.4 秒降到 1.6 秒。两条柱按这组里的较大值缩放。"
        series={[
          { key: 'before', name: '未合并', tone: 'baseline' },
          { key: 'after', name: '合并后', tone: 'good' },
        ]}
        groups={[
          {
            label: '每个决定',
            bars: [
              { key: 'before', value: 6.4, display: '6.4 秒' },
              { key: 'after', value: 1.6, display: '1.6 秒' },
            ],
          },
        ]}
      />
      <img
        src={`${process.env.PUBLIC_URL}/context-window-as-cache-illustrations/02-chain-book.png`}
        alt="小黑守着一本只摊开一页的大笔记本，手里拿着摘要纸条"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="small">在我那个小系统上怎么用</Heading>
      <p>这些想法，大系统能用，小系统也能用。我手上就有一个单机运行、单所有者的自动化 Agent。它的数据全在 SQLite 里。事件、任务、Worker 会话、订阅、结论，彼此靠外键式的引用连着。数据本来就是一张引用图，缺的只是一层沿引用注入的检索。</p>
      <p>我先把同仓库的历史结论注入了任务提示词。一条 SQL 按 thread_key 关联，取最近三条，内联标题、摘要和结果。审查环节的上下文，同样附加历史反馈。判定器在产出候选之前，先沿引用查一遍同仓库的旧结论，免得重复上报。再往上一层是蒸馏。多条结论聚合成一条模块经验，存回状态链，供以后的任务取用。</p>
      <p>整个过程没有一行 Embedding 代码。我当时是这么算的。</p>
      <ul>
        <li><strong>数据本来就是结构化的。</strong>结论挂在 thread 上，thread 再关联任务和 Worker，相关性不用猜；</li>
        <li><strong>结论表只有几百行。</strong>SQL LIKE 一跑，毫秒级就返回了，规模上没必要上向量；</li>
        <li><strong>同仓库的历史结论一定相关。</strong>向量相似的，可能是别的系统的东西；</li>
        <li><strong>也不用搭什么基础设施。</strong>没有嵌入服务和向量库，索引维护也省了。SQLite 就够了，每条检索路径都是一条能复现的 SQL。</li>
      </ul>
      <p>数据已经结构化，检索问题就退化成了 SQL 查询。</p>

      <Heading id="vector">什么时候才需要向量库</Heading>
      <p>向量库有它的位置，我把它排在最后。我的扩展路径从轻到重。先上 SQLite 的 FTS5 全文索引，零外部依赖，万级以下够用。FTS5 不够了，给结论表加一列关键词做倒排。再不够，把查记忆做成路由层的一个工具调用，让链式召回本身工具化。等真的到了跨仓库、跨语言、数据上万行的场景，才轮到向量库。</p>
      <p>四层排好了。下面这张图把它们摊开，方便以后回看。</p>
      <DotGrid
        title="检索从轻到重"
        caption="四层都来自这一节和文末附录的检索层级速查。颜色只区分先用前三层和最后才是向量库，没有额外的评分。"
        columns={4}
        legend={[
          { tone: 'good', label: '先用这三层' },
          { tone: 'baseline', label: '最后才是向量库' },
        ]}
        groups={[
          {
            id: 'layers',
            title: '由左到右，从轻到重',
            countLabel: '上一层失效，才付下一层的复杂度',
            items: [
              {
                id: 'fts',
                tone: 'good',
                short: 'FTS5',
                label: '第一层 · SQLite FTS5',
                detail: '零外部依赖的全文索引。万级以下数据，毫秒返回。',
              },
              {
                id: 'keyword',
                tone: 'good',
                short: '倒排',
                label: '第二层 · 关键词倒排',
                detail: '给结论表加一列关键词，覆盖 FTS5 分词不理想的场景。',
              },
              {
                id: 'chain',
                tone: 'good',
                short: '链式',
                label: '第三层 · 链式召回',
                detail: '把「查记忆」做成路由层的一个工具调用，按引用图逐跳展开。',
              },
              {
                id: 'vector',
                tone: 'baseline',
                short: '向量库',
                label: '第四层 · 向量库',
                detail: '只在跨仓库、跨语言、数据上万行，而且前三层都失效的时候引入。',
              },
            ],
          },
        ]}
      />
      <p>这个排序背后就一个判断。每一层新加的复杂度，得由上一层的失效来付账。别人都在用，这个理由不成立。</p>
      <p>窗口就这么大，放什么进来，得按缓存的规矩来。我那个小系统眼下还用 SQL LIKE，几百行，够了。哪天不够了，再往下一层走。</p>
    </PostLayout>
  );
}

import React, { useEffect } from 'react';
import './editorial.css';
import {
  usePageMeta,
  useReveal,
  useActiveSection,
  ReadingProgress,
  BackToTop,
  SiteHeader,
  Footer,
} from './Editorial';

const TOC_ITEMS = [
  { id: 'assumptions', label: '常规方案共同的假设' },
  { id: 'online', label: '持续在线改变了什么' },
  { id: 'cache', label: '上下文窗口就是一块缓存' },
  { id: 'refs', label: '已有引用，何必去猜' },
  { id: 'chain', label: '链式召回' },
  { id: 'small', label: '在小系统上的落地' },
  { id: 'vector', label: '什么时候才需要向量库' },
];

export function PostContextMemory() {
  usePageMeta(
    '把上下文窗口当作缓存来设计 | 盛兆威',
    '从 RAG、滑动窗口到引用图与链式召回——Agent 记忆管理的一次范式转变。'
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeSection = useActiveSection(TOC_ITEMS);
  useReveal();

  return (
    <div className="editorial">
      <ReadingProgress />
      <a className="ed-skip" href="#ed-article">跳到正文</a>
      <div className="ed-page ed-blog">
        <SiteHeader current="posts" postsHref="/#posts" />

        <main>
          <header className="ed-post-header">
            <h1>把上下文窗口当作缓存来设计</h1>
            <p className="ed-dek">从 RAG、滑动窗口到引用图与链式召回——Agent 记忆管理的一次范式转变。</p>
            <p className="ed-status">
              <time dateTime="2026-11-10">2026 年 11 月 10 日</time>
              <span>约 8 分钟</span>
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

            <p>这两年聊到 Agent 的记忆，答案基本绕不开几个词：RAG、滑动窗口、长上下文，再往前还有知识图谱和微调。这些方案各有各的适用场景，但如果把它们原样搬进一个持续在线、多任务并发的 Agent，问题会接连暴露。</p>
            <p>这篇文章记录我把这件事想清楚的过程：参考 DeepSeek 产品部关于 Super-agent 的设计探索，对照自己手上的一个小型自动化 Agent，说说为什么上下文管理最终不是 ML 问题，而是系统设计问题。</p>

            <h2 id="assumptions">常规方案共同的假设</h2>
            <p>先把主流方案放在一起看。RAG 把文本切片、嵌入、存进向量库，用相似度搜索取回 Top-K 塞进提示词；LangChain 一系的对话记忆靠滑动窗口和定期摘要，保留最近的消息；长上下文流派相信窗口够大就能装下一切；知识图谱先把事实抽成三元组再做图查询；微调则干脆把知识烙进模型权重里。</p>
            <p>做法不同，但它们共享同一组隐含假设：</p>
            <ul>
              <li>上下文在请求开始时一次性收集；</li>
              <li>Session 之间不需要延续状态；</li>
              <li>数据量有限，检索不会随规模退化；</li>
              <li>延迟不敏感，可以承受检索步骤的开销。</li>
            </ul>
            <p>这些假设在大多数场景里是成立的——因为过去两年我们做的大多是聊天机器人：用户提问，系统检索，模型回答，会话结束。方案是为这个交互形态设计的，只是我们很少把这一点说出来。</p>

            <h2 id="online">持续在线改变了什么</h2>
            <p>一个持续在线的 Agent 打破了上面每一条假设：多个任务并行、运行周期以月计、事件源源不断涌入。把常规方案放进去，各自的失效方式不太一样，但都指向同一个方向。</p>
            <p>向量检索的第一个问题是<strong>语义漂移</strong>：「修登录 bug」和「修认证问题」在向量空间里很近，但可能属于两个完全不同的系统——检索回来的是噪音而不是信号。第二个问题更根本：<strong>结构丢失</strong>。一段代码评审的对话被切块之后，「谁在回复谁、属于哪个 PR、关联哪个 issue」这些关系全部消失，而向量只保留了词义上的相似。再加上检索结果不可解释、每条新事件都要付一次嵌入成本，这笔账在持续在线场景里算不过来。</p>
            <p>滑动窗口的切割点可能恰好落在关键决策上；摘要的摘要会逐层失真；五个并行任务的上下文挤在同一个窗口里，互相稀释注意力。长上下文则是每个请求都为整个窗口付 Prefill 成本，模型还会在超长窗口的中间「迷路」——Lost in the middle 是被反复观察到的现象。而一个跨月运行的 Agent 积累的上下文，最终会超过任何窗口。知识图谱方向的问题出在抽取：谁来抽、抽得多准、schema 演进谁来维护，都是持续的成本。</p>
            <p>把这些失效摆在一起，能看到一个共同点：它们都在回答「怎么让模型检索得更准」，而持续在线的 Agent 需要回答的是另一个问题——「怎么在有限的资源下管理持续增长的状态」。前者是 ML 问题，后者是系统问题。</p>

            <h2 id="cache">上下文窗口就是一块缓存</h2>
            <p>Super-agent 给出的答案，是把操作系统管理缓存的思路搬了过来。操作系统里，CPU 的 L1 快而小，L2、L3 逐层变大变慢，放不下的去内存，再放不下的去磁盘，靠局部性原理决定什么留在最快的层。上下文窗口也可以这么看：窗口本身是最贵的一层缓存，窗口外是更便宜但更慢的存储。</p>
            <p>在这个视角下，注入策略只剩两个动作。<strong>Inline</strong>：把近期很可能用到的信息直接放进窗口，省掉一次工具调用的往返——相当于缓存命中。<strong>Spill</strong>：把超出预算或低频使用的内容留在窗口外，只保留摘要和引用，需要时再读——相当于把数据换出到磁盘，但指针还在。</p>
            <p>具体注入分三步。第一步从最少的信息开始，只给当前对象的 ID 和内容摘要，像虚拟内存起始只映射一页。第二步按局部性逐步展开：时间上，刚讨论过的话题很可能再次被提起；空间上，一条消息带上它前后相邻的消息和它所回复的那条，一条代码评论带上它所在讨论的上下文。第三步，对无法全部 Inline 的长内容设一个较小的截断上限，超出部分 Spill，保留续读入口——模型需要完整内容时再调用工具读取。</p>
            <p>注意这不是比喻性的说法。Inline 和 Spill 是真的在用缓存管理的思想做注入决策：热数据零成本命中，冷数据不占窗口，窗口的占用始终有上界。</p>

            <h2 id="refs">已有引用，何必去猜</h2>
            <p>整个设计里我最喜欢的转折点在这里。RAG 的前提是「你不知道哪两个东西相关，所以需要向量相似度来猜」。但 Agent 系统里的事件，天然带着确定性的关联：消息属于某个 Thread，是系统分配的；Thread 由某个 Worker 处理，是 Router 派发的；Worker 订阅了哪些 Thread，是系统建立的；Thread 对应哪个 PR，是工具调用返回的。</p>
            <p>这些关系不需要推断，它们本来就是系统自己写下的。既然已经有一张引用图，为什么还要用向量去猜？沿着引用走就行了。</p>
            <blockquote>
              <p>你已经有引用图了，为什么还要用向量去「猜」相关性？</p>
            </blockquote>
            <p>这个转变的收益比看起来大。引用是<strong>确定性</strong>的：A 引用 B，就是相关，不会检索出「语义相似但属于另一个系统」的噪音。引用是<strong>透明</strong>的：每一步召回都能说清楚为什么，排查问题时，检索路径就是一条可以复现的链。引用是<strong>增量</strong>的：新事件只需要挂上 ID 和引用，不需要把整库重新嵌入。</p>

            <h2 id="chain">链式召回</h2>
            <p>把 Inline 和 Spill 一致地应用到系统的各类对象上，就得到「链式召回」：一次工具调用的返回结果本身也遵循 Inline 和 Spill——返回的对象里，内联着下一跳关联对象的摘要和 ID。</p>
            <p>举个链条。一条新消息触发处理，它的内联字段里有 thread_id；读这个 Thread，返回摘要，同时内联处理它的 worker_session_id；读这个 Worker，返回状态摘要，同时内联它订阅的另一个 Thread；读那个 Thread，拿到一场 PR 讨论的摘要。每一跳都只展开一层，模型看到的是一个「摘要 + 下一跳 ID」的链条——需要就继续走，不需要就停，停在哪一层都拿到了当下足够的信息。</p>
            <p>这其实就是操作系统的惰性分页：页面不预先加载，缺页中断时才加载。上下文不需要一次装满，按需展开就好。</p>
            <p>同样服务于持续在线场景的还有 Router 层的批处理：事件密集涌入时，上一轮推理期间积压的多条事件自动合并进下一次 LLM 调用。事件到达速率提高四十倍时，单次请求耗时的增长远慢于合并的条数，摊到每个决定上的推理时间反而从 6.4 秒降到 1.6 秒——突发流量被吞吐吃掉了，而不是被水平扩容吃掉的。</p>

            <h2 id="small">在小系统上的落地</h2>
            <p>这些想法并不只属于大规模系统。我手上有一个单机运行、单所有者的自动化 Agent：事件、任务、Worker 会话、订阅、结论，全都躺在 SQLite 里，彼此之间靠外键式的引用连着。换句话说，数据天然就是一张引用图——缺的只是「沿引用注入」的检索层。</p>
            <p>落地时我做的第一件事，是把「同仓库的历史结论」注入任务提示词：一条 SQL 按 thread_key 关联，取最近三条，内联标题、摘要和结果。审查环节的上下文同样附加历史反馈；判定器在产出候选之前，先沿引用查一遍同仓库的旧结论，避免重复上报。再往上一层是蒸馏：把多条结论聚合成一条「模块经验」，存回状态链，供以后的任务取用。</p>
            <p>整个过程没有一行 Embedding 代码。判断依据有四条：</p>
            <ul>
              <li><strong>数据已经结构化。</strong>结论挂在 thread 上，thread 关联任务和 Worker，相关性是确定的；</li>
              <li><strong>规模不需要。</strong>结论表只有几百行量级，SQL LIKE 毫秒级返回；</li>
              <li><strong>确定性优先。</strong>同仓库的历史结论一定相关，向量相似的却可能是别的系统的东西；</li>
              <li><strong>零基础设施。</strong>不需要嵌入服务、向量库和索引维护，SQLite 就够了，而且每条检索路径都是可复现的 SQL。</li>
            </ul>
            <p>数据已经结构化的时候，检索问题就退化成了 SQL 查询。</p>

            <h2 id="vector">什么时候才需要向量库</h2>
            <p>这不是说向量库没有位置，而是它应该是最后手段而不是默认选项。我的扩展路径从轻到重排：先上 SQLite 的 FTS5 全文索引，零外部依赖，万级以下够用；不够了给结论表加一列关键词做倒排；再不够，把「查记忆」做成路由层的一个工具调用，让链式召回本身工具化；等真的到了跨仓库、跨语言、数据上万行的场景，才轮到向量库。</p>
            <p>排序背后的判断很简单：每一层新加的复杂度，都应该由上一层的失效来支付，而不是由「别人都在用」来支付。</p>
            <p>回头看，这场范式转变可以压缩成一句话：上下文管理的目标，不是让模型检索得更准，而是让系统在缓存有限的前提下，把对的数据在对的时刻放进窗口。前者是 ML 思维，后者是系统思维——而 Agent 一旦持续在线，就不再是模型问题，而是操作系统问题。</p>

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

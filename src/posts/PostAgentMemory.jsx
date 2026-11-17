import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
import { Compare } from '../figures';

const TOC_ITEMS = [
  { id: 'intro', label: '关掉再打开，它就不认识我了' },
  { id: 'question', label: '到底要记住什么' },
  { id: 'context', label: '记忆和上下文，真不是一回事' },
  { id: 'minimal', label: '三百六十行，记一个人够了' },
  {
    id: 'harness', label: '别人家是怎么记的',
    children: [
      { id: 'claude-codex', label: 'Claude Code 与 Codex' },
      { id: 'langgraph-adk', label: 'LangGraph 与 Google ADK' },
      { id: 'crewai', label: 'CrewAI' },
    ],
  },
  { id: 'pitfalls', label: '三个坑，都是我自己踩的' },
  { id: 'closing', label: '写完之后，我还想改什么' },
];

const REFERENCES = [
  {
    href: 'https://code.claude.com/docs/en/memory',
    label: 'Claude Code · Memory',
    note: 'CLAUDE.md 与 auto memory 的官方说明：谁写、存哪、每次加载多少',
  },
  {
    href: 'https://google.github.io/adk-docs/sessions/memory/',
    label: 'Google ADK · Memory: Long-term knowledge with MemoryService',
    note: 'Session 与 MemoryService 的分工，InMemory 与 Memory Bank 的对照',
  },
  {
    href: 'https://docs.crewai.com/concepts/memory',
    label: 'CrewAI · Memory',
    note: '统一 Memory 类、层级 scope、相似度加新近度加重要性的复合排序',
  },
  {
    href: 'https://github.com/Eynzof/Hermes-CN-Core',
    label: 'Hermes-CN-Core',
    note: '本文对照的生产级内核：内置 MEMORY.md / USER.md，加外接记忆服务',
  },
  {
    href: 'https://shengzhaowei.me/posts/context-window-as-cache',
    label: '本站 · 把上下文窗口当作缓存来设计',
    note: '上下文分层与链式召回的上一篇，本文的记忆分层是它的延续',
  },
];

const APPENDIX = [
  {
    id: 'appendix-full-code',
    title: '最小记忆系统的核心代码',
    body: (
      <React.Fragment>
        <p>这三段就是“记住”这件事在代码里的全部。完整文件约 360 行，含一个不用 Key 就能跑的 mock 模型。</p>
        <pre><code>{`# 长期记忆：两个 MD 文件，每条一行 "- 内容"
class MemoryStore:
    def load(self, target):
        # 读磁盘，去掉 "- " 前缀；文件不存在就是空记忆
        ...
    def add(self, target, content):
        if content in entries:
            return "已经记过了，不重复记"
        if sum(len(e) for e in entries) + len(content) > 2000:
            return "记忆已满：先精简旧条目，再记新的"
        entries.append(content)
        self._save(target, entries)  # 原子写：先写 .tmp 再 os.replace
        return "已记住"

    def render(self):
        # 启动时拼进 system prompt：这就是跨会话 recall 的全部机制
        ...`}</code></pre>
        <pre><code>{`# 启动时注入记忆，再进 ReAct 循环
def run(user_input, session):
    system = ("你是一个会记住用户的助手。"
              "system prompt 里 ## 关于用户 / ## 已学到的事实"
              "就是跨会话记忆：没有就直说不知道，不要编造。\\n\\n"
              + STORE.render())
    messages = [{"role": "system", "content": system},
                {"role": "user", "content": user_input}]
    ...`}</code></pre>
        <pre><code>{`# 情景记忆：每轮追加一行 JSONL，只追加不改写
def search(self, query, limit=3, exclude_session_id=""):
    # 翻“上次”时排除本会话，否则刚问的那句会把原话挤掉
    ...`}</code></pre>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-verify',
    title: '跨会话验证清单',
    body: (
      <React.Fragment>
        <p>跑 <code>python test_cross_session.py</code>，两个独立子进程互相考，全部通过才算记忆是真的靠磁盘，不是靠本轮历史：</p>
        <ul>
          <li><strong>进程 1 记住。</strong>说“我叫小明，我喜欢喝美式，不加糖”之后，data/USER.md 里有这两条。</li>
          <li><strong>进程 2 想起来。</strong>全新进程问“我叫什么？我喜欢喝什么？”，能答对姓名和喜好。</li>
          <li><strong>翻旧账。</strong>问“上次我说了喜欢喝什么？”，session_search 返回进程 1 的原话“我喜欢喝美式，不加糖”。</li>
          <li><strong>会忘。</strong>/忘记 之后，进程 3 再问喜好，答“还没记下”。</li>
          <li><strong>满了会拒。</strong>一次写 3000 字进 2000 字上限的记忆，add 返回“记忆已满”，而不是静默丢数据。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-harness-cheatsheet',
    title: '五家 harness 记忆速查',
    body: (
      <ul>
        <li><strong>Claude Code。</strong>CLAUDE.md（你写）加 auto memory（它写），索引只加载前 200 行或 25KB，细节按需读。</li>
        <li><strong>Codex。</strong>AGENTS.md（你写，默认 32KB）加 Memories（它写，默认关闭，本机 ~/.codex/memories）。</li>
        <li><strong>LangGraph。</strong>Checkpointer 按 thread_id 存本轮状态；BaseStore 按用户存跨会话事实；LangMem 是读写 Store 的工具层。</li>
        <li><strong>Google ADK。</strong>SessionService 管一轮会话，MemoryService 管跨会话；Memory Bank 用 LLM 提炼事实再做向量检索。</li>
        <li><strong>CrewAI。</strong>统一 Memory 类，层级 scope，相似度加新近度加重要性排序，默认存 LanceDB。</li>
        <li><strong>Hermes。</strong>内置 MEMORY.md / USER.md，memory 工具读写；外接服务一次只能接一个。</li>
      </ul>
    ),
  },
];

export function PostAgentMemory() {
  return (
    <PostLayout
      title="Agent 是怎么记住你的：记忆系统的实现手记"
      dek="我关掉终端再打开，它就不认识我了。于是我花了一个下午，给它写了个能记住人的本子。"
      dateTime="2026-11-17"
      date="2026 年 11 月 17 日"
      readingTime="约 9 分钟"
      metaDescription="关掉终端再打开，Agent 就不认识你了。我用 360 行写了个最小记忆系统，再对照 Claude Code、Codex、LangGraph、ADK、CrewAI 五家 harness，看它们怎么记人。"
      link={{ href: 'https://github.com/shengzhaowei/MyBlog', label: '本站代码' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>事情是这样的。11 月 17 号早上，我刚跟 Hermes 聊完跨会话记忆，觉得自己搞懂了，关掉终端，吃了个饭，回来新开一个会话，问它还记不记得我。它不记得。不是它态度不好，是它本来就没地方记。</p>
      <p>那一下挺打击人的。之前写 100 行 Agent 的时候，我还写过一句挺得意的话：“记忆就是消息历史。”单会话里没错，可关掉再打开，消息历史也没了。所以这篇文章就是我补的那堂课：到底什么才算记住，动手写一个能记住人的最小版本，再看看别人家是怎么做的。图可以点开看大图。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-memory-loop.svg`}
        alt="记忆循环示意图：上下文里的对话经 memory 工具写进磁盘上的 USER.md、MEMORY.md 和 sessions.jsonl，下个会话启动时再拼进 system prompt"
        width="1200"
        height="560"
        decoding="async"
      />

      <Heading id="intro">关掉再打开，它就不认识我了</Heading>
      <p>先把最扎心的部分说清楚：模型每次调用都是失忆的。你跟它聊一上午，它能接上你的话，是因为那堆对话还躺在 messages 里，每轮都原样发给它。进程一退，列表就没了，下次开局它手里什么都没有。</p>
      <p>那新会话凭什么还认识你？凭什么还知道你喜欢喝美式、不加糖，知道你上周纠正过它一次？只能靠模型外面的东西：有人或者有代码，把值得留的记下来，下次开局先递到它手里。递早了、递错了、递多了，都会出问题，后面会讲到。</p>
      <p>我一开始以为这事很玄，写完最小版才发现，它其实朴素得有点无聊：写进文件，读出来，拼进提示词。就这三步。难的不是这三步，是决定写什么、什么时候写、写多少。</p>

      <Heading id="question">到底要记住什么</Heading>
      <p>“记住用户”这四个字，写代码之前得先拆开，不然写着写着就乱了。我拆成了三样，混在一起存准出事。</p>
      <p><strong>画像，是你是谁、喜欢什么。</strong>姓名、口味、习惯，还有你平时怎么让我回答。变化慢，几乎每回都用得上，适合常驻在启动提示词里。比如“定购单审批要走 OA，ERP 只同步状态”，这是我们 ERP 项目里的一条约定，写进事实里比每次现问强。</p>
      <p><strong>事实，是 Agent 干活时学到的结论。</strong>项目约定、踩过的坑、被你纠正过的做法。比画像变得快，但比对话慢得多。</p>
      <p><strong>原话，是上次具体说了什么。</strong>某次对话的原句，某个决定的上下文。最全，也最占地方，平时根本用不着，只有你问“上次我们聊了什么”的时候才翻。</p>
      <p>这三样的脾气是反的：画像和事实要精简，原话要完整。精简的可以每次都读，完整的只能现搜现读。很多记忆系统做不好，根子就在这里：把原话当画像存，启动时全塞进去，窗口很快就满了；把画像当原话存，只留一句摘要，关键细节丢了，你一问它就答不上来。我的办法很土：分开存。画像和事实放两个 MD 文件，原话放一个 JSONL 流水账。分开不是为了好看，是让“每次都读”和“现搜现读”各用各的预算。</p>

      <Heading id="context">记忆和上下文，真不是一回事</Heading>
      <p>我有个挺喜欢的比方：上下文是桌面，记忆是笔记本。桌面上只能放正在用的几张纸，重要的写进笔记本收起来，下次要用再拿出来摊在桌面上。桌面是模型当下能看到的东西：系统提示词、本轮对话、工具返回的结果。存在内存里，进程一退就没了，塞满了还得截断，越长越贵、越慢。笔记本是磁盘或者数据库里的东西，关掉再打开还在，可以很大，但模型不会自动全读。</p>
      <p>所以记忆要进上下文才算想起来，上下文要变成记忆才算记住，下一轮再进上下文。只写不读，记忆是死档；只读不写，记忆是旧报纸。上面那张图画的就是这个圈，箭头不是单向的，点开能看大图。</p>
      <p>Hermes 身上有个细节，我一开始没想通，后来想通了才觉得它挺诚实：它的记忆是会话开始时的冻结快照，为了保住 prompt cache 不被打碎，本会话里新写的记忆只落盘，不改当前提示词，要下个会话才生效。写和用之间隔了一个会话边界。听着像个 bug，其实是上下文和记忆分开的直接证据：一个是当下在用的快照，一个是磁盘上的底本。</p>

      <Heading id="minimal">三百六十行，记一个人够了</Heading>
      <p>最小项目只有一个文件，约 360 行，标准库加 openai。跑法跟之前那篇 100 行 Agent 一样：没 Key 先跑 <code>--mock</code> 看流程，有 Key 再跑 DeepSeek 的 deepseek-chat。它的记忆就是上面分好的三层，照着 Hermes 的做法缩的。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-memory-layers.svg`}
        alt="三层记忆示意图：L1 工作记忆是本轮 messages，快而小；L2 长期记忆是 USER.md 和 MEMORY.md，精简且跨会话；L3 情景记忆是 sessions.jsonl，最全但只在翻旧账时搜"
        width="1200"
        height="560"
        decoding="async"
      />

      <p>第一层是工作记忆，就是本轮的 messages 列表，进程一退就没了，不用特意设计，它本来就在 ReAct 循环里。第二层是长期记忆，<code>data/USER.md</code> 记画像，<code>data/MEMORY.md</code> 记事实，每条一行 <code>- 内容</code>，人能直接打开看、改、删。第三层是情景记忆，<code>data/sessions.jsonl</code> 每轮追加一行 JSON，只追加不改写，所以是可信的原始记录。</p>
      <p>写记忆靠一个 <code>memory</code> 工具，四个动作：add、replace、remove、search。你说“记住……”或者随口透露姓名、喜好，它调 add；你纠正、改主意，它调 replace；你说“忘了吧”，它调 remove；拿不准就先调 search。翻原话靠另一个工具 <code>session_search</code>，你问“上次我们聊了什么”时调它，按关键词搜 JSONL。</p>
      <p>读记忆只有一处，就是启动时。run() 函数拼 system prompt 的时候，先把两份 MD 文件读进来：</p>
      <pre><code>{`system = ("你是一个会记住用户的助手。"
          "system prompt 里 ## 关于用户 / ## 已学到的事实"
          "就是跨会话记忆：没有就直说不知道，不要编造。\\n\\n"
          + STORE.render())`}</code></pre>
      <p>这行代码就是跨会话 recall 的全部。模型不是“想起”你，是每轮开局就先读到你的画像。反方向也一样：模型调工具，工具把条目追加进 MD 文件，原子写盘——先写临时文件再 os.replace，写一半断电也不会把记忆写坏。2000 字这个上限是我图省事定的，统一成一个数，超了 add 会拒绝并提示先精简，而不是悄悄丢数据。Hermes 那边是 2200 字和 1375 字分开算，我的版本糙一点，但意思一样。步数上限还是 8 步，防死循环。</p>
      <p>验证也很直接，没什么花头：进程 1 说“我叫小明，我喜欢喝美式，不加糖”，退出；打开 data/USER.md，那两条真的写进去了；再开一个全新进程问“我叫什么？我喜欢喝什么？”，能答上来，靠的是磁盘，不是本轮历史。自动验证 <code>test_cross_session.py</code> 用两个独立子进程互相考，还覆盖了忘记和超限，细节在文末附录。</p>

      <Heading id="harness">别人家是怎么记的</Heading>
      <p>最小版跑通之后，我再去翻别人家的文档，就能看出来每家在同一个问题上舍了什么、要了什么。五家大致分两派：文件派启动时全量读，数据库派用时现搜。图先摆在这儿，后面逐家拆。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-memory-harness.svg`}
        alt="两派记忆对照图：左边文件派是 Claude Code、Codex、Hermes，启动时全量读 MD 文件；右边数据库派是 LangGraph、Google ADK、CrewAI，用时按用户或向量现搜"
        width="1200"
        height="560"
        decoding="async"
      />

      <Compare
        title="文件派和数据库派，到底在争什么"
        caption="两侧都是这一节已经写下的对照：文件派启动时全读，数据库派用时现搜。没有新增指标。"
        pairs={[
          {
            id: 'load',
            prompt: '记忆什么时候进上下文？',
            before: {
              label: '文件派',
              body: '启动时全量读进 system prompt。简单，人能直接改，但有上限，量大了装不下。',
            },
            after: {
              label: '数据库派',
              body: '启动时只给画像，需要时再按相似度搜几条。能存很多，但要挑、要排、要建索引。',
            },
          },
          {
            id: 'write',
            prompt: '记忆是谁写的？',
            before: {
              label: '文件派',
              body: '一半人写（CLAUDE.md、AGENTS.md），一半模型写（auto memory、Memories）。写完就是文件。',
            },
            after: {
              label: '数据库派',
              body: '主要是系统写：会话结束提炼事实、去重、向量化，存成带分数的条目。',
            },
          },
        ]}
      />

      <Heading id="claude-codex" level={3}>Claude Code 与 Codex</Heading>
      <p>Claude Code 是两套并存。<code>CLAUDE.md</code> 是你写的指令，项目、个人、组织三级，启动时从根目录一路拼到工作目录，越近的越后读、越优先。模型收到的是 system prompt 后面的一条 user 消息，是上下文，不是强制配置，官方建议单文件控制在 200 行内。Auto memory 是 Claude 自己写的笔记，默认开，存在 <code>~/.claude/projects/&lt;项目&gt;/memory/</code>，<code>MEMORY.md</code> 是索引，每条一行加链接，细节在旁边单独的文件里。每次会话只加载索引的前 200 行或 25KB，细节要模型自己用读文件工具按需打开。它只记纠正和偏好，跳过能从代码里推导出的东西，也不重复 CLAUDE.md 已有的内容。</p>
      <p>Codex 很像，但自动记忆默认是关的。<code>AGENTS.md</code> 是你写的指令，全局加仓库里从 git 根目录向下每一级，拼起来，默认总共只取 32KB。Memories 是 Codex 自己从过去聊天里总结的记忆，要在配置里开，存在本机 <code>~/.codex/memories/</code>，会话闲置一段时间后在后台生成。两家的共同点我挺喜欢：记忆就是文件，人能打开看，机器按预算读。</p>

      <Heading id="langgraph-adk" level={3}>LangGraph 与 Google ADK</Heading>
      <p>LangGraph 的分层最像数据库的做法，界限也最清楚。短期记忆是 Checkpointer，按 <code>thread_id</code> 存每一步的状态快照，<code>InMemorySaver</code> 重启就丢，<code>SqliteSaver</code> 或 <code>PostgresSaver</code> 才能持久化，换一个 thread_id 就是全新的人。长期记忆是 <code>BaseStore</code>，按用户命名空间存事实，不按 thread 分，新 thread 的老用户照样能拿到偏好。LangMem 是上面的一层工具，让模型像调工具一样读写 Store，后台在回答发出去之后再抽取，免得挡住当轮回答。</p>
      <p>Google ADK 把会话和记忆做成两个不同的服务。<code>SessionService</code> 管一轮会话内的状态，<code>MemoryService</code> 管跨会话的长期知识，作用域是应用加用户。<code>InMemoryMemoryService</code> 存原样事件、关键词匹配，进程一退就没了，只适合原型；<code>VertexAiMemoryBankService</code> 在会话结束后用 LLM 把对话提炼成事实、去重、再做向量索引，检索走语义相似度。关键的一点是：ADK 的记忆不是自动填的，开发者必须显式调 <code>add_session_to_memory()</code>，否则只有会话，没有长期记忆。这点很容易踩坑，我读文档的时候特意记了一笔。</p>

      <Heading id="crewai" level={3}>CrewAI</Heading>
      <p>CrewAI 现在是一套统一的 Memory 类，取代了过去分开的短期、长期、实体几种。Crew 里 <code>memory=True</code> 就开了，每次任务之后自动从任务输出里抽出离散的事实存下来，下个任务开始前再按需召回。记忆按层级 scope 组织，像文件系统的一棵树，<code>/project/alpha</code>、<code>/agent/researcher</code> 这样的路径，召回时只搜所在分支，精度和速度都更好。排序是相似度、新近度、重要性三者的加权，默认存在本地 LanceDB。它的思路和 LangGraph、ADK 是一派：记忆是数据库里的条目，启动时只给画像，需要时再搜。</p>
      <p>再回头看 Hermes：内置的 MEMORY.md 和 USER.md 走的是文件派，memory 工具读写，外接服务一次只能接一个，honcho、mem0、supermemory 这些就是数据库派的接法。最小项目和 Hermes、Claude Code、Codex 是一派，LangGraph、ADK、CrewAI 是另一派。我的建议很简单，先走左派，量上来了再走右派。反过来做，就是给一个小项目背数据库的债，我吃过这个亏。</p>

      <Heading id="pitfalls">三个坑，都是我自己踩的</Heading>
      <p>下面这三个，都不是我想出来的，是写最小项目、跑跨会话验证的时候一个一个撞上的。写出来是怕你也撞一遍。</p>
      <ul>
        <li><strong>问句不能当成要记的内容。</strong>第一版假模型看到“我叫什么？”就调 memory 工具记了一条“姓名：什么？”，看到“我喜欢喝什么？”就记了“喜欢：喝什么？”。我盯着那两行看了好一会儿才反应过来：问句不是陈述。修法是先判断是不是问句，问句走回答分支，只有陈述句才走提取分支。真模型也会犯这个错，所以 memory 工具的描述里要写清：只有你透露、纠正、明确说“记住”时才写，提问时先搜，没有就直说不知道。</li>
        <li><strong>会话 ID 不能只精确到秒。</strong>第一版 session_id 是 <code>%Y%m%d_%H%M%S</code>，两个进程 1 秒内先后启动就会撞 ID。session_search 翻“上次”时要排除本会话，结果把上个会话也排掉了，怎么搜都搜不到。改成微秒加进程号就好了。这个坑的教训我记住了：记忆系统里 ID 就是身份，身份撞了，隔离和召回一起坏。</li>
        <li><strong>翻旧账要排除本会话。</strong>不排除的话，刚问的那句“上次我说了喜欢喝什么？”本身就会命中关键词，把真正的原话挤出前三条。修法是在 search 里加一个 <code>exclude_session_id</code> 参数。说白了，检索的输入里混进了查询本身，关键词搜和向量搜都会遇到，只是表现不一样。</li>
      </ul>
      <p>这三个坑看着各不相干，其实都是一个毛病：不是模型的问题，是 harness 的问题。模型再聪明，也救不了把问句当事实写进去的提取、撞号的会话 ID、和被查询污染的检索。记忆系统的质量，一大半在这些琐碎的工程细节上，不在模型多聪明上。</p>

      <Heading id="closing">写完之后，我还想改什么</Heading>
      <p>先说检索。session_search 现在是关键词匹配，够用，但量一大肯定不够。换成向量检索是迟早的事，不过得先有这一步，才需要向量库。在此之前关键词加引用图就够了，上一篇讲缓存的文章已经把这个顺序写过，我不想再重复一遍。</p>
      <p>再说抽取。现在是模型在轮内决定记不记，每轮结束加一次 LLM 抽取会更好，把本轮对话自动提炼一两条进 MEMORY.md，抽取后移还能省当轮的延迟。还有遗忘：记忆加过期和重要性打分，满了先删不重要的，而不是直接拒绝。最小版那个 2000 字上限是我故意留的硬护栏，生产版得把它换成软策略。</p>
      <p>不过这些都是循环外面的东西，循环本身不用变：上下文产生记忆，记忆回到上下文。先把这个循环手写一遍、跑通跨会话，再谈向量库和自动抽取。我写这篇文章之前也是这么想的，写完之后更确定了：能手写一个记忆系统，和会调用一个记忆服务，是两种不同的理解。前者你知道它为什么记得，后者你只知道它记得。</p>
    </PostLayout>
  );
}

export default PostAgentMemory;

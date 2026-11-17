import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
import { Compare } from '../figures';

const TOC_ITEMS = [
  { id: 'intro', label: '引言' },
  { id: 'question', label: '先问对问题：记住什么' },
  { id: 'context', label: '记忆和上下文：先分清' },
  { id: 'minimal', label: '最小实现：三层记忆' },
  {
    id: 'harness', label: '五家 harness 怎么做的',
    children: [
      { id: 'claude-codex', label: 'Claude Code 与 Codex' },
      { id: 'langgraph-adk', label: 'LangGraph 与 Google ADK' },
      { id: 'crewai', label: 'CrewAI' },
    ],
  },
  { id: 'pitfalls', label: '写记忆时最容易踩的三个坑' },
  { id: 'closing', label: '收尾：从最小版到生产' },
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
        <p>下面是最小项目里真正决定“记住”的三段代码，原样贴出。完整文件约 360 行，含一个不用 Key 就能跑的 mock 模型，见文末链接。</p>
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
        <p>跑 <code>python test_cross_session.py</code>，两个独立子进程互相考，断言如下，全部通过才算记忆是真的靠磁盘，不是靠本轮历史：</p>
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
      dek="上下文是桌面，记忆是笔记本——从一个 360 行的最小实现，对照五家 harness 的做法。"
      dateTime="2026-11-17"
      date="2026 年 11 月 17 日"
      readingTime="约 9 分钟"
      metaDescription="Agent 记忆不是把对话全存下来：先分清记忆与上下文，再用三层记忆做一个 360 行的最小实现，对照 Claude Code、Codex、LangGraph、ADK、CrewAI 五家 harness。"
      link={{ href: 'https://github.com/shengzhaowei/MyBlog', label: '本站代码' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>结论先行：Agent 的记忆不是把对话全存下来，而是<strong>把值得留的提炼出来，存到模型外面，下个会话再挑着放回上下文里</strong>。这篇文章先把这句话拆开，再用一个 360 行的最小项目把它跑通，最后对照五家最出名的 harness，看它们在同一个问题上做了哪些不同的取舍。</p>
      <p>顺序是这样的：先问记住什么，再分清记忆和上下文，然后写最小实现，接着看别人怎么做，最后讲我实测时踩到的三个坑。完整代码在文末附录，照着抄就能跑。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-memory-loop.svg`}
        alt="记忆循环示意图：上下文里的对话经 memory 工具写进磁盘上的 USER.md、MEMORY.md 和 sessions.jsonl，下个会话启动时再拼进 system prompt"
        width="1200"
        height="560"
        decoding="async"
      />

      <Heading id="intro">引言</Heading>
      <p>写 100 行 Agent 的时候，我写过一句简化的话：“记忆就是消息历史。”那句话在单会话里是对的：messages 列表攒着系统提示词、用户问题、模型回复和工具结果，模型每轮看到完整历史，才能越跑越明白。但关掉进程再打开，列表就没了——那不是记忆，那只是上下文。</p>
      <p>真正的问题从关掉再打开那一刻开始：新会话的模型凭什么还认识你？凭什么还知道你喜欢喝美式、不加糖，知道你上周纠正过它一次？答案不在模型里，模型每次调用都是失忆的。答案在模型外面：有人（或有代码）把值得留的东西存下来了，下次开局先递给它。</p>
      <p>这篇文章就是把“存下来”和“递回去”这两步写明白。先从最小的做起，因为最小的版本里，每一步都没有藏起来的魔法。</p>

      <Heading id="question">先问对问题：记住什么</Heading>
      <p>动手写记忆之前，先问一句：到底要记住什么？“记住用户”这四个字太大了，拆开是三种完全不同的东西，混在一起写，系统很快就乱了。</p>
      <ul>
        <li><strong>画像：用户是谁、喜欢什么。</strong>姓名、口味、习惯、常用车间、回答偏好。变化慢，几乎每个会话都用得上，值得常驻在启动 prompt 里。</li>
        <li><strong>事实：Agent 学到的结论。</strong>项目约定、踩过的坑、纠正过的做法。比如“定购单审批要走 OA，ERP 只同步状态”。变化比画像快，但比对话慢。</li>
        <li><strong>原话：上次具体说了什么。</strong>某次对话的原句、某个决定的上下文。最全，也最占地方，平时不需要，只有用户问“上次我们聊了什么”时才翻。</li>
      </ul>
      <p>这三类的取舍正好相反：画像和事实要<strong>精简</strong>，原话要<strong>完整</strong>。精简的东西可以每次都读，完整的东西只能现搜现读。很多记忆系统做不好的根源，是把原话当画像存——启动时全塞进去，窗口很快就满了；或者把画像当原话存——只留一句话摘要，关键细节丢了，用户一问就答不上来。</p>
      <p>所以最小实现的第一条设计，就是把三类分开存：画像和事实放两个 MD 文件，原话放一个 JSONL 流水账。分开不是为了好看，是为了让“每次都读”和“现搜现读”用不同的预算。</p>

      <Heading id="context">记忆和上下文：先分清</Heading>
      <p>一句话：<strong>上下文是模型当下能看到的东西，记忆是模型不在场时帮它存着的东西。</strong>模型只能用上下文里的东西回答，记忆要先被装进上下文才有用。</p>
      <p>上下文是一次调用里发给模型的那堆东西：system prompt、本轮对话历史、工具返回结果。存在内存里，进程一退就没了，有硬上限，塞满了就得截断或压缩，越长越贵、越慢。记忆是存在磁盘或数据库里的东西，关掉再打开还在，可以很大，但模型不会自动全读。</p>
      <p>两者的联系是一个循环：记忆进上下文，才叫想起来；上下文产生记忆，才叫记住；下一轮再进上下文。没有第一步，记忆写了也白写；没有第二步，上下文关掉就全丢了。下面这张图就是这个循环在最小项目里的样子——注意箭头的方向，它不是单向的。</p>
      <p>还有一个容易混的点，是 Hermes 身上的一个真实细节：它的记忆是会话开始时的冻结快照，为了保 prompt cache 不被打碎，本会话内新写的记忆只落盘，不改当前 prompt，要下个会话才生效。写记忆和用记忆之间隔了一个会话边界，这正是上下文和记忆分开的直接证据：一个是当下在用的快照，一个是磁盘上的底本。</p>
      <blockquote>
        <p>上下文是桌面，记忆是笔记本。桌面上只能放正在用的几张纸，重要的写进笔记本收起来，下次要用再拿出来摊在桌面上。</p>
      </blockquote>

      <Heading id="minimal">最小实现：三层记忆</Heading>
      <p>最小项目只有一个文件，约 360 行，标准库加 openai，跑法和之前的 100 行 Agent 一样：不用 Key 先跑 <code>--mock</code> 看流程，有 Key 再跑 DeepSeek 的 deepseek-chat。它的记忆就是上面分好的三层，对照 Hermes 的做法，但都缩到最小。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-memory-layers.svg`}
        alt="三层记忆示意图：L1 工作记忆是本轮 messages，快而小；L2 长期记忆是 USER.md 和 MEMORY.md，精简且跨会话；L3 情景记忆是 sessions.jsonl，最全但只在翻旧账时搜"
        width="1200"
        height="560"
        decoding="async"
      />

      <p>第一层是<strong>工作记忆</strong>，就是本轮的 messages 列表。进程一退就没了，不用特意设计，它本来就在 ReAct 循环里。第二层是<strong>长期记忆</strong>，<code>data/USER.md</code> 记画像，<code>data/MEMORY.md</code> 记事实，每条一行 <code>- 内容</code>，人能直接打开看、改、删。第三层是<strong>情景记忆</strong>，<code>data/sessions.jsonl</code> 每轮追加一行 JSON，只追加不改写，所以是可信的原始记录。</p>
      <p>写记忆靠一个 <code>memory</code> 工具，四个动作：add、replace、remove、search。用户说“记住……”或者透露姓名、喜好时调 add；纠正、改主意时调 replace；说“忘了吧”时调 remove；不确定时先调 search。翻原话靠另一个工具 <code>session_search</code>，用户问“上次我们聊了什么”时调它，按关键词搜 JSONL。</p>
      <p>读记忆只有一处，就是启动时。run() 函数在拼 system prompt 的时候，先把两份 MD 文件读进来：</p>
      <pre><code>{`system = ("你是一个会记住用户的助手。"
          "system prompt 里 ## 关于用户 / ## 已学到的事实"
          "就是跨会话记忆：没有就直说不知道，不要编造。\\n\\n"
          + STORE.render())`}</code></pre>
      <p>这行代码就是跨会话 recall 的全部机制，没有别的魔法。模型不是“想起”你，是每轮开局就先读到你的画像。写记忆也是同一条路的反方向：模型调工具，工具把条目追加进 MD 文件，原子写盘——先写临时文件再 os.replace，写一半断电也不会把记忆写坏。</p>
      <p>两个上限是故意留下的。长期记忆统一 2000 字，超了 add 会拒绝并提示先精简，而不是静默丢数据——这是 Hermes 的 2200 字和 1375 字上限的最小版。步数上限还是 8 步，防死循环。验证也很直接：进程 1 说“我叫小明，我喜欢喝美式，不加糖”，退出；打开 data/USER.md，真的写进去了；再开一个全新进程问“我叫什么？我喜欢喝什么？”，能答上来，靠的是磁盘，不是本轮历史。自动验证 <code>test_cross_session.py</code> 用两个独立子进程互相考，还覆盖了忘记和超限，细节在文末附录。</p>

      <Heading id="harness">五家 harness 怎么做的</Heading>
      <p>最小版跑通之后，再看别人怎么做，就能看清每家的取舍在哪里。五家分两派：文件派启动时全量读，数据库派用时现搜。下面这张图先把两派摆在一起，后面再逐家拆。</p>

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
      <p>Codex 很像，但自动记忆默认是关的。<code>AGENTS.md</code> 是你写的指令，全局加仓库里从 git 根目录向下每一级，拼起来，默认总共只取 32KB。Memories 是 Codex 自己从过去聊天里总结的记忆，要在配置里开，存在本机 <code>~/.codex/memories/</code>，会话闲置一段时间后在后台生成。两家的共同点是：记忆就是文件，人能打开看，机器按预算读。</p>

      <Heading id="langgraph-adk" level={3}>LangGraph 与 Google ADK</Heading>
      <p>LangGraph 的分层最像数据库的做法，分两层，界限也最清楚。短期记忆是 Checkpointer，按 <code>thread_id</code> 存每一步的状态快照，<code>InMemorySaver</code> 重启就丢，<code>SqliteSaver</code> 或 <code>PostgresSaver</code> 才能持久化，换一个 thread_id 就是全新的人。长期记忆是 <code>BaseStore</code>，按用户命名空间存事实，不按 thread 分，新 thread 的老用户照样能拿到偏好。LangMem 是上面的一层工具，让模型像调工具一样读写 Store，后台在回答发出去之后再抽取，避免挡住当轮回答。</p>
      <p>Google ADK 把会话和记忆做成两个不同的服务。<code>SessionService</code> 管一轮会话内的状态，<code>MemoryService</code> 管跨会话的长期知识，作用域是应用加用户。<code>InMemoryMemoryService</code> 存原样事件、关键词匹配，进程一退就没了，只适合原型；<code>VertexAiMemoryBankService</code> 在会话结束后用 LLM 把对话提炼成事实、去重、再做向量索引，检索走语义相似度。关键点是：ADK 的记忆不是自动填的，开发者必须显式调 <code>add_session_to_memory()</code>，否则只有会话，没有长期记忆。</p>

      <Heading id="crewai" level={3}>CrewAI</Heading>
      <p>CrewAI 现在是一套统一的 Memory 类，取代了过去分开的短期、长期、实体几种。Crew 里 <code>memory=True</code> 就开了，每次任务之后自动从任务输出里抽出离散的事实存下来，下个任务开始前再按需召回。记忆按层级 scope 组织，像文件系统的一棵树，<code>/project/alpha</code>、<code>/agent/researcher</code> 这样的路径，召回时只搜所在分支，精度和速度都更好。排序是相似度、新近度、重要性三者的加权，默认存在本地 LanceDB。它的思路和 LangGraph、ADK 是一派：记忆是数据库里的条目，启动时只给画像，需要时再搜。</p>
      <p>对照一下 Hermes：内置的 MEMORY.md 和 USER.md 走的是文件派，memory 工具读写，外接服务一次只能接一个，honcho、mem0、supermemory 这些就是数据库派的接法。最小项目和 Hermes、Claude Code、Codex 是一派，LangGraph、ADK、CrewAI 是另一派。先走左派，量上来了再走右派——顺序反了，就是给小项目背数据库的债。</p>

      <Heading id="pitfalls">写记忆时最容易踩的三个坑</Heading>
      <p>这三个坑都是我在写最小项目、跑跨会话验证时真的踩到的，不是想出来的。每一个都对应记忆系统里一个具体的机制，值得单独记一笔。</p>
      <ul>
        <li><strong>问句不能当成要记的内容。</strong>第一版假模型看到“我叫什么？”就调 memory 工具记了一条“姓名：什么？”，看到“我喜欢喝什么？”就记了“喜欢：喝什么？”。修法很直接：先判断是不是问句，问句走回答分支，只有陈述句才走提取分支。真模型也会犯这个错，所以 memory 工具的描述里要写清：只有用户透露、纠正、明确说“记住”时才写，提问时先搜、没有就直说不知道。</li>
        <li><strong>会话 ID 不能只精确到秒。</strong>第一版 session_id 是 <code>%Y%m%d_%H%M%S</code>，两个进程 1 秒内先后启动就会撞 ID。session_search 翻“上次”时要排除本会话，结果把上个会话也排掉了，搜不到是必然的。修法是微秒加进程号。这个坑的教训是：记忆系统的 ID 是身份，身份撞了，隔离和召回一起坏。</li>
        <li><strong>翻旧账要排除本会话。</strong>不排除的话，刚问的那句“上次我说了喜欢喝什么？”本身就会命中关键词，把真正的原话挤出前三条。修法是在 search 里加一个 <code>exclude_session_id</code> 参数。更一般的教训是：检索的输入里混进了查询本身，是记忆系统里很常见的污染，关键词搜和向量搜都会遇到，只是表现不同。</li>
      </ul>
      <p>这三个坑有一个共同点：它们都不是模型的问题，是 harness 的问题。模型再聪明，也救不了把问句当事实写进去的提取、撞号的会话 ID、和被查询污染的检索。记忆系统的质量，一大半在这些看似琐碎的工程细节上。</p>

      <Heading id="closing">收尾：从最小版到生产</Heading>
      <p>回头看，最小版和生产版之间只隔着三件事。第一件是<strong>检索升级</strong>：把 session_search 的关键词匹配换成向量检索，先有这一步，才需要向量库，在此之前关键词加引用图就够了，上一篇讲缓存的文章已经把这个顺序写过。第二件是<strong>自动抽取</strong>：每轮结束加一次 LLM 抽取，把本轮对话自动提炼一两条进 MEMORY.md，现在是模型在轮内决定记不记，抽取后移能省当轮的延迟。第三件是<strong>遗忘策略</strong>：记忆加过期和重要性打分，满了先删不重要的，而不是直接拒绝——最小版的 2000 字上限是故意留的硬护栏，生产版要把它换成软策略。</p>
      <p>但这三件都是在循环外面加东西，循环本身不用变：上下文产生记忆，记忆回到上下文。先把这个循环手写一遍、跑通跨会话，再谈向量库和自动抽取，理解来得更快，也更牢。能手写一个记忆系统，和会调用一个记忆服务，是两种不同的理解。</p>
    </PostLayout>
  );
}

export default PostAgentMemory;

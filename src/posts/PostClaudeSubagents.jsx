import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
import { Compare } from '../figures';

const TOC_ITEMS = [
  { id: 'reviewer-first', label: '先看 code-reviewer：只读是最重要的设计' },
  { id: 'context-isolation', label: '子代理真正卖的是上下文隔离，不是并行' },
  { id: 'contract', label: '一张 frontmatter，就是一份组织契约' },
  { id: 'cost-routing', label: '模型、effort 与成本路由' },
  { id: 'trust-boundary', label: '权限、Hook 与输出扫描：防的是失控，不是坏人' },
  { id: 'fork-choice', label: '分叉与子代理：什么时候不该隔离' },
  { id: 'when-not', label: '什么时候别用子代理' },
];

const REFERENCES = [
  {
    href: 'https://code.claude.com/docs/zh-CN/sub-agents',
    label: 'Claude Code 官方文档 · 创建自定义 subagents（中文）',
    note: '本文的主要来源：内置子代理、作用域、frontmatter、模型与权限规则均出自这里',
  },
  {
    href: 'https://code.claude.com/docs/en/sub-agents',
    label: 'Claude Code Docs · Create custom subagents',
    note: '同一页的英文原版，核对字段名与版本说明时以它为准',
  },
  {
    href: 'https://code.claude.com/docs/zh-CN/sub-agents#code-reviewer',
    label: 'Claude Code 官方文档 · 示例 subagents：代码审查者',
    note: '本文的起点：只读审查者的设计，也是附录里那份改写版的对照',
  },
];

const APPENDIX = [
  {
    id: 'reviewer-file',
    title: '一份改写过的 code-reviewer',
    body: (
      <React.Fragment>
        <p>下面是我按官方示例改写后的版本，不是官方原文的逐字复制。改动有三处：把输出格式写进系统提示词，让审查结果能直接进待办；加了 <code>maxTurns</code>，防止一次审查拖成马拉松；把「不准改文件」从一句话变成工具层面的保证。</p>
        <pre><code>{`---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 20
---
You are a senior code reviewer. You review code, you never modify it.

When invoked:
1. Run git diff HEAD to see recent changes, then read the changed files.
2. Check, in this order: correctness, security, error handling, then style.
3. Report only findings with evidence. For each finding give file and line, severity, what breaks, and one concrete fix.
4. If there is no real finding, say so in one line. Do not invent style issues to fill the report.`}</code></pre>
        <p>注意 <code>tools</code> 里有 <code>Bash</code>，但没有 <code>Edit</code> 和 <code>Write</code>。审查者能跑 <code>git diff</code>、能读测试输出，但手里没有改文件的工具。想让它「顺手修一下」，就得另建一个 debugger 子代理——那是另一个角色，不是同一个人的两种心情。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'frontmatter-cheat',
    title: 'frontmatter 速查',
    body: (
      <React.Fragment>
        <p>只有 <code>name</code> 和 <code>description</code> 是必填的，其余都是收紧用的旋钮。按我自己的使用频率排个序：</p>
        <ul>
          <li><strong>description。</strong>路由表。写清「什么时候用、用什么触发词」，别写能力清单。</li>
          <li><strong>tools / disallowedTools。</strong>爆炸半径。只读审查者就只给读的工具；先给白名单，再考虑黑名单。</li>
          <li><strong>model。</strong>成本与能力。探索用 Haiku，审查用 Sonnet，疑难才上 Opus。</li>
          <li><strong>permissionMode。</strong>默认继承主对话；主对话在 plan 模式时子代理也被锁在 plan 模式。</li>
          <li><strong>maxTurns。</strong>给长任务一个停表，到了就返回部分结果，主对话可以恢复它继续。</li>
          <li><strong>effort。</strong>low / medium / high / xhigh / max；环境变量优先于它。</li>
          <li><strong>memory。</strong>user / project / local；想进版本控制、团队共享就选 project。</li>
          <li><strong>isolation: worktree。</strong>给子代理一份仓库隔离副本，改动不污染当前检出。</li>
          <li><strong>skills。</strong>启动时把完整 skill 内容预加载进来，而不是等它现找。</li>
          <li><strong>hooks。</strong>只属于这个子代理的生命周期 hook，比如 PreToolUse 拦截写操作。</li>
          <li><strong>omitClaudeMd。</strong>设为 true 时启动不加载 CLAUDE.md，适合提示词里已经给全信息的子代理。</li>
        </ul>
        <p>还有一条容易踩的坑：Claude Code 会静默忽略它不认识的 frontmatter 字段，不报错。拼错了字段名，子代理照样跑，只是你的配置没生效。怀疑时用 <code>claude --debug</code>，在调试日志里搜 <code>does not recognize or apply</code>。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'new-agent-checklist',
    title: '新建子代理检查清单',
    body: (
      <ul>
        <li><strong>名字唯一。</strong>同一目录树下别重名；插件子代理的名字带作用域，比如 my-plugin:code-reviewer。</li>
        <li><strong>描述能当路由用。</strong>读一遍就知道「什么任务派给它」，总描述超过 15,000 token 时启动会警告。</li>
        <li><strong>工具是白名单。</strong>先想「它最少需要什么」，而不是「它能用什么」。</li>
        <li><strong>委托提示词自包含。</strong>子代理看不到你的对话历史，背景、路径、验收标准都要写进那一次调用里。</li>
        <li><strong>返回格式有约定。</strong>文件与行号、严重程度、证据、建议修复，缺了哪一项报告就没法直接用。</li>
        <li><strong>先测一次真实任务。</strong>用 --agents 临时定义、或在项目里建一个文件跑一次，再决定要不要提交进版本控制。</li>
        <li><strong>想好放哪一层。</strong>只给自己用放 ~/.claude/agents/，团队共享放 .claude/agents/ 并提交，组织统一放托管设置。</li>
      </ul>
    ),
  },
];

export function PostClaudeSubagents() {
  return (
    <PostLayout
      title="Subagent 不是多开一个聊天框"
      dek="从 code-reviewer 说起：上下文隔离、只读审查与成本路由，才是 Claude Code 子代理真正要解决的问题。"
      dateTime="2026-11-12"
      date="2026 年 11 月 12 日"
      readingTime="约 10 分钟"
      metaDescription="读 Claude Code 官方 subagents 文档：从只读的 code-reviewer 出发，讲上下文隔离、frontmatter 契约、成本路由与权限边界，以及什么时候不该用子代理。"
      link={{
        href: 'https://code.claude.com/docs/zh-CN/sub-agents#code-reviewer',
        label: '原文：Claude Code 官方文档',
      }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>Claude Code 的 subagent 文档很长，九百多行，字段表、权限表、作用域表一张接一张。第一次读很容易得出一个印象：这就是给 AI 多开几个聊天框，并行干活。但读完 <code>code-reviewer</code> 那个示例，我的判断反过来了——<strong>子代理真正卖的不是并行，而是隔离</strong>：把一次会产生大量中间输出的工作关进一个独立的上下文窗口，只把摘要还给你；把一个角色的权限收紧到它真的需要的范围，让它想越界也越不了。</p>
      <p>这篇文章以官方文档的 <code>code-reviewer</code> 为起点，顺着它把文档里最值得留下的几条线理出来：只读审查为什么是最好的第一课，frontmatter 到底在契约什么，模型与成本怎么路由，权限与输出扫描的边界在哪里，以及分叉出现之后，什么时候反而不该隔离。文中的事实与数字都来自官方文档，判断是我自己的。</p>

      <Heading id="reviewer-first">先看 code-reviewer：只读是最重要的设计</Heading>
      <p>官方示例里的代码审查者，是一个只读 subagent：审查代码而不修改它。它的工具列表里只有 <code>Read</code>、<code>Grep</code>、<code>Glob</code>、<code>Bash</code>，没有 <code>Edit</code> 和 <code>Write</code>。系统提示词写清了要查什么、按什么顺序查、报告长什么样。这个组合看起来朴素，却恰好是理解子代理的最小完整模型。</p>
      <p>关键在「不能改」不是一句提示词，而是一层工具限制。提示词可以被模型忽略、被上下文带偏、被一次委婉的请求绕过去；工具列表不会。一个没有 <code>Edit</code> 的审查者，就算它觉得某行代码「顺手就能修」，也只能把修复建议写进报告里。这个差别，就是把「审查」和「执行」分开的真正含义——不是分工上的礼貌，而是能力上的不可能。</p>
      <p>这也是我把它当作第一个子代理的原因。很多人在第一次做 Agent 系统时，会先做一个全能的执行者，再事后补一个审查环节。顺序反了。审查者应该先存在，而且先以只读形态存在：它逼你把「什么算问题、什么算证据、报告长什么样」先写清楚。如果审查标准本身是模糊的，执行者再强，也只是在高效地生产不可复核的结果。</p>
      <p>放在我之前画的那套 Agent 平台里看，这一点更明显。那张图里 <code>Router → Agent / Worker → Reviewer</code> 的链路，本质上就是把 <code>code-reviewer</code> 放大了一级：执行者在一个沙箱里干活，审查者在另一个上下文里独立判断，交付之前必须经过它。Claude Code 把这套模式收敛成了一个 Markdown 文件加一段 frontmatter，门槛低了很多，但结构没变——审查与执行分离，靠的不是自觉，而是边界。</p>
      <blockquote>
        <p>审查者最值钱的属性不是「看得准」，而是「改不了」。</p>
      </blockquote>
      <p>当然，只读也有代价。审查者看不到你刚在主对话里讨论过的取舍，除非你在委托时写进去；它也不能顺手跑一次修复验证。官方文档里 debugger 示例的存在，就是为了补这一块：同一个任务，审查用只读的角色，修复用能改代码的角色，两个角色之间用报告交接，而不是让一个人同时拥有两把钥匙。</p>

      <Heading id="context-isolation">子代理真正卖的是上下文隔离，不是并行</Heading>
      <p>文档开篇就把子代理的定位写得很直白：当一个辅助任务会用搜索结果、日志或文件内容充斥主对话，而你不会再次引用这些内容时，就用子代理。每个子代理在自己的 context window 中运行，有自定义系统提示、特定的工具访问权限和独立的权限。它独立工作，只返回结果。</p>
      <p>这句话里真正的主角是「充斥」两个字。跑测试、翻日志、扫代码库，这些工作的中间产物往往很长，但主对话真正需要的只是一行结论：「三处失败都在同一个模块，根因是超时配置」。如果把几千行日志都留在主对话里，后面的每一次推理都要为它们付 token，还要冒着被无关细节带偏的风险。子代理就是把这部分成本关进一个用完即弃的窗口。</p>
      <p>内置的 <code>Explore</code> 和 <code>Plan</code> 是这个思路最干净的体现。它们是只读代理，启动时不加载 <code>CLAUDE.md</code> 和 git 状态快照，为的就是让研究更快、更便宜。<code>Explore</code> 还分了三档彻底程度：quick、medium、very thorough。也就是说，官方自己也在教你：探索的深度是预算，不是态度——先想清楚这次要找的东西值多少上下文，再决定派多彻底的代理去。</p>
      <p>并行研究当然是子代理的常见用法，文档也写了：相互独立的调查可以同时派多个子代理，最后由主对话综合。但我觉得这只是隔离的副产品。真正决定要不要用子代理的，不是有几个任务，而是有多少中间输出不值得留在主对话里。如果一次任务的输出本身就是你要反复引用的结论，那它留在主对话里反而更好，派子代理只会多一次转述的损耗。</p>
      <p>还有一个容易被忽略的细节：子代理从零开始。它看不到你的对话历史、你已调用的 skill、你已读过的文件。主对话要给它写一条概括任务的委托消息，它以此为起点。这意味着委托提示词的质量，几乎直接决定了子代理的质量。「帮我看看这段代码」和「审查这次提交里新增的鉴权逻辑，重点看越权与错误处理，输出文件与行号加严重程度」，是两种完全不同的委托。前者把判断的责任推给了子代理，后者把判断的标准留在了自己手里。</p>

      <Heading id="contract">一张 frontmatter，就是一份组织契约</Heading>
      <p>子代理的定义方式简单得有点反直觉：一个 Markdown 文件，顶部一段 YAML frontmatter，下面是系统提示词。frontmatter 里只有 <code>name</code> 和 <code>description</code> 是必填的，其余字段全是可选的。但这份简单是有意的——文件的位置决定谁能用它，frontmatter 决定它能做什么。</p>
      <p>位置就是作用域，而且有明确的优先级：托管设置最高，其次是启动时用 <code>--agents</code> 传入的会话级定义，然后是项目里的 <code>.claude/agents/</code>，再是用户级的 <code>~/.claude/agents/</code>，最后是插件的 <code>agents/</code> 目录。同名时高优先级覆盖低优先级，项目里离工作目录最近的定义优先。这一套规则读起来像配置文件，实际上是一份组织契约：组织能统一发审查标准，项目能按自己的代码库定制，个人能保留自己的习惯，三层之间不打架。</p>
      <p>对我来说，最有启发的是项目级子代理要提交进版本控制这条建议。把 <code>.claude/agents/code-reviewer.md</code> 提交上去，团队用的就是同一份审查标准、同一套输出格式。审查不再依赖某个人的提示词技巧，而是一份可以被 review、可以被回滚、可以随代码一起演进的文件。这和把 lint 规则、CI 脚本放进仓库是同一个逻辑：凡是希望团队一致的东西，都应该进版本控制，而不是留在某个人的本地配置里。</p>
      <p>而 <code>description</code> 字段，是整份契约里最容易被低估的一行。它不只是介绍，是 Claude 决定「什么时候派这个子代理」的路由表。文档建议在描述里写上 <code>use proactively</code> 这类短语来鼓励主动委托，也提醒描述总和超过 15,000 个 token 时启动会警告。我的理解是：描述要写给路由看，不是写给人看的——写清触发条件，少写能力清单，细节挪到系统提示词里，那里只在子代理运行时才加载。</p>
      <p>这种「路由信息要省，执行信息要全」的取舍，和我之前项目里 Router 的设计是同一个问题。那张图里的 Router 只做接待分流、不执行重活，原因也一样：入口处的信息越轻，入口越不容易被拖垮。只不过 Claude Code 把这条规则写进了 token 预算：15,000，超过就警告。</p>

      <Heading id="cost-routing">模型、effort 与成本路由</Heading>
      <p>子代理的模型选择，文档给了一个清晰的优先级：单次调用传的 <code>model</code> 参数优先，其次是定义里的 <code>model</code> 字段，再次是 <code>CLAUDE_CODE_SUBAGENT_MODEL</code> 环境变量，最后才继承主对话的模型。想把所有子代理都锁在同一个模型上，再加一个 <code>CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1</code>。</p>
      <p>这个顺序本身就是一种成本观：越具体的指定越优先，越全局的越是兜底。日常做法也可以照着这个顺序想——默认让子代理继承主对话模型，只在少数角色上显式降级或升级。探索、查资料、跑日志这种「读得多、判断轻」的活，交给 Haiku；审查、需要仔细推理的活，用 Sonnet；只有真正疑难的，才值得上 Opus。文档里内置子代理的安排也是这样：<code>Explore</code> 在很多场景下跑 Opus 或主对话模型，<code>claude-code-guide</code> 这种问答类角色直接用 Haiku。</p>
      <p>再往下还有一层旋钮，是 <code>effort</code>：low、medium、high、xhigh、max。它覆盖会话的 effort 级别，但不覆盖 <code>CLAUDE_CODE_EFFORT_LEVEL</code> 环境变量。我的看法是，effort 和模型是两条不同的成本线——模型决定「谁来想」，effort 决定「想多深」。给审查者设一个合适的 effort，比盲目升级模型更划算：一次 medium 的 Sonnet 审查，往往比一次 low 的 Opus 审查更可靠，也更便宜。</p>
      <p>还有两个数字值得记在心里。并发子代理默认上限是 20 个，超过就拒绝生成新的，等运行数降下来才能继续；嵌套深度默认是 3 层，再往下 <code>Agent</code> 工具会被拿掉。20 和 3 都不大，但这正是它们合理的地方：子代理是用来隔离的，不是用来无限 fan-out 的。真有需要持续并行、或塞不进一个上下文窗口的工作，文档建议换成独立的会话，再让 Claude 在会话之间传递发现——那已经是另一个层面的编排了。</p>

      <Heading id="trust-boundary">权限、Hook 与输出扫描：防的是失控，不是坏人</Heading>
      <p>子代理的能力控制有三层，越往下越贴近「它真的能做什么」。第一层是工具白名单与黑名单：<code>tools</code> 是允许列表，<code>disallowedTools</code> 是拒绝列表，两者都设时先应用拒绝、再解析允许。同时出现在两边的会被移除。还有一个细节值得单独记：<code>disallowedTools</code> 里写 <code>Bash(git push *)</code> 这种带说明符的条目，移除的是整个 Bash 工具，而不只是那条命令。想只禁一条命令，要去 <code>permissions.deny</code> 里加规则，那里的规则同时管主对话和子代理。</p>
      <p>第二层是 <code>permissionMode</code>。子代理默认继承主对话的权限模式，但在两种情况下主对话会压过它：主对话在 <code>bypassPermissions</code>、<code>acceptEdits</code> 或自动模式时，子代理跟着走；主对话在 plan 模式时，子代理无论如何都留在 plan 模式。这条规则我觉得写得很好——它承认了一个现实：子代理的权限不能比派它的人更大。审查者再可信，也不能在主对话被锁定时替你把锁打开。</p>
      <p>第三层是 Hook。文档里数据库查询验证器的例子很典型：一个 <code>PreToolUse</code> hook 在每个 Bash 命令执行前检查它，只放行 <code>SELECT</code>，写操作返回退出码 2 就被拦下，子代理会看到 <code>Blocked</code> 提示。Hook 的意义不在于提示词写得多严，而在于它在工具执行之前、模型意图之外又加了一道机械检查。提示词是「希望它别这么做」，Hook 是「这么做会被拦下」。对只读审查者来说，这两层叠加才算完整。</p>
      <p>最后是输出扫描，这一段最容易被误读。Claude Code 会在主对话读取子代理的最终报告之前扫描它：如果报告里有模仿系统提示的文本，会插入反斜杠；如果提到了 <code>bypassPermissions</code> 这类权限设置，会在开头加一行 <code>[harness: ...]</code> 标记。但文档把边界写得很清楚：扫描不判断内容是否恶意，也不改写指令的效果，报告促使主对话发起的工具调用仍然要过权限检查和沙箱隔离。</p>
      <blockquote>
        <p>扫描防的是「报告里的文字被误读成你的指令」，不是「子代理不会干坏事」。真正的边界，永远是权限与沙箱。</p>
      </blockquote>
      <p>这个提醒对做 Agent 平台的人尤其重要。我的项目里 Reviewer 之后也有交付环节，道理相同：审查报告再权威，也只是一份输入；真正决定能不能落地的，是执行侧的权限与沙箱。把安全感寄托在「提示词写得够严」或「扫描过了」上，都是在把边界放在错误的那一层。</p>

      <Heading id="fork-choice">分叉与子代理：什么时候不该隔离</Heading>
      <p>读到文档后半段的分叉，我才意识到子代理有一个反面：如果一个辅助任务需要太多背景才能有用，隔离反而是负担。分叉就是为这个场景准备的：它继承到目前为止的整个对话，而不是从头开始——同样的系统提示、工具、模型和消息历史，只有它自己的工具调用留在主对话之外，最终结果返回，主对话的上下文保持干净。</p>
      <p>分叉和子代理的对照，文档用一张表写得很干净。分叉继承完整对话历史，子代理从新鲜上下文加委托提示开始；分叉与主会话共享提示缓存，所以第一个请求能复用缓存、成本更低；子代理有自己的缓存。想从相同起点并行尝试多种方法、或者想在继续主线实现的同时让它起草测试用例，分叉是更合适的选择。</p>
      <p>我的取舍是这样：任务需要的背景越多、和主线耦合越紧，越倾向分叉；任务越独立、中间输出越脏、越需要硬性的工具限制，越倾向子代理。审查新提交的代码，适合子代理——输入就是 diff，背景可以一次给全；在一个已经讨论了半小时的方案上换个角度重做，适合分叉——重讲一遍背景的成本，比隔离省下的上下文还贵。</p>
      <Compare
        title="主对话、分叉、子代理：三者的位置"
        caption="对照来自官方文档「分叉与其他 subagents 的区别」与「在子代理和主对话之间选择」两节。左侧是每种方式的起点，右侧是它换来的东西。"
        pairs={[
          {
            id: 'main',
            prompt: '任务就在当前对话里，改动很小，要反复确认？',
            before: { label: '主对话', body: '直接在主对话里做。频繁来回、共享大量上下文、延迟重要时，别派子代理。' },
            after: { label: '子代理', body: '从零开始，要花时间收集上下文。只适合输出脏、能一次说清、能返回摘要的任务。' },
          },
          {
            id: 'fork',
            prompt: '辅助任务需要主对话的全部背景？',
            before: { label: '子代理', body: '新鲜上下文，只拿到委托提示。背景讲不全，结果就容易走偏。' },
            after: { label: '分叉', body: '继承完整对话历史、系统提示、工具与模型，共享提示缓存。适合从相同起点并行尝试多种方法。' },
          },
          {
            id: 'review',
            prompt: '审查代码，怕审查者顺手改了？',
            before: { label: '全能执行者', body: '既能读又能改，审查标准写在提示词里，能不能守住全看模型自觉。' },
            after: { label: '只读 code-reviewer', body: '工具列表里没有 Edit 与 Write。想改，就得另派一个 debugger，报告交接。' },
          },
        ]}
      />
      <p>还有一个操作层面的差别：默认情况下，主对话派出的子代理在后台启动，你可以继续工作；前台子代理会阻塞主对话直到完成。后台子代理的权限提示会出现在主会话里，你批一次，它继续跑。这一点和团队协作很像——派出去的人不需要你盯着每一步，只需要在需要拍板的时候回来问一句。</p>

      <Heading id="when-not">什么时候别用子代理</Heading>
      <p>文档最后给了两条「别用」的建议，我觉得值得原样记下来。第一，如果你想要的是可复用的提示词或工作流、并且希望它们在主对话上下文中而不是隔离的子代理上下文中运行，应该用 Skill，而不是子代理。第二，如果只是问一个关于对话里已有内容的问题，用 <code>/btw</code>，它不用工具，答案也不进历史记录。</p>
      <p>这两条合起来，其实是在划另一条线：子代理是「派一个人去干活」，Skill 是「给自己一份操作手册」，<code>/btw</code> 是「随口问一句」。三者的成本从低到高，隔离程度也是从低到高。很多人（包括以前的我）的问题，是手里只有子代理这一把锤子，问个问题也要派一个代理去查，查完还把答案留在历史里。</p>
      <p>所以我的落地建议很克制：先只做两到三个子代理。一个是读代码库的探索者，一个是只读的 <code>code-reviewer</code>，再按你的项目补一个领域角色——比如我那个平台里的 Worker、或者一个专门跑测试的。每个子代理都要有一份返回契约：报告的格式、严重程度怎么分、证据写到什么粒度。没有契约的子代理，返回的只是一段散文，主对话还得再读一遍、再提炼一次，隔离省下的上下文，又在转述里花掉了。</p>
      <p>最后回到开头那句话。Subagent 不是多开一个聊天框，而是一次有意识的拆分：把「谁来干、能干什么、干完交什么」写成一份能进版本控制的文件，然后让主对话只保留它真正需要的结论。如果你的第一个子代理只能选一个，就选 <code>code-reviewer</code>。只读、便宜、好验证，而且它会逼你先把标准写清楚——这恰恰是所有 Agent 系统里最难、也最值得先做的那一步。</p>
    </PostLayout>
  );
}

export default PostClaudeSubagents;

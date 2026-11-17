import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

/* ==========================================================================
   Claude Code 源码电子书 —— 按 dg-ai-notes 那本 Pi 电子书的办法写。
   样式对照（dg-ai-notes 的 web 电子书 → 本站 PostLayout）：
   - 左侧按系列隔离的目录 → 左侧粘性目录（上篇 P01–P03 / 下篇 M01–M06）
   - 右侧本页大纲 → 右侧 Agent笔记栏（只记结论与出处，不复述正文）
   - 每章「是什么 / 怎么做 / 为什么」→ 每章先给一句话定义，再讲机制，最后讲取舍
   - 章末上下章导航 + 参考文献 + 附录速查 → 文末参考文献与阅读 + 附录
   - 阅读进度条、深浅色、灯箱 → PostLayout 已有，全站通用
   事实口径：凡是写了数字的地方，都注明是仓库 README 写的，还是我自己
   在克隆下来的仓库里数出来的。两者不一样时，以数出来的为准，并写清原因。
   ========================================================================== */

const TOC_ITEMS = [
  { id: 'intro', label: '开篇，先把结论放前面' },
  { id: 'p01', label: 'P01 跑起来，十分钟' },
  { id: 'p02', label: 'P02 全貌，1987 个文件' },
  { id: 'p03', label: 'P03 一次问答走了多远' },
  { id: 'm01', label: 'M01 电子宠物 Buddy' },
  { id: 'm02', label: 'M02 永不关机的 Kairos' },
  { id: 'm03', label: 'M03 云端规划 Ultraplan' },
  { id: 'm04', label: 'M04 指挥官 Coordinator' },
  { id: 'm05', label: 'M05 远程遥控 Bridge' },
  { id: 'm06', label: 'M06 三层门控' },
  { id: 'closing', label: '收尾，怎么读，别怎么读' },
];

const AGENT_NOTES = [
  {
    id: 'intro',
    title: '这篇只讲一个仓库',
    text: 'pengchengneo/Claude-Code，一个从 npm source map 还原出来的非官方仓库。官方 Claude Code 怎么用，不在这篇里。',
  },
  {
    id: 'p01',
    title: '跑起来只要三行',
    text: 'bun install、bun run dev、bun run version。版本号 999.0.0-restored 是还原版自己的标记，不是官方版本号。',
  },
  {
    id: 'p02',
    title: '数字有两个口径',
    text: 'README 写 53 个工具、87 个命令，我数出来 src/tools/ 有 54 个目录、src/commands/ 有 102 个条目。一个是注册数，一个是文件数。',
  },
  {
    id: 'p03',
    title: '跟一条链就够了',
    text: 'main.tsx → query.ts → QueryEngine.ts → tools。先把这条链走通，再去翻边上的 87 个 hook。',
  },
  {
    id: 'm01',
    title: 'Buddy 的关键就两行',
    text: '盐值 friend-2026-401 加 FNV-1a 哈希，每人固定一只宠物。开关是 feature(BUDDY)，外部版没有，别去找 /buddy。',
  },
  {
    id: 'm02',
    title: 'Kairos 的关键是五层检查',
    text: '编译开关、settings.assistant、目录信任、GrowthBook、全局激活，少一层都开不起来。做梦的条件是 24 小时加 5 个新会话。',
  },
  {
    id: 'm03',
    title: 'Ultraplan 外部永远不可用',
    text: 'isEnabled 写的是 external === ant，恒为 false。30 分钟是轮询超时，不是模型思考时间。',
  },
  {
    id: 'm04',
    title: 'Coordinator 只有三个工具',
    text: 'Agent、SendMessage、TaskStop。指挥官不碰代码，铁律是禁止甩锅式委派。',
  },
  {
    id: 'm05',
    title: 'Bridge 要过三重检查',
    text: '编译开关、付费订阅、GrowthBook tengu_ccr_bridge。单会话、worktree、共享目录是三种分发模式。',
  },
  {
    id: 'm06',
    title: '门控分三层，别只记一层',
    text: '编译时 feature()、运行时 USER_TYPE、远程 GrowthBook。我 grep 出 89 个不同的 feature 开关名，README 只列了约 50 个核心的。',
  },
  {
    id: 'closing',
    title: '三条红线',
    text: '别当官方版用，别商用，别指望隐藏功能能在你手里跑起来。读源码可以，照着改了发出去不行。',
  },
];

const REFERENCES = [
  {
    href: 'https://github.com/pengchengneo/Claude-Code',
    label: 'pengchengneo/Claude-Code',
    note: '本文的全部素材来源：还原后的源码、README 与 docs/01–07 七篇分析',
  },
  {
    href: 'https://github.com/buchidonggua/dg-ai-notes',
    label: 'buchidonggua/dg-ai-notes',
    note: '本文模仿的电子书样式：双轨章节、左右双栏、每章是什么/怎么做/为什么',
  },
  {
    href: 'https://dg-ai-notes.pages.dev',
    label: 'dg-ai-notes 在线电子书',
    note: 'Pi-Agent 电子书的在线版，左目录、右大纲、上下章导航都在这页上能看到',
  },
  {
    href: 'https://www.npmjs.com/package/@anthropic-ai/claude-code',
    label: 'npm · @anthropic-ai/claude-code',
    note: '还原的数据来源：官方 npm 包的 cli.js.map，源码版权归 Anthropic',
  },
  {
    href: 'https://code.claude.com/docs/en/overview',
    label: 'Claude Code 官方文档',
    note: '官方版长什么样、能干什么，以这里为准，不以还原仓库为准',
  },
];

const APPENDIX = [
  {
    id: 'appendix-counts',
    title: '数字核对表，README 与实测对照',
    body: (
      <React.Fragment>
        <p>下面这张表是我在克隆下来的仓库里数出来的。README 的数字是注册数或约数，我的数字是文件数或顶层条目数，口径不一样，所以对不上不是谁错了。</p>
        <ul>
          <li><strong>TypeScript 源文件。</strong>README 写 1,987 个，我数出来也是 1,987 个（find src -name *.ts -o -name *.tsx），对得上。</li>
          <li><strong>工具。</strong>README 写 53 个，src/tools/ 下有 54 个目录。差的那一个，可能是某个目录没注册成工具，或者是计数时把两个算成了一个。</li>
          <li><strong>斜杠命令。</strong>README 写 87 个，src/commands/ 下有 102 个条目（含子目录与 12 个顶层 .ts 文件）。87 是注册进命令表的数。</li>
          <li><strong>终端 UI 组件。</strong>README 写 148 个，src/components/ 顶层有 146 个条目。子目录里的组件没算进去，就会差这两个。</li>
          <li><strong>Hooks。</strong>README 写 87 个，src/hooks/ 顶层有 85 个条目。口径同上。</li>
          <li><strong>Bridge。</strong>README 写 31 个文件，我数出来 src/bridge/ 有 33 个文件。docs/06 写 33 个文件，跟我数的一致。</li>
          <li><strong>feature 开关。</strong>README 列了约 50 个核心开关，我 grep 出 89 个不同的 feature(…) 开关名，多出来的大多是基础设施开关，比如 IS_LIBC_MUSL、PERFETTO_TRACING 这类。</li>
          <li><strong>主入口行数。</strong>src/main.tsx 4,690 行，src/query.ts 1,729 行，src/QueryEngine.ts 1,295 行，都是 wc -l 数出来的。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-commands',
    title: '隐藏命令速查',
    body: (
      <React.Fragment>
        <p>分两拨。第一拨是编译开关控制的，外部版里看不见；第二拨是只有 Anthropic 内部用户（USER_TYPE === ant）才能看见的。两拨都出自仓库的 docs/05，命令名与开关名我都对过源码里的注册表。</p>
        <ul>
          <li><strong>/buddy，开关 BUDDY。</strong>宠物系统，见 M01。</li>
          <li><strong>/proactive，开关 PROACTIVE / KAIROS。</strong>主动自主模式。</li>
          <li><strong>/assistant，开关 KAIROS。</strong>持久助手模式，见 M02。</li>
          <li><strong>/brief，开关 KAIROS / KAIROS_BRIEF。</strong>简报模式。</li>
          <li><strong>/bridge，开关 BRIDGE_MODE。</strong>远程控制桥接，见 M05。</li>
          <li><strong>/voice，开关 VOICE_MODE。</strong>语音模式。</li>
          <li><strong>/ultraplan，开关 ULTRAPLAN。</strong>云端深度规划，见 M03。</li>
          <li><strong>/fork，开关 FORK_SUBAGENT。</strong>子代理分叉。</li>
          <li><strong>/peers，开关 UDS_INBOX。</strong>对等通信，走 Unix Domain Socket。</li>
          <li><strong>/workflows，开关 WORKFLOW_SCRIPTS。</strong>工作流脚本。</li>
          <li><strong>/teleport，内部。</strong>传送会话到远程或本地，Ultraplan 的底座。</li>
          <li><strong>/ctx_viz，内部。</strong>上下文可视化。</li>
          <li><strong>/mock-limits 与 /reset-limits，内部。</strong>模拟与重置速率限制。</li>
          <li><strong>/bughunter 与 /autofix-pr，内部。</strong>内部 Bug 猎人与自动修 PR。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-env',
    title: '环境变量与 CLI 参数速查',
    body: (
      <React.Fragment>
        <p>出自仓库 README 的速查表，我只挑了跟正文有关的几条。完整列表在仓库 README 末尾，展开就能看到。</p>
        <ul>
          <li><strong>CLAUDE_CODE_COORDINATOR_MODE。</strong>开 Coordinator 模式，见 M04。光设这个不够，编译时 COORDINATOR_MODE 开关也得开着。</li>
          <li><strong>CLAUDE_CODE_PROACTIVE。</strong>主动模式。</li>
          <li><strong>CLAUDE_CODE_BRIEF。</strong>简报模式。</li>
          <li><strong>CLAUDE_CODE_DISABLE_AUTO_MEMORY。</strong>关掉自动记忆。</li>
          <li><strong>CLAUDE_CODE_MAX_OUTPUT_TOKENS。</strong>最大输出 token。</li>
          <li><strong>CLAUDE_CODE_IDLE_THRESHOLD_MINUTES。</strong>空闲阈值，默认 75 分钟。</li>
          <li><strong>ANTHROPIC_MODEL。</strong>模型覆盖。</li>
          <li><strong>--teleport [session]。</strong>恢复传送会话。</li>
          <li><strong>--remote [description]。</strong>创建远程会话。</li>
          <li><strong>--assistant / --proactive / --brief。</strong>对应上面三种模式的 CLI 参数。</li>
          <li><strong>--agent-teams。</strong>多代理团队。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-gates',
    title: '三层门控速查',
    body: (
      <React.Fragment>
        <p>Anthropic 控制一个功能露不露脸，分三层。读源码时先问它在哪一层，再问它开没开。</p>
        <ul>
          <li><strong>第一层，编译时开关 feature()。</strong>构建时决定代码包不包进来，没包进来的代码会被死代码消除整个删掉。README 列了约 50 个核心开关，我 grep 出 89 个不同开关名。</li>
          <li><strong>第二层，运行时 USER_TYPE。</strong>环境变量 USER_TYPE 是 ant 还是 external。ant 是内部员工，解锁全部功能，GrowthBook 20 分钟刷新一次；external 是外部用户，裁剪版，6 小时刷新一次。源码里 200 多处专属检查，判断条件就是 process.env.USER_TYPE === ant。</li>
          <li><strong>第三层，GrowthBook 远程开关。</strong>带 tengu_ 前缀的远程开关，动态控制。Kairos 是 tengu_kairos，做梦的阈值是 tengu_onyx_plover，Ultraplan 的模型是 tengu_ultraplan_model，Bridge 是 tengu_ccr_bridge，会话记忆是 tengu_session_memory。</li>
        </ul>
      </React.Fragment>
    ),
  },
];

export function PostClaudeCodeSourceBook() {
  return (
    <PostLayout
      title="Claude Code 的源码里，还藏着一套没发布的 Claude Code"
      dek="一个从 npm 包的 source map 还原出来的仓库，1,987 个文件。里面有电子宠物、有永不关机的助手、有云端规划，和三层开关把它们锁起来。这篇是按 dg-ai-notes 那本 Pi 电子书的办法，给它写的读书笔记。"
      dateTime="2026-11-17"
      date="2026 年 11 月 17 日"
      readingTime="约 14 分钟"
      metaDescription="pengchengneo/Claude-Code 还原仓库的读书笔记：1,987 个文件怎么组织，Buddy、Kairos、Ultraplan、Coordinator、Bridge 五个隐藏功能是什么，三层门控怎么把它们锁起来。"
      link={{ href: 'https://github.com/pengchengneo/Claude-Code', label: 'GitHub 上的还原仓库' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
      notes={AGENT_NOTES}
    >
      <Heading id="intro">开篇，先把结论放前面</Heading>
      <p>先把结论放前面，免得你读到一半才发现这篇不是你要的。pengchengneo/Claude-Code 不是官方的 Claude Code，它是从 npm 上发布的 @anthropic-ai/claude-code 包里，把 cli.js.map 里附带的 sourcesContent 抽出来，还原成的一个 TypeScript 仓库。README 第一行就写了，可本地运行，紧接着就是警告，非官方，仅供研究学习，源码版权归 Anthropic。</p>
      <p>这篇也不是教你怎么用 Claude Code。官方文档在 code.claude.com，要学用法去那儿。这篇只干一件事：把这个还原仓库翻开，看看 Anthropic 的终端 Agent 在源码层面长什么样，尤其是那些你平时装到的版本里没有的东西。dg-ai-notes 那本 Pi 电子书的办法很好，我照着它来：分上下两篇，上篇先跑起来、看全貌、跟一条链，下篇一个功能一个功能地拆，每章都回答三个问题，是什么、怎么做、为什么。右边的 Agent笔记栏是这篇新加的，只记结论和出处，不复述正文，读的时候可以当速查。</p>

      <p className="ed-eyebrow">上篇 · 跑起来 — P01–P03</p>
      <Heading id="p01">P01 跑起来，十分钟</Heading>
      <p>这个仓库跑起来不难，难的是别把它当成官方版。先克隆，bun install 装依赖，再 bun run dev 启动 CLI，bun run version 验一下能不能起来。要求写在 package.json 里：Bun 不低于 1.3.5，Node 不低于 24。跑起来之后看到的版本号是 999.0.0-restored，这是还原版自己的标记，意思是“这个版本不存在，是还原出来的”，别拿它去跟官方的版本号对照。</p>
      <p>仓库里没有现成的测试套件，AGENTS.md 写得很直白：改了 TypeScript 模块，就跑上面那三条命令，再手动走一遍你改的那条路。没有 lint，没有统一的 test 命令，验证靠启动和手动 smoke test。这不是偷懒，是还原仓库的常态，1,987 个文件是从 source map 里倒出来的，能跑起来已经不容易，测试基础设施没跟着倒出来。</p>
      <p>跑起来之后先别急着翻隐藏功能，先确认一件事：你手里这个东西，跟 npm 上那个包是不是同一份。还原方式决定了它的可信度边界。source map 里的 sourcesContent 是发布时打进去的源码快照，构建产物和源码是一一对应的，所以大结构可信。但它毕竟不是 Anthropic 的仓库，提交历史只有一条 first commit，没有分支、没有 issue、没有随版本演进的记录。你看到的是一张定格照片，不是连续剧。</p>
      <pre><code>{`bun install       # 安装依赖（需要 Bun ≥ 1.3.5、Node.js ≥ 24）
bun run dev       # 启动 CLI
bun run version   # 验证版本`}</code></pre>
      <p>这三行就是仓库 README 的快速开始，原样抄过来的。十分钟跑通之后，这篇才算真正开始。</p>

      <p className="ed-eyebrow">上篇 · 跑起来 — P01–P03</p>
      <Heading id="p02">P02 全貌，1987 个文件</Heading>
      <p>先站远一点看。src/ 下面是核心源码，我数了一下，1,987 个 TS 和 TSX 文件，跟 README 写的一模一样，这点对得上。顶层分工也干净：tools/ 是工具，commands/ 是斜杠命令，services/ 是 API、MCP、分析、做梦这些服务，components/ 是终端 UI，hooks/ 是自定义 Hook，剩下 buddy、assistant、coordinator、bridge、proactive、vim、voice 各一个目录，各管一个隐藏功能。旁边还有 shims/ 和 vendor/，放原生模块的兼容替代和原生绑定源码。</p>
      <p>数字到这里就开始出现两个口径，我得先说明白，不然你照着数会对不上。README 写 53 个工具，我数出来 src/tools/ 下有 54 个目录；README 写 87 个斜杠命令，我数出来 src/commands/ 下有 102 个条目；README 写 148 个终端 UI 组件，我数出来 src/components/ 顶层有 146 个；README 写 87 个 Hook，我数出来 src/hooks/ 顶层有 85 个。差的那几个，不是数错了，是口径不同。README 数的是注册进系统里的个数，我数的是文件和目录个数。一个目录可能没注册成工具，一个命令可能由好几个文件组成，子目录里的组件顶层 ls 看不见。dg-ai-notes 写 Pi 那篇也遇到过同样的事，他们专门写了一节说明数字的口径，我这篇也照办，核对表放在附录里。</p>
      <p>有三组数字是没争议的。入口 main.tsx 4,690 行，query.ts 1,729 行，QueryEngine.ts 1,295 行，都是 wc -l 数出来的。Bridge 是 33 个文件，docs/06 和我数的一致，README 里写 31 个文件的那处是它自己前后不一致。feature() 开关我 grep 出 89 个不同名字，README 只列了约 50 个核心的，多出来的大多是基础设施开关，比如判断 libc 的 IS_LIBC_MUSL、做性能追踪的 PERFETTO_TRACING，平时读功能的时候可以先不管。</p>
      <pre><code>{`src/                    # 核心源码（1,987 个 TS/TSX）
├── tools/              # 工具，Bash / FileEdit / Agent / MCP……
├── commands/           # 斜杠命令
├── services/           # API / MCP / analytics / autoDream
├── components/         # 终端 UI 组件（React + Ink）
├── hooks/              # 自定义 Hooks
├── buddy/              # 电子宠物系统
├── assistant/          # KAIROS 助手模式
├── coordinator/        # 多 Agent 协调器
├── bridge/             # 远程控制桥接
├── proactive/          # 主动模式
├── vim/                # Vim 模式引擎
├── voice/              # 语音交互
└── ...
shims/                  # 原生模块兼容替代
vendor/                 # 原生绑定源码`}</code></pre>
      <p>这张结构图是仓库 README 里的，我只改了一处：把 tools/ 后面那句“53 个工具”拿掉了，换成工具名的例子。数字的事，上面那段已经说清了，这里不再重复。</p>

      <p className="ed-eyebrow">上篇 · 跑起来 — P01–P03</p>
      <Heading id="p03">P03 一次问答走了多远</Heading>
      <p>全貌看完，接下来跟一条链。Agent 的源码最怕上来就漫无目的地翻，1,987 个文件，翻三天也翻不完。我的办法是只跟一条链：一次问答从敲回车到出结果，在源码里走了多远。入口在 src/dev-entry.ts，它先把版本号、构建时间这些宏配置好，再交给 src/main.tsx。main.tsx 是 4,690 行的大文件，启动、参数解析、模式判断、会话恢复都在这里，Kairos 的五层检查也在这里做。</p>
      <p>真正转起来的是 query.ts 和 QueryEngine.ts。query.ts 里是 query() 的实现，1,729 行；QueryEngine.ts 里是 QueryEngine 类，1,295 行，ask() 是个异步生成器，一边流式吐结果，一边把工具调用的结果再喂回去。这就是 Agent Loop 在这个仓库里的样子：模型给一个回答，回答里带工具调用，执行工具，把结果拼回消息里，再调模型，直到模型不再调工具，或者撞上步数上限。跟 Hermes 那边 delegate_task 的思路是一样的，只是这里没有单独抽一个 coordinator 文件，循环就长在 QueryEngine 里。</p>
      <p>工具是这条链的末端，也是最值得停下来看的一层。Bash、文件读写、Agent、MCP 这些工具都在 src/tools/ 里，每个工具一个目录，里面有自己的 prompt、参数校验和执行逻辑。模型不是直接跑你的命令，它先看到工具的描述，再决定调哪个，调的时候传什么参数。工具描述写得好不好，直接决定模型调得准不准。这点在 dg-ai-notes 的 Pi 精读篇第 5 章也讲过，工具系统就是 Agent 的手脚，手脚怎么被管住，看的就是这一层。</p>
      <p>跟完这条链，你再去看别的目录就有坐标了。components/ 是 Ink 的 React 组件，负责把流式输出画成终端界面；hooks/ 是状态和副作用；services/ 里 autoDream 管做梦，compact 管上下文压缩，mcp 管外部工具。边上的目录各管一摊，互不串台。下篇的五个隐藏功能，每一个都是在主链之外，另起一个目录、另配一套开关长出来的。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m01">M01 电子宠物 Buddy</Heading>
      <p><strong>是什么。</strong>终端里的拓麻歌子，一个完整的虚拟宠物伴侣系统，藏在 src/buddy/ 的 6 个文件里。18 种物种，鸭子、鹅、猫、龙、章鱼、猫头鹰、企鹅、乌龟、蜗牛、幽灵、六角恐龙、水豚、仙人掌、机器人、兔子、蘑菇、果冻、胖猫，每种都有 3 帧 ASCII 精灵动画，5 行高、12 字符宽，500 毫秒一帧，旁边飘气泡对话。窄终端放不下精灵图，就退化成一张表情文字脸，比如 =·ω·=。</p>
      <p><strong>怎么做。</strong>稀有度分 5 档，普通 60%、非凡 25%、稀有 10%、史诗 4%、传说 1%，稀有度越高属性下限越高，普通没有帽子，其他档随机分帽子，皇冠、巫师帽、光环这些一共 8 种。闪光是独立的 1%，任何物种、任何稀有度都有 1% 概率变闪光。最有意思的是确定性生成：账号 UUID 加固定盐值 friend-2026-401，先 FNV-1a 哈希，再喂给 Mulberry32 这个小随机数生成器，每人只会得到一只固定的宠物，改配置也没用。物种名在源码里全是 String.fromCharCode 的十六进制编码，注释写了原因：有个物种名跟内部模型代号撞了，会被构建检查拦截，干脆全部改成编码绕过去。</p>
      <p><strong>为什么。</strong>交互是 /buddy pet 抚摸，带爱心动画；/buddy hatch 孵化；/buddy card 看卡片。编译开关是 feature(BUDDY)，外部版没有开。宠物这件事本身不产生任何生产力，它存在的意义我觉得是反向证明：一个每天被几十万人用的终端工具，里面还留着这种纯好玩的东西。Anthropic 内部把它当彩蛋养着，对外一律锁起来，锁的办法就是下一章要讲的三层门控。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m02">M02 永不关机的 Kairos</Heading>
      <p><strong>是什么。</strong>关掉终端，Claude 还在运行的持久助手模式。Kairos 想把 Claude 从一次性对话工具变成一个持久运行的助手：关掉终端它还在后台跑，每天自动写日志，晚上自动做梦整理记忆，没人说话时自己找活干，命令超过 15 秒自动丢后台。源码位置在 src/assistant/、src/proactive/、src/services/autoDream/。</p>
      <p><strong>怎么做。</strong>激活要过五层检查，定义在 src/main.tsx 里：一是编译时 feature(KAIROS) 开着，二是 .claude/settings.json 里 assistant: true，三是目录信任状态检查，防恶意仓库劫持，四是 GrowthBook 的远程开关 tengu_kairos，五是 setKairosActive(true) 把全局状态打开。--assistant 这个 CLI 参数可以跳过第四层远程开关检查，是给 Agent SDK 的 daemon 模式留的后门。做梦是它最复杂的一块：距上次整合超过 24 小时，并且有 5 个以上新会话时，后台自动启动记忆整合子代理，分 Orient、Gather、Consolidate、Prune 四个阶段跑，.consolidate-lock 文件加 PID 存活检查，防止两个进程同时做梦。持久 cron 任务记在 .claude/scheduled_tasks.json 里，标记为 permanent: true 的任务不受 7 天自动过期限制，catch-up、morning-checkin、dream 这三个就是这么留着的。</p>
      <p><strong>为什么。</strong>主动模式是 Kairos 的另一面：没人说话时它自己找活干，没活就调 SleepTool 等着，靠周期性的 tick 提示来检查有没有事可做。这跟我们之前写的 Hermes cron 定时简报是同一个思路，只是 Hermes 的 cron 是用户配的，Kairos 的 tick 是内核自己发的。做梦那套机制也值得单独记一笔，它跟 Agent 记忆那篇里讲的“抽取后移”是一个东西：白天干活，晚上整理，整理完再剪掉不要的。只不过这里的整理是全自动的，触发条件写在 GrowthBook 的 tengu_onyx_plover 里，远程就能调。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m03">M03 云端规划 Ultraplan</Heading>
      <p><strong>是什么。</strong>把难题甩给云端的 Opus，让它独立研究最长 30 分钟，再把方案传回来。流程是 /ultraplan 加一段问题，先创建一个远程 CCR 会话，Opus 在云端独立研究，本地在后台轮询等，最长等 30 分钟，超时就断。你可以在浏览器里看方案、改方案，批准了就在远程执行，或者传送回本地跑。源码在 src/commands/ultraplan.tsx 和 src/utils/ultraplan/。</p>
      <p><strong>怎么做。</strong>30 分钟这个数我验过，src/commands/ultraplan.tsx 里写的是 ULTRAPLAN_TIMEOUT_MS = 30 * 60 * 1000，注释还提醒 OAuth token 可能在这 30 分钟里过期。触发有两种，显式敲 /ultraplan，或者消息里出现 ultraplan 这个词。关键词检测写在 src/utils/ultraplan/keyword.ts 里，做得很细：引号里的、文件路径里的、标识符里的出现都不触发，只算正儿八经提到它的。传送靠的是 src/utils/teleport.tsx，本地和远程会话之间传，支持把代码上下文打成 Git Bundle 一起带过去。</p>
      <p><strong>为什么。</strong>最关键的一行在 ultraplan.tsx 里：isEnabled: () =&gt; &quot;external&quot; === &apos;ant&apos;。external 是外部用户，ant 是内部员工，这个比较恒为 false，外部版永远不可用。也就是说，Ultraplan 从设计上就没打算给外部用户，它是 Anthropic 内部的云端规划工具。读到这里，三层门控的第二层就具象了：不是某个功能没做完，是代码写在那儿，门从里面锁上了。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m04">M04 指挥官 Coordinator</Heading>
      <p><strong>是什么。</strong>主 Claude 变成纯指挥官，Worker 并行执行任务。Coordinator 只有三个工具：Agent 派活、SendMessage 通信、TaskStop 停工。它不直接操作代码，只干五件事：理解目标、拆解任务、派生 Worker、给跑偏的 Worker 发后续指令、停掉方向错误的 Worker，最后把多个 Worker 的结果综合起来向你报告。Worker 在独立子进程里跑，各自有一套完整工具集。</p>
      <p><strong>怎么做。</strong>开启要同时满足两个条件，代码在 src/coordinator/coordinatorMode.ts 里：编译时 COORDINATOR_MODE 开关启用，并且运行时环境变量 CLAUDE_CODE_COORDINATOR_MODE 为真。任务流程分四阶段：Research 阶段 Worker 并行调查代码库，Synthesis 阶段 Coordinator 自己读发现、写实施规格，Implementation 阶段 Worker 按规格做精准改动，Verification 阶段 Worker 测试改动是否生效。Worker 之间靠文件共享任务列表，~/.claude/tasks/ 下面的文件，Coordinator 和 Worker 共同读写，Worker 的执行结果以 XML 格式注回 Coordinator 的对话流。</p>
      <p><strong>为什么。</strong>系统提示里有一条铁律，我觉得是整篇最值得抄走的一句话：禁止甩锅式委派。不能把不清楚的需求直接丢给 Worker。指挥官的活儿是先把目标想明白、拆干净，再派下去。派下去之后，Worker 跑偏了，指挥官要能发现、能叫停、能纠正。这跟我们之前手撕多智能体那篇的结论是一样的：多 Agent 的难点不在并行，在拆分和验收。Coordinator 把这两件事写进了系统提示，而不是指望模型自觉。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m05">M05 远程遥控 Bridge</Heading>
      <p><strong>是什么。</strong>从 claude.ai 或者手机，直接操控本地终端里的 Claude Code。网页上输入 prompt，传到本地 CLI 执行，输出实时回传到网页，还支持远程批准权限、中断、切换模型、设置思考 token 上限。源码在 src/bridge/，33 个文件。</p>
      <p><strong>怎么做。</strong>两种运行模式。独立模式是 claude remote-control，起一个长运行服务器，注册环境、轮询工作、生成子进程处理会话，分发有三种：single-session 是一个会话跑完就关，worktree 是持久服务器、每个会话拿一个隔离的 git worktree，same-dir 是持久服务器、所有会话共享同一个工作目录。内嵌模式是 REPL 里的 /remote-control，把当前对话镜像到 claude.ai，本地打字和网页打字都能驱动同一个会话。启用条件写在 src/bridge/bridgeEnabled.ts 里，是三重检查：编译时 feature(BRIDGE_MODE) 开着，是付费订阅用户，GrowthBook 的 tengu_ccr_bridge 开关开着。本地 CLI 和 claude.ai 之间走 WebSocket 双向通道，bridgeStatusUtil.ts 实时同步运行状态，bridgePermissionCallbacks.ts 做远程权限审批。</p>
      <p><strong>为什么。</strong>Bridge 有意思的地方不在远程控制本身，而在它把“本地”和“远程”这两件事焊在了一起。Claude Code on the Web 每个会话一个隔离沙箱，执行环境是云端的；Bridge 反过来，让云端去驱动本地的执行环境。你在网页上点的批准，落到的是你本机的文件和命令。这个方向一旦走通，终端 Agent 就不再被绑在某台机器前面。代价是信任链变长了：WebSocket 通道、远程权限回调、JWT 刷新，任何一环出问题，都是直接冲着本机来的。所以它要过三重检查，一点也不多。</p>

      <p className="ed-eyebrow">下篇 · 源码精读 — M01–M06</p>
      <Heading id="m06">M06 三层门控</Heading>
      <p>前面五章，每个功能最后都落到同一句话：这个功能有没有开，取决于门控。Anthropic 控制功能露不露脸，分三层，画出来是这个样子。</p>
      <pre><code>{`┌─────────────────────────────────────────────────┐
│  第一层：编译时开关 feature()                      │
│  代码包含 or 移除（Dead Code Elimination）          │
├─────────────────────────────────────────────────┤
│  第二层：运行时 USER_TYPE                          │
│  'ant'（内部）vs 'external'（外部）                 │
├─────────────────────────────────────────────────┤
│  第三层：GrowthBook 远程 A/B 测试                   │
│  tengu_ 前缀的远程开关，动态控制                     │
└─────────────────────────────────────────────────┘`}</code></pre>
      <p><strong>第一层是编译时。</strong>feature() 这个函数来自 bun:bundle，构建时决定代码包不包进来，没包进来的代码会被死代码消除整个删掉。BUDDY、KAIROS、ULTRAPLAN、COORDINATOR_MODE、BRIDGE_MODE、VOICE_MODE 这些都是这一层的开关。README 列了约 50 个核心开关，我 grep 出 89 个不同名字，多的那些大多是基础设施开关。这一层最狠：代码不在构建产物里，你再怎么找也找不到，连逆向都没得逆。</p>
      <p><strong>第二层是运行时用户类型。</strong>环境变量 USER_TYPE 是 ant 还是 external，判断条件在源码里写的是 process.env.USER_TYPE === &apos;ant&apos;。ant 是内部员工，解锁全部功能，GrowthBook 20 分钟刷新一次，还有 200 多处专属检查；external 是外部用户，裁剪版，6 小时刷新一次。Ultraplan 那行恒为 false 的 isEnabled，就是第二层的极端形态：代码在那儿，门从里面锁上了。</p>
      <p><strong>第三层是远程开关。</strong>GrowthBook 上带 tengu_ 前缀的开关，服务端随时能改，不用发版。Kairos 的总开关是 tengu_kairos，做梦的阈值是 tengu_onyx_plover，Ultraplan 用哪个模型是 tengu_ultraplan_model，Bridge 是 tengu_ccr_bridge，会话记忆是 tengu_session_memory。这一层的好处是灰度，坏处是对读源码的人来说，源码里看到的只是开关名，开关现在是开是关，源码里没有答案。</p>
      <p>三层合起来，外部发布版是个阉割版，这句话不是修辞，是字面意思。编译时砍掉一批，运行时按用户类型再锁一批，远程开关最后还能动态关一批。你手里装到的 Claude Code，和 Anthropic 内部用的那份，从源码上看就不是同一个东西。读还原仓库最大的收获，我觉得就是这张图：功能清单不重要，门控清单才重要。</p>

      <Heading id="closing">收尾，怎么读，别怎么读</Heading>
      <p>读到这里，这本小电子书就读完了。回头看，dg-ai-notes 的办法确实好用：先跑起来，再看全貌，再跟一条链，再一个功能一个功能地拆，每章都问是什么、怎么做、为什么，最后把数字和速查都收到附录里。右边的 Agent笔记栏也是照着它的右大纲做的，只是内容换了：大纲告诉你现在读到哪，笔记告诉你这章最该记住哪一句。</p>
      <p>如果你想接着读，我建议三条路。第一条，照着附录的核对表，自己克隆一份仓库，把那几个数字重新数一遍，数出来的和 README 不一样的地方，就是你开始真正读源码的起点。第二条，挑一个隐藏功能，跟它的开关走到底：从 feature() 的调用点，到命令注册表，到具体实现文件，再到 GrowthBook 的开关名，一条线走通，比泛泛翻十个目录有用。第三条，把这篇和 dg-ai-notes 的 Pi 精读篇对照着读，Pi 是 MIT 开源的 SDK，Claude Code 是还原出来的商业产品，一个讲“该怎么做”，一个讲“实际是怎么做”，两边对照，取舍就看得出来。</p>
      <p>最后是三条红线，也是这篇开头那句警告的展开。第一，别把还原仓库当官方版用，它的版本号、测试、发布流程都不是官方的，出了问题没人负责。第二，别商用，源码版权归 Anthropic，仓库 README 写了仅用于技术研究与学习。第三，别指望隐藏功能能在你手里跑起来，它们被三层门控锁着，锁是设计的一部分，不是 bug。读源码可以，照着改了发出去不行。</p>
      <blockquote>
        <p>功能清单不重要，门控清单才重要。外部版是个阉割版，这句话不是修辞，是字面意思。</p>
      </blockquote>
    </PostLayout>
  );
}

export default PostClaudeCodeSourceBook;

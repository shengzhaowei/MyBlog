import React from 'react';

/* ==========================================================================
   Claude Code 电子书 · 章节数据（2026-11-18 重写版）
   写法照搬 dg-ai-notes Pi Agent Book 的章法：
   - 实战上手：先问“这章解决什么问题”，再拿最小示例逐行拆，最后收成清单
   - 源码精读：引子 → 精确概念 → 全景旅程 → 逐函数拆源码 → 核心设计
   - 每条事实都带出处：文件路径 + 行号，附录有“知识点—源码对照”
   - 数字一律两个口径：README 写的，和我在克隆仓库里数出来的
   正文事实来源：pengchengneo/Claude-Code 单提交 b78dd22，
   核心循环、工具/权限两组已逐行核对；隐藏功能五组待核对清单见附录。
   ========================================================================== */

export const BOOK = {
  brand: 'Claude Code',
  crumb: 'Claude Code Book',
  heroTitle: 'Claude Code',
  heroSubFirst: '从上手到深入，',
  heroSubAccent: '一本读懂 Claude Code 内核',
  aboutHeading: '◆ 关于 CLAUDE CODE',
  aboutDesc:
    'Claude Code（pengchengneo 的还原仓库）是一份从 npm 包 source map 还原出来的完整源码——一套没发布的 Claude Code，藏着宠物、永不关机的助手与云端规划。',
  aboutGithub: 'https://github.com/pengchengneo/Claude-Code',
  tracks: [
    {
      id: 'internals',
      roman: 'I',
      eyebrow: '源码学习',
      label: '源码精读',
      tagline: '8 章拆完一套没发布的 Claude Code',
      badge: null,
    },
    {
      id: 'practice',
      roman: 'II',
      eyebrow: '实战上手',
      label: '实战上手',
      tagline: '4 章跑通还原版，再决定怎么读',
      badge: 'NEW',
    },
  ],
};

export const REFERENCES = [
  {
    href: 'https://github.com/pengchengneo/Claude-Code',
    label: 'pengchengneo/Claude-Code',
    note: '本书的全部素材来源：还原后的源码、README 与 docs/01–07 七篇分析',
  },
  {
    href: 'https://github.com/buchidonggua/dg-ai-notes',
    label: 'buchidonggua/dg-ai-notes',
    note: '本书模仿的电子书样式：双轨章节、左右双栏、每章是什么/怎么做/为什么',
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

export const CHAPTERS = [
  {
    id: 'm01',
    code: 'M01',
    track: 'internals',
    title: '开篇——先把结论放前面',
    words: 1017,
    outline: [
      { id: 'verdict', label: '一、先把结论放前面' },
      { id: 'what-is-it', label: '二、这仓库到底是什么' },
      { id: 'how-to-read', label: '三、这本书怎么读' },
      { id: 'numbers', label: '四、数字先说清口径' },
      { id: 'next', label: '五、下一站' },
    ],
    body: (
      <React.Fragment>
        <h2 id="verdict">一、先把结论放前面</h2>
        <p>pengchengneo/Claude-Code 不是官方的 Claude Code。它是从 npm 上发布的 @anthropic-ai/claude-code 包里，把 cli.js.map 里附带的 sourcesContent 抽出来，还原成的一个 TypeScript 仓库。README 第一行就写了，可本地运行，紧接着就是警告：非官方，仅供研究学习，源码版权归 Anthropic。</p>
        <p>这本也不是教你怎么用 Claude Code。官方文档在 code.claude.com，要学用法去那儿。这本只干一件事：把这个还原仓库翻开，看看 Anthropic 的终端 Agent 在源码层面长什么样，尤其是那些你平时装到的版本里没有的东西。</p>
        <h2 id="what-is-it">二、这仓库到底是什么</h2>
        <p>还原方式决定了它的可信度边界。source map 里的 sourcesContent 是发布时打进去的源码快照，构建产物和源码是一一对应的，所以大结构可信：目录分工、函数名、常量值、开关名，都是发布那一刻的真实状态。</p>
        <p>但它毕竟不是 Anthropic 的仓库。提交历史只有一条 first commit，没有分支、没有 issue、没有随版本演进的记录。你看到的是一张定格照片，不是连续剧。AGENTS.md 里也写明了这一点：</p>
        <blockquote>
          <p>This is a reconstructed source tree, not pristine upstream. Prefer minimal, auditable changes, and document any workaround added because a module was restored with fallbacks or shim behavior.</p>
        </blockquote>
        <p>还有两处要先说清楚。第一，版本号是 999.0.0-restored，这是还原版自己的标记，意思是“这个版本不存在，是还原出来的”，别拿它去跟官方的版本号对照。第二，仓库里没有测试套件，没有 lint，没有统一的 test 命令。AGENTS.md 写得很直白：改了 TypeScript 模块，就跑启动命令，再手动走一遍你改的那条路。验证的办法，P01 会展开讲。</p>
        <h2 id="how-to-read">三、这本书怎么读</h2>
        <p>写法照搬 dg-ai-notes 那本 Pi 电子书，分上下两篇。上篇是实战上手，P01 跑起来、P02 看全貌、P03 跟一条链、P04 收尾，目标是先把东西跑通、建立坐标。下篇是源码精读，M01 是这篇开篇，M02 到 M06 一个功能一个功能地拆，M07 讲三层门控，M08 讲工具与权限。</p>
        <p>每章的章法也照搬过来。实战上手的章，先问“这章解决什么问题”，再拿最小示例逐行拆，最后收成一张清单。源码精读的章，先讲引子（为什么需要这个），再把概念定义精确，然后画一条消息或一次调用的完整旅程，最后逐函数拆源码，结尾收成几条核心设计。右边的本页大纲只列这些小节标题，读的时候可以当速查。</p>
        <p>如果你时间只够读三章，读 P03、M07、M08。P03 是一次问答的循环，整个 Agent 的心脏；M07 是三层门控，解释了为什么你手里的版本和内部版本不是同一个东西；M08 是工具与权限，解释了模型的手脚是怎么被管住的。这三章读完，其他章都是在这三章的坐标上展开。</p>
        <h2 id="numbers">四、数字先说清口径</h2>
        <p>这本书里凡是写了数字的地方，都有两个口径：README 写的，和我自己在克隆下来的仓库里数出来的。两者不一样时，以数出来的为准，并写清原因。核对表在附录，这里先举两个例子，你就明白为什么非得这样写：</p>
        <ul>
          <li><strong>工具。</strong>README 写 53 个工具。我数出来 src/tools/ 下有 53 个目录，其中 shared/ 和 testing/ 不是工具，真实工具目录是 51 个。README 数的是目录数。</li>
          <li><strong>斜杠命令。</strong>README 写 87 个命令。我数出来 src/commands/ 下有 102 个条目：87 个子目录加 15 个顶层文件。README 数的是子目录数。更进一步，注册表里无条件列出的只有 70 个，剩下的靠开关和身份展开。</li>
        </ul>
        <p>dg-ai-notes 写 Pi 那篇也遇到过同样的事，他们专门写了一节说明数字的口径。这本也照办，附录第一张表就是完整的核对结果。</p>
        <h2 id="next">五、下一站</h2>
        <p>下一章 P01，先把还原版跑起来。跑通之后再谈读源码，不然所有数字和函数名都只是纸上的。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'p01',
    code: 'P01',
    track: 'practice',
    title: '跑起来——十分钟跑通还原版',
    words: 1088,
    outline: [
      { id: 'problem', label: '一、这章解决什么问题' },
      { id: 'commands', label: '二、三条命令各干了什么' },
      { id: 'boot-chain', label: '三、启动链：从 dev-entry 到 REPL' },
      { id: 'no-tests', label: '四、没有测试套件意味着什么' },
      { id: 'next', label: '五、下一站' },
    ],
    body: (
      <React.Fragment>
        <h2 id="problem">一、这章解决什么问题</h2>
        <p>这章只解决一件事：让你亲手把这个还原仓库跑起来，并且知道跑起来之后看到的是什么、不是什么。读源码之前先跑通，是 dg-ai-notes 那本书第 1 章的规矩：先有一个能跑的东西，再谈它的结构，不然所有数字和函数名都只是纸上的。</p>
        <p>先说环境。package.json 要求 Bun 不低于 1.3.5、Node 不低于 24。Bun 是必须的，因为整个仓库的构建、运行和 dead code elimination 都走 Bun 的打包器，后面 M07 讲的三层门控第一层，靠的就是它。</p>
        <h2 id="commands">二、三条命令各干了什么</h2>
        <p>README 的快速开始只有三行，原样抄过来：</p>
        <pre><code>{`bun install       # 安装依赖（需要 Bun ≥ 1.3.5、Node.js ≥ 24）
bun run dev       # 启动 CLI
bun run version   # 验证版本`}</code></pre>
        <p>三行各干了什么，AGENTS.md 写得很细。bun install 装依赖和本地 shim 包，shim 在 shims/ 里，是原生模块的兼容替代。bun run dev 启动还原版的 CLI 入口，是交互式入口。bun run version 只验一件事：CLI 能起来、能打出版本号。版本号打出来是 999.0.0-restored，别拿它去跟官方的版本号对照，它的意思就是“这个版本不存在，是还原出来的”。</p>
        <p>还有一个容易忽略的命令，bun run start，它是 dev 入口的别名，做的事情和 bun run dev 一样。AGENTS.md 的原话是：</p>
        <blockquote>
          <p>Use Bun for local development. bun install: install dependencies and local shim packages. bun run dev: start the restored CLI entrypoint interactively. bun run version: verify the CLI boots and prints its version.</p>
        </blockquote>
        <h2 id="boot-chain">三、启动链：从 dev-entry 到 REPL</h2>
        <p>跑起来之后，启动链长这样。入口是 src/dev-entry.ts，还原仓库的 dev 入口，一共 145 行。它先干两件事：第一，注入 MACRO 宏的默认值，版本号、构建时间、包名、反馈渠道都在这里定，VERSION 就是 package.json 里的 999.0.0-restored；第二，扫描全仓库的缺失相对导入，缺失为 0 才转交真正的入口 src/entrypoints/cli.tsx。这一步是个门禁，还原出来的仓库最怕的就是导入链断了，先数一遍，断了就直接报错，不让你带着断链往下跑。</p>
        <pre><code>{`// src/dev-entry.ts:10-20 —— MACRO 宏的默认值
const defaultMacro: MacroConfig = {
  VERSION: pkg.version,          // 999.0.0-restored
  BUILD_TIME: '',
  PACKAGE_URL: pkg.name,
  NATIVE_PACKAGE_URL: pkg.name,
  VERSION_CHANGELOG: '',
  ISSUES_EXPLAINER:
    'file an issue at https://github.com/anthropics/claude-code/issues',
  FEEDBACK_CHANNEL: 'github',
}`}</code></pre>
        <p>真正的启动逻辑在 src/main.tsx 的 main()，从 585 行开始，分五步。第一步是 argv 预改写，比如把 -d2e 这个还原出来的调试别名改写成 --debug-to-stderr，免得 Commander 收到一个多字符短 flag 直接报错，顺手还把 Windows 的 NoDefaultCurrentDirectoryInExePath 置 1，防当前目录的命令被执行。第二步是 Commander 参数定义，--model、--max-turns、--dangerously-skip-permissions 这些都在这里挂上去。第三步在 action 里做会话 ID 校验和 Kairos 检查：--session-id 只能配合 --continue 或 --resume 再加 --fork-session 用，否则直接报错退出；Kairos 检查在 setup() 之前跑，目录没通过信任检查就先警告，再决定开不开助手模式。第四步是 setup()，第 1933 行起，建会话、建权限上下文、建工作区。第五步是恢复会话（--continue 或 --resume 时）再进 launchRepl，第 3140 行起，终端交互界面从这里开始。</p>
        <pre><code>{`// src/main.tsx:585-597 —— main() 开头
export async function main() {
  profileCheckpoint('main_function_start');

  // Preserve the restored debug alias without registering an invalid
  // multi-character short flag in Commander.
  if (process.argv.includes('-d2e')) {
    process.argv = process.argv.map(arg => arg === '-d2e' ? '--debug-to-stderr' : arg);
  }

  // SECURITY: Prevent Windows from executing commands from current directory
  process.env.NoDefaultCurrentDirectoryInExePath = '1';`}</code></pre>
        <p>记住这个五步的骨架，后面几章会反复回来。P03 跟一次问答的循环，就是从 launchRepl 里用户敲回车那一刻开始；M03 讲 Kairos，检查点就在第三步；M08 讲权限，setup() 建的权限上下文就是审批的起点。</p>
        <h2 id="no-tests">四、没有测试套件意味着什么</h2>
        <p>这个仓库没有 test/ 目录，package.json 里也没有 lint 和 test 脚本。AGENTS.md 的测试指南只有三条：用 bun run dev 把 CLI 跑起来，用 bun run version 看版本输出，再手动走一遍你改的那条路。加测试的话，放在被改模块附近，名字跟着模块走。</p>
        <p>这不是偷懒，是还原仓库的常态。1,987 个文件是从 source map 里倒出来的，能跑起来已经不容易，测试基础设施没跟着倒出来。对读源码的人来说，这意味着一件事：你不能指望测试告诉你“这个函数应该干什么”，你只能看函数本身、看调用方、看注释。后面几章的“知识点—源码对照”，就是按这个办法做的：每条结论都贴着文件和行号，不拿测试当证据。</p>
        <p>顺带一提，提交历史也只有一条 first commit，没有分支和 issue。AGENTS.md 建议的提交信息是短祈使句，比如 Fix MCP config normalization，PR 要写清用户可见的影响、还原特有的取舍和验证步骤。这也是读这份源码时的一个提醒：你看到的是一张定格照片，演进过程不在仓库里。</p>
        <h2 id="next">五、下一站</h2>
        <p>跑通之后，下一章 P02 站远一点，看 1,987 个文件是怎么分工的。先看数字，再看地图，最后看三个最大的文件。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'p02',
    code: 'P02',
    track: 'practice',
    title: '全貌——1,987 个文件怎么分工',
    words: 1030,
    outline: [
      { id: 'numbers', label: '一、先看数字，再看口径' },
      { id: 'map', label: '二、顶层目录地图' },
      { id: 'big-files', label: '三、三个最大的文件' },
      { id: 'deps', label: '四、依赖方向：谁 import 谁' },
      { id: 'next', label: '五、下一站' },
    ],
    body: (
      <React.Fragment>
        <h2 id="numbers">一、先看数字，再看口径</h2>
        <p>先站远一点看。src/ 下面是核心源码，我数了一下，1,987 个 TS 和 TSX 文件，跟 README 写的一模一样，这点对得上。但数字到这里就开始出现两个口径，我得先说明白，不然你照着数会对不上。核对表在附录，这里先把结论放前面：</p>
        <ul>
          <li><strong>源文件。</strong>README 写 1,987 个，我数出来也是 1,987 个（find src -name *.ts -o -name *.tsx），对得上。</li>
          <li><strong>工具。</strong>README 写 53 个。src/tools/ 下有 53 个目录，其中 shared/ 和 testing/ 不是工具，真实工具目录是 51 个。README 数的是目录数。更进一步，注册表 getAllBaseTools() 里无条件常驻的只有 21 个，剩下的靠 feature() 开关、USER_TYPE 和环境变量展开，见 M08。</li>
          <li><strong>斜杠命令。</strong>README 写 87 个。src/commands/ 下有 102 个条目：87 个子目录加 15 个顶层文件（12 个 .ts 加 install.tsx、statusline.tsx、ultraplan.tsx）。README 数的是子目录数。注册表 COMMANDS() 里无条件列出的只有 70 个。</li>
          <li><strong>终端 UI 组件。</strong>README 写 148 个，src/components/ 顶层有 146 个条目。差 2 的原因没核实，可能是子目录里的组件没算进去，附录里标了未核实。</li>
          <li><strong>Hooks。</strong>README 写 87 个，src/hooks/ 顶层有 85 个条目（83 个文件加 notifs/、toolPermission/ 两个子目录）。差 2 的原因同样没核实。注意：这里的 hooks/ 是 React Hooks，不是生命周期 Hooks 系统，生命周期 Hooks 的实现在 src/utils/hooks.ts，一共 27 个事件，见 M08。</li>
          <li><strong>Bridge。</strong>README 写 31 个文件，我数出来 src/bridge/ 有 33 个文件。docs/06 写 33 个文件，跟我数的一致，是 README 自己前后不一致。</li>
          <li><strong>feature 开关。</strong>README 列了约 50 个核心开关，我 grep 出 89 个不同的 feature(…) 开关名，多出来的大多是基础设施开关，比如判断 libc 的 IS_LIBC_MUSL、做性能追踪的 PERFETTO_TRACING，平时读功能的时候可以先不管。</li>
        </ul>
        <p>口径这件事，dg-ai-notes 写 Pi 那篇也遇到过，他们的办法是：README 的数字是注册数或约数，实测的数字是文件数或顶层条目数，两个数都留着，写清各是怎么数出来的。这本也照办。</p>
        <h2 id="map">二、顶层目录地图</h2>
        <p>顶层分工很干净，旁边还有 shims/ 和 vendor/，放原生模块的兼容替代和原生绑定源码：</p>
        <pre><code>{`src/                    # 核心源码（1,987 个 TS/TSX）
├── tools/              # 工具实现，51 个真实工具目录 + shared/ + testing/
├── commands/           # 斜杠命令，87 个子目录 + 15 个顶层文件
├── commands.ts         # 命令注册表 COMMANDS()
├── tools.ts            # 工具注册表 getAllBaseTools()
├── services/           # 服务：api/、compact/、mcp/、analytics/、oauth/、lsp/
├── components/         # 终端 UI（Ink 的 React 组件），146 个顶层条目
├── hooks/              # React Hooks 状态逻辑，85 个顶层条目
├── query.ts            # 一次问答的循环 query() / queryLoop()
├── QueryEngine.ts      # 会话与查询生命周期，QueryEngine 类
├── main.tsx            # 启动组装，4,690 行
├── buddy/              # 电子宠物系统
├── assistant/          # KAIROS 助手模式
├── coordinator/        # 多 Agent 协调器
├── bridge/             # 远程控制桥接，33 个文件
├── proactive/          # 主动模式
├── vim/                # Vim 模式引擎
└── voice/              # 语音交互
shims/                  # 原生模块兼容替代
vendor/                 # 原生绑定源码`}</code></pre>
        <p>这张图是仓库 README 里的结构，我只改了两处：tools/ 后面不再写“53 个工具”，commands/ 后面补了条目构成。数字的事，上一节已经说清了，这里不再重复。</p>
        <h2 id="big-files">三、三个最大的文件</h2>
        <p>三个文件最大，也最值得先记住。src/main.tsx 4,690 行，是启动组装层：argv 预改写、Commander 参数定义、会话 ID 校验、Kairos 检查、setup()、恢复会话、launchRepl，全在这里。它 import 所有人，自己不实现业务逻辑。src/query.ts 1,729 行，是一次问答的循环：query()、queryLoop()、工具执行入口、压缩调用点，全在这里。src/QueryEngine.ts 1,295 行，是会话与查询生命周期：QueryEngine 类的注释写明了“一会话一实例”，ask() 是 async generator，submitMessage() 开始新的一轮，消息、文件缓存、用量这些状态跨轮保留。</p>
        <p>三个文件的分工，恰好对应 Agent 的三层：main.tsx 是“怎么启动”，QueryEngine.ts 是“一次会话怎么管”，query.ts 是“一轮问答怎么转”。P03 只跟第三层，但你要知道另外两层在哪。</p>
        <h2 id="deps">四、依赖方向：谁 import 谁</h2>
        <p>依赖方向是单向分层，底层是 utils/，几乎被所有目录 import，自己不 import 业务层。往上是 services/api/（模型调用层）和 services/tools/（工具编排层），再往上是 tools/（工具实现层，各工具自成目录，共享 src/Tool.ts 基类）和 commands/（薄调度层），最上面是 components/（Ink 终端 UI）和 hooks/（状态逻辑），main.tsx 是组装层，import 所有人。</p>
        <p>只有一个例外：hooks/ 与 components/ 存在双向引用。components/ import hooks/ 55 次，hooks/ import components/ 18 次。这是 React 项目里的常见形态：UI 组件用状态 Hook，Hook 里又要调 UI（比如弹权限对话框）。读的时候别被这个例外带偏，大方向仍然是单向的。</p>
        <p>一个更具体的数字：tools/ 内部互引最多的是 ./prompt（33 次），其次是 ./constants（20 次）和 ./UI（13 次）。这说明每个工具目录下都有自己的 prompt.ts，模型看到的工具说明就是从这里来的。M08 会展开讲工具的 prompt 是怎么拼的。</p>
        <h2 id="next">五、下一站</h2>
        <p>全貌看完，下一章 P03 跟一条链：一次问答从敲回车到出结果，在源码里走了多远。这是全书最重要的一章。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'p03',
    code: 'P03',
    track: 'practice',
    title: '循环——一次问答走了多远',
    words: 2668,
    outline: [
      { id: 'intro', label: '一、引子：大模型的三种用法' },
      { id: 'concepts', label: '二、先搞清概念：Turn 与退出原因' },
      { id: 'journey', label: '三、全景：一条消息的旅程' },
      { id: 'source', label: '四、源码详解：queryLoop 的骨架' },
      { id: 'streaming', label: '五、流式与上下文组装' },
      { id: 'session', label: '六、会话、恢复与压缩' },
      { id: 'models', label: '七、模型选择：默认是谁，优先级怎么排' },
      { id: 'design', label: '八、核心设计与下一站' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：大模型的三种用法</h2>
        <p>在跟这条链之前，先退一步，看看“使用大模型”这件事本身有几种模式。这对理解“为什么需要循环”至关重要。dg-ai-notes 那本书第 3 章就是这么开头的，我照搬它的三分法。</p>
        <p><strong>模式 1：直接调用——“模型，回答我”。</strong>最原始的用法。你构建好提示词，调用一次 API，拿到结果，完事。核心工作在于“构建提示词”。一次调用，一次输出，没有来回。适用场景：翻译、摘要、问答、代码补全，凡是“一问一答”能搞定的事。</p>
        <p><strong>模式 2：Workflow——“模型，你先做第一步，我检查一下，再做第二步”。</strong>任务变复杂，一次性很难得到满意结果，你把大任务拆成多步，每步调一次模型，步骤之间由你的代码控制流转。每一步模型只负责自己的那份工作，决策权在你手上。适用场景：文档生成流水线、代码审查自动化、RAG。</p>
        <p><strong>模式 3：Agent Loop——“模型，你自己决定怎么做”。</strong>到了 Agent 模式，你把决策权交给了模型。步骤之间的流转不再由你写死，而是由模型的输出内容来驱动。你的代码只做两件事：把用户的输入和工具执行结果喂给模型；如果模型输出的内容里包含了工具调用请求，就执行它；如果没有，就认为任务完成了。至于“该调什么工具”、“该调几次”，这些由模型的输出内容决定。“什么时候该停”，这是人类定义的规则。</p>
        <pre><code>{`用户输入 → 调模型 → 模型说“我需要读文件” → 执行读文件 → 模型看结果
         → 模型说“还需要搜索代码” → 执行搜索 → 模型看结果
         → 模型说“我知道了，答案是...” → 输出 → 结束`}</code></pre>
        <table>
          <thead>
            <tr><th>维度</th><th>直接调用</th><th>Workflow</th><th>Agent Loop</th></tr>
          </thead>
          <tbody>
            <tr><td>决策者</td><td>用户</td><td>你的代码</td><td>模型</td></tr>
            <tr><td>模型调用次数</td><td>1 次</td><td>N 次（由代码控制）</td><td>不确定（由模型控制）</td></tr>
            <tr><td>核心工作</td><td>写提示词</td><td>设计流程</td><td>定义工具和循环</td></tr>
            <tr><td>模型角色</td><td>执行者</td><td>流水线环节</td><td>自主决策者</td></tr>
            <tr><td>典型场景</td><td>翻译、摘要</td><td>文档流水线、RAG</td><td>编程助手、自动化任务</td></tr>
          </tbody>
        </table>
        <h2 id="concepts">二、先搞清概念：Turn 与退出原因</h2>
        <p>在深入源码之前，有两个概念必须分清楚。一个 Turn 的定义非常精确：<strong>一次模型调用 + 这次调用触发的所有工具执行</strong>。模型返回了 tool_use，执行那批工具，把结果喂回去再调模型，那是下一个 Turn。一个 Turn 只有一次模型调用。如果模型在一个 Turn 中一口气要求了 3 个工具，那 3 个工具都在同一个 Turn 里执行，因为它们都是同一次模型调用的产物。</p>
        <p>循环什么时候停？query.ts 里的退出原因一共有 9 种，值得一张表记下来：</p>
        <table>
          <thead>
            <tr><th>退出原因</th><th>含义</th></tr>
          </thead>
          <tbody>
            <tr><td>completed</td><td>正常结束：流式返回里没有 tool_use 块</td></tr>
            <tr><td>max_turns</td><td>达到 --max-turns 上限（只在 --print 模式下生效）</td></tr>
            <tr><td>aborted_tools</td><td>工具执行中被中止</td></tr>
            <tr><td>aborted_streaming</td><td>流式输出中被中止</td></tr>
            <tr><td>hook_stopped</td><td>Hook 要求停下（shouldPreventContinuation）</td></tr>
            <tr><td>stop_hook_prevented</td><td>Stop Hook 阻止了继续</td></tr>
            <tr><td>blocking_limit</td><td>撞上阻塞上限</td></tr>
            <tr><td>prompt_too_long</td><td>提示词过长</td></tr>
            <tr><td>model_error</td><td>模型调用出错</td></tr>
          </tbody>
        </table>
        <p>最值得注意的是第一行。query.ts 第 552 行的注释原文写得很直白：stop_reason === &apos;tool_use&apos; 是不可靠的，它不总被正确设置。循环继续的唯一信号，是流式返回里出现了 tool_use 块。如果流式结束时没有 tool_use 块，循环就结束（Stop Hook 还能再续一次）。也就是说，<strong>循环的油门和刹车不在某个配置项上，而在模型每一次输出里有没有工具调用</strong>。这就是 Agent Loop 和 Workflow 最根本的区别：停不停，模型说了算，规则只负责收尾。</p>
        <h2 id="journey">三、全景：一条消息的旅程</h2>
        <p>你输入了“帮我读一下 src/main.ts”并按下回车。从这一刻起发生了什么？先站在高处看一遍全过程，不必纠结每个细节，后面会逐段拆解源码。</p>
        <pre><code>{`你按下回车：“帮我读一下 src/main.ts”
│
│  ① 你的输入变成一条用户消息
│
UserMessage { role: "user", content: "帮我读一下 src/main.ts" }
│
│  ② 进入循环：query() 是 async generator，只做一件事——交给 queryLoop()
│
└── queryLoop() —— while (true)，turnCount 从 1 开始
    │
    │  ③ 每轮先过四层压缩（365 / 414 / 433 / 454 行）
    │     边界裁剪 → microcompact → context collapse → autocompact
    │
    │  ┌── Turn 1 ──────────────────────────────────────────┐
    │  │  ④ 调模型（每 Turn 仅一次模型调用）                   │
    │  │     deps.callModel → queryModelWithStreaming          │
    │  │     流式返回里出现 tool_use 块 → 循环继续的唯一信号    │
    │  │  ⑤ 执行工具：runTools(toolUseBlocks, ...)            │
    │  │     工具结果拼回消息列表，交给下一轮                  │
    │  └─────────────────────────────────────────────────────┘
    │
    │  循环判断：有 tool_use → 下一轮；没有 → 走 Stop Hooks 后 completed
    │
    │  ┌── Turn 2 ──────────────────────────────────────────┐
    │  │  ⑥ 第二次调模型（工具结果已追加到消息列表）           │
    │  │     模型看到文件内容，开始解释，没有工具调用           │
    │  │     → completed，一个问答结束，共 2 个 Turn           │
    │  └─────────────────────────────────────────────────────┘`}</code></pre>
        <p>途中反复出现四个实体：你的输入变成消息（Message），循环调用模型（Model）来思考，模型要求的操作用工具（Tool）完成，每一步的结果再拼回消息列表。驱动这四者反复运转的机制，就是本章主角 queryLoop。</p>
        <h2 id="source">四、源码详解：queryLoop 的骨架</h2>
        <p>入口是 src/query.ts 第 219 行的 query()，一个 async generator。它的定义本身就说明了分工：query() 只做一件事，把活交给 queryLoop()，再把 queryLoop 交出来的终端状态返回去。</p>
        <pre><code>{`// src/query.ts:219-230 —— query() 是 async generator
export async function* query(
  params: QueryParams,
): AsyncGenerator<
  | StreamEvent
  | RequestStartEvent
  | Message
  | TombstoneMessage
  | ToolUseSummaryMessage,
  Terminal
> {
  const consumedCommandUuids: string[] = []
  const terminal = yield* queryLoop(params, consumedCommandUuids)`}</code></pre>
        <p>queryLoop() 从第 241 行开始，状态里 turnCount 从 1 开始，然后是一个 while (true)。每一轮的骨架是固定的：先过压缩，再调模型，再执行工具，最后拼出下一轮的状态。</p>
        <pre><code>{`// src/query.ts:1714-1728 —— 工具结果拼回消息列表，成为下一轮的输入
    queryCheckpoint('query_recursive_call')
    const next: State = {
      messages: [...messagesForQuery, ...assistantMessages, ...toolResults],
      toolUseContext: toolUseContextWithQueryTracking,
      autoCompactTracking: tracking,
      turnCount: nextTurnCount,
      ...
      transition: { reason: 'next_turn' },
    }
    state = next
  } // while (true)`}</code></pre>
        <p>注意这一行：messages: [...messagesForQuery, ...assistantMessages, ...toolResults]。这就是 Agent 的“记忆”在代码里的样子：没有单独的记忆模块，记忆就是消息列表本身。上一轮的模型回答和工具结果，全部原样追加进去，下一轮的模型看到的就是完整历史。上下文压缩要解决的问题，也正是这个列表会无限变长，第六节讲。</p>
        <p>再看两个容易误解的点。第一，maxTurns 只在 --print 模式下由 --max-turns 传入，交互模式没有从这个选项设上限。--max-turns 的 Commander 定义在 src/main.tsx 第 982 行，描述里写明了 only works with --print，定义上还藏了 hideHelp。第二，工具执行的入口在第 1382 行，是 runTools()，从 src/services/tools/toolOrchestration.ts 引进来。query.ts 自己不执行工具，它只负责“什么时候调模型、什么时候停”，工具怎么跑，交给编排层。M08 会展开讲编排层。</p>
        <p>QueryEngine 是 query() 的上一层，位置在 src/QueryEngine.ts。它的 ask() 从第 1186 行开始，也是 async generator：构造一个 QueryEngine，再 yield* engine.submitMessage(prompt)。类的注释写明了“一会话一实例”：</p>
        <blockquote>
          <p>QueryEngine owns the query lifecycle and session state for a conversation. One QueryEngine per conversation. Each submitMessage() call starts a new turn within the same conversation. State (messages, file cache, usage, etc.) persists across turns.</p>
        </blockquote>
        <p>submitMessage() 在第 684 行起消费 query()：for await (const message of query(...))，把每条消息写回会话，querySource 标为 sdk。也就是说，REPL 里你每敲一次回车，是一次 submitMessage；每次 submitMessage，是一次 query()；每次 query()，是若干个 Turn 的 while 循环。三层嵌套，别搞混了。</p>
        <h2 id="streaming">五、流式与上下文组装</h2>
        <p>模型调用是流式的。queryLoop 调的是 deps.callModel，默认实现是 queryModelWithStreaming（src/query/deps.ts 第 23、35 行）。底层走 anthropic.beta.messages.create，stream: true，但特意不用 SDK 自带的 BetaMessageStream。src/services/api/claude.ts 第 1818 行的注释写了原因：</p>
        <blockquote>
          <p>Use raw stream instead of BetaMessageStream to avoid O(n²) partial JSON parsing. BetaMessageStream calls partialParse() on every input_json_delta, which we don&apos;t need since we handle tool input accumulation ourselves.</p>
        </blockquote>
        <p>意思是，SDK 的流式包装会在每个 input_json_delta 上做一次 partial JSON 解析，工具参数越大越慢，复杂度是 O(n²)。Claude Code 自己攒工具参数，就不用它那套。失败时有非流式回退 queryModelWithoutStreaming（第 709、864 行）。流还有一个闲置看门狗：超过 90 秒没有 chunk 到达就主动杀掉流，因为 SDK 的请求超时只覆盖最初的 fetch()，不覆盖流式 body，连接悄悄断了的话会话会永远挂住。90 秒这个数可以用 CLAUDE_STREAM_IDLE_TIMEOUT_MS 环境变量改。</p>
        <p>上下文组装分三块。第一块是 system prompt，由 fetchSystemPromptParts 拼（QueryEngine.ts 第 284 行起），再由 asSystemPrompt 定稿：自定义提示词（如果有）优先于默认提示词，再拼记忆机制提示词，最后拼追加提示词。第二块是 system context，由 appendSystemContext（src/utils/api.ts 第 437 行）以 key: value 的形式追加到 system prompt 末尾。第三块是 user context，由 prependUserContext 以一条 isMeta 的用户消息前置，内容开头是 system-reminder，意思是“回答问题时，你可以用下面这些上下文”。三块拼完，才是一次模型调用看到的完整输入。</p>
        <p>本轮用哪个模型，由 getRuntimeMainLoopModel 决定（query.ts 第 573 行）。plan 模式下，如果最近一条助手消息超过 200k token，会换模型。这个细节后面 M07 讲门控时会再出现：模型不是启动时定死一次，而是在循环里每轮重新决定。</p>
        <h2 id="session">六、会话、恢复与压缩</h2>
        <p>会话以 JSONL 存盘，路径是 ~/.claude/projects/&lt;项目目录&gt;/&lt;sessionId&gt;.jsonl，写盘入口是 recordTranscript（src/utils/sessionStorage.ts 第 1408 行）。读盘有个上限，MAX_TRANSCRIPT_READ_BYTES 是 50MB，注释写了原因：会话 JSONL 能长到几个 GB，读原始 transcript 的调用方必须在这个阈值之上直接放弃，避免 OOM。</p>
        <p>恢复走两条路。--continue 直接 loadConversationForResume(undefined)，再经 processResumedConversation 还原，把消息交给 launchRepl。--resume 先试着按文件路径加载 transcript（src/main.tsx 第 3634 行），文件不存在（ENOENT）再按 session ID 处理。两条路最后汇合到同一个还原函数。</p>
        <p>压缩是这个仓库里最值得单独记一笔的设计。每一轮开始，先依次过四层：边界裁剪（getMessagesAfterCompactBoundary，第 365 行）、microcompact（第 414 行）、context collapse（第 433 行）、autocompact（第 454 行）。自动压缩的阈值有个公式：有效上下文窗口减 13,000 token。有效窗口是模型窗口减去 min(最大输出 token, 20,000)。默认窗口是 200,000，支持 1M 上下文的模型（claude-sonnet-4 和 opus-4-6）能到 1,000,000。警告和错误阈值各再减 20,000，手动 /compact 的缓冲是 3,000。连续 3 次自动压缩失败就熔断，DISABLE_COMPACT 和 DISABLE_AUTO_COMPACT 两个环境变量能分别关掉手动和自动压缩。</p>
        <pre><code>{`// src/services/compact/autoCompact.ts:33-89 —— 阈值公式
export function getEffectiveContextWindowSize(model: string): number {
  const reservedTokensForSummary = Math.min(
    getMaxOutputTokensForModel(model),
    MAX_OUTPUT_TOKENS_FOR_SUMMARY,
  )
  ...
}
export const AUTOCOMPACT_BUFFER_TOKENS = 13_000
export const WARNING_THRESHOLD_BUFFER_TOKENS = 20_000
export const ERROR_THRESHOLD_BUFFER_TOKENS = 20_000
export const MANUAL_COMPACT_BUFFER_TOKENS = 3_000`}</code></pre>
        <p>压缩后，旧消息不会直接消失，而是被固定顺序的一组消息替代（src/services/compact/compact.ts 第 330 行，buildPostCompactMessages）：边界标记、摘要消息、保留消息、附件、Hook 结果。这个顺序是定死的，注释写了原因：保证所有压缩路径的顺序一致。压缩完的消息会先 yield 出去，再继续本轮查询。手动 /compact 也存在，定义在 src/commands/compact/index.ts：先跑 microcompact 降 token，再调 compactConversation() 用模型把历史压缩成摘要留在上下文里，DISABLE_COMPACT 时命令直接禁用。</p>
        <h2 id="models">七、模型选择：默认是谁，优先级怎么排</h2>
        <p>模型 ID 常量在 src/constants/prompts.ts 第 118 行起：Opus 4.6、Sonnet 4.6、Haiku 4.5。默认模型分用户等级（src/utils/model/model.ts 第 178 行起）：内部 ant 用户默认 Opus 1M（或 flag 配置里的 defaultModel），Max 和 Team Premium 用户默认 Opus，其余默认 Sonnet 4.6。</p>
        <pre><code>{`// src/utils/model/model.ts:178-200 —— 默认模型分等级
export function getDefaultMainLoopModelSetting(): ModelName | ModelAlias {
  // Ants default to defaultModel from flag config, or Opus 1M if not configured
  if (process.env.USER_TYPE === 'ant') {
    return (
      getAntModelOverrideConfig()?.defaultModel ??
      getDefaultOpusModel() + '[1m]'
    )
  }
  // Max users get Opus as default
  if (isMaxSubscriber()) {
    return getDefaultOpusModel() + (isOpus1mMergeEnabled() ? '[1m]' : '')
  }
  // Team Premium gets Opus (same as Max)
  if (isTeamPremiumSubscriber()) {
    return getDefaultOpusModel() + (isOpus1mMergeEnabled() ? '[1m]' : '')
  }
  // PAYG (1P and 3P), Enterprise, Team Standard, and Pro get Sonnet as default
  return getDefaultSonnetModel()
}`}</code></pre>
        <p>优先级分五档，注释原文写在同一个文件第 49 行起：1 会话内 /model 覆盖，最高；2 --model 启动参数；3 ANTHROPIC_MODEL 环境变量；4 settings 里的 model；5 内置默认。--model 的定义在 src/main.tsx 第 999 行，可以传别名（sonnet、opus）也可以传全名（claude-sonnet-4-6）。</p>
        <h2 id="design">八、核心设计与下一站</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>循环的信号只有一个：tool_use 块。</strong>stop_reason 不可靠，唯一可信的是流式返回里有没有工具调用。停不停，模型说了算，规则只负责收尾和兜底。</li>
          <li><strong>记忆就是消息列表。</strong>没有单独的记忆模块，上一轮的回答和工具结果全部原样追加，下一轮全看见。压缩解决的正是这个列表无限变长的问题。</li>
          <li><strong>三层嵌套，各管一摊。</strong>REPL 的一次回车是 submitMessage，一次 submitMessage 是一次 query()，一次 query() 是若干个 Turn 的 while 循环。启动、会话、循环三层分离。</li>
          <li><strong>流式要自己攒参数。</strong>不用 SDK 的 BetaMessageStream，是为了避开每 chunk 一次 partial JSON 解析的 O(n²)；闲置看门狗补的是 SDK 超时覆盖不到的流式 body。</li>
          <li><strong>压缩是四层漏斗，不是开关。</strong>边界裁剪、microcompact、context collapse、autocompact 依次收紧，阈值是公式算出来的，压缩后的消息顺序是定死的。</li>
        </ul>
        <p>下一站是 P04。上篇的最后一章，讲怎么接着读、哪几条线不能碰。循环跟完了，坐标有了，收尾的时候再回头看开篇那句话：这仓库到底是什么。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'm08',
    code: 'M08',
    track: 'internals',
    title: '工具与权限——模型的手脚怎么被管住',
    words: 2772,
    outline: [
      { id: 'problem', label: '一、这章解决什么问题' },
      { id: 'interface', label: '二、工具长什么样：Tool 接口' },
      { id: 'registry', label: '三、注册表与条件编译' },
      { id: 'four-tools', label: '四、四个工具拆开看' },
      { id: 'hooks', label: '五、Hooks：27 个事件' },
      { id: 'permissions', label: '六、权限：五种模式与审批流水线' },
      { id: 'details', label: '七、容易忽略的细节' },
      { id: 'design', label: '八、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="problem">一、这章解决什么问题</h2>
        <p>Agent 的手脚是工具，工具的缰绳是权限。模型能调什么工具、调的时候传什么参数、调之前要不要问你，这三个问题，答案全在这一章。先纠正一个常见的误解：src/hooks/ 不是 Hooks 系统，它是 React Hooks，85 个顶层条目。生命周期 Hooks 的实现在 src/utils/hooks.ts，一个 5,022 行的文件。这两个名字一样、东西完全不同的目录，是读这份源码时最容易踩的坑，本章先把它踩掉。</p>
        <h2 id="interface">二、工具长什么样：Tool 接口</h2>
        <p>所有工具共享一个接口，定义在 src/Tool.ts 第 362 行起。每个工具是一个对象，关键字段就这些：name（工具名）、description()（给模型看的说明，动态生成）、prompt()（工具的长篇系统提示）、inputSchema（zod schema，入参校验就靠它）、call()（真正干活的函数）、isEnabled()（这工具现在能不能用）、isReadOnly()（这一次调用是不是只读）、isDestructive?()（是不是不可逆操作：删除、覆盖、发送）、maxResultSizeChars（结果超过多少字符就落盘）。</p>
        <pre><code>{`// src/Tool.ts:362-410 —— 工具接口核心字段（节选）
export type Tool<
  Input extends AnyObject = AnyObject,
  Output = unknown,
  P extends ToolProgressData = ToolProgressData,
> = {
  call(
    args: z.infer<Input>,
    context: ToolUseContext,
    canUseTool: CanUseToolFn,
    parentMessage: AssistantMessage,
    onProgress?: ToolCallProgress<P>,
  ): Promise<ToolResult<Output>>
  description(
    input: z.infer<Input>,
    options: {
      isNonInteractiveSession: boolean
      toolPermissionContext: ToolPermissionContext
      tools: Tools
    },
  ): Promise<string>
  readonly inputSchema: Input
  isEnabled(): boolean
  isReadOnly(input: z.infer<Input>): boolean
  /** Defaults to false. Only set when the tool performs irreversible operations (delete, overwrite, send). */
  isDestructive?(input: z.infer<Input>): boolean`}</code></pre>
        <p>工具用 buildTool() 构造（src/Tool.ts 第 748 行起），注释称它能做到“0-error typecheck across all 60+ tools”。每个工具目录下都有独立的 prompt.ts，模型看到的工具说明由 description() 与 prompt() 返回。Bash 的长篇系统提示在 src/tools/BashTool/prompt.ts 的 getSimplePrompt() 里，超时数字也是从这里拼进提示的。</p>
        <p>maxResultSizeChars 值得单独记一笔。它的注释写在 src/Tool.ts 第 463 行：结果超过这个字符数，就写到磁盘文件里，模型只收到预览加文件路径。每个工具的上限不一样：Bash 是 30,000，Agent 和 MCP 是 100,000，Read 是 Infinity。Read 设成无限是有原因的，注释写明了：落盘会造成 Read→文件→Read 的循环，工具自带上限就够了。超限结果由 persistToolResult 写到会话目录下的 tool-results/&lt;toolUseId&gt;.txt 或 .json，模型只收到 2,000 字节的预览加文件路径，之后可以用 Read 读完整结果。</p>
        <h2 id="registry">三、注册表与条件编译</h2>
        <p>注册表就是 src/tools.ts，getAllBaseTools() 从第 184 行起，注释称它是“全部内置工具的唯一事实来源”。getTools(permissionContext) 在此基础上做模式过滤与 deny 过滤，assembleToolPool() 再把 MCP 工具并进来、按名字去重，内置优先。</p>
        <p>注册数本身就是条件编译的。同一份代码，USER_TYPE 是 ant 还是外部用户、feature() 开关开还是关，得到的工具集不同。证据有三处。第一，tools.ts 里引用的 5 个工具目录在还原仓库里不存在：SuggestBackgroundPRTool、PushNotificationTool、SubscribePRTool、CtxInspectTool、ListPeersTool，都是以 feature(...) ? require(...) : null 做死代码消除，外部构建产物里被砍掉了。第二，ant 专属工具按环境变量开关，比如 ConfigTool 和 TungstenTool，只在 process.env.USER_TYPE === &apos;ant&apos; 时才加进来，REPLTool 也是同样的条件 require。第三，有内嵌搜索工具时直接不要 Glob 和 Grep：注释写明，ant 原生构建把 bfs/ugrep 嵌进了 bun 二进制，Claude 的 shell 里 find/grep 会 alias 到这些快工具，专用的 Glob/Grep 工具就没必要了。无条件常驻的只有 21 个。CLAUDE_CODE_SIMPLE=1 时只剩 3 个：Bash、FileRead、FileEdit；Coordinator 模式下再加 AgentTool、TaskStopTool、SendMessageTool。</p>
        <pre><code>{`// src/tools.ts:188-201 —— 条件编译的两个例子
    // Ant-native builds have bfs/ugrep embedded in the bun binary (same ARGV0
    // trick as ripgrep). When available, find/grep in Claude's shell are aliased
    // to these fast tools, so the dedicated Glob/Grep tools are unnecessary.
    ...(hasEmbeddedSearchTools() ? [] : [GlobTool, GrepTool]),
    ...
    ...(process.env.USER_TYPE === 'ant' ? [ConfigTool] : []),
    ...(process.env.USER_TYPE === 'ant' ? [TungstenTool] : []),`}</code></pre>
        <p>还有一个容易忽略的细节：assembleToolPool() 把内置工具排前面、MCP 工具排后面，分别排序后拼接。注释称这是为了提示缓存稳定：全局缓存断点放在最后一个内置工具之后，扁平排序会让 MCP 工具插进内置工具之间、使下游缓存键失效。工具的顺序不是随便排的，它直接影响缓存命中率。</p>
        <h2 id="four-tools">四、四个工具拆开看</h2>
        <p><strong>Bash。</strong>默认超时 2 分钟，上限 10 分钟（src/utils/timeouts.ts），都可由环境变量改。run_in_background 进后台任务系统，输出落盘、完成时通知。助手模式下阻塞命令 15 秒自动转后台（BashTool.tsx 第 56 行，ASSISTANT_BLOCKING_BUDGET_MS = 15_000）。sleep 这类阻塞命令会被直接拦下，提示你用 run_in_background 或 Monitor 工具，实在要等就别超过 2 秒。只读性由 checkReadOnlyConstraints 判定，isReadOnly 为真才可能免审批。权限入口在 src/tools/BashTool/bashPermissions.ts 第 1663 行的 bashToolHasPermission()，沙箱决策在同目录的 shouldUseSandbox.ts，触发条件未核实，附录里标了。</p>
        <p><strong>文件读写。</strong>Read 默认最多输出 25,000 token、文件总大小上限 0.25MB，超限报错并提示用 offset/limit 分段读，图片有单独的 imageProcessor.ts。Edit 的 old_string 必须恰好出现一次，多处匹配时报错，提示用 replace_all: true 或加更多上下文；old_string 与 new_string 相同直接拒绝。Write 最有意思，写前校验“先读后写”：文件存在但没读过，拒绝（errorCode 2）；文件自读后被外部改过（mtime 变了），拒绝（errorCode 3）。每次写前都调 fileHistoryTrackEdit 做备份，按内容哈希去重的 v1 备份，而且备份先于 staleness 检查执行，注释明说：即使 staleness 检查失败，也只是留下一个无用的备份，不会损坏状态。</p>
        <pre><code>{`// src/tools/FileWriteTool/FileWriteTool.ts:196-216 —— 先读后写校验
    const readTimestamp = toolUseContext.readFileState.get(fullFilePath)
    if (!readTimestamp || readTimestamp.isPartialView) {
      return {
        result: false,
        message:
          'File has not been read yet. Read it first before writing to it.',
        errorCode: 2,
      }
    }
    const lastWriteTime = Math.floor(fileMtimeMs)
    if (lastWriteTime > readTimestamp.timestamp) {
      return {
        result: false,
        message:
          'File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.',
        errorCode: 3,
      }
    }`}</code></pre>
        <p><strong>Agent / Task。</strong>AgentTool 的 call() 先处理“团队队友”分支：传了 team_name 和 name 时调 spawnTeammate()，原地生成队友，返回 status: &apos;teammate_spawned&apos;。否则走 runAgent()（src/tools/AgentTool/runAgent.ts 第 248 行，异步生成器）。关键设计点有四处。第一，子代理拿到的是预先算好的独立工具池 availableTools，由调用方算好，避免循环依赖，且父级的 allow 规则不会漏过去：传了 allowedTools 时会替换全部 allow 规则。第二，子代理可以同步等结果，也可以 run_in_background: true 走后台任务，之后用 TaskOutputTool 读输出——这个工具的 description() 自称 [Deprecated]，推荐直接 Read 任务输出文件。第三，同步路径用 Promise.race 在“下一条消息”与“转后台信号”之间竞速，超过进度阈值就在界面上显示后台提示。第四，防护：队友不能再派队友，注释原文是“the team roster is flat”；fork 子代理里不能再 fork，靠 querySource 检查加消息扫描兜底。子代理的权限模式可单独指定，比如 plan。</p>
        <p><strong>MCP 工具。</strong>src/tools/MCPTool/MCPTool.ts 只是模板，name 是 mcp，call() 返回空字符串，注释写明“Overridden in mcpClient.ts”。真正的转换在 src/services/mcp/client.ts 的 fetchToolsForClient()（第 1744 行起）：对每个连接上的 server 调 tools/list，逐个把 MCP 工具展开成内置 Tool 对象，名字拼成 mcp__&lt;server&gt;__&lt;tool&gt;，除非 SDK 模式且开了 CLAUDE_AGENT_SDK_MCP_NO_PREFIX。描述超过上限会被截断并加 … [truncated]；并行、只读、破坏性全部取自 MCP 工具自带的 annotations（readOnlyHint、destructiveHint、openWorldHint）；调用时走 callMCPToolWithUrlElicitationRetry，带 abort 信号，失败会话最多重试 1 次。</p>
        <h2 id="hooks">五、Hooks：27 个事件</h2>
        <p>先把名字对清楚。src/hooks/ 是 React Hooks，不是生命周期 Hooks。生命周期 Hooks 的实现在 src/utils/hooks.ts（5,022 行），配置在 src/utils/hooks/hooksConfigManager.ts 和 hooksSettings.ts，事件类型在 src/entrypoints/sdk/coreSchemas.ts 与 coreTypes.ts。事件一共 27 个，两处定义完全一致：</p>
        <p>PreToolUse、PostToolUse、PostToolUseFailure、Notification、UserPromptSubmit、SessionStart、SessionEnd、Stop、StopFailure、SubagentStart、SubagentStop、PreCompact、PostCompact、PermissionRequest、PermissionDenied、Setup、TeammateIdle、TaskCreated、TaskCompleted、Elicitation、ElicitationResult、ConfigChange、WorktreeCreate、WorktreeRemove、InstructionsLoaded、CwdChanged、FileChanged。</p>
        <p>配置位置是 settings.json 的 hooks 字段，schema 是 HooksSchema（src/schemas/hooks.ts 第 211 行）：事件名到 matcher 数组的映射，每个 matcher 是 {'{'} matcher（可选，用来按工具名等过滤，比如 Write）、hooks（HookCommand 数组） {'}'}。来源按优先级合并：用户、项目、本地、策略 settings，插件 hook，会话 hook，内置 hook。</p>
        <p>Hook 命令分四种类型，schema 上是按 type 区分的联合类型：command（shell 命令）、prompt（发给模型）、agent（子代理）、http（HTTP 请求）。command 类型有 command、shell（默认 bash，PowerShell 时 spawn pwsh -NoProfile -NonInteractive）、timeout（秒）、if（条件）四个字段。执行方式是 spawn 子进程，输入 JSON 写进 stdin（src/utils/hooks.ts 第 1006 行，child.stdin.write(jsonInput + &apos;\n&apos;)），stdout 解析为 JSON 输出。所有事件共有的 stdin 字段是 session_id、transcript_path、cwd，permission_mode、agent_id、agent_type 视情况有。PreToolUse 的输入再加四个字段：hook_event_name、tool_name、tool_input、tool_use_id。</p>
        <p>超时分三档。默认是 TOOL_HOOK_EXECUTION_TIMEOUT_MS，10 分钟。单条 hook 可配 timeout 字段，单位是秒。SessionEnd hook 默认只有 1,500 毫秒，可由 CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS 改。退出码语义以 PreToolUse 为准，hooksConfigManager.ts 第 33 行的原话：0 是 stdout/stderr 不展示；2 是把 stderr 展示给模型并阻止工具调用；其他是只展示给用户，工具照常执行。Stop 事件的 2 是“把 stderr 给模型并继续对话”，UserPromptSubmit 的 2 是“阻止处理、擦掉原 prompt、只把 stderr 给用户”。JSON 输出里的 decision（approve 或 block）与 hookSpecificOutput.permissionDecision（allow、deny、ask，仅 PreToolUse）可以直接改权限判定，hookSpecificOutput.updatedInput 还能改写工具入参。</p>
        <h2 id="permissions">六、权限：五种模式与审批流水线</h2>
        <p>权限模式对外有 5 种（src/types/permissions.ts 第 15 行）：acceptEdits、bypassPermissions、default、dontAsk、plan。内部再加 auto（需要 TRANSCRIPT_CLASSIFIER 开关）和 bubble。模式存在 settings.json 的 permissions.defaultMode，也可由 --permission-mode 指定。</p>
        <p>规则存在 settings.json 的 permissions 段，PermissionsSchema 定义了 allow、deny、ask 三个数组，元素是规则，比如 Bash(npm test)、Edit、mcp__server 前缀规则，外加 defaultMode、disableBypassPermissionsMode（关掉 bypass 能力）、additionalDirectories。行为只有三态：allow、deny、ask。规则来源有优先级：userSettings、projectSettings、localSettings、flagSettings、policySettings、cliArg 等。</p>
        <p>审批流程在 src/services/tools/toolExecution.ts 的 checkPermissionsAndCallTool（第 599 行起），分五步：① zod 校验入参；② 各工具自己的 validateInput；③ 对 Bash 提前启动 allow 分类器检查，与 pre-tool hooks、deny/ask 分类器、权限对话框并行；④ 跑 runPreToolUseHooks，hook 可返回 permissionBehavior 改判定、或 updatedInput 改写参数；⑤ canUseTool 做最终判定，ask 时弹对话框。auto 模式下 canUseTool 会等分类器（side_query）的结果。</p>
        <pre><code>{`// src/services/tools/toolExecution.ts:731-735 —— 投机分类器
  // Speculatively start the bash allow classifier check early so it runs in
  // parallel with pre-tool hooks, deny/ask classifiers, and permission dialog
  // setup. The UI indicator (setClassifierChecking) is NOT set here — it's
  // set in interactiveHandler.ts only when the permission check returns 'ask'
  // with a pendingClassifierCheck. This avoids flashing "classifier running"
  // for commands that auto-allow via prefix rules.`}</code></pre>
        <p>deny 规则在模型看到工具之前就过滤掉。filterToolsByDenyRules（src/tools.ts 第 259 行）的注释写明：mcp__server 这样的前缀规则，会在模型看到工具之前就把整个 server 的工具都剥掉，不只是在调用时拦。--dangerously-skip-permissions 存在，定义在 src/main.tsx 第 982 行，原话是“Bypass all permission checks. Recommended only for sandboxes with no internet access.”另有 --allow-dangerously-skip-permissions，只启用该选项、不默认开启。会话没有用这个 flag 启动时，事后不能把模式切到 bypassPermissions，print.ts 第 4595 行有对应报错。还有一个 killswitch，src/utils/permissions/bypassPermissionsKillswitch.ts，可以按远程 gate 关掉 bypass。</p>
        <h2 id="details">七、容易忽略的细节</h2>
        <p><strong>流式并行执行。</strong>StreamingToolExecutor 的类注释写明：工具边流式到达边执行，不必等整条消息收完；并发安全的工具可以并行，不安全的必须独占；结果按工具到达顺序缓冲后依次发出。还有一个细节：子级 AbortController，一个 Bash 出错时兄弟子进程立刻死掉，而不是跑完。未知工具名时直接返回 &lt;tool_use_error&gt;Error: No such tool available: 名字&lt;/tool_use_error&gt;。</p>
        <p><strong>错误信封。</strong>入参 zod 校验失败、或工具自带 validateInput 返回失败时，不抛异常，而是把 &lt;tool_use_error&gt;...&lt;/tool_use_error&gt; 的 is_error: true 结果块发回给模型，模型能据此自我纠正。FileWrite 的“未读先写”错误码 2、“读后被改”错误码 3 属于同一机制。</p>
        <p><strong>防注入。</strong>toolExecution.ts 第 753 行起：_simulatedSedEdit 是内部字段，只允许权限系统在用户批准后注入；模型如果自己传了这个字段，会被剥掉，注释称这是 defense-in-depth，即使 zod 的 strictObject 理应拒绝。MCP 工具的 searchHint 会把空白折叠掉，注释称 _meta 对外部 MCP server 开放，一个换行会在延迟工具列表里注入孤行。</p>
        <p><strong>取消语义。</strong>工具接口有个 interruptBehavior()，返回 cancel 或 block：用户在工具运行时提交新消息时怎么办，cancel 是停掉工具并丢弃结果，block 是继续跑、新消息等待，不实现时默认 block。Bash、Agent、FileEdit 都没实现这个方法，即默认 block。</p>
        <p><strong>延迟加载。</strong>工具接口有 shouldDefer（调用前必须先走 ToolSearch）与 alwaysLoad（MCP 工具由 _meta[&apos;anthropic/alwaysLoad&apos;] 控制，首轮就必须可见）。getAllBaseTools 末尾的注释称，ToolSearchTool 是在“工具搜索可能启用”时乐观包含的，真正的延迟决策在请求时做。</p>
        <h2 id="design">八、核心设计</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>注册即策略。</strong>工具集不是写死的，是 getAllBaseTools() 在 feature 开关、USER_TYPE、环境变量三个维度上算出来的。同一份代码，不同身份看到的工具不一样。</li>
          <li><strong>deny 在模型看见之前就生效。</strong>规则过滤发生在工具列表组装时，不是调用时。模型看不到被 deny 的工具，也就不会去调它。</li>
          <li><strong>审批是五步流水线，不是单个 if。</strong>校验、工具自检、投机分类器、PreToolUse hooks、canUseTool 最终判定，每一步都能改判定或改参数，hook 甚至能改写工具入参。</li>
          <li><strong>错误是给模型看的，不是给人看的。</strong>校验失败不抛异常，发回 &lt;tool_use_error&gt; 让模型自我纠正。写前备份先于检查执行，宁可留下一个无用备份，也不损坏状态。</li>
          <li><strong>顺序和并发都是设计，不是巧合。</strong>工具按到达顺序缓冲结果，并发安全逐个判定；内置工具排前面、MCP 排后面，是为了提示缓存稳定；Bash 出错时兄弟进程立刻死掉。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'm07',
    code: 'M07',
    track: 'internals',
    title: '三层门控——门控清单才重要',
    words: 1246,
    outline: [
      { id: 'intro', label: '一、引子：功能清单不重要' },
      { id: 'layer1', label: '二、第一层，编译时开关' },
      { id: 'layer2', label: '三、第二层，用户类型' },
      { id: 'layer3', label: '四、第三层，远程开关' },
      { id: 'design', label: '五、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：功能清单不重要</h2>
        <p>前面六章，每个功能最后都落到同一句话：这个功能有没有开，取决于门控。Anthropic 控制功能露不露脸，分三层，画出来是这个样子：</p>
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
        <p>这三层不是平行的，是漏斗。编译时砍掉一批，运行时按用户类型再锁一批，远程开关最后还能动态关一批。你手里装到的 Claude Code，和 Anthropic 内部用的那份，从源码上看就不是同一个东西。这章把三层逐层拆开，每层都给证据。</p>
        <h2 id="layer1">二、第一层，编译时开关</h2>
        <p>feature() 这个函数来自 bun:bundle，构建时决定代码包不包进来，没包进来的代码会被死代码消除整个删掉。BUDDY、KAIROS、ULTRAPLAN、COORDINATOR_MODE、BRIDGE_MODE、VOICE_MODE 这些都是这一层的开关。README 列了约 50 个核心开关，我 grep 出 89 个不同名字，多的那些大多是基础设施开关。这一层最狠：代码不在构建产物里，你再怎么找也找不到，连逆向都没得逆。</p>
        <p>死代码消除在工具注册表里看得最清楚。src/tools.ts 里引用的 5 个工具目录在还原仓库里不存在：SuggestBackgroundPRTool、PushNotificationTool、SubscribePRTool、CtxInspectTool、ListPeersTool。它们的引用方式是 feature(...) ? require(...) : null，开关关着的时候，require 那条分支在构建时就被删掉，目录本身连进构建产物都没有。src/tools.ts 第 15 行的 REPLTool 也是一样的写法：</p>
        <pre><code>{`// src/tools.ts:15-19 —— 条件 require，开关关着就被死代码消除
const REPLTool =
  process.env.USER_TYPE === 'ant'
    ? require('./tools/REPLTool/REPLTool.js').REPLTool
    : null`}</code></pre>
        <p>注意这一行的判断条件是 USER_TYPE，不是 feature()。第一层和第二层经常写在同一处，读的时候要分清：feature() 决定代码在不在构建产物里，USER_TYPE 决定运行时走不走这条分支。一个工具可能代码在产物里，但因为 USER_TYPE 是 external，运行时永远走不到。</p>
        <h2 id="layer2">三、第二层，用户类型</h2>
        <p>环境变量 USER_TYPE 是 ant 还是 external，判断条件在源码里写的是 process.env.USER_TYPE === &apos;ant&apos;。ant 是内部员工，解锁全部功能，GrowthBook 20 分钟刷新一次，还有 200 多处专属检查；external 是外部用户，裁剪版，6 小时刷新一次。模型默认也分等级：ant 用户默认 Opus 1M，Max 和 Team Premium 用户默认 Opus，其余默认 Sonnet 4.6，P03 第七节讲过。</p>
        <p>Ultraplan 那行恒为 false 的 isEnabled，就是第二层的极端形态（src/commands/ultraplan.tsx）：isEnabled: () =&gt; &quot;external&quot; === &apos;ant&apos;。external 是外部用户，ant 是内部员工，这个比较恒为 false，外部版永远不可用。代码在那儿，门从里面锁上了。工具注册表里的 ConfigTool 和 TungstenTool 也是第二层的例子：只在 process.env.USER_TYPE === &apos;ant&apos; 时才加进工具列表（src/tools.ts 第 199 行起）。</p>
        <p>第二层还有一个容易忽略的点：它不只控制功能，还控制默认模型和刷新节奏。ant 用户的 GrowthBook 20 分钟刷新一次，外部用户 6 小时刷新一次。这意味着同一个远程开关，内部员工 20 分钟就能看到变化，外部用户最长要等 6 小时。门控的时效性本身也是分层的。</p>
        <h2 id="layer3">四、第三层，远程开关</h2>
        <p>GrowthBook 上带 tengu_ 前缀的开关，服务端随时能改，不用发版。Kairos 的总开关是 tengu_kairos，做梦的阈值是 tengu_onyx_plover，Ultraplan 用哪个模型是 tengu_ultraplan_model，Bridge 是 tengu_ccr_bridge，会话记忆是 tengu_session_memory。这一层的好处是灰度，坏处是对读源码的人来说，源码里看到的只是开关名，开关现在是开是关，源码里没有答案。</p>
        <p>第三层和前两层的关系，Kairos 的检查最能说明问题。src/main.tsx 第 1039 行起的检查是：feature(&apos;KAIROS&apos;) 开着（第一层），settings.json 里 assistant: true（用户配置），目录通过信任检查（安全），GrowthBook 的 tengu_kairos 开着（第三层），最后 setKairosActive(true) 把全局状态打开。五层检查里，第一层和第三层都是门控，缺一层都不行。--assistant 这个 CLI 参数可以跳过第四层远程开关检查，是给 Agent SDK 的 daemon 模式留的后门，但跳不过第一层：feature(&apos;KAIROS&apos;) 关着，代码根本不在产物里。</p>
        <p>权限系统里也有第三层的影子。bypassPermissions 的 killswitch（src/utils/permissions/bypassPermissionsKillswitch.ts）可以按远程 gate 关掉 bypass，auto 权限模式需要 TRANSCRIPT_CLASSIFIER 开关。这些都是“服务端随时能改”的设计，发布出去的二进制，行为还能被远程收回去。</p>
        <h2 id="design">五、核心设计</h2>
        <p>三层合起来，外部发布版是个阉割版，这句话不是修辞，是字面意思。读还原仓库最大的收获，我觉得就是这张图：功能清单不重要，门控清单才重要。收成三条：</p>
        <ul>
          <li><strong>门控是漏斗，不是开关。</strong>编译时、用户类型、远程开关三层依次收紧，每层砍掉一批。读源码时先问它在哪一层，再问它开没开。</li>
          <li><strong>第一层最狠，第二层最宽，第三层最活。</strong>编译时砍掉的代码连逆向都没得逆；用户类型一刀切出两个版本；远程开关不用发版就能改，灰度全靠它。</li>
          <li><strong>同一个功能，门可能锁在任何一层。</strong>Ultraplan 锁在第二层，恒为 false；Kairos 要过五层检查；Bridge 要过三重检查。只看功能名，不知道它被锁在哪。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'p04',
    code: 'P04',
    track: 'practice',
    title: '收尾——怎么读，别怎么读',
    words: 956,
    outline: [
      { id: 'problem', label: '一、这章解决什么问题' },
      { id: 'paths', label: '二、三条接着读的路' },
      { id: 'red-lines', label: '三、三条红线' },
      { id: 'checklist', label: '四、读完之后带走的清单' },
    ],
    body: (
      <React.Fragment>
        <h2 id="problem">一、这章解决什么问题</h2>
        <p>读到这里，这本小电子书就读完了。回头看，dg-ai-notes 的办法确实好用：先跑起来，再看全貌，再跟一条链，再一个功能一个功能地拆，每章都问是什么、怎么做、为什么，最后把数字和速查都收到附录里。这章不讲新功能，只回答两个问题：接下来往哪读，以及哪几条线不能碰。</p>
        <h2 id="paths">二、三条接着读的路</h2>
        <p><strong>第一条，照着附录的核对表，自己克隆一份仓库，把那几个数字重新数一遍。</strong>数出来的和 README 不一样的地方，就是你开始真正读源码的起点。比如 tools/ 下 53 个目录、真实工具 51 个、注册表无条件常驻 21 个，这三个数放在一起，工具注册表的条件编译就立起来了。再比如 commands/ 下 102 个条目、87 个子目录、注册表无条件列出 70 个，命令的注册机制也就清楚了。数数字是最便宜的读源码办法。</p>
        <p><strong>第二条，挑一个隐藏功能，跟它的开关走到底。</strong>从 feature() 的调用点，到命令注册表，到具体实现文件，再到 GrowthBook 的开关名，一条线走通，比泛泛翻十个目录有用。比如 Buddy：feature(BUDDY) 在哪调用，/buddy 命令在 src/commands/ 里怎么注册，src/buddy/ 下 6 个文件各干什么，盐值 friend-2026-401 在哪。再比如 Bridge：feature(BRIDGE_MODE)、USER_TYPE、tengu_ccr_bridge 三重检查分别在哪，src/bridge/ 下 33 个文件怎么分工。走通一条线，门控的三层就不再是抽象的图。</p>
        <p><strong>第三条，把这本和 dg-ai-notes 的 Pi 精读篇对照着读。</strong>Pi 是 MIT 开源的 SDK，Claude Code 是还原出来的商业产品，一个讲“该怎么做”，一个讲“实际是怎么做”，两边对照，取舍就看得出来。比如 Pi 的 Agent Loop 用 stopReason 做唯一的信号灯，Claude Code 的 queryLoop 却在注释里写明 stop_reason === &apos;tool_use&apos; 不可靠，唯一信号是流式返回里的 tool_use 块。再比如 Pi 的工具系统讲“说明书、干活、框架兜底”三件事，Claude Code 的工具接口多了 isReadOnly、isDestructive、maxResultSizeChars 这些生产环境才需要的字段。对照着读，两个仓库的设计取舍都看得更清楚。</p>
        <h2 id="red-lines">三、三条红线</h2>
        <p><strong>第一，别把还原仓库当官方版用。</strong>它的版本号、测试、发布流程都不是官方的，出了问题没人负责。版本号 999.0.0-restored 的意思就是“这个版本不存在”，测试套件根本没有，提交历史只有一条 first commit。</p>
        <p><strong>第二，别商用。</strong>源码版权归 Anthropic，仓库 README 写了仅用于技术研究与学习。隐藏功能被三层门控锁着，锁是设计的一部分，不是 bug。</p>
        <p><strong>第三，别指望隐藏功能能在你手里跑起来。</strong>Buddy、Kairos、Ultraplan、Bridge 这些，编译开关、用户类型、远程开关三层里至少有一层是锁着的。读源码可以，照着改了发出去不行。Ultraplan 的 isEnabled 恒为 false，就是最直接的证据。</p>
        <h2 id="checklist">四、读完之后带走的清单</h2>
        <p>如果这本书只留给你一张清单，就是下面这张。每一项都能在源码里找到出处，出处在附录的对照表里：</p>
        <ul>
          <li>一次问答的循环是 queryLoop() 的 while (true)，信号只有一个：流式返回里的 tool_use 块。</li>
          <li>记忆就是消息列表，压缩是四层漏斗，阈值是公式算出来的。</li>
          <li>工具集是算出来的，不是写死的：feature 开关、USER_TYPE、环境变量三个维度。</li>
          <li>deny 在模型看见工具之前就生效，审批是五步流水线。</li>
          <li>门控是三层漏斗，功能清单不重要，门控清单才重要。</li>
        </ul>
        <blockquote>
          <p>功能清单不重要，门控清单才重要。外部版是个阉割版，这句话不是修辞，是字面意思。</p>
        </blockquote>
      </React.Fragment>
    ),
  },
  {
    id: 'm02',
    code: 'M02',
    track: 'internals',
    title: '电子宠物——终端里的拓麻歌子',
    words: 1680,
    outline: [
      { id: 'intro', label: '一、引子：先拆掉一个预期' },
      { id: 'soul-bones', label: '二、灵魂与骨架：什么存盘、什么现算' },
      { id: 'generation', label: '三、生成算法：盐值、稀有度与五维属性' },
      { id: 'rendering', label: '四、渲染：500ms 心跳与气泡' },
      { id: 'misunderstandings', label: '五、两个容易误解的点' },
      { id: 'design', label: '六、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：先拆掉一个预期</h2>
        <p>终端里的拓麻歌子，一个完整的虚拟宠物伴侣系统，藏在 src/buddy/ 的 6 个文件里。18 种物种，鸭子、鹅、果冻、猫、龙、章鱼、猫头鹰、企鹅、乌龟、蜗牛、幽灵、六角恐龙、水豚、仙人掌、机器人、兔子、蘑菇、胖猫，每种都有 3 帧 ASCII 精灵动画，5 行高、12 字符宽，500 毫秒一帧，旁边飘气泡对话。窄终端放不下精灵图，就退化成一张表情文字脸，比如猫的 =·ω·=。</p>
        <p>但先拆掉一个预期：它没有饥饿、心情、等级这些状态机。宠物这件事，在这个仓库里不是“养成系统”，而是“确定性生成加轻渲染”的彩蛋。你喂它、摸它，不会让它长大，只会让它冒个爱心。先把这个预期拆掉，后面的机制才读得下去。</p>
        <h2 id="soul-bones">二、灵魂与骨架：什么存盘、什么现算</h2>
        <p>宠物的状态分两半，一半叫灵魂，一半叫骨架。灵魂只有三个字段：名字、性格、孵化时间，存在全局配置 ~/.claude.json 的 companion 键里（src/utils/config.ts 第 269 行起，路径由 getGlobalClaudeFile 定，$CLAUDE_CONFIG_DIR 可以改）。骨架是物种、稀有度、眼睛、帽子、闪光、五维属性，每次读取时都从 userId 重新算，不存盘。src/buddy/types.ts 第 104 行起的注释写明了为什么这么设计：</p>
        <blockquote>
          <p>What actually persists in config. Bones are regenerated from hash(userId) on every read so species renames don&apos;t break stored companions and users can&apos;t edit their way to a legendary.</p>
        </blockquote>
        <p>意思是，物种改名不会弄坏已经存下来的宠物，用户改配置也刷不出传说宠物。改配置没用，因为骨架根本不从配置里读。运行时还有两个状态放在内存的 AppState 里，不落盘：最新的宠物反应（companionReaction，来自观察器）和上次 /buddy pet 的时间戳（companionPetAt，爱心动画就靠它判断还在不在 2.5 秒内）。</p>
        <h2 id="generation">三、生成算法：盐值、稀有度与五维属性</h2>
        <p>生成算法是确定性的：账号 UUID 加固定盐值 friend-2026-401，先 FNV-1a 哈希，再喂给 Mulberry32 这个小随机数生成器。每人只会得到一只固定的宠物，改配置也没用。src/buddy/companion.ts 第 84 行起：</p>
        <pre><code>{`// src/buddy/companion.ts:84-101 —— 生成算法
const SALT = 'friend-2026-401'
  const rarity = rollRarity(rng)
  const bones: CompanionBones = {
    rarity,
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
  }`}</code></pre>
        <p>稀有度分 5 档，权重是普通 60、非凡 25、稀有 10、史诗 4、传说 1。五维属性是 DEBUGGING、PATIENCE、CHAOS、WISDOM、SNARK，稀有度越高属性下限越高：普通 5、非凡 15、稀有 25、史诗 35、传说 50。眼睛有 6 种，帽子有 7 种可戴的（皇冠、礼帽、螺旋桨、光环、巫师帽、毛线帽、小鸭子），普通没有帽子，其他档随机分。闪光是独立的 1%，任何物种、任何稀有度都有 1% 概率变闪光。</p>
        <p>roll() 会被三个高频路径调用：500 毫秒的精灵 tick、每次按键的 PromptInput、每回合的观察器。所以结果有缓存，不然每 500 毫秒重新算一次，宠物会在你眼前不停地变。物种名在源码里全是 String.fromCharCode 的十六进制编码，注释写了原因：</p>
        <blockquote>
          <p>One species name collides with a model-codename canary in excluded-strings.txt. The check greps build output (not source), so runtime-constructing the value keeps the literal out of the bundle while the check stays armed for the actual codename.</p>
        </blockquote>
        <p>意思是，有个物种名跟内部模型代号撞了，检查会扫构建产物，所以运行时再拼出这个值，让字面量不进产物，检查还能继续盯着真正的代号。18 个物种统一编码，不是只编那一个。具体是哪个物种名撞了哪串代号，树里没有 excluded-strings.txt，无法核实，附录里标了。</p>
        <h2 id="rendering">四、渲染：500ms 心跳与气泡</h2>
        <p>渲染是 500 毫秒心跳驱动的。src/buddy/CompanionSprite.tsx 第 15 行起，四个常量就把整个渲染讲完了：TICK_MS 是 500，BUBBLE_SHOW 是 20 个 tick（气泡显示约 10 秒），FADE_WINDOW 是 6 个 tick（最后约 3 秒气泡变淡，让你知道它快没了），PET_BURST_MS 是 2,500（/buddy pet 之后爱心上浮 2.5 秒）。待机序列是 [0,0,0,0,1,0,0,0,-1,0,0,2,0,0,0]，大多是第 0 帧休息，偶尔动一下（第 1、2 帧），-1 的意思是在第 0 帧眨眼。</p>
        <pre><code>{`// src/buddy/CompanionSprite.tsx:15-22 —— 渲染常量
const TICK_MS = 500;
const BUBBLE_SHOW = 20; // ticks → ~10s at 500ms
const FADE_WINDOW = 6; // last ~3s the bubble dims so you know it's about to go
const PET_BURST_MS = 2500; // how long hearts float after /buddy pet
// Idle sequence: mostly rest (frame 0), occasional fidget (frames 1-2), rare blink.
// Sequence indices map to sprite frames; -1 means "blink on frame 0".
const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0];`}</code></pre>
        <p>精灵本体在 src/buddy/sprites.ts，注释写明：每个精灵 5 行高、12 字符宽，第 0 行是帽子槽，第 0 到 1 帧必须留空，第 2 帧可用。终端宽度小于 100 列时退化成单行表情脸，气泡台词截断到 24 字符，说话时台词直接替掉名字旁边的气泡，没地方放气泡了。气泡的台词从哪来，模型侧有一段指令，src/buddy/prompt.ts 第 8 行起的 companionIntroText，注入系统提示的附件文案：</p>
        <blockquote>
          <p>A small {'{species}'} named {'{name}'} sits beside the user&apos;s input box and occasionally comments in a speech bubble. You&apos;re not {'{name}'} — it&apos;s a separate watcher. When the user addresses {'{name}'} directly (by name), its bubble will answer. Your job in that moment is to stay out of the way: respond in ONE line or less, or just answer any part of the message meant for you.</p>
        </blockquote>
        <p>意思是，模型你不是这只宠物，宠物是独立的观察者。用户直接叫宠物名字时，气泡会回答，你的活儿是让开：一行以内，或者只答那部分跟你有关的消息。别解释你不是它，他们知道。别替它说什么，气泡会处理。</p>
        <h2 id="misunderstandings">五、两个容易误解的点</h2>
        <p><strong>第一，/buddy 的子命令。</strong>docs/01 的表格称有 /buddy hatch（AI 模型生成名字和性格）、/buddy pet（2.5 秒爱心）、/buddy card（卡片）、/buddy mute、/buddy unmute 五个子命令。但 src/commands.ts 第 118 行引用的 ./commands/buddy/index.js，在树里不存在，src/commands/ 下没有 buddy/ 目录。子命令的实现与孵化时的模型调用，均无法核实。这是一个重要的提醒：这棵还原树有文件缺失，docs 里声称的东西，不一定能在源码里找到。</p>
        <p><strong>第二，气泡台词是谁生成的。</strong>src/screens/REPL.tsx 每回合结束后调 fireCompanionObserver，把消息喂进去，等它回一个反应，再写进 AppState 的 companionReaction。但这个函数在全树无定义、无 import，src/state/AppStateStore.ts 注释指向的 src/buddy/observer.ts 也不存在。台词是模型现场生成、模板拼接还是规则触发，均无法核实。宠物会说话这件事，源码里只有一半：渲染和提示词都在，生成台词的那块不在。</p>
        <p>顺带一提，上线时间门也在源码里。src/buddy/useBuddyNotification.tsx：isBuddyTeaserWindow 只在 2026 年 4 月 1 日到 7 日返回真，isBuddyLive 在 2026 年 4 月之后返回真。没孵化时启动会弹 15 秒彩虹色的 /buddy 提示。也就是说，这只宠物是按日期逐步放开的，4 月 1 日之前连提示都没有。</p>
        <h2 id="design">六、核心设计</h2>
        <p>这一章的机制可以收成四条核心设计：</p>
        <ul>
          <li><strong>灵魂存盘，骨架现算。</strong>名字、性格、孵化时间存配置，物种、稀有度、属性每次从 userId 重新算。改配置刷不出传说宠物，物种改名也不会弄坏存量。</li>
          <li><strong>确定性生成。</strong>盐值加 FNV-1a 加 Mulberry32，每人一只固定的宠物。生成函数被高频路径调用，所以结果有缓存。</li>
          <li><strong>渲染与状态分离。</strong>500 毫秒心跳只管画，气泡 10 秒、变淡 3 秒、爱心 2.5 秒，时间全是常量。运行时状态只在内存里放两条：最新反应和上次抚摸时间。</li>
          <li><strong>彩蛋的门控。</strong>编译开关是 feature(BUDDY)，外部版没有开。宠物这件事本身不产生任何生产力，它存在的意义是反向证明：一个每天被几十万人用的终端工具，里面还留着这种纯好玩的东西。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'm03',
    code: 'M03',
    track: 'internals',
    title: '永不关机——关掉终端它还在跑',
    words: 1852,
    outline: [
      { id: 'intro', label: '一、引子：四件东西拼在一起' },
      { id: 'activation', label: '二、激活链：五层检查，少一层都不行' },
      { id: 'dream', label: '三、做梦：四阶段与三重门' },
      { id: 'memory-lock', label: '四、记忆落点与锁文件即时钟' },
      { id: 'proactive', label: '五、主动模式：tick、Sleep 与一个 stub' },
      { id: 'design', label: '六、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：四件东西拼在一起</h2>
        <p>关掉终端，Claude 还在运行的持久助手模式。Kairos 想把 Claude 从一次性对话工具变成一个持久运行的助手：关掉终端它还在后台跑，每天自动写日志，晚上自动做梦整理记忆，没人说话时自己找活干，命令超过 15 秒自动丢后台。源码位置在 src/assistant/、src/proactive/、src/services/autoDream/。</p>
        <p>先把四件东西分开：Kairos 是助手模式本身（关掉终端还在跑），autoDream 是做梦（晚上整理记忆），proactive 是主动模式（没人说话时自己找活干），cron 是定时任务（到点就跑）。四件东西拼在一起，才是“永不关机”。这章逐件拆，每件都先讲机制，再讲哪部分在还原树里缺失。</p>
        <h2 id="activation">二、激活链：五层检查，少一层都不行</h2>
        <p>Kairos 激活的真实链路在 src/main.tsx 第 1064 行起：feature(&apos;KAIROS&apos;) 编译开着 → isAssistantMode() 为真 → 目录通过信任检查 → GrowthBook 门开着 → setKairosActive(true)，同时强制 brief 模式、初始化助手团队。--assistant（Agent SDK 的 daemon 模式）会跳过 GrowthBook 门，注释写明 daemon 是 pre-entitled（预先授权的）。</p>
        <pre><code>{`// src/main.tsx:1064-1089 —— Kairos 激活链
    if (feature('KAIROS') && assistantModule?.isAssistantMode() &&
    // Spawned teammates share the leader's cwd + settings.json, so
    // isAssistantMode() is true for them too. --agent-id being set
    // means we ARE a spawned teammate — don't
    // re-init the team or override teammateMode/proactive/brief.
    !(options as {
      agentId?: unknown;
    }).agentId && kairosGate) {
      if (!checkHasTrustDialogAccepted()) {
        console.warn(chalk.yellow('Assistant mode disabled: directory is not trusted. Accept the trust dialog and restart.'));
      } else {
        // Blocking gate check — returns cached 'true' instantly; if disk
        // cache is false/missing, lazily inits GrowthBook and fetches fresh
        // (max ~5s). --assistant skips the gate entirely (daemon is
        // pre-entitled).
        kairosEnabled = assistantModule.isAssistantForced() || (await kairosGate.isKairosEnabled());`}</code></pre>
        <p>这里要纠正一个旧说法。之前这本写的是“settings.json 里 assistant: true 是检查之一”，这个说法在树里找不到依据。isAssistantMode() 的实现在 src/assistant/index.ts，整个文件只有 14 行，只读一个环境变量：</p>
        <pre><code>{`// src/assistant/index.ts:1-6 —— 整个文件只有环境变量判断
function readAssistantModeFlag(): boolean {
  return (
    process.env.CLAUDE_CODE_ASSISTANT_MODE === '1' ||
    process.env.CLAUDE_CODE_ASSISTANT_MODE === 'true'
  )
}`}</code></pre>
        <p>也就是说，Kairos 的开关是环境变量 CLAUDE_CODE_ASSISTANT_MODE，不是 settings.json 的字段。settings 里有没有 assistant 这个字段，在树里找不到任何依据，可能是旧版行为，也可能是另一处没被还原。附录的未核实清单里标了。同样无法核实的是第四层：GrowthBook 的门函数在 src/assistant/gate.ts 里，这个文件不存在，开关名是不是 tengu_kairos，只能从 main.tsx 的注释推断。initializeAssistantTeam()、getAssistantSystemPromptAddendum() 这些函数，在 14 行的 index.ts 里也不存在。</p>
        <h2 id="dream">三、做梦：四阶段与三重门</h2>
        <p>做梦是它最复杂的一块。距上次整合超过 24 小时，并且有 5 个以上新会话时，后台自动启动记忆整合子代理，分 Orient、Gather、Consolidate、Prune 四个阶段跑。这四个阶段就是 src/services/autoDream/consolidationPrompt.ts 的原文字段：</p>
        <ul>
          <li><strong>Phase 1 Orient。</strong>ls 记忆目录、读 MEMORY.md、扫现有主题文件。先看地形，再动手。</li>
          <li><strong>Phase 2 Gather。</strong>按优先级收：每日日志最先，漂移的旧记忆其次，grep JSONL transcript 最后。</li>
          <li><strong>Phase 3 Consolidate。</strong>写或更新记忆目录顶层文件，相对日期转绝对日期，删被证伪的事实。</li>
          <li><strong>Phase 4 Prune and index。</strong>MEMORY.md 保持 200 行以下且约 25KB 以下，每条一行约 150 字符以下，删过期指针，超过约 200 字符的行要瘦身，把内容挪到主题文件里。</li>
        </ul>
        <p>触发分三重门，按便宜程度排序（autoDream.ts 第 1 行起的注释原文：Gate order (cheapest first)）。第一门是时间：距上次整合超过 minHours，默认 24 小时，一次 stat 就能判断。第二门是会话：mtime 在上次整合之后的 transcript 达到 minSessions，默认 5 个，排除当前会话。时间门过了但会话门没过时，10 分钟内不再扫（SESSION_SCAN_INTERVAL_MS）。第三门是锁，下一节讲。</p>
        <p>总开关是 isAutoDreamEnabled()：settings 里的 autoDreamEnabled 有值就用它，没有就看 GrowthBook 的 tengu_onyx_plover 的 enabled 字段。执行体是一个 forked 子代理，runForkedAgent，querySource 是 auto_dream，Bash 被限为只读命令（ls、find、grep、cat、stat、wc、head、tail 这类），写、重定向、改状态都会被拒。跑完在主 transcript 里插一条 Improved 的 “Saved N memories” 系统消息。触发点是每回合结束的 stopHooks（src/query/stopHooks.ts 第 155 行，executeAutoDream）。KAIROS 模式下 autoDream 不跑，注释写明 KAIROS 模式用 disk-skill 的做梦。</p>
        <h2 id="memory-lock">四、记忆落点与锁文件即时钟</h2>
        <p>记忆落点是 getAutoMemPath()：&lt;memoryBase&gt;/projects/&lt;sanitized-git-root&gt;/memory/，worktree 共享同一份。解析顺序分三档：CLAUDE_COWORK_MEMORY_PATH_OVERRIDE 环境变量（全路径覆盖）最先，settings.json 里的 autoMemoryDirectory 其次，默认就是上面那个路径。每日日志在 logs/YYYY/MM/YYYY-MM-DD.md，注释写明是助手模式的用法：白天干活往日期命名的日志文件里追加，晚上单独的 /dream skill 再把日志提炼成主题文件加 MEMORY.md。入口 MEMORY.md 的上限是 MAX_ENTRYPOINT_LINES = 200 行。</p>
        <p>锁文件是最值得记一笔的设计。记忆目录下的 .consolidate-lock，文件 mtime 就是 lastConsolidatedAt，内容是持有者的 PID，1 小时后过期（PID 复用防护）。src/services/autoDream/consolidationLock.ts 第 1 行起的注释原文：</p>
        <blockquote>
          <p>Lock file whose mtime IS lastConsolidatedAt. Body is the holder&apos;s PID. Lives inside the memory dir (getAutoMemPath) so it keys on git-root like memory does, and so it&apos;s writable even when the memory path comes from an env/settings override whose parent may not be.</p>
        </blockquote>
        <p>意思是，锁文件即时钟，不用再单独存一个“上次整合时间”。读 mtime 就知道上次什么时候整合的，写锁文件就是更新时间。锁放在记忆目录里，是为了跟记忆用同一个 git-root 做 key，而且即使记忆路径是环境变量或 settings 覆盖的、父目录可能不可写，锁文件本身也还能写。这跟我们之前写的 Hermes cron 定时简报是同一个思路，只是 Hermes 的 cron 是用户配的，Kairos 的做梦是内核自己发的。做梦那套机制也值得单独记一笔，它跟 Agent 记忆那篇里讲的“抽取后移”是一个东西：白天干活，晚上整理，整理完再剪掉不要的。只不过这里的整理是全自动的，触发条件写在 GrowthBook 的 tengu_onyx_plover 里，远程就能调。</p>
        <h2 id="proactive">五、主动模式：tick、Sleep 与一个 stub</h2>
        <p>主动模式是 Kairos 的另一面：没人说话时它自己找活干，没活就调 SleepTool 等着，靠周期性的 tick 提示来检查有没有事可做。系统提示里的自主段落写在 src/constants/prompts.ts 第 862 行起的 getProactiveSection()，规则很完整：</p>
        <blockquote>
          <p>You are running autonomously. You will receive &lt;tick&gt; prompts that keep you alive between turns — just treat them as &quot;you&apos;re awake, what now?&quot; The time in each &lt;tick&gt; is the user&apos;s current local time. Use it to judge the time of day. If you have nothing useful to do on a tick, you MUST call Sleep. Never respond with only a status message like &quot;still waiting&quot; or &quot;nothing to do&quot; — that wastes a turn and burns tokens for no reason.</p>
        </blockquote>
        <p>意思是，你在自主运行，会收到 tick 提示让你在回合之间保持清醒，就当它是“你醒了，现在干什么”。每个 tick 里的时间是用户的当地时间。每次唤醒要花一次 API 调用，但提示缓存 5 分钟不活动就过期，要平衡好。没事干必须调 Sleep，绝不能只回一句“还在等”或“没事干”，那是浪费一个回合、烧 token 还没产出。SleepTool 的提示词也写明了：每次唤醒花一次 API 调用，提示缓存 5 分钟过期；宁可用 Sleep，也别用 Bash(sleep ...)，因为 Sleep 不占一个 shell 进程。</p>
        <p>但是，tick 以什么节奏发出，在树里找不到实现。src/proactive/useProactive.ts 全文只有 6 行，是一个 stub：</p>
        <pre><code>{`// src/proactive/useProactive.ts —— 全文，只是一个 stub
export function useProactive() {
  return {
    active: false,
    paused: false,
  }
}`}</code></pre>
        <p>REPL 里 onSubmitTick 和 onQueueTick 接在这个 stub 上。tick 每多久发一次、由什么计时器驱动，在树里无实现。只核实了系统提示里的 tick 语义与 SleepTool 的用法。同样只有名字、没有真身的是 cron 的三个 permanent 任务：catch-up、morning-checkin、dream 只在 src/utils/cronTasks.ts 第 50 行起的注释里出现，写它们的 src/assistant/install.ts 不存在，三者的 cron 表达式、prompt 内容、首次安装时机均无法核实。能核实的是：非 permanent 的 recurring 任务默认 7 天过期（recurringMaxAgeMs），调度器每 1 秒检查一次，daemon 的 cron worker 只跑 permanent 任务。</p>
        <h2 id="design">六、核心设计</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>锁文件即时钟。</strong>上次整合时间不用单独存，锁文件的 mtime 就是。读 mtime 就知道上次什么时候整合的，写锁就是更新时间。</li>
          <li><strong>做梦是 forked 子代理加只读 Bash。</strong>整合跑在独立的子代理里，Bash 只能读不能写，跑完在主 transcript 里插一条系统消息。隔离靠进程，权限靠工具白名单。</li>
          <li><strong>触发是三重门，按便宜程度排序。</strong>时间门一次 stat，会话门再扫 transcript，最后才是锁。便宜的检查先跑，贵的最后跑。</li>
          <li><strong>记忆目录按 git root 分。</strong>worktree 共享同一份记忆，每日日志按日期分文件，入口 MEMORY.md 不超过 200 行。白天追加，晚上提炼。</li>
          <li><strong>规则与实现要分开读。</strong>主动模式的 tick 语义写在系统提示里，但 tick 的发出节奏在树里是个 stub。规则写得再完整，实现不在就是不在。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'm04',
    code: 'M04',
    track: 'internals',
    title: '云端深度规划——把难题甩给云端',
    words: 1257,
    outline: [
      { id: 'intro', label: '一、引子：先说门是锁着的' },
      { id: 'lifecycle', label: '二、生命周期：从 /ultraplan 到批准' },
      { id: 'polling', label: '三、轮询状态机与五种失败' },
      { id: 'keyword', label: '四、关键词检测：什么算提到它' },
      { id: 'context', label: '五、传上下文：GitHub 模式与 Bundle 三级回退' },
      { id: 'design', label: '六、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：先说门是锁着的</h2>
        <p>把难题甩给云端 Opus 跑深度探索和规划，最长 30 分钟。实现在 src/commands/ultraplan.tsx（命令入口）和 src/utils/ultraplan/（轮询、关键词、Git Bundle 传上下文）里。但先说门：isEnabled 恒为 false，外部版永远不可用。这章讲的是内部工具的设计，读的时候记住，你手里的版本跑不起来它。</p>
        <pre><code>{`// src/commands/ultraplan.tsx:466 —— 门从里面锁上了
  isEnabled: () => "external" === 'ant',`}</code></pre>
        <h2 id="lifecycle">二、生命周期：从 /ultraplan 到批准</h2>
        <p>触发有三条路：/ultraplan &lt;prompt&gt; 命令，消息里出现 ultraplan 关键词，plan-approval 对话框里的 Ultraplan 按钮。进去之后是这样一条链：launchUltraplan 先做“已有会话在跑？”去重（已经在轮询或正在启动时，直接返回已激活的消息）→ checkRemoteAgentEligibility() 查远程资格 → teleportToRemote 建远程 CCR 会话（permissionMode 是 plan，ultraplan 为真，模型取 GrowthBook 的 tengu_ultraplan_model）→ 注册 RemoteAgentTask → startDetachedPoll 以 3 秒间隔轮询 pollRemoteSessionEvents，等远程的 ExitPlanMode 工具结果 → 用户在浏览器里批准 → 执行目标分两支。</p>
        <p>两支的区别值得记下来。选“在 CCR 执行”，本地任务完成，不归档（注释写明归档没有运行中检查，会在执行中途杀掉会话），也不弹选择对话框（已经选过了）。选“传回终端”，挂 ultraplanPendingChoice，由 UltraplanChoiceDialog 接手。但这个组件文件在树里缺失，传回本地后 plan 是直接当作用户消息发进会话，还是走 ExitPlanMode 的本地执行，无法核实。失败或超时则 archiveRemoteSession 归档远程会话，归档后的会话拒绝新事件，远程在下一次写操作时停下；409（已经归档）算成功；归档是 fire-and-forget，失败会留一个可见会话，等收割器回收。</p>
        <h2 id="polling">三、轮询状态机与五种失败</h2>
        <p>轮询状态机只有三态。running 是正在跑，回合结束且没等到 ExitPlanMode 时变成 needs_input，浏览器里回复后变回 running；running 时 ExitPlanMode 已发但还没结果，变成 plan_ready，拒绝后变回 running；批准后解析结束。批准的 plan 文本从 tool_result 里按标记截取：## Approved Plan: 或 ## Approved Plan (edited by user):，编辑过的 plan 用另一个标记。传回分支靠拒绝结果里的哨兵 __ULTRAPLAN_TELEPORT_LOCAL__，plan 在哨兵下一行。</p>
        <pre><code>{`// src/utils/ultraplan/ccrSession.ts:300-307 —— 超时分两种错误
  throw new UltraplanPollError(
    scanner.everSeenPending
      ? \`no approval after \${timeoutMs / 1000}s\`
      : \`ExitPlanMode never reached after \${timeoutMs / 1000}s (the remote container failed to start, or session ID mismatch?)\`,
    scanner.everSeenPending ? 'timeout_pending' : 'timeout_no_plan',
    scanner.rejectCount,
  )`}</code></pre>
        <p>超时是 30 分钟（ULTRAPLAN_TIMEOUT_MS = 30 * 60 * 1000），分两种错误：见过待批 plan 叫 timeout_pending，从没到过 ExitPlanMode 叫 timeout_no_plan。两种错误的区别是“等过 plan”和“从没到过 plan”，是两种不同的失败。另有 terminated（远程先挂了）、network_or_unknown（连续 5 次瞬时网络失败才判死）、extract_marker_missing（plan 标记没找到）。轮询参数是 POLL_INTERVAL_MS 3000 毫秒，MAX_CONSECUTIVE_FAILURES 5 次。注释算了一笔账：30 分钟轮询约 600 次调用，任何非零的 5xx 率，一次抖动就会杀掉整次运行，所以不重试、只容忍连续失败。还有一行 TODO 注释：OAuth token 可能在 30 分钟轮询里过期，考虑刷新。</p>
        <h2 id="keyword">四、关键词检测：什么算提到它</h2>
        <p>关键词检测在 src/utils/ultraplan/keyword.ts，逻辑很讲究。大小写不敏感，词边界 \bultraplan\b。以下情况不触发：第一，在成对定界符内，反引号、双引号、尖括号（仅当后跟字母或 /，即像标签时）、花括号、方括号（最内层，[Pasted text #N] 占位符）；单引号只在不是缩写撇号时算定界符，&quot;let&apos;s ultraplan it&apos;s&quot; 仍触发。第二，前后紧贴 /、\、-，比如 src/ultraplan/foo.ts、ultraplan.tsx、--ultraplan-mode，或者后跟 . 加字母（文件扩展名）。第三，后跟 ?（提问不触发，.、,、! 照常触发）。第四，整段以 / 开头（斜杠命令，比如 /rename ultraplan foo）。触发后转发给远程时，第一个可触发的 ultraplan 会被换成 plan，保语法通顺。</p>
        <p>这套规则的用意很清楚：只在用户真的想说“用 Ultraplan”时才触发，代码路径、文件名、命令行参数、提问、斜杠命令里出现的 ultraplan 都不算。检测的不是字符串，是意图。</p>
        <h2 id="context">五、传上下文：GitHub 模式与 Bundle 三级回退</h2>
        <p>传上下文默认走 GitHub 模式，后端按 origin URL clone。CCR_FORCE_BUNDLE=1 或显式 useBundle 时走 Git Bundle：git stash create → refs/seed/stash（让未提交改动可达）→ git bundle create --all，上传 Files API，seed_bundle_file_id 传给会话，后端下载后从 bundle clone。--all 太大（超过上限）时退到 HEAD-only，再退到 squash 成单个无父提交（refs/seed/root）。注释里写明的覆盖率：GitHub 模式 43% 的 CLI 会话有 origin 远端，Bundle 模式 54%（只要有 .git/）。也就是说，默认模式只覆盖不到一半的会话，Bundle 模式多覆盖一成，代价是多传一个 bundle。</p>
        <h2 id="design">六、核心设计</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>轮询而非推送。</strong>3 秒一轮询，30 分钟约 600 次调用，5 次连续失败才判死。轮询不重试，因为一次抖动就会杀掉整次运行。</li>
          <li><strong>状态机只有三态。</strong>running、needs_input、plan_ready。批准的 plan 文本从 tool_result 里按标记截取，传回分支靠哨兵字符串。</li>
          <li><strong>超时分两种错误。</strong>timeout_pending 是见过待批 plan，timeout_no_plan 是从没到过 ExitPlanMode。“等过”和“从没到过”是两种不同的失败。</li>
          <li><strong>传上下文按覆盖率选模式。</strong>GitHub 模式 43%，Bundle 模式 54%。默认模式覆盖不到一半，Bundle 多覆盖一成，代价是多传一个 bundle。</li>
          <li><strong>关键词检测的是意图，不是字符串。</strong>代码路径、文件名、命令行参数、提问、斜杠命令里出现的 ultraplan 都不触发。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'm05',
    code: 'M05',
    track: 'internals',
    title: '多智能体编排——主 Claude 只负责派活',
    words: 1389,
    outline: [
      { id: 'intro', label: '一、引子：指挥官模式' },
      { id: 'enable', label: '二、开启：双条件' },
      { id: 'phases', label: '三、四阶段：谁干什么' },
      { id: 'task-list', label: '四、任务列表：文件即队列' },
      { id: 'backflow', label: '五、结果回流：XML 格式' },
      { id: 'rules', label: '六、系统提示的硬规则' },
      { id: 'tools', label: '七、三个工具的入参' },
      { id: 'design', label: '八、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：指挥官模式</h2>
        <p>主 Claude 只负责派活：调查、实施、验证都交给 Worker 子代理，Coordinator 自己读结果、写规格、盯进度。代码在 src/coordinator/，只有 2 个文件。先讲清楚它不是什么：它不是“多开几个 Agent”，是指挥官模式。主 Claude 不直接操作代码，只负责派活。调查、实施、验证都交给 Worker 子代理，Coordinator 自己读结果、写规格、盯进度。工具只有 Agent、SendMessage、TaskStop 三个，外加一个 SyntheticOutput。</p>
        <h2 id="enable">二、开启：双条件</h2>
        <p>开启要过双条件，src/coordinator/coordinatorMode.ts 第 36 行起：</p>
        <pre><code>{`// src/coordinator/coordinatorMode.ts:36-41 —— 双条件开启
export function isCoordinatorMode(): boolean {
  if (feature('COORDINATOR_MODE')) {
    return isEnvTruthy(process.env.CLAUDE_CODE_COORDINATOR_MODE)
  }
  return false
}`}</code></pre>
        <p>编译时 COORDINATOR_MODE 开关开着，并且环境变量 CLAUDE_CODE_COORDINATOR_MODE 为真，两个都满足才开。恢复旧会话时模式不匹配会自动翻转该环境变量（matchSessionMode）。也就是说，模式是会话级的，不是全局的，旧会话恢复时如果模式对不上，会自动改过来。</p>
        <h2 id="phases">三、四阶段：谁干什么</h2>
        <p>四阶段就是系统提示 §4 的表，输入输出不是代码里的独立函数，就是这张表加 §5 的“先综合、再派活”流程：</p>
        <table>
          <thead>
            <tr><th>阶段</th><th>谁</th><th>干什么</th></tr>
          </thead>
          <tbody>
            <tr><td>Research</td><td>Worker（并行）</td><td>调查代码库，找文件，理解问题</td></tr>
            <tr><td>Synthesis</td><td>Coordinator 自己</td><td>读发现，理解问题，写实施规格</td></tr>
            <tr><td>Implementation</td><td>Worker</td><td>按规格做精准改动，提交</td></tr>
            <tr><td>Verification</td><td>Worker</td><td>测试改动生效</td></tr>
          </tbody>
        </table>
        <p>注意第二阶段的“你”加粗了。Synthesis 是 Coordinator 自己干的，不派给 Worker。这是整个模式里最关键的一句：理解不能外包。下一节的硬规则里还会再出现一次。</p>
        <h2 id="task-list">四、任务列表：文件即队列</h2>
        <p>任务列表文件在 ~/.claude/tasks/&lt;taskListId&gt;/&lt;taskId&gt;.json，每个任务一个 JSON 文件。zod schema 的字段是：id、subject、description、activeForm（可选，现在进行时形式，给 spinner 用，比如 &quot;Running tests&quot;）、owner（可选，agent ID）、status（pending、in_progress、completed 三态）、blocks（这个任务挡住哪些任务）、blockedBy（哪些任务挡住它）、metadata（可选，任意元数据）。另有 .highwatermark（最大任务 ID）与 .lock（多 Claude 并发抢任务时 30 次重试退避）。读写走 listTasks、claimTask、updateTask，useTaskListWatcher 每 1 秒防抖后检查有无可接任务。</p>
        <p>任务列表是文件，不是内存队列。这意味着多 Claude 能抢同一个任务列表，锁文件就是为这个准备的。scratchpad 目录是另一处，getScratchpadDir() 返回项目临时目录下按会话隔离的 scratchpad，提示里写明 Worker 可以在这里读写而不触发权限提示。</p>
        <h2 id="backflow">五、结果回流：XML 格式</h2>
        <p>Worker 结果回流的格式是 &lt;task-notification&gt; XML，以 user-role 消息投递：</p>
        <pre><code>{`<task-notification>
<task-id>{agentId}</task-id>
<status>completed|failed|killed</status>
<summary>{human-readable status summary}</summary>
<result>{agent's final text response}</result>
<usage>
  <total_tokens>N</total_tokens>
  <tool_uses>N</tool_uses>
  <duration_ms>N</duration_ms>
</usage>
</task-notification>`}</code></pre>
        <p>&lt;result&gt; 与 &lt;usage&gt; 可选；&lt;summary&gt; 是 &quot;completed&quot;、&quot;failed: {'{error}' }&quot; 或 &quot;was stopped&quot;；&lt;task-id&gt; 就是 agent ID，用它做 SendMessage 的 to。结果回流是 XML，不是自然语言。这意味着 Coordinator 可以解析它，而不是读一段自由文本再猜。结构化回流是这个模式能跑起来的前提。</p>
        <h2 id="rules">六、系统提示的硬规则</h2>
        <p>系统提示里的硬规则，除了“禁止甩锅式委派”外，全部来自 getCoordinatorSystemPrompt() 原文。先讲最狠的一条，§5 的原话：</p>
        <blockquote>
          <p>Never write &quot;based on your findings&quot; or &quot;based on the research.&quot; These phrases delegate understanding to the worker instead of doing it yourself. You never hand off understanding to another worker.</p>
        </blockquote>
        <p>意思是，永远别写“根据你的发现”或“根据研究”。这些话是把理解甩给 Worker，而不是自己做。你永远不能把理解交给另一个 Worker。派活的时候，prompt 必须自包含，Worker 看不到你的对话，写 &quot;based on your findings&quot; 等于让 Worker 去猜你看到了什么。</p>
        <p>其余硬规则：每次派活后绝不编造或预测 Agent 的结果；不许用一个 Worker 去检查另一个 Worker；不给 Worker 设 model 参数；验证必须是“证明代码能跑，而不是确认代码存在”，跑测试要带功能开启、类型错误要追查、不许以“无关”为由 dismiss，测试要独立跑、证明改动生效、不要橡皮图章；读写并发规则是只读任务随便并行，写重的同一批文件一次只一个，验证可与实现在不同文件区并行；失败先用 SendMessage 继续同一 Worker（它有完整错误上下文），再不行换方法或上报。</p>
        <h2 id="tools">七、三个工具的入参</h2>
        <p>Coordinator 实际能用的只有 Agent、SendMessage、TaskStop，外加 SyntheticOutput。白名单在 src/constants/tools.ts 第 107 行起的 COORDINATOR_MODE_ALLOWED_TOOLS，过滤函数是 applyCoordinatorToolFilter。另外系统提示 §2 还允许直接调 subscribe_pr_activity 和 unsubscribe_pr_activity 这两个 MCP 工具，不经过 Worker；并明确写了合并冲突的状态变化不会主动推送，GitHub 不发 mergeable_state 变化的 webhook，所以要轮询 gh pr view N --json mergeable。</p>
        <p><strong>Agent。</strong>入参是 description（3 到 5 个词）、prompt（派给 Worker 的任务）、subagent_type（Coordinator 固定用 worker）、model（sonnet、opus、haiku 三选一，但提示明令不设）、run_in_background、name（可寻址，供 SendMessage 用名字找人）、team_name、mode、isolation（外部版只有 worktree，内部版加 remote）、cwd。Worker 的类型常量就是一行：export const WORKER_AGENT = &apos;worker&apos;。Worker 的工具集是非 --bare 时取 ASYNC_AGENT_ALLOWED_TOOLS 再去掉内部工具（TEAM_CREATE、TEAM_DELETE、SEND_MESSAGE、SYNTHETIC_OUTPUT）；--bare 时只有 Bash、Read、Edit；MCP 工具也会透传给 Worker。</p>
        <p><strong>SendMessage。</strong>入参是 to 和 message。to 是队友名、&quot;*&quot; 广播、uds:&lt;socket&gt; 本地对等、bridge:&lt;session-id&gt; 远程对等。message 是字符串或结构化，字符串时需要 5 到 10 词摘要做 UI 预览。</p>
        <p><strong>TaskStop。</strong>入参是 task_id，另有已废弃的 shell_id 做兼容。</p>
        <h2 id="design">八、核心设计</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>指挥官不直接操作代码。</strong>只有 3 到 4 个工具，调查、实施、验证都交给 Worker。Coordinator 的活儿是读结果、写规格、盯进度。</li>
          <li><strong>任务列表是文件。</strong>每个任务一个 JSON 文件，多 Claude 能抢同一个列表，锁文件做 30 次重试退避。队列不在内存里，在磁盘上。</li>
          <li><strong>结果回流是 XML。</strong>结构化，可解析。Coordinator 不用读一段自由文本再猜，task-id 就是 agent ID，直接拿去发消息。</li>
          <li><strong>验证的标准写进提示词。</strong>证明代码能跑，而不是确认代码存在。跑测试要带功能开启，类型错误要追查，不要橡皮图章。</li>
          <li><strong>理解不能外包。</strong>&quot;based on your findings&quot; 是禁语。Synthesis 是 Coordinator 自己干的，派活的 prompt 必须自包含。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'm06',
    code: 'M06',
    track: 'internals',
    title: '远程控制桥接——从网页操控本地终端',
    words: 1332,
    outline: [
      { id: 'intro', label: '一、引子：本地与远程焊在一起' },
      { id: 'gates', label: '二、三重检查' },
      { id: 'channels', label: '三、通道分两代：v1 WS 与 v2 SSE' },
      { id: 'standalone', label: '四、独立模式：注册、轮询、派活' },
      { id: 'spawn', label: '五、三种分发模式' },
      { id: 'permission', label: '六、权限审批：control_request 的往返' },
      { id: 'web-ops', label: '七、网页能操作什么' },
      { id: 'design', label: '八、核心设计' },
    ],
    body: (
      <React.Fragment>
        <h2 id="intro">一、引子：本地与远程焊在一起</h2>
        <p>从网页操控本地终端。Bridge 让 claude.ai 网页版变成你本地终端的遥控器：网页上发消息，本地终端执行；本地要权限，网页上弹审批框。实现在 src/bridge/，33 个文件，复核通过。先讲清楚它把什么焊在一起：本地的 CLI 进程，和远程的 claude.ai 会话。信任链变长了，本地文件系统、远程网页、OAuth token、GrowthBook 开关，四样东西都得对上，桥才搭得起来。</p>
        <h2 id="gates">二、三重检查</h2>
        <p>启用要过三重检查，src/bridge/bridgeEnabled.ts 第 28 行起：</p>
        <pre><code>{`// src/bridge/bridgeEnabled.ts:28-35 —— 三重检查
export function isBridgeEnabled(): boolean {
  // Positive ternary pattern — see docs/feature-gating.md.
  // Negative pattern (if (!feature(...)) return) does not eliminate
  // inline string literals from external builds.
  return feature('BRIDGE_MODE')
    ? isClaudeAISubscriber() &&
        getFeatureValue_CACHED_MAY_BE_STALE('tengu_ccr_bridge', false)
    : false
}`}</code></pre>
        <p>第一重是 feature(&apos;BRIDGE_MODE&apos;) 编译开着。第二重是 isClaudeAISubscriber()，claude.ai 订阅，排除 Bedrock、Vertex、Foundry、API key、网关部署；需要带 user:profile scope 的 OAuth token，否则连 org UUID 都拿不到，GrowthBook 门直接判 false。第三重是 GrowthBook 的 tengu_ccr_bridge 开着。另有版本下限 tengu_bridge_min_version 与 v2 路径开关 tengu_bridge_repl_v2。注释里还讲了一个门控的写法细节：用正三元表达式，不用 if (!feature(...)) return 的否定写法，因为否定写法没法把内联字符串字面量从外部构建里消除掉。门控的写法本身也是门控的一部分。</p>
        <h2 id="channels">三、通道分两代：v1 WS 与 v2 SSE</h2>
        <p>通道不是单一 WebSocket，分两代。v1 是 Session-Ingress WebSocket，URL 由 buildSdkUrl 生成：生产是 wss://&lt;host&gt;/v1/session_ingress/ws/&lt;sessionId&gt;，本地直连 session-ingress 时是 ws:// 加 /v2/。v2（CCR code sessions）是 HTTP 加 SSE：POST /v1/code/sessions/&lt;id&gt;/worker/register 拿 worker epoch，读流是 {'{base}'}/worker/events/stream（SSE，支持 from_sequence_num 和 Last-Event-ID 断点续传），写、heartbeat、状态上报走 CCRClient，heartbeat 默认 20 秒。服务端按会话决定走 v1 还是 v2（work secret 里的 use_code_sessions 字段），CLI 侧环境变量 CLAUDE_BRIDGE_USE_CCR_V2 可强制 v2。v2 的端点会校验 JWT 的 session_id 声明和 worker 角色，OAuth token 两样都没有。</p>
        <h2 id="standalone">四、独立模式：注册、轮询、派活</h2>
        <p>独立模式是 claude remote-control，bridgeMain.ts 有 3,000 行。CLI 先 POST /v1/environments/bridge 注册环境（带 client 生成的 bridgeId 加 environmentId，幂等）→ 循环 POST /v1/environments/&lt;id&gt;/work/poll 等活 → 收到 type: &apos;session&apos; 的 work 后 ack → 按 spawnMode 决定工作目录 → 起子进程跑本机 CLI（--sdk-url 指向 ingress，子进程自带 v1 WS 或 v2 SSE 加 CCRClient）→ 会话结束按模式决定是否继续轮询。优雅退出时 DELETE /v1/environments/bridge/&lt;id&gt; 注销，--session-id 续接走 POST /v1/environments/&lt;id&gt;/bridge/reconnect。内嵌模式（REPL 里的 /remote-control，别名 rc）则是把当前 REPL 会话镜像到 claude.ai：replBridge.ts 的 in-process 桥，本地打字和网页打字驱动同一个会话。</p>
        <p>鉴权与刷新在 jwtUtils.ts。会话 ingress token 是 JWT（可带 sk-ant-si- 前缀），createTokenRefreshScheduler 在过期前 5 分钟刷新，刷新失败 60 秒重试、最多 3 次连败后放弃；刷新成功后 30 分钟再排一次跟进刷新；刷新时调 getAccessToken() 拿 OAuth token，递给传输层：独立模式是写进子进程 stdin，REPL 桥是 WebSocket 重连。另有代际计数器防过期刷新互相覆盖。</p>
        <h2 id="spawn">五、三种分发模式</h2>
        <p>三种分发模式的原文注释在 src/bridge/types.ts 第 50 行起：</p>
        <blockquote>
          <p>How `claude remote-control` chooses session working directories. - `single-session`: one session in cwd, bridge tears down when it ends - `worktree`: persistent server, every session gets an isolated git worktree - `same-dir`: persistent server, every session shares cwd (can stomp each other)</p>
        </blockquote>
        <p>single-session 是 cwd 里只跑一个会话，结束桥就拆。worktree 是持久服务器，每个会话一个隔离 git worktree（createAgentWorktree(&quot;bridge-&lt;sessionId&gt;&quot;)），但“预创建的初始会话”仍跑在 config.dir（即用户敲 rc 的目录，保持旧单会话体验）。same-dir 是持久服务器，所有会话共享 cwd，注释原话是 can stomp each other（会互相踩）。会话默认超时 24 小时（DEFAULT_SESSION_TIMEOUT_MS）。三种模式是信任与隔离的取舍：worktree 隔离，same-dir 互相踩，single-session 用完就拆。</p>
        <h2 id="permission">六、权限审批：control_request 的往返</h2>
        <p>子进程 CLI 需要授权某次具体工具调用时，在 stdout 的 JSON 流里吐 control_request（subtype 是 can_use_tool，含 tool_name、input、tool_use_id）→ 桥（sessionRunner.ts 第 422 行识别后调 onPermissionRequest）→ 桥把请求发给服务端，claude.ai 弹审批框 → 用户点允许或拒绝 → 服务端回 control_response，{'{behavior: &apos;allow&apos; | &apos;deny&apos;}'}（bridgePermissionCallbacks.ts 第 3 行起的类型定义，isBridgePermissionResponse 只校验 behavior 字段）→ 桥经 sendPermissionResponseEvent 写回会话；can_use_tool 发出时还会把会话状态推成 requires_action。另有 control_cancel_request 可让网页撤回待批请求。</p>
        <p>注意这里的审批不是本地弹框，是远程审批。本地 CLI 要跑一条命令，先把请求发到 claude.ai，网页上点允许，允许的结果再发回来，本地才继续跑。往返一次，本地等一次。这跟 M08 的本地审批流水线是同一个问题的两种答案：本地弹对话框，远程弹网页框。</p>
        <h2 id="web-ops">七、网页能操作什么</h2>
        <p>claude.ai 侧能操作的东西，在 bridgeMessaging.ts 的 handleServerControlRequest 里，服务端发来的 control_request 子类型有：initialize（必须回成功，否则服务端约 10 到 14 秒后杀连接；回包里 commands、models、account 都是空的，写明“the REPL handles commands, models, and account info itself”）、set_model（换模型）、set_max_thinking_tokens（改思考 token 上限）、set_permission_mode（改权限模式；daemon 场景没注册回调时回 error 而不是假成功）、interrupt（中断当前回合）。除控制请求外，网页还能发普通 user 消息（prompt 文本，含图片块；inboundMessages.ts 会把 iOS 和 web 客户端 camelCase 的 mediaType 归一化成 media_type，否则坏块会毒化整个会话）。outbound-only（单向镜像）模式下，除 initialize 外所有可变请求都回 error，提示 “This session is outbound-only. Enable Remote Control locally to allow inbound control.”</p>
        <h2 id="design">八、核心设计</h2>
        <p>这一章的机制可以收成五条核心设计：</p>
        <ul>
          <li><strong>通道分两代。</strong>v1 是 WebSocket，v2 是 HTTP 加 SSE，服务端按会话决定走哪代。断点续传靠 from_sequence_num 和 Last-Event-ID。</li>
          <li><strong>鉴权是 JWT 加提前 5 分钟刷新。</strong>刷新失败 60 秒重试，最多 3 次连败后放弃，代际计数器防过期刷新互相覆盖。刷新成功后 30 分钟再排一次跟进刷新。</li>
          <li><strong>分发模式是信任与隔离的取舍。</strong>worktree 隔离，same-dir 互相踩，single-session 用完就拆。预创建的初始会话仍跑在用户敲 rc 的目录里，保持旧体验。</li>
          <li><strong>权限审批是 control_request 的往返。</strong>本地 CLI 发请求，网页弹框，用户点允许，control_response 写回会话。不是本地弹框，是远程审批。</li>
          <li><strong>网页能做的事是白名单。</strong>initialize、set_model、set_max_thinking_tokens、set_permission_mode、interrupt，加发消息。单向镜像模式下，除 initialize 外全回 error。</li>
        </ul>
      </React.Fragment>
    ),
  },
];

export const APPENDIX_CHAPTER = {
  id: 'appendix',
  code: '附录',
  track: 'appendix',
  title: '附录——数字核对、速查表与未核实清单',
  words: 2270,
  outline: [
    { id: 'appendix-counts', label: '数字核对表' },
    { id: 'appendix-commands', label: '隐藏命令速查' },
    { id: 'appendix-env', label: '环境变量与 CLI 参数速查' },
    { id: 'appendix-gates', label: '三层门控速查' },
    { id: 'appendix-source-map', label: '知识点—源码对照' },
    { id: 'appendix-unverified', label: '未核实清单' },
  ],
  body: (
    <React.Fragment>
      <h2 id="appendix-counts">数字核对表</h2>
      <p>下面这张表是我在克隆下来的仓库里数出来的。README 的数字是注册数或约数，我的数字是文件数或顶层条目数，口径不一样，所以对不上不是谁错了。核对时间是 2026-11-18，仓库是单提交 b78dd22。</p>
      <ul>
        <li><strong>TypeScript 源文件。</strong>README 写 1,987 个，我数出来也是 1,987 个（find src -name *.ts -o -name *.tsx），对得上。</li>
        <li><strong>工具。</strong>README 写 53 个。src/tools/ 下有 53 个目录，其中 shared/ 和 testing/ 不是工具，真实工具目录是 51 个。注册表 getAllBaseTools() 里无条件常驻的只有 21 个，其余靠 feature() 开关、USER_TYPE 和环境变量展开。tools.ts 里引用的 5 个工具目录在还原仓库里不存在（SuggestBackgroundPRTool、PushNotificationTool、SubscribePRTool、CtxInspectTool、ListPeersTool），是 feature() ? require() : null 做死代码消除的产物。</li>
        <li><strong>斜杠命令。</strong>README 写 87 个。src/commands/ 下有 102 个条目：87 个子目录加 15 个顶层文件（12 个 .ts 加 install.tsx、statusline.tsx、ultraplan.tsx）。注册表 COMMANDS() 里无条件列出的只有 70 个，其余靠条件展开，另有 INTERNAL_ONLY_COMMANDS（USER_TYPE 是 ant 且非 demo 才加入，含 bughunter、autofix-pr、teleport、ctx_viz 等）。</li>
        <li><strong>终端 UI 组件。</strong>README 写 148 个，src/components/ 顶层有 146 个条目。差 2 的原因未核实。</li>
        <li><strong>Hooks。</strong>README 写 87 个，src/hooks/ 顶层有 85 个条目（83 个文件加 notifs/、toolPermission/ 两个子目录）。差 2 的原因未核实。注意：这里的 hooks/ 是 React Hooks，生命周期 Hooks 的实现在 src/utils/hooks.ts，一共 27 个事件。</li>
        <li><strong>Bridge。</strong>README 写 31 个文件，我数出来 src/bridge/ 有 33 个文件。docs/06 写 33 个文件，跟我数的一致。</li>
        <li><strong>feature 开关。</strong>README 列了约 50 个核心开关，我 grep 出 89 个不同的 feature(…) 开关名，多出来的大多是基础设施开关，比如 IS_LIBC_MUSL、PERFETTO_TRACING 这类。</li>
        <li><strong>主入口行数。</strong>src/main.tsx 4,690 行，src/query.ts 1,729 行，src/QueryEngine.ts 1,295 行，都是 wc -l 数出来的。</li>
      </ul>
      <h2 id="appendix-commands">隐藏命令速查</h2>
      <p>分两拨。第一拨是编译开关控制的，外部版里看不见；第二拨是只有 Anthropic 内部用户（USER_TYPE === ant）才能看见的。两拨都出自仓库的 docs/05，命令名与开关名都对过源码里的注册表。</p>
      <ul>
        <li><strong>/buddy，开关 BUDDY。</strong>宠物系统，见 M02。注意：hatch、pet、card、mute、unmute 五个子命令只有 docs/01 的表格声称，src/commands/buddy/ 在还原树里不存在，实现无法核实。</li>
        <li><strong>/proactive，开关 PROACTIVE / KAIROS。</strong>主动自主模式。</li>
        <li><strong>/assistant，开关 KAIROS。</strong>持久助手模式，见 M03。</li>
        <li><strong>/brief，开关 KAIROS / KAIROS_BRIEF。</strong>简报模式。</li>
        <li><strong>/bridge，开关 BRIDGE_MODE。</strong>远程控制桥接，见 M06。</li>
        <li><strong>/voice，开关 VOICE_MODE。</strong>语音模式。</li>
        <li><strong>/ultraplan，开关 ULTRAPLAN。</strong>云端深度规划，见 M04。</li>
        <li><strong>/fork，开关 FORK_SUBAGENT。</strong>子代理分叉。</li>
        <li><strong>/peers，开关 UDS_INBOX。</strong>对等通信，走 Unix Domain Socket。</li>
        <li><strong>/workflows，开关 WORKFLOW_SCRIPTS。</strong>工作流脚本。</li>
        <li><strong>/teleport，内部。</strong>传送会话到远程或本地，Ultraplan 的底座。</li>
        <li><strong>/ctx_viz，内部。</strong>上下文可视化。</li>
        <li><strong>/mock-limits 与 /reset-limits，内部。</strong>模拟与重置速率限制。</li>
        <li><strong>/bughunter 与 /autofix-pr，内部。</strong>内部 Bug 猎人与自动修 PR。</li>
      </ul>
      <h2 id="appendix-env">环境变量与 CLI 参数速查</h2>
      <p>出自仓库 README 的速查表，我只挑了跟正文有关的几条。完整列表在仓库 README 末尾，展开就能看到。带行号的是本轮核实过的。</p>
      <ul>
        <li><strong>CLAUDE_CODE_COORDINATOR_MODE。</strong>开 Coordinator 模式，见 M05。光设这个不够，编译时 COORDINATOR_MODE 开关也得开着。</li>
        <li><strong>CLAUDE_CODE_PROACTIVE。</strong>主动模式。</li>
        <li><strong>CLAUDE_CODE_BRIEF。</strong>简报模式。</li>
        <li><strong>CLAUDE_CODE_DISABLE_AUTO_MEMORY。</strong>关掉自动记忆。</li>
        <li><strong>CLAUDE_CODE_MAX_OUTPUT_TOKENS。</strong>最大输出 token。</li>
        <li><strong>CLAUDE_CODE_IDLE_THRESHOLD_MINUTES。</strong>空闲阈值，默认 75 分钟。</li>
        <li><strong>ANTHROPIC_MODEL。</strong>模型覆盖，优先级第三档（src/utils/model/model.ts 第 49 行起）。</li>
        <li><strong>CLAUDE_CODE_SIMPLE=1。</strong>简单模式，只剩 Bash、FileRead、FileEdit 三个工具（src/tools.ts 的 getTools）。</li>
        <li><strong>DISABLE_COMPACT / DISABLE_AUTO_COMPACT。</strong>分别关掉手动和自动压缩（src/services/compact/autoCompact.ts）。</li>
        <li><strong>CLAUDE_STREAM_IDLE_TIMEOUT_MS。</strong>流闲置看门狗超时，默认 90,000 毫秒（src/services/api/claude.ts）。</li>
        <li><strong>CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS。</strong>SessionEnd hook 超时，默认 1,500 毫秒（src/utils/hooks.ts）。</li>
        <li><strong>--model &lt;model&gt;。</strong>当前会话的模型，可传别名（sonnet、opus）或全名（src/main.tsx 第 999 行）。</li>
        <li><strong>--max-turns &lt;turns&gt;。</strong>只在 --print 模式下生效，无默认值（src/main.tsx 第 982 行）。</li>
        <li><strong>--dangerously-skip-permissions / --allow-dangerously-skip-permissions。</strong>前者直接跳过全部权限检查，后者只启用该选项、不默认开启（src/main.tsx 第 982 行）。</li>
        <li><strong>--teleport [session]。</strong>恢复传送会话。</li>
        <li><strong>--remote [description]。</strong>创建远程会话。</li>
        <li><strong>--assistant / --proactive / --brief。</strong>对应上面三种模式的 CLI 参数。</li>
        <li><strong>--agent-teams。</strong>多代理团队。</li>
      </ul>
      <h2 id="appendix-gates">三层门控速查</h2>
      <p>Anthropic 控制一个功能露不露脸，分三层。读源码时先问它在哪一层，再问它开没开。</p>
      <ul>
        <li><strong>第一层，编译时开关 feature()。</strong>构建时决定代码包不包进来，没包进来的代码会被死代码消除整个删掉。README 列了约 50 个核心开关，我 grep 出 89 个不同开关名。工具注册表里的 feature() ? require() : null 是这一层最直接的证据。</li>
        <li><strong>第二层，运行时 USER_TYPE。</strong>环境变量 USER_TYPE 是 ant 还是 external。ant 是内部员工，解锁全部功能，GrowthBook 20 分钟刷新一次；external 是外部用户，裁剪版，6 小时刷新一次。源码里 200 多处专属检查，判断条件就是 process.env.USER_TYPE === ant。默认模型也分等级：ant、Max、Team Premium 默认 Opus，其余默认 Sonnet 4.6。</li>
        <li><strong>第三层，GrowthBook 远程开关。</strong>带 tengu_ 前缀的远程开关，动态控制。Kairos 是 tengu_kairos，做梦的阈值是 tengu_onyx_plover，Ultraplan 的模型是 tengu_ultraplan_model，Bridge 是 tengu_ccr_bridge，会话记忆是 tengu_session_memory。</li>
      </ul>
      <h2 id="appendix-source-map">知识点—源码对照</h2>
      <p>dg-ai-notes 每章末尾都有这张表，本书也照办。每个关键结论，都能按这张表找到出处：</p>
      <ul>
        <li><strong>启动链。</strong>src/dev-entry.ts（MACRO 宏、缺失导入门禁）；src/main.tsx:585（main()）、:1039（Kairos 检查）、:1933（setup()）、:3140（launchRepl）。</li>
        <li><strong>一次问答的循环。</strong>src/query.ts:219（query()）、:241（queryLoop()）、:552（tool_use 是唯一信号）、:1382（runTools 入口）、:1714（拼回下一轮）；src/QueryEngine.ts:1186（ask()）、:177（类注释）。</li>
        <li><strong>流式与上下文。</strong>src/query/deps.ts:23（callModel 默认实现）；src/services/api/claude.ts:1818（原始流式请求，O(n²) 注释）、:709（非流式回退）；src/QueryEngine.ts:284（system prompt 拼装）；src/utils/api.ts:437（appendSystemContext）、:449（prependUserContext）。</li>
        <li><strong>会话与压缩。</strong>src/utils/sessionStorage.ts:199（保存路径）、:1408（recordTranscript）；src/services/compact/autoCompact.ts:33（阈值公式）；src/services/compact/compact.ts:330（压缩后消息顺序）；src/commands/compact/index.ts（手动 /compact）。</li>
        <li><strong>模型选择。</strong>src/constants/prompts.ts:118（模型 ID 常量）；src/utils/model/model.ts:49（优先级）、:178（默认模型分等级）。</li>
        <li><strong>工具注册与接口。</strong>src/tools.ts:184（getAllBaseTools）、:259（filterToolsByDenyRules）；src/Tool.ts:362（Tool 接口）、:748（buildTool）。</li>
        <li><strong>四个工具。</strong>src/tools/BashTool/BashTool.tsx（超时、后台、只读判定）；src/tools/FileReadTool/limits.ts、src/tools/FileWriteTool/FileWriteTool.ts:196（先读后写）；src/tools/AgentTool/runAgent.ts:248；src/services/mcp/client.ts:1744（fetchToolsForClient）。</li>
        <li><strong>Hooks 与权限。</strong>src/utils/hooks.ts:166（超时常量）、:1006（stdin 写入）；src/schemas/hooks.ts:211（HooksSchema）；src/types/permissions.ts:15（五种模式）；src/services/tools/toolExecution.ts:599（审批流水线）；src/utils/settings/types.ts:41（PermissionsSchema）。</li>
        <li><strong>三层门控。</strong>src/tools.ts:15（条件 require）、:199（ant 专属工具）；src/commands/ultraplan.tsx（恒为 false 的 isEnabled）；src/utils/permissions/bypassPermissionsKillswitch.ts。</li>
      </ul>
      <h2 id="appendix-unverified">未核实清单</h2>
      <p>下面这些是核对时没读完、或读了但不敢下结论的，写在这里，免得你以为书写完了就是全核实了：</p>
      <ul>
        <li><strong>压缩摘要用哪个模型跑。</strong>在 src/services/compact/compact.ts 里 grep haiku、queryWithModel、queryHaiku 无命中，摘要模型未确认。</li>
        <li><strong>各模型 max_input_tokens 的具体取值表。</strong>在 src/utils/model/modelCapabilities.ts，未逐项读出。</li>
        <li><strong>交互模式下是否存在其他硬性轮数上限。</strong>--max-turns 仅 print 模式、无默认值已核实；但 TOKEN_BUDGET 特性（src/query.ts 约 1300–1350 行的 checkTokenBudget）的预算续跑与提前停止逻辑未深读，不能断言“交互模式完全无限轮”。</li>
        <li><strong>--resume 按 session ID 恢复的完整分支。</strong>只读到“先试文件路径，ENOENT 再按 ID 处理”（src/main.tsx:3634），ID 分支的后续代码未读完。</li>
        <li><strong>system prompt 的具体内容来源。</strong>fetchSystemPromptParts 内部拼接细节（src/constants/prompts.ts 中各段落的取舍）未读。</li>
        <li><strong>components/ 差 2 与 hooks/ 差 2 的原因。</strong>README 写 148/87，实测顶层条目 146/85，差 2 的原因未核实（未递归数子目录文件）。</li>
        <li><strong>README“53 个工具”的计数方法。</strong>与目录数 53 一致是强证据，但未找到 README 生成脚本或计数注释；testing/ 下的 TestingPermissionTool 是否计入官方口径未核实（它只在 NODE_ENV === &apos;test&apos; 时注册）。</li>
        <li><strong>Bash 沙箱触发条件。</strong>shouldUseSandbox.ts 存在，但触发规则未细读。</li>
        <li><strong>canUseTool 的完整判定顺序。</strong>只确认了流水线骨架，未逐行读完 useCanUseTool.tsx 的全部判定分支与对话框交互细节。</li>
        <li><strong>Hook 的 prompt / agent / http 三种类型。</strong>只核实了 schema 层面的联合类型与 command 类型的执行路径，其余三种类型的运行时行为未核实。</li>
        <li><strong>/compact 的摘要模型与 token 预算。</strong>只确认了它调 compactConversation() 且先跑 microcompact，未核实摘要用哪个模型、摘要长度上限。</li>
        <li><strong>子代理结果回流的最终形态。</strong>确认了 runAgent 是异步生成器、父级逐条消费、转后台后重跑，但未核实最终返回给父级模型的那条结果文本具体由哪段代码拼装。</li>
        <li><strong>/buddy 子命令实现。</strong>src/commands.ts 第 118 行引用 ./commands/buddy/index.js，但 src/commands/buddy/ 目录不存在。hatch、pet、card、mute、unmute 五个子命令与孵化时的模型调用（名字、性格如何生成）只有 docs/01 的表格声称，源码无文件可对。</li>
        <li><strong>气泡台词是谁生成的。</strong>REPL.tsx 每回合结束后调 fireCompanionObserver，但该函数在全树无定义、无 import；AppStateStore 注释指向的 src/buddy/observer.ts 也不存在。台词是模型现场生成、模板拼接还是规则触发，均无法核实。</li>
        <li><strong>Kairos 的 GrowthBook 门与团队初始化。</strong>main.tsx 引用的 src/assistant/gate.ts（isKairosEnabled）与 initializeAssistantTeam()、getAssistantSystemPromptAddendum()、isAssistantForced()、markAssistantForced() 在 14 行的 src/assistant/index.ts 里均不存在。五层检查中的第四层（远程开关名是否为 tengu_kairos）只能从注释推断，无法对文件核实。</li>
        <li><strong>settings.json 的 assistant: true 开关。</strong>此前说法称 Kairos 检查之一是 settings.json 的 assistant 标志；在树里 isAssistantMode() 只读 CLAUDE_CODE_ASSISTANT_MODE 环境变量，未找到任何 settings 字段。应视为未核实（可能是旧版行为或另一处未被还原）。</li>
        <li><strong>三个 permanent cron 任务的真身。</strong>cronTasks.ts 注释只给出名字 catch-up、morning-checkin、dream，并指明由 src/assistant/install.ts 写入；该文件不存在（src/assistant/ 仅 3 个文件），三者的 cron 表达式、prompt 内容、首次安装时机均无法核实。</li>
        <li><strong>主动模式 tick 的发出节奏。</strong>useProactive.ts 只是返回 {'{active: false, paused: false}'} 的 stub；REPL.tsx 的 onSubmitTick、onQueueTick 接在这个 stub 上。tick 每多久发一次、由什么计时器驱动，在树里无实现。只核实了系统提示里的 tick 语义与 SleepTool 的用法。</li>
        <li><strong>UltraplanChoiceDialog 组件。</strong>REPL.tsx 挂载了它（plan、sessionId、taskId 三个 props），但全树找不到该组件文件。“传回本地后如何执行 plan（是直接当作用户消息发进会话，还是走 ExitPlanMode 的本地执行）”无法核实。</li>
        <li><strong>Bridge 细节未深挖。</strong>trustedDevice.ts、workSecret.ts（除 URL 生成与 registerWorker 外）、replBridge.ts（2,406 行，仅抽查了关键段）、remoteBridgeCore.ts（1,008 行，仅抽查了控制请求收发）未逐行读完；v1 WebSocket 断线重连的退避参数、--session-id 续接的完整流程未核实。</li>
        <li><strong>Buddy 物种名编码的“撞名”说法。</strong>types.ts 的注释称“One species name collides with a model-codename canary in excluded-strings.txt”，但树里未找到 excluded-strings.txt，具体是哪个物种名撞了哪串代号无法核实。</li>
        <li><strong>autoDream 的 isForced()。</strong>autoDream.ts 中 isForced() 硬编码返回 false，注释称是 ant-only 测试覆盖——外部构建里强制触发路径不存在，属实（代码即证据），但“ant 构建里它返回什么”无法核实。</li>
      </ul>
    </React.Fragment>
  ),
};

/* 阅读顺序（与 CHAPTERS 数组的书写顺序无关）：开篇 → 实战上手 → 源码精读 → 附录 */
const READING_ORDER = [
  'm01',
  'p01',
  'p02',
  'p03',
  'p04',
  'm02',
  'm03',
  'm04',
  'm05',
  'm06',
  'm07',
  'm08',
  'appendix',
];

export const ALL_CHAPTERS = READING_ORDER.map((id) =>
  [...CHAPTERS, APPENDIX_CHAPTER].find((c) => c.id === id),
).filter(Boolean);

export const chapterById = (id) => ALL_CHAPTERS.find((c) => c.id === id);

export const chapterIndex = (id) => ALL_CHAPTERS.findIndex((c) => c.id === id);

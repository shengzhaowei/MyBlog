import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

const TOC_ITEMS = [
  { id: 'intro', label: '引言' },
  { id: 'one-loop', label: '一个 Agent 还是一个循环' },
  { id: 'patterns', label: '五种组织方式' },
  { id: 'cost', label: '什么时候不该用多智能体' },
  { id: 'langgraph', label: 'LangGraph，把路由画成图' },
  { id: 'crewai', label: 'CrewAI，把团队写成角色和任务' },
  { id: 'autogen', label: 'AutoGen，把协作写成群聊' },
  { id: 'metagpt', label: 'MetaGPT，把协作写成软件公司的 SOP' },
  { id: 'agents-sdk', label: 'OpenAI Agents SDK，把移交写成工具' },
  { id: 'adk', label: 'Google ADK，把流程写成树' },
  { id: 'choose', label: '怎么选，三张对照表' },
  { id: 'closing', label: '收尾，先手撕，再选框架' },
];

const REFERENCES = [
  {
    href: 'https://www.anthropic.com/engineering/building-effective-agents',
    label: 'Building effective agents',
    note: 'Anthropic 对 Agent 与工作流的分界，以及协调员-工人等五种模式的出处',
  },
  {
    href: 'https://www.anthropic.com/engineering/built-multi-agent-research-system',
    label: 'How we built our multi-agent research system',
    note: 'Anthropic 的多智能体研究系统：领队加并行子 Agent 的做法与 token 代价',
  },
  {
    href: 'https://arxiv.org/abs/2308.00352',
    label: 'MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework',
    note: 'MetaGPT 论文：角色、SOP 与共享消息池，ICLR 2024',
  },
  {
    href: 'https://arxiv.org/abs/2210.03629',
    label: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    note: '单 Agent 循环的出处，也是所有多智能体模式的地基',
  },
  {
    href: 'https://langchain-ai.github.io/langgraph/concepts/multi_agent/',
    label: 'LangGraph: Multi-agent systems',
    note: 'LangGraph 官方对 Supervisor 与 Swarm 两种编排的说明',
  },
];

const APPENDIX = [
  {
    id: 'appendix-handmade',
    title: '手撕版核心代码（delegate_task 的全部）',
    body: (
      <React.Fragment>
        <p>下面是手撕版里让一个 Agent 变成多智能体那几十行代码，原样摘自 <code>multi_agent.py</code>。完整 224 行含假模型与测试，这里不全贴。</p>
        <pre><code>{`@dataclass
class Agent:
    name: str
    system: str
    tools: dict = field(default_factory=dict)


def run(agent: Agent, task: str, depth: int = 0) -> str:
    tools = dict(agent.tools)
    if depth == 0:
        def delegate_task(agent_name: str, task: str) -> str:
            # 子 Agent 是全新对话，只拿到 task，
            # 看不到父 Agent 的历史。
            return run(AGENTS[agent_name], task, depth + 1)
        tools["delegate_task"] = (
            delegate_task, _tool(
                "delegate_task",
                "派生一个子 Agent，只返回它的最终摘要",
                {"agent_name": "researcher / analyst / writer",
                 "task": "交给子 Agent 的任务"}))
    messages = [{"role": "system", "content": agent.system},
                {"role": "user", "content": task}]
    for step in range(1, MAX_STEPS + 1):
        content, calls = call_model(agent, messages, specs)
        if not calls:
            return content or "（无回答）"
        # 同一轮的多个 delegate_task 用线程池并行跑
        # 结果按原顺序 append 回去，tool_call_id 对得上
        ...`}</code></pre>
        <p>三处安全线是刻意写死的。只允许派生一层，<code>depth == 0</code> 才给 <code>delegate_task</code>。并行用 <code>ThreadPoolExecutor</code>。上下文隔离写在 <code>messages</code> 的初始化里，没写进提示词。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-cheatsheet',
    title: '选型速查表',
    body: (
      <React.Fragment>
        <ul>
          <li><strong>流程固定、要可审计、要断点续跑，选 LangGraph 或 Google ADK。</strong>路由与顺序写在代码里，出问题能按图查。</li>
          <li><strong>任务像一个团队，分工一眼看懂，选 CrewAI。</strong>角色、任务、Crew 三个词就能讲清，适合演示与中小项目。</li>
          <li><strong>要辩论、要评审、要让 Agent 互相挑错，选 AutoGen（0.2 风格 / AG2）。</strong>群聊是最自然的载体，记得设 max_round。</li>
          <li><strong>输出是结构化文档，一步接一步，选 MetaGPT。</strong>SOP 加共享消息池，角色按订阅取自己那份。</li>
          <li><strong>客服式路由，一个入口分给多个专员，选 OpenAI Agents SDK。</strong>handoffs 是最短的路，顺带拿到 guardrails 与 tracing。</li>
          <li><strong>只做拆任务、并行做、汇总，不用框架，手撕 150 行就够了。</strong>先跑通，再决定要不要第 3、4 层。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-terms',
    title: '术语，sub-agent 与 multi-agent',
    body: (
      <React.Fragment>
        <p><strong>sub-agent（子代理）</strong>是一个被派生出来的 Agent 实例。它有父子关系，活在任务级，做完交回就消失。它最大的用处是上下文隔离，并行只是顺带。Claude Code 的 <code>code-reviewer</code>、Hermes 的 <code>delegate_task</code> 派出的那个，都是 sub-agent。</p>
        <p><strong>multi-agent（多智能体）</strong>是多个 Agent 协作完成任务的系统与架构。它可以是层级，也可以是平级，可以有协调员，也可以没有。手撕版里 coordinator 加 researcher、analyst、writer 四个 Agent 合起来，才叫一个 multi-agent 系统。</p>
        <p>一句话能说清两者的分工。sub-agent 管怎么派活，multi-agent 管怎么组队。没有 sub-agent 的 multi-agent 也存在，比如三个 Agent 平级辩论、投票、互相审稿。</p>
      </React.Fragment>
    ),
  },
];

export function PostMultiAgent() {
  return (
    <PostLayout
      title="Multi-Agent 不是多开几个 Agent：从手撕 150 行到六个开源项目的拆解"
      dek="一个 Agent 是一个循环，多智能体是一套分工、通信与汇总的组织方式。我先手撕 150 行，再拆 LangGraph、CrewAI、AutoGen、MetaGPT、OpenAI Agents SDK 和 Google ADK，看它们各自把哪一步做死了。"
      dateTime="2026-11-15"
      date="2026 年 11 月 15 日"
      readingTime="约 12 分钟"
      metaDescription="多智能体不是多开几个 Agent：先手撕 150 行看清派生与上下文隔离，再拆解 LangGraph、CrewAI、AutoGen、MetaGPT、OpenAI Agents SDK 与 Google ADK。"
      link={{ href: 'https://github.com/shengzhaowei/MyBlog', label: '本文代码与配图所在的仓库' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>协调员第一步同时派了两个人。调研员去查三家门店的销量，分析员去算数，各自拿着自己的任务走了。写手最后才上场，把结果写进 brief.md。总销量 425，平均 141.7，丰台店最高。这 150 行就是我手撕的多智能体，四个 Agent，一个循环，没多余的东西。</p>
      <p>多开几个 Agent 很容易，难的是让它们各干各的，完了还能拼成一份能用的简报。这篇讲的就是这件事。先看手撕版里派活、隔离、汇总是怎么落地的，再看六个开源项目把同样的事写成了什么样。</p>

      <Heading id="intro">引言</Heading>
      <p>上一篇的 100 行 Agent 只剩一个循环。模型决定调什么工具，代码执行工具，把结果喂回去，直到模型不再调工具。多智能体没有发明新的循环，它在循环外面加了三样东西。派生是派一个子 Agent 出去干活，通信是父子之间传任务和结果，汇总是把几份结果拼成一份答案。</p>
      <p>初学者最容易走偏的地方在这儿。先学框架的 API，再回头补原理，每个框架的词都认识，换一个框架又不会了。我先把最小的多智能体手写一遍，再去读框架源码，读起来就顺了。它们都在回答同一组问题，答案写在了不同的地方。</p>
      <blockquote>
        <p>循环还是那个循环。变的是循环外面谁派活、谁说话、谁汇总。</p>
      </blockquote>

      <Heading id="one-loop">一个 Agent 还是一个循环</Heading>
      <p>手撕版只有 150 行左右，四个 Agent。协调员 coordinator，调研员 researcher，分析员 analyst，写手 writer。任务是给三家门店做一份销量简报。协调员自己不查数据、不算数、不写文件，只拆任务、派给专员、汇总结果。</p>
      <p>让一个 Agent 变成多智能体，只加了一个工具。</p>
      <pre><code>{`def delegate_task(agent_name: str, task: str) -> str:
    return run(AGENTS[agent_name], task, depth + 1)`}</code></pre>
      <p>协调员调它，和调 <code>lookup</code>、<code>calc</code> 没有任何区别。Hermes 的 <code>delegate_task</code>、OpenAI Agents SDK 的 handoff，底下也是这个工具，外面又包了一层路由、日志与权限。完整核心代码在文末附录。</p>
      <p>流程跑起来是三步。协调员第 1 步一次调两个 <code>delegate_task</code>，并行派调研员和分析员。拿到他俩的结果后，第 2 步派写手写文件。第 3 步汇总给用户。不用 Key 也能验证，假模型按这个剧本走，写出的 <code>brief.md</code> 是总销量 425，平均 141.7，丰台店最高。</p>
      <img
        src={`${process.env.PUBLIC_URL}/multi-agent-guide-illustrations/01-paper-planes.png`}
        alt="协调员小黑站在凳上同时掷出两架纸飞机，两边小桌上的小黑伸手接"
        width="2048"
        height="1152"
        decoding="async"
      />
      <p>派活就是这样发生的。协调员第 1 步一次调两个 delegate_task，调研员和分析员并行走。第 2 步派写手写文件，第 3 步汇总给用户。子 Agent 拿的是全新对话，只看到分给它的任务，看不到父 Agent 的历史。父 Agent 也只拿到子 Agent 交回的一句话摘要，看不到子 Agent 的中间过程。这叫上下文隔离，也是 sub-agent 存在的理由。并行只是顺带的收益。</p>
      <p>隔离的好处是每个窗口都很小，不会互相污染。代价是摘要会丢细节。协调员给子 Agent 的任务写得越具体、要求返回的格式越结构化，丢得越少。后面六个项目里，你会反复看到这个取舍换了不同的名字出现。</p>

      <Heading id="patterns">五种组织方式</Heading>
      <p>多智能体一个词底下，是五种不同的组织方式。区分它们的标准只有一个。下一步是谁决定的。</p>
      <img
        src={`${process.env.PUBLIC_URL}/multi-agent-guide-illustrations/03-turntable-patterns.png`}
        alt="小黑转动怪转盘，指针指向不同的工位牌"
        width="2048"
        height="1152"
        decoding="async"
      />
      <ul>
        <li><strong>协调员-工人（Orchestrator-Worker）。</strong>协调员现拆现派，工人并行做，最后由协调员汇总。这是生产里最常见的一种，Anthropic 在《Building effective agents》里点过名。子任务没有事先写死，协调员按输入现拆。同一个系统，问事实派 1 个工人，问对比派 2 到 4 个，问大范围调研派 10 个以上。</li>
        <li><strong>流水线（Pipeline）。</strong>顺序写死在代码里。上一步的输出是下一步的输入。查、算、写三步固定，适合流程本身就是答案一部分的任务。好处是可预测、可审计，坏处是中间一步错了，后面全错，而且没有回头路，除非再套一个评审循环。</li>
        <li><strong>并行扇出（Parallel Fan-out）。</strong>子任务事先定好，同时跑，再汇总。和协调员-工人的区别只在谁拆任务。这里是你写代码时拆好的，不是模型现拆的。便宜，好推理，适合分段明确的任务。</li>
        <li><strong>群体移交（Swarm / Handoff）。</strong>没有协调员，谁拿到活，谁决定交给谁。客服转账单、账单转退款就是这个形状。省掉中间人，少一次模型调用，但路由的责任散到了每个 Agent 的提示词里，出问题时要翻每个 Agent 的记录才能定位。</li>
        <li><strong>辩论与评审（Debate / Critic）。</strong>各自独立出方案，互相挑错，再由评审或投票裁决。关键在独立二字。批评者必须有自己的上下文窗口，否则它只是在复述第一个方案。适合答案有对错、值得多花一份成本验证的任务。</li>
      </ul>
      <p>这五种之外再起新名字，大多只是其中一种换了叫法。读任何一个框架的文档，先找到它的路由写在哪里，就能立刻归类。写死在代码里是流水线与扇出，交给协调员模型是协调员-工人，交给每个 Agent 自己是群体移交，各自独立再裁决是辩论。</p>

      <Heading id="cost">什么时候不该用多智能体</Heading>
      <p>先说代价，再说收益。Anthropic 在 2025 年 6 月公开的多智能体研究系统里，给了一组很诚实的数字。在其内部研究评测上，Opus 4 做领队、Sonnet 4 做工人的多智能体系统，比单 Agent 的 Opus 4 高 90.2%。同一篇文章也写了价格。多智能体系统约用单轮对话 15 倍的 token，单 Agent 约用 4 倍。</p>
      <p>这两个数字要一起读。90.2% 是内部评测的结果，不是给所有任务的承诺。15 倍是为并行探索与多份上下文付的钱。任务本身没有足够的并行度，这笔钱就白花了。顺序推理、环环相扣的任务，拆开反而更慢、更贵，还多了一层汇总时丢信息的风险。</p>
      <img
        src={`${process.env.PUBLIC_URL}/multi-agent-guide-illustrations/02-cost-scale.png`}
        alt="天平左盘一枚奖牌、右盘堆满硬币压得翘起，小黑踮脚再添一枚"
        width="2048"
        height="1152"
        decoding="async"
      />
      <ul>
        <li><strong>值得拆。</strong>调研、对比、审查。子任务之间基本独立，各自值得一个上下文窗口，最后要的是一份汇总。</li>
        <li><strong>不值得拆。</strong>一步错步步错的推理链、共享同一份文件的反复修改、答案本身很短的问答。单 Agent 加一个好工具，往往更快更便宜。</li>
        <li><strong>拆了会出事。</strong>多个工人同时写同一份文件、同一张表。协调员必须在派活时就把写作用域切开，每人一块互不重叠的地盘，否则汇总时就得救火。</li>
      </ul>
      <p>还有三条硬护栏，手撕版里就写死了，框架里也一样。扇出上限，简单问题不值得派 10 个工人。递归深度上限，只允许派生一层，防止工人再派工人。汇总格式，工人返回结构化短摘要，全文过程不交回。没有这三条，多智能体最常见的死法是跑起来停不下来，不是答错。</p>

      <Heading id="langgraph">LangGraph 把路由画成一张图</Heading>
      <p>LangGraph 的办法是把路由画成一张图。状态流过节点，边决定下一步去哪。官网仓库是 <code>langchain-ai/langgraph</code>。</p>
      <p>它用的原语是 <code>StateGraph</code> 与共享状态。每个 Agent 是一个节点，节点读状态、写状态。边可以写死，也可以是条件边，由函数返回值决定去向。它的多智能体有两种官方编排，Supervisor 与 Swarm。Supervisor 是协调员-工人，每轮控制权回到协调员手里，由它决定再派谁或结束。Swarm 是群体移交，Agent 之间直接用 <code>Command</code> 移交，不经过协调员，少一次模型调用，但路由逻辑散在各处。</p>
      <p>最小示例用官方的 <code>create_supervisor</code>，十几行就是一个协调员-工人系统。</p>
      <pre><code>{`from langgraph.prebuilt import create_react_agent
from langgraph.supervisor import create_supervisor

researcher = create_react_agent(
    model, tools=[search], prompt="只查数据，返回要点。")
analyst = create_react_agent(
    model, tools=[calc], prompt="只算数，返回结果。")
supervisor = create_supervisor(
    [researcher, analyst], model=model,
    prompt="拆任务、派给专员、汇总结果。")
app = supervisor.compile()
app.invoke({"messages": [("user", "做一份销量简报")]})`}</code></pre>
      <p>读源码我会先看三处。StateGraph 的节点与边怎么写，create_handoff_tool 里 Command(goto=...) 指到哪儿，检查点配成什么样。图的好处是出问题能按图查，卡在哪条边上一眼就能看到。代价是图要事先画好，动态性不如纯提示词驱动的协调员。</p>
      <p>流程有分支回退、要断点续跑、要审计每一步的生产系统，用它合适。只想拆任务、并行做、汇总的一次性任务，手撕版更便宜。</p>

      <Heading id="crewai">CrewAI 把团队写成角色和任务</Heading>
      <p>CrewAI 用三个词讲清一个团队，Agent、Task、Crew。官网仓库是 <code>crewAIInc/crewAI</code>，MIT 开源，不依赖 LangChain。</p>
      <p>它的原语最接近日常语言。Agent 有 <code>role</code>、<code>goal</code>、<code>backstory</code> 与工具。Task 有 <code>description</code>、<code>expected_output</code>、<code>agent</code> 与 <code>context</code>。Crew 把 Agent 与 Task 装在一起，<code>process</code> 选 <code>sequential</code> 或者 <code>hierarchical</code>。</p>
      <pre><code>{`from crewai import Agent, Task, Crew, Process

researcher = Agent(role="调研员",
    goal="查准三家门店的销量",
    backstory="你只认查到的数据，不编数字。")
research = Task(description="查三家门店的销量",
    expected_output="每家销量与备注的列表",
    agent=researcher)
crew = Crew(agents=[researcher, writer],
    tasks=[research, brief],
    process=Process.sequential)
crew.kickoff(inputs={"topic": "销量简报"})`}</code></pre>
      <p>读源码我会先看三处。Agent 的 <code>allow_delegation</code>，允不允许它再派活。Task 的 <code>context</code>，依赖关系写在哪里。Crew 的 <code>process</code> 与记忆配置。CrewAI 的长处是可读性，一个没写过 Agent 的人，读这段代码也能讲出团队在干什么。短处也在这里，流程越复杂，角色与任务的声明就越像一份新的配置文件，调试时要在声明与运行之间来回对。</p>
      <p>分工一眼看懂的中小项目、演示与教学，用它合适。路由要按输入动态变化、变化逻辑本身很复杂的系统，那是 LangGraph 的图的领地。</p>

      <Heading id="autogen">AutoGen 把协作写成群聊</Heading>
      <p>AutoGen 把多智能体写成一场群聊。Agent 轮流发言，辩论、挑错、收敛，直到达成终止条件。微软研究院 2023 年 10 月发布，仓库是 <code>microsoft/autogen</code>。</p>
      <p>它的原语是 <code>ConversableAgent</code>，一个会说话的 Agent，有系统提示词、模型配置与对话策略。两个 Agent 直接对话就是一对一。三个以上装进 <code>GroupChat</code>，由 <code>GroupChatManager</code> 决定下一位发言者。<code>UserProxyAgent</code> 代表人或者程序，负责执行代码、把结果带回对话。最经典的回路是写代码的助手与执行代码的代理之间来回。报错了，traceback 回到助手手里，它改了再试。</p>
      <pre><code>{`# 0.2 风格的 API，AG2 沿用；0.4 是重写版，见正文提醒
from autogen import AssistantAgent, UserProxyAgent
from autogen import GroupChat, GroupChatManager

coder = AssistantAgent(name="coder",
    system_message="只写代码，不解释。",
    llm_config=llm_config)
critic = AssistantAgent(name="critic",
    system_message="只挑错，不写代码。",
    llm_config=llm_config)
chat = GroupChat(agents=[user_proxy, coder, critic],
    messages=[], max_round=12,
    speaker_selection_method="auto")
manager = GroupChatManager(groupchat=chat,
    llm_config=llm_config)
user_proxy.initiate_chat(manager,
    message="写一个 CSV 解析器，并通过评审。")`}</code></pre>
      <p>版本提醒必须写在正文里，不然代码抄回去跑不起来。AutoGen 到 2026 年已经分叉。微软的 0.4 是异步事件驱动的重写，社区 fork <code>AG2</code> 延续 0.2 的设计，微软又把 AutoGen 与 Semantic Kernel 合并为 Agent Framework。上面这段是 0.2 风格，也是大多数旧教程的写法，概念在各代里是通的，群聊、选发言者、<code>max_round</code>，API 细节要按你装的版本对官方文档。</p>
      <p>读源码我会先看三处。发言者选择，<code>speaker_selection_method</code> 是模型选、轮询还是自定义函数。终止条件，说到 TERMINATE 还是到 <code>max_round</code>。代码执行放在哪里，默认在本地跑模型生成的代码，生产里要放进沙箱或容器。群聊的长处是辩论与评审最自然，短处是涌现式对话最难调试，流程不在代码里，在对话记录里。</p>
      <p>要辩论、要评审、要让 Agent 互相挑错的研究与工程任务，用它合适。流程固定、要求每一步都可审计的生产流水线，用它不合适。</p>

      <Heading id="metagpt">MetaGPT 把协作写成一家软件公司的 SOP</Heading>
      <p>MetaGPT 把一群 Agent 排成一家软件公司。产品经理、架构师、项目经理、工程师、QA 各就各位，按标准流程 SOP 交接结构化文档。论文见 arXiv 2308.00352，ICLR 2024，仓库现为 <code>FoundationAgents/MetaGPT</code>，原来是 <code>geekan/MetaGPT</code>。</p>
      <p>它的原语是 <code>Role</code> 与 <code>Action</code>。每个 Role 有名字、画像、目标、约束与一组 Action。Role 用 <code>_watch</code> 声明自己订阅哪种上游消息，所有消息进一个共享消息池，按类型分发。消息不是自由聊天，Role 按订阅取自己那份。产品经理写 PRD，架构师出设计，项目经理拆任务，工程师写代码，QA 写测试，交接的介质是结构化文档本身。</p>
      <pre><code>{`class SimpleWriteCode(Action):
    async def run(self, instruction: str):
        return await self._aask(instruction)

class SimpleCoder(Role):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._watch([UserRequirement])
        self._actions = [SimpleWriteCode]`}</code></pre>
      <p>这段是官方多智能体入门教程的结构。一个 Action 干一件事，一个 Role 订阅一类消息、挂一组 Action。把三个这样的 Role 排起来，写代码、写测试、写评审，就是一条最小的 SOP。论文报告的数字要标明出处再引用。MetaGPT 在 HumanEval 上 85.9%、MBPP 上 87.7% 的 Pass@1，是论文报告的结果，不是所有任务的承诺。</p>
      <p>读源码我会先看三处。Role 的 <code>_watch</code> 订阅，谁消费谁的输出。Action 的结构化输出 schema，文档格式就是接口。工程师的执行反馈循环，写测试、跑测试、失败重试，论文里重试上限是 3 次。MetaGPT 的长处是输出物最像人类的工程交付，短处是角色与 SOP 是事先定死的，换一个领域就要重写一套公司。</p>
      <p>输出是结构化文档、一环接一环的任务，用它合适，比如从一句话需求生成代码与测试。路由要按输入现拆、角色本身要动态变化的任务，用它不合适。</p>

      <Heading id="agents-sdk">OpenAI Agents SDK 把移交写成一个工具</Heading>
      <p>OpenAI Agents SDK 把交给另一个 Agent 做成一等公民的原语 handoff，其余一切保持最小。仓库是 <code>openai/openai-agents-python</code>，<code>pip install openai-agents</code>。</p>
      <p>SDK 只有三个核心概念。Agent，模型配置、指令、工具、移交列表。handoff，把控制权交给另一个 Agent。Runner，驱动整条循环，调模型、执行工具、跟随移交、跑护栏，直到产出最终答案。对模型来说，handoff 看起来就是一个工具调用，<code>transfer_to_billing_agent</code>。区别在调用之后。普通工具是拿回一个 JSON 结果继续想，handoff 是当前 Agent 的回合结束，另一个 Agent 带着完整对话历史接手。</p>
      <pre><code>{`from agents import Agent, Runner

billing = Agent(name="Billing Agent",
    instructions="处理账单问题。",
    handoff_description="处理发票、扣费与退款。",
    tools=[lookup_invoice, issue_refund])
triage = Agent(name="Triage Agent",
    instructions="只做路由，不直接回答。",
    handoffs=[billing, tech_agent])
result = Runner.run_sync(triage,
    "这个月我被重复扣费了。")
print(result.final_output)`}</code></pre>
      <p>注意两个细节。第一，<code>handoff_description</code> 是路由模型读的招聘启事，不是注释，写得越准，分流越准。第二，默认整段对话历史会跟着移交走，专员不用重新问一遍。如果不想带走全部历史，SDK 提供了输入过滤器与 <code>on_handoff</code> 回调，在移交那一刻记日志或预取数据。</p>
      <p>读源码我会先看三处。<code>handoffs</code> 列表是怎么变成 <code>transfer_to_*</code> 工具的，guardrails 在哪里拦，输入护栏在主模型跑之前，输出护栏在答案出去之前，以及 tracing 默认记了什么。它的长处是最短，一个分诊加两个专员，二十行左右就能跑。短处是编排能力最薄，复杂路由、并行扇出要自己用 <code>asyncio.gather</code> 拼。</p>
      <p>客服式路由，一个入口，按主题分给多个专员，用它合适。需要图、流水线或辩论的复杂编排，用它不合适。</p>

      <Heading id="adk">Google ADK 把流程写成一棵树</Heading>
      <p>Google ADK 把流程写成一棵树。每个应用是一棵 Agent 树，根 Agent 接用户输入，子 Agent 一层层往下派，叶子执行工具。流程本身是确定的代码，不是模型的临场决定。2025 年 4 月随 Google Cloud Next 发布，仓库是 <code>google/adk-python</code>，Apache 2.0 开源。</p>
      <p>ADK 的原语分两类。推理型只有一种，<code>LlmAgent</code>，有系统提示词、工具与模型，负责想、决定调什么。流程型有三种，都是纯路由逻辑、自己不调模型。<code>SequentialAgent</code>，子 Agent 一个接一个跑。<code>ParallelAgent</code>，同时扇出。<code>LoopAgent</code>，重复跑直到条件满足或到 <code>max_iterations</code>。Agent 之间用共享的 <code>session.state</code> 传数据。上游把结果写进 <code>output_key</code>，下游用 {'{key}'} 模板取。</p>
      <pre><code>{`from google.adk.agents import LlmAgent
from google.adk.agents import SequentialAgent

research = LlmAgent(name="research",
    model="gemini-2.5-flash",
    instruction="查数据，写进 output_key。",
    output_key="findings")
writer = LlmAgent(name="writer",
    model="gemini-2.5-flash",
    instruction="按 {findings} 写简报。")
pipeline = SequentialAgent(name="pipeline",
    sub_agents=[research, writer])`}</code></pre>
      <p>ADK 的树不支持 Agent 层面的环。要循环就用 <code>LoopAgent</code>，不要手动互相引用。这是它与 LangGraph 最大的分野。LangGraph 的图可以有环，ADK 的树没有环，换来的是流程永远可预测。另外两点也该知道。原生支持 MCP，工具接外部服务。原生支持 A2A，Agent 与 Agent 之间跨框架通信的协议。还有一键部署到 Vertex AI Agent Engine 的路径。</p>
      <p>读源码我会先看三处。<code>sub_agents</code> 的树结构，每个 Agent 只能有一个父节点。<code>output_key</code> 与 <code>session.state</code> 的传值方式。<code>LoopAgent</code> 的退出条件，<code>max_iterations</code> 或子 Agent 主动升级。它的长处是确定性最强、部署路径最完整，短处是动态路由最弱，协调员现拆任务不是它的主场。</p>
      <p>流程固定、要可预测、要部署到 Google Cloud 的生产系统，用它合适。子任务要按输入现拆、流程本身要由模型决定的探索型任务，用它不合适。</p>

      <Heading id="choose">怎么选，看三张表</Heading>
      <p>六个项目拆完，选型就只剩三张表。第一张按下一步是谁决定的分。</p>
      <ul>
        <li><strong>写死在代码里。</strong>LangGraph 的图、Google ADK 的树与三种流程 Agent、MetaGPT 的 SOP。可预测、可审计、可断点续跑。</li>
        <li><strong>交给协调员模型现拆。</strong>LangGraph 的 Supervisor、手撕版的 coordinator、OpenAI Agents SDK 的 triage。灵活，但要付路由那一次模型调用的钱。</li>
        <li><strong>交给每个 Agent 自己。</strong>LangGraph 的 Swarm、OpenAI Agents SDK 的点对点 handoff、AutoGen 的群聊。最省中间人，出问题最难定位。</li>
        <li><strong>各自独立再裁决。</strong>AutoGen 的群聊评审、辩论模式。最贵，只用在值得验证的答案上。</li>
      </ul>
      <p>第二张按你要什么分。想要最短的路，选 OpenAI Agents SDK。想要流程最确定，选 Google ADK。想要图与检查点，选 LangGraph。想要团队一眼看懂，选 CrewAI。想要辩论与评审，选 AutoGen。想要结构化文档流水线，选 MetaGPT。没有哪一个在所有维度上赢，它们赢的维度本来就不一样。</p>
      <p>第三张是另外两个值得读的项目，放在这里是因为它们回答了上面六个没回答的问题。CAMEL 是 <code>camel-ai/camel</code>，最早把角色扮演做成多智能体研究框架的项目。两个 Agent，一个扮用户、一个扮助手，用 inception 提示词互相出题、互相完成任务，研究的是 Agent 之间如何协作本身，交付某个产品不在它的目标里。Hermes-CN-Core 是 <code>Eynzof/Hermes-CN-Core</code>，我在本地核查过的版本。它原生就有 <code>delegate_task</code>，单批并行派生子 Agent，与 <code>agent_swarm</code>，按模板批量派生，最多 128 个。默认只允许派生一层、最多 10 个并发子 Agent，子 Agent 继承父 Agent 的 MCP 工具集，但禁掉 <code>delegate_task</code> 等六个工具。和手撕版的三条安全线是同一组决定，只是写进了内核。</p>
      <img
        src={`${process.env.PUBLIC_URL}/multi-agent-guide-illustrations/04-three-bricks.png`}
        alt="小黑把派活、隔离、汇总三块砖砌成一面小墙"
        width="2048"
        height="1152"
        decoding="async"
      />
      <p>多智能体拆开看，只有三件事。派活、隔离、汇总。只做拆任务、并行做、汇总，第 2 层就够了。要分支回退、断点续跑、审计每一步，才需要第 3、4 层。框架值钱的地方，大多在第 4 层，检查点、追踪、权限、审批、超时与重试上限。</p>

      <Heading id="closing">收尾，先手撕，再选框架</Heading>
      <p>开几个 Agent 很容易。难的是让它们互相看不见不该看的东西、只交回该交的东西、最后汇总成一个能用的答案。手撕版的 150 行里，这三件事分别对应三行代码。<code>delegate_task</code>，全新对话的 <code>messages</code> 初始化，以及只返回摘要的约定。</p>
      <p>读框架的时候，也按这三件事去对。派生写在哪里。上下文隔离是真的隔离，还是共用一份历史。汇总是结构化的，还是把全文都倒给协调员。对得上，这篇文档就读完了。对不上，说明那个框架在解决另一个问题。</p>
      <p>下一步最顺的练习，是把手撕版的 <code>lookup</code> 换成一个真的工具。读文件、调接口、查数据库都行。换完你会发现，协调员一行不用动，变的只是专员的工具箱。这也是多智能体最诚实的一课。组织方式一旦对了，加能力只是加工具。组织方式错了，加再多 Agent 也只是加混乱。</p>
    </PostLayout>
  );
}

export default PostMultiAgent;

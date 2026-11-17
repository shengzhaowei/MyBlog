import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

const TOC_ITEMS = [
  { id: 'intro', label: '引言' },
  { id: 'loop', label: '核心就一个循环' },
  { id: 'tools', label: '工具就是函数加一段描述' },
  { id: 'memory', label: '记忆就是消息历史' },
  { id: 'guard', label: '护栏就是步数上限和错误处理' },
  { id: 'left-out', label: '故意没写的东西' },
  { id: 'run', label: '跑起来，DeepSeek 版' },
  { id: 'closing', label: '收尾，从 100 行到生产系统' },
];

const REFERENCES = [
  {
    href: 'https://www.anthropic.com/engineering/building-effective-agents',
    label: 'Building effective agents',
    note: 'Agent 与工作流的分界：模型在循环中自己决定下一步',
  },
  {
    href: 'https://arxiv.org/abs/2210.03629',
    label: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    note: 'Thought-Action-Observation 循环的出处',
  },
  {
    href: 'https://platform.openai.com/docs/guides/function-calling',
    label: 'OpenAI Function Calling',
    note: '工具声明的 JSON Schema 格式',
  },
  {
    href: 'https://api-docs.deepseek.com/',
    label: 'DeepSeek API 文档',
    note: 'deepseek-chat 支持 Function Calling；deepseek-reasoner 不支持',
  },
  {
    href: 'https://github.com/Eynzof/Hermes-CN-Core',
    label: 'Hermes-CN-Core',
    note: '本文对照的生产级 Agent 内核',
  },
];

const APPENDIX = [
  {
    id: 'appendix-full-code',
    title: '完整代码（DeepSeek 版，共 95 行）',
    body: (
      <React.Fragment>
        <p>下面就是全文拆解的那份代码，原样贴出，照着抄就能跑。行数含注释与空行，共 95 行。</p>
        <pre><code>{`"""80 行手写 Agent（DeepSeek 版）：ReAct 循环 + 工具调用。
跑法：
    pip install openai
    去 https://platform.deepseek.com/api_keys 申请一个 API Key
    设置环境变量 DEEPSEEK_API_KEY（可选 LLM_MODEL）
    python mini-agent-deepseek.py

注意：Agent 必须用 deepseek-chat。deepseek-reasoner（思考模型）
不支持 Function Calling，调工具会报错，所以不要把它填进 LLM_MODEL。
"""
import json
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://api.deepseek.com",  # DeepSeek 官方接口，兼容 OpenAI 协议
    api_key=os.environ["DEEPSEEK_API_KEY"],
)
MODEL = os.environ.get("LLM_MODEL", "deepseek-chat")


# ---------- 1. 工具：就是普通函数 + 一段给模型看的描述 ----------
def read_file(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def write_file(path: str, content: str) -> str:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"已写入 {path}（{len(content)} 字）"


TOOLS = {
    "read_file": (
        read_file,
        {"type": "function", "function": {
            "name": "read_file",
            "description": "读取指定文件的内容",
            "parameters": {"type": "object",
                           "properties": {"path": {"type": "string"}},
                           "required": ["path"]},
        }},
    ),
    "write_file": (
        write_file,
        {"type": "function", "function": {
            "name": "write_file",
            "description": "把内容写入指定文件（会覆盖）",
            "parameters": {"type": "object",
                           "properties": {
                               "path": {"type": "string"},
                               "content": {"type": "string"},
                           },
                           "required": ["path"]},
        }},
    ),
}

SYSTEM = "你是一个会用工具的助手。需要查资料或写文件时调用工具，不要编造内容。"


# ---------- 2. 循环：这就是 Agent 的全部 ----------
def run(user_input: str, max_steps: int = 10) -> str:
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_input},
    ]
    for _ in range(max_steps):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=[spec for _, spec in TOOLS.values()],
        )
        msg = resp.choices[0].message
        messages.append(msg)  # 把模型的回复也记进历史
        if not msg.tool_calls:
            return msg.content or "（无回答）"
        for call in msg.tool_calls:
            fn, _ = TOOLS[call.function.name]
            try:
                result = fn(**json.loads(call.function.arguments))
            except Exception as e:
                result = f"工具出错：{e}"
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result),
            })
    return "步数用完，我主动停下来了（防止死循环）"


if __name__ == "__main__":
    print(run(input("你：")))`}</code></pre>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-lines',
    title: '行数分布',
    body: (
      <React.Fragment>
        <p>每一部分的行数。理解 Agent 之前，先知道钱花在哪。</p>
        <ul>
          <li><strong>工具定义，约 25 行。</strong>两个普通函数，加上它们的 JSON Schema 声明。</li>
          <li><strong>循环，约 25 行。</strong>run() 函数调模型、执行工具、回填结果、再调模型。</li>
          <li><strong>消息历史，约 5 行。</strong>messages 列表的初始化，就是 Agent 的记忆。</li>
          <li><strong>错误处理，约 5 行。</strong>try/except 把工具报错喂回去，不让程序崩掉。</li>
          <li><strong>护栏，约 5 行。</strong>max_steps 步数上限，防死循环。</li>
          <li><strong>其余约 30 行。</strong>配置、客户端初始化、系统提示词与入口。</li>
        </ul>
      </React.Fragment>
    ),
  },
];

export function PostMiniAgent() {
  return (
    <PostLayout
      title="100 行代码写一个 Agent，手写 ReAct 循环"
      dek="不用框架，一个循环加两个工具，就是 Agent 的全部。"
      dateTime="2026-11-14"
      date="2026 年 11 月 14 日"
      readingTime="约 5 分钟"
      metaDescription="不用框架，100 行 Python 手写一个 Agent，ReAct 循环、工具调用、消息历史、步数护栏，以及故意没写的东西。"
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>我先拿文末那份 DeepSeek 版代码跑了一句。读一下 README，再写个总结保存到 summary.txt。它先调 read_file 读文件，接着调 write_file 写文件，中间没让我插手。跑完我就明白了，Agent 是一个循环。</p>
      <p>文末附录贴了完整代码，95 行，注释和空行都算在里头。照着抄就能跑，跑起来要先装 openai，设好 DEEPSEEK_API_KEY。</p>

      <Heading id="intro">引言</Heading>
      <p>想做 Agent 开发的人，第一步常卡在选框架上。我的看法是，不用先设计一套自己的 Agent 加 harness。harness 重要，核心比想象中简单。理解 Agent 最快的方式，是把最核心的循环手写一遍。</p>
      <p>这 100 行就是那个练习。一个 ReAct 循环，两个文件工具，一个 DeepSeek 模型。它读文件、写文件，自己决定先读后写，工具出错也能处理。RAG 和多 Agent 都没写，记忆系统也没写。它确实是一个 Agent，也是理解所有 Agent 的起点。</p>

      <Heading id="loop">核心就一个循环</Heading>
      <p>ReAct 循环就是想、动、看结果，再想、再动、再看，直到想明白为止。论文里叫 ReAct，代码里就是一个 for 循环。Thought、Action、Observation 三个词，分别对应模型想、代码执行、结果回到模型手里。</p>

      <img
        src={`${process.env.PUBLIC_URL}/mini-agent-100-lines-illustrations/01-loop-track.png`}
        alt="小黑坐环形轨道小车上，手里捏着纸条，先想想、动手、看结果、再想一遍"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>run() 函数就是这个循环的全部，完整代码贴在下面。</p>
      <pre><code>{`def run(user_input: str, max_steps: int = 10) -> str:
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_input},
    ]
    for _ in range(max_steps):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=[spec for _, spec in TOOLS.values()],
        )
        msg = resp.choices[0].message
        messages.append(msg)  # 把模型的回复也记进历史
        if not msg.tool_calls:
            return msg.content or "（无回答）"
        for call in msg.tool_calls:
            fn, _ = TOOLS[call.function.name]
            try:
                result = fn(**json.loads(call.function.arguments))
            except Exception as e:
                result = f"工具出错：{e}"
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result),
            })
    return "步数用完，我主动停下来了（防止死循环）"`}</code></pre>
      <p>模型只负责说，说什么话，调什么工具。代码负责做，真的去执行，把结果带回来。模型每轮看到完整的历史，能根据上一轮工具的结果决定下一轮做什么。循环转起来，Agent 就越跑越明白。</p>

      <Heading id="tools">工具就是函数加一段描述</Heading>
      <p>工具就是普通函数。read_file 读文件，write_file 写文件，跟平时写的函数没区别。让它变成 Agent 工具的，是函数旁边那段声明。</p>
      <pre><code>{`"read_file": (
    read_file,
    {"type": "function", "function": {
        "name": "read_file",
        "description": "读取指定文件的内容",
        "parameters": {"type": "object",
                       "properties": {"path": {"type": "string"}},
                       "required": ["path"]},
    }},
)`}</code></pre>
      <p>声明是一段 JSON Schema，分四块。type 固定写 function，告诉接口这是一个函数工具。name 是模型调用时返回的名字，代码靠它找到对应的 Python 函数。description 是一句话的用途说明，模型选工具全靠这句话，写得越准，调得越准。parameters 描述参数，properties 列参数名和类型，required 列必填项。模型按这个格式生成参数，代码用 json.loads 解析出来传给函数。</p>
      <p>description 写错了，工具就调乱了。把读文件的描述写成写入文件，模型想读文件时会去调写文件。工具声明是给模型看的接口文档，得认真写。</p>

      <img
        src={`${process.env.PUBLIC_URL}/mini-agent-100-lines-illustrations/03-infographic-drawer-manual.png`}
        alt="文件柜两个抽屉，抽屉上贴着 read_file 和 write_file 的描述卡片，声明是给模型看的接口文档"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="memory">记忆就是消息历史</Heading>
      <p>Agent 的记忆是 messages 这个列表。系统提示词、用户问题、每轮模型的回复、每个工具的执行结果，全攒在这里。列表一空，模型就什么都不记得了。</p>
      <p>没有它，模型每轮都是失忆的。上一轮调了什么工具，得到了什么结果，下一轮全不知道。把工具结果 append 回历史，就是 Observation 回到模型手里的那一步。循环能越跑越明白，全靠这个列表在攒上下文。</p>
      <p>上下文窗口有限，列表会越攒越长，生产系统要做压缩和摘要。机制就是这个列表，先把机制搞对，再谈优化。</p>

      <img
        src={`${process.env.PUBLIC_URL}/mini-agent-100-lines-illustrations/02-memory-stack.png`}
        alt="小黑踮脚顶着一摞歪歪斜斜的纸，列表一空就失忆"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="guard">护栏就是步数上限和错误处理</Heading>
      <p>两个护栏摆在这里，Agent 才敢一直跑。少了它们，一次失控就能让程序停不下来。</p>
      <ul>
        <li><strong>max_steps = 10。</strong>模型可能一直调工具下去，步数上限是死循环的刹车，到了就主动停下来，返回一句话交代。没有它，一次模型抽风就能让程序无限跑下去。</li>
        <li><strong>try/except。</strong>工具出错时，把错误文本喂回去，让模型自己决定重试还是换个方法，程序不崩掉。工具出错是常态，崩掉才是事故。</li>
      </ul>
      <p>还有一个隐性护栏，只读与可控的工具。给 Agent 的工具越少、权限越小，出错的代价越小。读文件、查数据是起步的安全选择。写文件会覆盖，要慎重。删文件、改生产数据，根本不该出现在起步的工具箱里。</p>

      <img
        src={`${process.env.PUBLIC_URL}/mini-agent-100-lines-illustrations/04-infographic-step-brake.png`}
        alt="步数条走满 10 格，到了就停，工具出错喂回去，步数上限是死循环的刹车"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="left-out">故意没写的东西</Heading>
      <p>这 100 行故意没写很多东西。RAG 没写，多 Agent 也没写。记忆系统没写，LangChain 之类的框架也没用上。</p>
      <p>这些都在循环外面加模块。Agent 的本质是那个循环。20 行能写明白的循环，不需要框架。框架是给生产环境做工程化的，它管重试，管观测，也管权限和部署。先把循环手写一遍，框架的每一层抽象都知道它在解决什么问题。</p>
      <p>顺序反了是初学者最常见的弯路。先学框架 API，再回头补循环。反过来做，理解来得更快，也更牢。</p>

      <Heading id="run">跑起来，DeepSeek 版</Heading>
      <p>跑法很简单。pip install openai，去 DeepSeek 平台申请一个 API Key，设置环境变量 DEEPSEEK_API_KEY，然后 python mini-agent-deepseek.py。</p>
      <p>试一句，读一下 README，再写个总结保存到 summary.txt。你会看到它自己先调 read_file，再调 write_file。这就是 Agent 在工作。</p>
      <p>注意一个坑。模型必须用 deepseek-chat。deepseek-reasoner 是思考模型，不支持 Function Calling，填进去调工具会报错。思考能力可以另起一路只做纯文本推理，那是进阶玩法，先把 deepseek-chat 这版跑通。</p>

      <Heading id="closing">收尾，从 100 行到生产系统</Heading>
      <p>这 100 行和生产系统之间，只隔着三层东西。工具层是更多、更安全的工具。管控层管登录、审计、权限、部署。评测层是题库、打分、回归。理解了循环，Agent 开发剩下的就是往循环外面加东西。</p>
      <p>对照一下我之前做的 ERP 数据智能体。Hermes 内核就是这个循环，加上工具注册、会话管理和权限。数据服务的 7 个工具，就是 TOOLS 那个字典的放大版。评测就是检查这个循环的每一步答得准不准。内核不用重写，循环还是这一个。定制在工具层和管控层做，评测层也一样。</p>
      <p>先把 100 行跑通，再谈框架和平台。能手写一个 Agent，和会调用一个框架，是两种不同的理解。</p>
    </PostLayout>
  );
}

export default PostMiniAgent;

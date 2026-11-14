import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

const TOC_ITEMS = [
  { id: 'intro', label: '引言' },
  { id: 'loop', label: '核心就一个循环' },
  { id: 'tools', label: '工具：函数加一段描述' },
  { id: 'memory', label: '记忆就是消息历史' },
  { id: 'guard', label: '护栏：步数上限与错误处理' },
  { id: 'left-out', label: '故意没写的东西' },
  { id: 'run', label: '跑起来：DeepSeek 版' },
  { id: 'closing', label: '收尾：从 100 行到生产系统' },
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
                           "required": ["path", "content"]},
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
        <p>每一部分的行数，理解 Agent 之前先知道钱花在哪：</p>
        <ul>
          <li><strong>工具定义，约 25 行。</strong>两个普通函数，加上它们的 JSON Schema 声明。</li>
          <li><strong>循环，约 25 行。</strong>run() 函数：调模型、执行工具、回填结果、再调模型。</li>
          <li><strong>消息历史，约 5 行。</strong>messages 列表的初始化，就是 Agent 的「记忆」。</li>
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
      title="100 行代码写一个 Agent：手写 ReAct 循环"
      dek="不用框架，一个循环加两个工具，就是 Agent 的全部。"
      dateTime="2026-11-14"
      date="2026 年 11 月 14 日"
      readingTime="约 5 分钟"
      metaDescription="不用框架，100 行 Python 手写一个 Agent：ReAct 循环、工具调用、消息历史、步数护栏，以及故意没写的东西。"
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>结论先行：Agent 不是框架，是一个循环。不到 100 行 Python，两个工具，不用任何 Agent 框架，就能把 Agent 的核心机制跑通：模型决定调什么工具，代码执行工具，把结果喂回去，直到模型不再调工具为止。</p>
      <p>这篇文章就是这 100 行的拆解：循环、工具、记忆、护栏，以及故意没写的东西。完整代码在文末附录，照着抄就能跑。</p>

      <Heading id="intro">引言</Heading>
      <p>想从事 Agent 开发，第一个问题往往是：是不是要先设计一套自己的 Agent 加 harness？我的答案是不用——不是因为 harness 不重要，而是因为它的核心比想象中简单。理解 Agent 的最快方式，不是先学一个框架的 API，而是把最核心的循环手写一遍。</p>
      <p>这 100 行代码就是那个练习：一个 ReAct 循环，两个文件工具，一个 DeepSeek 模型。它能读文件、写文件，能自己决定先读后写，也能处理工具出错。它没有 RAG，没有多 Agent，没有记忆系统——但它确实是一个 Agent，而且是理解所有 Agent 的起点。</p>

      <Heading id="loop">核心就一个循环</Heading>
      <p>Agent 的核心是一个叫 ReAct 的循环：Thought（想）→ Action（动）→ Observation（看结果），再想、再动、再看，直到想明白为止。论文里叫 ReAct，代码里就是一个 for 循环。</p>

      <img
        src={`${process.env.PUBLIC_URL}/mini-agent-loop.svg`}
        alt="Agent 循环示意图：用户提问、模型决策、执行工具、结果回填，再问一次模型，直到不调工具就输出答案"
        width="1200"
        height="540"
        decoding="async"
      />

      <p>run() 函数就是这个循环的全部，完整代码如下：</p>
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
      <p>注意这个分工：<strong>模型只负责「说」</strong>——说什么话、调什么工具；<strong>代码负责「做」</strong>——真的去执行、把结果带回来。Agent 的智能不在框架里，在这个循环和提示词里。模型每轮看到完整的历史，所以它能根据上一轮工具的结果，决定下一轮做什么。</p>

      <Heading id="tools">工具：函数加一段描述</Heading>
      <p>工具就是普通函数。read_file 读文件，write_file 写文件，跟你平时写的函数没有任何区别。Agent 化的部分不在函数本身，在函数旁边那段声明：</p>
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
      <p>声明是一段 JSON Schema，四个部分各有分工：<strong>type</strong> 固定写 function，告诉接口这是一个函数工具；<strong>name</strong> 是模型调用时返回的名字，代码靠它找到对应的 Python 函数；<strong>description</strong> 是一句话的用途说明——模型选工具全靠这句话，写得越准，调得越准；<strong>parameters</strong> 描述参数，properties 列参数名与类型，required 列必填项。模型按这个格式生成参数，代码用 json.loads 解析出来传给函数。</p>
      <p>一个容易被低估的点：description 写错了，工具就调乱了。比如把读文件的描述写成「写入文件」，模型想读文件时会去调写文件。工具声明是给模型看的接口文档，不是给人看的注释，值得认真写。</p>

      <Heading id="memory">记忆就是消息历史</Heading>
      <p>Agent 的「记忆」不是数据库，是 messages 这个列表：系统提示词、用户问题、每轮模型的回复、每个工具的执行结果，全攒在这里。</p>
      <p>没有它，模型每轮都是失忆的——上一轮调了什么工具、得到了什么结果，下一轮全不知道。把工具结果 append 回历史，就是 Observation 回到模型手里的那一步。循环之所以能「越跑越明白」，全靠这个列表在攒上下文。</p>
      <p>上下文窗口有限，列表会越攒越长，生产系统要做压缩和摘要。但机制就是这个列表，先把机制搞对，再谈优化。</p>

      <Heading id="guard">护栏：步数上限与错误处理</Heading>
      <p>两个护栏，决定了 Agent 是「能跑」还是「能一直跑」。</p>
      <ul>
        <li><strong>max_steps = 10。</strong>模型可能一直调工具下去，步数上限是死循环的刹车，到了就主动停下来，返回一句话交代。没有它，一次模型抽风就能让程序无限跑下去。</li>
        <li><strong>try/except。</strong>工具出错时，把错误文本喂回去，让模型自己决定重试还是换个方法，而不是整个程序崩掉。工具出错是常态，崩掉才是事故。</li>
      </ul>
      <p>还有一个隐性护栏：<strong>只读与可控的工具</strong>。给 Agent 的工具越少、权限越小，出错的代价越小。读文件、查数据是起步的安全选择；写文件会覆盖，要慎重；删文件、改生产数据，根本不该出现在起步的工具箱里。</p>

      <Heading id="left-out">故意没写的东西</Heading>
      <p>这 100 行故意没写很多东西：没写 RAG，没写多 Agent，没写记忆系统，也没用 LangChain 之类的框架。</p>
      <p>不是不会写，是这些都在循环外面加模块，不是 Agent 的本质。20 行能写明白的循环，不需要框架；框架是给生产环境做工程化的——重试、观测、权限、部署。先把循环手写一遍，框架的每一层抽象都知道它在解决什么问题。</p>
      <p>顺序反了是初学者最常见的弯路：先学框架 API，再回头补循环。反过来做，理解来得更快，也更牢。</p>

      <Heading id="run">跑起来：DeepSeek 版</Heading>
      <p>跑法很简单：pip install openai，去 DeepSeek 平台申请一个 API Key，设置环境变量 DEEPSEEK_API_KEY，然后 python mini-agent-deepseek.py。</p>
      <p>试一句：「读一下 README，再写个总结保存到 summary.txt」。你会看到它自己先调 read_file，再调 write_file——这就是 Agent 在工作。</p>
      <p>注意一个坑：<strong>模型必须用 deepseek-chat</strong>。deepseek-reasoner 是思考模型，不支持 Function Calling，填进去调工具会报错。思考能力可以另起一路只做纯文本推理，但那是进阶玩法，先把 deepseek-chat 这版跑通。</p>

      <Heading id="closing">收尾：从 100 行到生产系统</Heading>
      <p>这 100 行和生产系统之间，只隔着三层东西：<strong>工具层</strong>（更多、更安全的工具）、<strong>管控层</strong>（登录、审计、权限、部署）、<strong>评测层</strong>（题库、打分、回归）。理解了循环，Agent 开发剩下的就是往循环外面加东西。</p>
      <p>对照一下我之前做的 ERP 数据智能体：Hermes 内核就是这个循环，加上工具注册、会话管理和权限；数据服务的 7 个工具，就是 TOOLS 那个字典的放大版；评测就是检查这个循环的每一步答得准不准。内核不用重写，因为核心就是这一个循环；定制发生在工具、管控和评测这三层。</p>
      <p>先把 100 行跑通，再谈框架和平台。能手写一个 Agent，和会调用一个框架，是两种不同的理解。</p>
    </PostLayout>
  );
}

export default PostMiniAgent;

import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

const TOC_ITEMS = [
  { id: 'intro', label: '先说结论：模型是失忆的' },
  {
    id: 'short-term', label: '短期记忆：checkpointer 是自动的',
    children: [
      { id: 'thread-id', label: 'thread_id 是钥匙' },
      { id: 'messages-state', label: 'MessagesState 是载体' },
    ],
  },
  {
    id: 'long-term', label: '长期记忆：store 是手动的',
    children: [
      { id: 'search-then-write', label: '先查后写' },
      { id: 'user-isolation', label: '按 user_id 隔离' },
    ],
  },
  { id: 'demo', label: '46 行跑一遍' },
  { id: 'pitfalls', label: '三个坑' },
  { id: 'closing', label: '写完之后，下一步' },
];

const REFERENCES = [
  {
    href: 'https://docs.langchain.com/oss/python/langgraph/persistence',
    label: 'LangGraph · Persistence',
    note: '官方对 checkpointer 与 store 的分工：前者存单线程状态快照，后者存跨线程数据',
  },
  {
    href: 'https://docs.langchain.com/oss/python/langgraph/add-memory',
    label: 'LangGraph · Add memory',
    note: '短期记忆与长期记忆的官方接入方式，含生产该用数据库后端的提醒',
  },
  {
    href: 'https://github.com/langchain-ai/langmem',
    label: 'LangMem',
    note: 'LangChain 官方的记忆提取层：在 Store 之上自动提炼事实，回答发出后再后台抽取',
  },
  {
    href: 'https://shengzhaowei.me/posts/agent-memory-implementation',
    label: '本站 · Agent 是怎么记住你的',
    note: '上一篇：360 行手写最小记忆系统，对照五家 harness 的记法，本文是它的 LangGraph 续篇',
  },
];

const APPENDIX = [
  {
    id: 'appendix-full-code',
    title: '完整 46 行 demo',
    body: (
      <React.Fragment>
        <p>下面就是全文讨论的那份代码，一个字没改。真模型是 DeepSeek 的 deepseek-chat，跑之前先设 <code>DEEPSEEK_API_KEY</code>。</p>
        <pre><code>{`# memory_demo.py — 真模型版：DeepSeek deepseek-chat
# 运行前：pip install langgraph langchain-openai
#         Windows: set DEEPSEEK_API_KEY=你的key
#         Mac/Linux: export DEEPSEEK_API_KEY=你的key
# 注意：别用 deepseek-reasoner，它不支持工具调用。
import os
import sys

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.store.memory import InMemoryStore

if not os.getenv("DEEPSEEK_API_KEY"):
    sys.exit("没找到 DEEPSEEK_API_KEY，先设好环境变量再跑")

model = ChatOpenAI(model=os.getenv("LLM_MODEL", "deepseek-chat"),
                   api_key=os.getenv("DEEPSEEK_API_KEY"),
                   base_url=os.getenv("LLM_BASE_URL",
                                      "https://api.deepseek.com/v1"),
                   temperature=0)

checkpointer = InMemorySaver()  # 生产换 Redis checkpointer
store = InMemoryStore()        # 生产换 Milvus 这类向量 store

def reply(state: MessagesState):
    msgs = [SystemMessage(content="你是助手，回答简短，"
                                  "遵守对话里提到的用户偏好。")]
    msgs += state["messages"]
    return {"messages": [model.invoke(msgs)]}

graph = StateGraph(MessagesState)
graph.add_node("reply", reply)
graph.add_edge(START, "reply")
graph.add_edge("reply", END)
graph = graph.compile(checkpointer=checkpointer, store=store)

def chat(user_id, thread_id, text):
    hits = store.search((user_id,), query=text)  # 长期记忆：先查
    if hits:
        text += "\\n[长期记忆] " + "; ".join(
            h.value["text"] for h in hits)
    out = graph.invoke(
        {"messages": [HumanMessage(content=text)]},
        config={"configurable": {"thread_id": thread_id}})
    print(f"[{thread_id}] {out['messages'][-1].content}\\n")
    if "不吃香菜" in text:  # 长期记忆：再写
        store.put((user_id, "profile"), "food",
                  {"text": "用户不吃香菜，喜欢吃辣"})

if __name__ == "__main__":
    chat("u1", "u1:s1", "我不吃香菜，喜欢吃辣")
    chat("u1", "u1:s1", "推荐一道川菜")
    chat("u1", "u1:s2", "推荐一道川菜")  # 新会话：短期丢了，长期还在
    chat("u2", "u2:s1", "推荐一道川菜")  # 换个人：按 user_id 隔离
`}</code></pre>
        <p>注意附录这份代码和正文里贴的片段有一处不一样：<code>graph.compile</code> 那几行我拆开了写，只为了让每行不超过 80 个字符，跑起来是一样的。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-verify',
    title: '验证清单',
    body: (
      <React.Fragment>
        <p>四句话，分别验证四个结论。真模型的措辞每次都不一样，看结论不看原话。</p>
        <ul>
          <li><strong>第一句能存。</strong>说完「我不吃香菜，喜欢吃辣」，长期记忆里多了一条「用户不吃香菜，喜欢吃辣」。</li>
          <li><strong>第二句靠短期。</strong>同一会话再问推荐川菜，模型记得上一句，不用长期记忆也能答对。</li>
          <li><strong>第三句靠长期。</strong>换一个新会话，短期记忆是空的，推荐的菜仍然又辣又不放香菜，说明长期记忆被查到并拼进了输入。</li>
          <li><strong>第四句看隔离。</strong>换一个人问同样的问题，推荐里可以出现香菜，说明长期记忆按 user_id 隔离，没串。</li>
          <li><strong>没 key 会明说。</strong>不设 <code>DEEPSEEK_API_KEY</code> 就跑，程序直接退出并提示先设 key，不会报一堆看不懂的错。</li>
        </ul>
        <p>还有一句实话：这份真模型版我只验到了没 key 提示那一步，完整四句的实跑要你自己在有 key 的机器上跑。假模型版我倒是完整跑通过，四行输出和上面四个结论一一对应，区别只是回答是写死的规则，不是模型现想的。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-cheatsheet',
    title: 'checkpointer 与 store 速查',
    body: (
      <ul>
        <li><strong>短期记忆。</strong>checkpointer，存图状态快照，范围是一个 thread_id，自动存取，换 thread 即空白。内存版是 <code>InMemorySaver</code>，生产换 Redis 或 Postgres。</li>
        <li><strong>长期记忆。</strong>store，存提炼后的事实，范围是 user_id 命名空间，手动查和写，跨 thread 有效。内存版是 <code>InMemoryStore</code>，生产换 Milvus 或 Postgres。</li>
        <li><strong>写长期记忆。</strong>demo 用规则写，生产用 LLM 抽取或 LangMem；只存陈述句，问句不存。</li>
        <li><strong>读长期记忆。</strong>回答之前先 search，拼进本次输入；不读，记忆就是死档。</li>
        <li><strong>模型选择。</strong>DeepSeek 用 deepseek-chat，别用 deepseek-reasoner，后者不支持工具调用。</li>
      </ul>
    ),
  },
];

export function PostLangchainMemory() {
  return (
    <PostLayout
      title="LangChain 的长期记忆和短期记忆，46 行代码跑通"
      dek="模型本身是失忆的。短期记忆靠 checkpointer 自动存，长期记忆靠 store 手动查和写，46 行代码加一个真模型，跑一遍就明白了。"
      dateTime="2026-11-19"
      date="2026 年 11 月 19 日"
      readingTime="约 7 分钟"
      metaDescription="LangChain 里长期记忆和短期记忆到底怎么实现。46 行代码，真模型 DeepSeek，对照 checkpointer 与 store 各写一遍，四句话验证完。"
      link={{ href: 'https://github.com/shengzhaowei/MyBlog', label: '本站代码' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>先说结论，模型本身是失忆的。每次调用完，它什么都不记得。所谓长期记忆和短期记忆，都是你帮它把东西存在外面，下次调用前再塞回去。这篇文章就讲这两样东西在 LangChain 里是怎么存、怎么塞的，一共 46 行代码，真模型跑一遍。</p>
      <p>这篇是上一篇的续篇。上一篇我手写了一个 360 行的最小记忆系统，用文件当本子，讲了画像、事实、原话三层。那篇的结论是记忆就是写和读之间的一个圈。这篇换一套做法，不用自己写文件，用 LangGraph 自带的两个东西：checkpointer 管短期，store 管长期。写起来更短，但坑也更隐蔽，因为一半的活框架替你干了，另一半它一声不吭，全得你自己来。</p>

      <Heading id="intro">先说结论：模型是失忆的</Heading>
      <p>这句话值得先钉死。模型每次调用都是独立的，你跟它聊一上午，它能接上你的话，不是因为它记住了，而是因为那堆对话还躺在 <code>messages</code> 里，每轮都原样发给它。进程一退，列表就没了，下次开局它手里什么都没有。</p>
      <p>所以记忆这件事，在代码里永远是两步。第一步，值得留的，存到模型外面的地方。第二步，下次调用之前，把相关的那几条找出来，拼进这次的输入里。只存不找，记忆是死档。只找不存，记忆是旧报纸。LangChain 的长期记忆和短期记忆，分工就是这两步各管一摊。</p>
      <p>如果你搜到的教程还在用 <code>ConversationBufferMemory</code>，那是老版写法。新版 LangChain 里，记忆已经收敛到 LangGraph 的两套东西上。这一篇只讲新版，老版就不展开了。</p>
      <blockquote>
        <p>模型是失忆的，记忆是存下来再塞回去。短期记忆管这次对话，长期记忆管这个人。</p>
      </blockquote>

      <Heading id="short-term">短期记忆：checkpointer 是自动的</Heading>
      <p>短期记忆回答一个问题：这次对话前面说了啥。LangGraph 里它的名字叫 checkpointer。用法只有两处，编译的时候传进去，调用的时候给一个 <code>thread_id</code>。</p>
      <pre><code>{`checkpointer = InMemorySaver()
graph = StateGraph(MessagesState)
graph.add_node("reply", reply)
graph.add_edge(START, "reply")
graph.add_edge("reply", END)
graph = graph.compile(checkpointer=checkpointer, store=store)`}</code></pre>
      <p>传进去之后，剩下的活框架全包了，你不用再写一行存取代码。这就是它和长期记忆最大的不同。自动的意思是，每跑完一个节点，框架就把整个图状态存一版快照。下次同一个 <code>thread_id</code> 进来，它先把最新快照加载回来，再接着跑。</p>

      <Heading id="thread-id" level={3}>thread_id 是钥匙</Heading>
      <p>调用的时候，<code>thread_id</code> 是唯一决定你是谁的东西。demo 里我用的是 <code>u1:s1</code> 这种格式，前面是用户，后面是会话，生产里一般写成 <code>f&quot;{'{user_id}:{session_id}'}&quot;</code>，意思一样。</p>
      <pre><code>{`out = graph.invoke(
    {"messages": [HumanMessage(content=text)]},
    config={"configurable": {"thread_id": thread_id}})`}</code></pre>
      <p>同一个 <code>thread_id</code> 就是同一次对话，能接着聊。换一个 <code>thread_id</code>，就是一张白纸，前面说过什么，框架一个字也不会替你捞回来。这不是 bug，这是定义。短期记忆的范围就是一个线程，出了这个线程，它不负责。</p>
      <p>demo 最后四句话里，第二句和第三句的区别，全在这个钥匙上。第二句还是 <code>u1:s1</code>，短期记忆里有第一句。第三句换成了 <code>u1:s2</code>，短期记忆是空的。如果第三句还能答对，那功劳不在短期记忆，在下一节的长期记忆。</p>

      <Heading id="messages-state" level={3}>MessagesState 是载体</Heading>
      <p>checkpointer 存的是什么？存的是图的状态。在这个 demo 里，状态就是 <code>MessagesState</code>，核心只有一个 <code>messages</code> 列表。每次调用，框架先把上次存的列表找回来，把你这句新的 <code>HumanMessage</code> 追加进去，再交给节点。</p>
      <pre><code>{`def reply(state: MessagesState):
    msgs = [SystemMessage(content="你是助手，回答简短，"
                                  "遵守对话里提到的用户偏好。")]
    msgs += state["messages"]
    return {"messages": [model.invoke(msgs)]}`}</code></pre>
      <p>注意这一行：<code>msgs += state[&quot;messages&quot;]</code>。模型看到的，就是这份完整的对话历史。节点返回的 <code>AIMessage</code> 会被框架追加进列表，再存成新的快照。下一轮进来，列表里就多了一问一答。</p>
      <p>这里用的 <code>InMemorySaver</code> 有个老实交代：重启就丢。它只适合跑 demo。生产换成 Redis 的 checkpointer，机制一模一样，只是落盘了。上一篇里我写的那个 360 行版本，工作记忆就是这份 <code>messages</code> 列表，进程一退就没了，道理是通的。</p>

      <Heading id="long-term">长期记忆：store 是手动的</Heading>
      <p>长期记忆回答另一个问题：这个人以前是谁，有啥偏好。LangGraph 里它的名字叫 store。同样是编译的时候传进去，但传进去之后，框架不会替你多干一件事。它只提供三个动作，<code>put</code>、<code>get</code>、<code>search</code>，什么时候查、什么时候写、写什么，全得你自己写代码。</p>
      <pre><code>{`store = InMemoryStore()
graph = graph.compile(checkpointer=checkpointer, store=store)`}</code></pre>
      <p>这句话要反着读。store 不会自动从对话里提炼记忆，你只存了什么，它才有什么。接了向量库也不等于有了长期记忆，向量库只是让 <code>search</code> 按语义找得更准。写的那一步没人替你做，库里就是空的。</p>
      <p>存的也不是聊天原话。demo 里存的是这一条提炼后的事实：「用户不吃香菜，喜欢吃辣」。原话是「我不吃香菜，喜欢吃辣」，存进去的时候去掉了「我」和句式，只留结论。事实和原话分开存，是上一篇就讲过的规矩，画像和事实要精简，原话要完整，混在一起存准出事。</p>

      <Heading id="search-then-write" level={3}>先查后写</Heading>
      <p>长期记忆在 demo 里只有两行，都在 <code>chat()</code> 这个函数里。一行在调模型之前，一行在调模型之后。</p>
      <pre><code>{`hits = store.search((user_id,), query=text)  # 先查
if hits:
    text += "\\n[长期记忆] " + "; ".join(
        h.value["text"] for h in hits)`}</code></pre>
      <p>先查的意思是，回答之前，先按 <code>user_id</code> 去 store 里捞一把。捞到了，就把结果贴在用户那句话后面，格式是 <code>[长期记忆] 用户不吃香菜，喜欢吃辣</code>。模型看到的输入里，就多了这么一行。它不知道这行字从哪来，也不需要知道，它只会照着做：推荐川菜的时候避开香菜，往辣了推。</p>
      <pre><code>{`if "不吃香菜" in text:  # 再写
    store.put((user_id, "profile"), "food",
              {"text": "用户不吃香菜，喜欢吃辣"})`}</code></pre>
      <p>再写的意思是，回答之后，值得留的才存。这里的判断写得很糙，看到「不吃香菜」四个字就存。这是为了让你看清流程，生产里不能这么写。生产里这一步一般换成让模型自己抽取，或者用 LangMem 那套工具，在回答发出之后，后台把本轮对话提炼一两条再写进去，免得挡住当轮回答。</p>
      <p>先查后写，这个顺序别反。先写后查，当轮的记忆会把上一轮的记忆顶掉。只查不写，记忆永远是第一天那几条。只写不查，写了也白写，模型永远看不到。</p>

      <Heading id="user-isolation" level={3}>按 user_id 隔离</Heading>
      <p>store 的钥匙不是 <code>thread_id</code>，是 <code>user_id</code>。demo 里 <code>store.search((user_id,))</code> 和 <code>store.put((user_id, &quot;profile&quot;), ...)</code> 的第一个参数，都是用户。命名空间就是 <code>(用户, 种类)</code> 这样一对括号，种类这里写的是 <code>profile</code>，意思是画像类。</p>
      <p>这就是第三句和第四句的区别。第三句是 <code>u1</code> 换了新会话，<code>search((&quot;u1&quot;,))</code> 还能查到那条偏好。第四句换成了 <code>u2</code>，<code>search((&quot;u2&quot;,))</code> 查不到，模型只能按通用情况推荐，香菜就可能出现在推荐里。隔离不是顺带的，它是长期记忆成立的前提。串了用户，记住就变成了泄密。</p>
      <p>顺带提一句 demo 里的简化。内存版的 <code>InMemoryStore</code> 没有配向量模型，<code>search</code> 基本是按命名空间把条目返回。生产换成 Milvus 这类向量 store，<code>search</code> 才按语义相似度挑最相关的几条。demo 只有一条记忆，两种做法看不出区别，记忆一多，区别就出来了。</p>

      <Heading id="demo">46 行跑一遍</Heading>
      <p>把上面两节拼起来，就是附录里那份 46 行代码。模型是真模型，DeepSeek 的 deepseek-chat，走 <code>https://api.deepseek.com/v1</code>。跑之前先装依赖，再设 key。</p>
      <pre><code>{`pip install langgraph langchain-openai
# Windows: set DEEPSEEK_API_KEY=你的key
# Mac/Linux: export DEEPSEEK_API_KEY=你的key
python memory_demo.py`}</code></pre>
      <p>模型名别填错。DeepSeek 的思考模型 deepseek-reasoner 不支持工具调用，Agent 调工具会直接报错。这里只用它回答问题，用不到工具，也别图省事填 reasoning 那个。温度我设成了 0，意思是让回答尽量稳定，验证的时候好对照。</p>
      <p>主流程是四句话，四个结论。第一句说偏好，第二句同会话问推荐，第三句换新会话问同样的问题，第四句换个人问同样的问题。真模型的措辞每次都不一样，验证的时候看结论不看原话。第三句的关键，是推荐的菜仍然又辣又不放香菜。第四句的关键，是推荐里可以出现香菜。两个关键都对，说明两条记忆线都没断。</p>
      <p>还有一个细节值得跑的时候留意。没有 key 就跑，程序会直接退出，并提示先设 key。这是故意写的。报错信息是给人看的，越早说清楚越好，别等调到模型那一步才报一串认证失败。</p>

      <Heading id="pitfalls">三个坑</Heading>
      <p>下面这三个，都是我写这份 demo、跑这四句话的时候撞上的。第一个是概念坑，后两个是工程坑。</p>
      <ul>
        <li><strong>checkpointer 不是长期记忆。</strong>换一个 thread_id，短期记忆就没了。拿它当长期记忆用，用户一开新会话，偏好全丢，还查不出原因，因为代码里没有任何报错。</li>
        <li><strong>接了向量库不等于有了长期记忆。</strong>向量库只解决 search 怎么找，put 那一步没人写，库里就是空的。先把「先查后写」跑通，再换 Milvus，顺序别反。</li>
        <li><strong>问句不能当成要记的内容。</strong>这个坑上一篇就踩过。第一版看到「我喜欢喝什么？」就记了一条，喜欢那栏填了个「喝什么？」。问句不是陈述，只有用户透露、纠正、明确说「记住」时才写。demo 里用规则写，规则越简单，这个坑越容易露出来。</li>
      </ul>
      <p>这三个坑看着各不相干，毛病都在 harness 这边。模型再聪明，也救不了把短期记忆当长期用、把没写的记忆当已存的、把问句当事实写进去的提取。记忆系统的质量，一大半在这些琐碎的工程细节上。</p>

      <Heading id="closing">写完之后，下一步</Heading>
      <p>这份 demo 故意留了三个口子。第一，内存版重启就丢，生产把 <code>InMemorySaver</code> 换成 Redis 的 checkpointer，把 <code>InMemoryStore</code> 换成 Milvus，调用的地方不用动。第二，聊长了会爆上下文，LangChain 有现成的摘要压缩中间件，到阈值把老消息摘要成一段，只留最近几条。第三，写长期记忆那一步，从规则换成 LLM 抽取，或者直接用 LangMem，让模型在回答发出之后，后台把本轮对话提炼一两条写进去。</p>
      <p>顺序也有讲究。先跑通这 46 行，把「短期自动、长期手动」这个分工刻进脑子里。再换存储，再加压缩，最后才动抽取。反过来做，就是给一个小 demo 背数据库和抽取的债，我吃过这个亏。</p>
      <p>循环本身不用变。上下文产生记忆，记忆回到上下文。下一步我先动存储，内存版换成 Redis 加 Milvus，跑一遍四句话，确认第三句还对，再看抽取后移能省多少延迟。</p>
    </PostLayout>
  );
}

export default PostLangchainMemory;

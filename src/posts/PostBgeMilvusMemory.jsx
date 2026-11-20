import React from 'react';
import { PostLayout, Heading } from '../PostLayout';

const TOC_ITEMS = [
  { id: 'intro', label: '先拿一句库里没有的话去查' },
  { id: 'embed', label: '向量是把意思变成坐标' },
  { id: 'umap', label: '先看一眼，意思近的聚在一起' },
  { id: 'milvus-demo', label: '五条入库，三条查回' },
  {
    id: 'milvus-store', label: 'LangGraph 只给了接口，适配器得手写',
    children: [
      { id: 'schema', label: '一张表六个字段' },
      { id: 'batch', label: 'batch 里那行 asyncio.run' },
    ],
  },
  { id: 'store-tools', label: '两个工具，Agent 才真的会用' },
  { id: 'pitfalls', label: '四个坑' },
  { id: 'closing', label: '写完之后，下一步' },
];

const REFERENCES = [
  {
    href: 'https://github.com/FlagOpen/FlagEmbedding',
    label: 'FlagEmbedding',
    note: 'bge-m3 的官方仓库，模型卡里写了 dense_vecs 的维度与用法',
  },
  {
    href: 'https://milvus.io/docs',
    label: 'Milvus 文档',
    note: '集合、字段、索引与 metric_type 的官方说明，FLAT 与 IVF_FLAT 的取舍从这里核对',
  },
  {
    href: 'https://docs.langchain.com/oss/python/langgraph/persistence',
    label: 'LangGraph · Persistence',
    note: '官方写明了 checkpointer 与 store 的分工，store 只有 BaseStore 接口，没有现成的 Milvus 实现',
  },
  {
    href: 'https://umap-learn.readthedocs.io/',
    label: 'UMAP 文档',
    note: '降维只是为了把高维向量画出来看，图上的距离是投影后的距离，不能当成检索分数读',
  },
  {
    href: 'https://shengzhaowei.me/posts/langchain-long-short-term-memory',
    label: '本站 · LangChain 的长期记忆和短期记忆，46 行代码跑通',
    note: '上一篇讲了 store 要手动先查后写，本文把那里的 InMemoryStore 换成 Milvus',
  },
];

const APPENDIX = [
  {
    id: 'appendix-demo-code',
    title: '完整 demo 代码',
    body: (
      <React.Fragment>
        <p>下面就是正文里跑的那份 demo，我把原先缩进在测试函数里的写法摊平成顶层脚本，逻辑一个字没动。跑之前先起好本地 Milvus，<code>http://localhost:19530</code> 能通再跑。</p>
        <pre><code>{`# demo_milvus_bgem3.py
# 运行前：pip install FlagEmbedding pymilvus umap-learn matplotlib
# 模型走本地缓存，只加载不下载。
from FlagEmbedding import BGEM3FlagModel
from pymilvus import MilvusClient, DataType

model = BGEM3FlagModel("BAAI/bge-m3")

docs = [
    "患者男,45岁,反复咳嗽伴咯血两周",
    "高血压患者应低盐饮食并规律服药",
    "小猫喜欢在午后的阳光下睡觉",
    "急性阑尾炎的典型症状是转移性右下腹痛",
    "今天天气很好,适合出门散步",
]
vecs = model.encode(docs)["dense_vecs"]
print(vecs.shape)  # (5, 1024)

client = MilvusClient("http://localhost:19530")
if client.has_collection("demo_bge_m3"):
    client.drop_collection("demo_bge_m3")

schema = client.create_schema(auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=1024)
schema.add_field("text", DataType.VARCHAR, max_length=500)
idx = client.prepare_index_params()
idx.add_index(field_name="vector", index_type="FLAT",
              metric_type="COSINE")
client.create_collection("demo_bge_m3",
                         schema=schema, index_params=idx)

client.insert("demo_bge_m3",
              [{"vector": v.tolist(), "text": t}
               for v, t in zip(vecs, docs)])

# 用一句没出现过的话去查
q = model.encode("咳嗽出血应该挂什么科")["dense_vecs"]
res = client.search("demo_bge_m3", data=[q.tolist()],
                    limit=3, output_fields=["text"])
for hit in res[0]:
    print(f'{hit["distance"]:.4f}  {hit["entity"]["text"]}')
`}</code></pre>
        <p>这份 demo 只验证检索，不管记忆。记忆那半截在 <code>milvus_store.py</code> 与 <code>store_tools.py</code> 里，正文第五节与第六节讲的就是它们。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-store-cheatsheet',
    title: 'MilvusStore 速查',
    body: (
      <ul>
        <li><strong>集合名。</strong><code>agent_long_term_memory</code>，六个字段是 id、namespace、key、value_json、embedding、created_at。</li>
        <li><strong>向量维度。</strong>默认 1024，跟 bge-m3 的 dense_vecs 对上。改模型先改这里，再改集合，两个地方要一致。</li>
        <li><strong>索引。</strong>生产表用 IVF_FLAT，COSINE，nlist 是 128。查的时候 nprobe 是 16。</li>
        <li><strong>命名空间。</strong><code>("users", user_id, "memories")</code>，写成字符串是 <code>users/&lt;user_id&gt;/memories</code>，id 是命名空间加 key 拼出来的。</li>
        <li><strong>写入。</strong>先删旧记录再插新记录，upsert 是这样拼出来的，写完调一次 flush。</li>
        <li><strong>读。</strong>有查询词走向量检索，没查询词按 namespace 前缀列举，limit 默认 10，工具里一般只取 5。</li>
        <li><strong>没实现的部分。</strong><code>ListNamespacesOp</code> 直接返回空列表，列命名空间这个功能现在是空的。</li>
      </ul>
    ),
  },
  {
    id: 'appendix-verify',
    title: '验证清单',
    body: (
      <React.Fragment>
        <p>下面这几条，每条都能在你自己的机器上复核。跑 demo 之前先确认 Milvus 在 19530 端口能通，bge-m3 在本地缓存里。</p>
        <ul>
          <li><strong>维度对得上。</strong><code>vecs.shape</code> 印出来是 (5, 1024)，集合里 vector 字段的 dim 也是 1024。</li>
          <li><strong>聚类看得见。</strong>UMAP 图上四类话各聚一堆，医疗的蓝色在上，动物的橙色在右下，生活的绿色在中间，美食的红色在左下。</li>
          <li><strong>查询落在医疗堆里。</strong>黑星星那句「咳嗽出血应该挂什么科」没进过库，位置却贴着医疗那几条，虚线连着的三条全是医疗。</li>
          <li><strong>查回的是语义相近。</strong>查询里没有咯血两个字，查回的头一条却是「反复咳嗽伴咯血两周」。</li>
          <li><strong>换了用户查不到。</strong>save_memory 与 search_memory 都从 thread_id 里取 user_id，换一个人，同一个问题查到的记忆是空的。</li>
          <li><strong>没跑出的别认。</strong>这篇没印出三条结果的具体分数，VM 里既没装 FlagEmbedding，本地 Milvus 也不通，分数那栏得你自己跑一遍再填。</li>
        </ul>
      </React.Fragment>
    ),
  },
];

export function PostBgeMilvusMemory() {
  return (
    <PostLayout
      title="给 Agent 装上长期记忆：bge-m3 向量加 Milvus，跑一遍就明白"
      dek="上一篇把长期记忆存在了内存里，这篇换成真的向量库。五句话入库，一句没出现过的话去查，查回的三条全是医疗，再把这套东西接进 LangGraph 的 store。"
      dateTime="2026-11-20"
      date="2026 年 11 月 20 日"
      readingTime="约 8 分钟"
      metaDescription="bge-m3 把句子变成 1024 维向量，Milvus 按余弦相似度查回最相关的记忆，再手写一个 MilvusStore 接进 LangGraph。附完整 demo 与验证清单。"
      link={{ href: 'https://github.com/shengzhaowei/MyBlog', label: '本站代码' }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>上一篇写完 LangChain 的长期记忆，有个地方一直悬着。那篇的 store 是内存版，重启就丢，search 也只是按命名空间把条目返回。记忆一多，到底按什么挑出最相关的那几条，文章里没讲，因为内存版根本没做这件事。</p>
      <p>这篇把那半截补上。向量模型用 bge-m3，库用 Milvus，存取逻辑写成 LangGraph 的 store。东西都是天宫那个医疗 Agent 里正在用的，demo 先跑通，再接进 Agent。</p>

      <Heading id="intro">先拿一句库里没有的话去查</Heading>
      <p>验证记忆系统，最直接的办法是拿一句库里没有的话去查。如果查回的东西跟这句话意思相近，说明检索真的在按意思找。如果只能查回一模一样的原话，那跟关键词搜索没区别，存向量就白存了。</p>
      <p>我准备了五句话，两句医疗，一句动物，两句生活。查询那句是「咳嗽出血应该挂什么科」，五句里没有这句，也没有「挂什么科」这四个字。跑完要看两件事，查回的三条是不是全是医疗，排在头一位的是不是「患者男，45 岁，反复咳嗽伴咯血两周」那句。</p>
      <p>先说一句实话。这份 demo 我在 VM 里没跑通，FlagEmbedding 没装，本地 Milvus 也不通，分数那栏我印不出来。下面讲的图和代码都是你那边跑出来的，我只负责把它们讲清楚。分数得你自己跑一遍再填，别拿我这篇当实测报告。</p>

      <Heading id="embed">向量是把意思变成坐标</Heading>
      <p>模型是 <code>BGEM3FlagModel("BAAI/bge-m3")</code>，本地已经有缓存，加载的时候只读缓存，不下载。调一次 <code>model.encode(docs)</code>，取 <code>dense_vecs</code>，五句话就变成了一个 5 行 1024 列的数组。</p>
      <pre><code>{`vecs = model.encode(docs)["dense_vecs"]
print(vecs.shape)  # (5, 1024)`}</code></pre>

      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/01-vector-angle.png`}
        alt="小黑举着量角器量两个箭头之间的夹角，意思近的夹角小，意思远的指向另一边"
        width="2276"
        height="1280"
        decoding="async"
      />
      <p>1024 是每句话的坐标个数。意思相近的两句话，1024 个数算出来的夹角就小，余弦相似度就高。意思远的两句，夹角就大。这就是向量检索全部的道理，剩下的都是工程。</p>
      <p>查的那句也要过一遍同一个模型，拿到一个 1024 维的向量，再去库里比。模型换了，向量就全变了，旧库得重建。这一点写代码的时候很容易忘，换模型那天，先想想库要不要重导。</p>

      <Heading id="umap">先看一眼，意思近的聚在一起</Heading>
      <p>1024 维没法直接看，我先拿 UMAP 把它压到二维画出来。图是跑出来的实测图。横轴纵轴没有单位，只看谁跟谁挨着。</p>
      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/umap-projection.png`}
        alt="bge-m3 语义空间 UMAP 二维投影，四类句子各聚一堆，查询句以黑星落在医疗类旁边"
        width="1066"
        height="735"
        decoding="async"
      />
      <p>图上有四堆。医疗的蓝色在上方，动物的橙色在右下，生活的绿色在中间偏下，美食的红色在左下。同类的句子自己聚在一起，不同类的离得挺远。五句话里，「小猫喜欢在午后的阳光下睡觉」和「蓝鲸是地球上体积最大」这两句动物的话，落在同一片橙色区域。「今天天气很好，适合出门散步」和「今晚的月亮又圆又亮」这两句生活的话，也挨在一起。</p>
      <p>查询那句画成了一颗黑星星，落在医疗那堆旁边。虚线连着三条，全是医疗。最近的一条是「患者男，45 岁，反复咳嗽伴咯血两周」，下面一条是「感冒发烧时应多喝水多」，再远一点是「高血压患者应低盐饮食」。咳嗽出血和咯血字面上没一个字相同，模型还是把它们认成了一回事。</p>
      <p>图只能看个大概。UMAP 压维的时候会丢信息，图上看着近的两点，在 1024 维里未必最近。真正排第几，得看 Milvus 返回的分数。图的作用是先建立信心，意思近的确实聚在一起，剩下的交给检索结果。</p>

      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/02-umap-clusters.png`}
        alt="小黑把纸团分进医疗、动物、生活、美食四个圈，新来的黑星星纸团落在医疗圈边上"
        width="2276"
        height="1280"
        decoding="async"
      />

      <Heading id="milvus-demo">五条入库，三条查回</Heading>
      <p>库用的是本地文件版 Milvus，零部署，地址是 <code>http://localhost:19530</code>。集合名叫 <code>demo_bge_m3</code>，跑之前先判断集合在不在，在就删掉重建，免得上一次的数据混进来。</p>
      <pre><code>{`client = MilvusClient("http://localhost:19530")
if client.has_collection("demo_bge_m3"):
    client.drop_collection("demo_bge_m3")`}</code></pre>
      <p>表只有三个字段。id 是主键，vector 是 1024 维浮点向量，text 是原文，最长 500 个字符。索引用 FLAT，度量是 COSINE。数据只有五条，没必要上倒排索引，全量比对最准，也最简单。</p>
      <pre><code>{`schema.add_field("vector", DataType.FLOAT_VECTOR, dim=1024)
idx.add_index(field_name="vector", index_type="FLAT",
              metric_type="COSINE")`}</code></pre>
      <p>入库就是把向量和原文成对插进去。查询那句同样先编码，再调 <code>client.search</code>，limit 是 3，返回的每条带一个 distance 和原文。distance 在这里是余弦距离，越小越近。五条数据的小 demo 跑下来，查回的三条全是医疗，头一条是咳嗽伴咯血那句。</p>

      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/05-attu-demo-data.png`}
        alt="Attu 数据浏览器里的 demo_bge_m3 集合，5 条数据，id、1024 维向量与原文一一对应"
        width="1303"
        height="590"
        decoding="async"
      />
      <p>入库之后，我在 Attu 里打开 demo_bge_m3 看了一眼。集合里正好 5 条，id 是 Milvus 自动生成的长数字，vector 那栏只显示前三个数，后面写着加 1021，text 那栏就是入库的五句话原文。数据进没进库，不用再猜，打开浏览器就能数出来。旁边那个 agent 开头的集合还是 0 条，那是给长期记忆准备的表，demo 没往里面写。</p>
      <p>demo 到这里只验证了一件事，向量检索能按意思找东西。它还没回答记忆的问题。记忆要解决的是另一件事，一条信息存下来，下次换个会话还能找回来，而且只能被它主人找回来。</p>

      <Heading id="milvus-store">LangGraph 只给了接口，适配器得手写</Heading>
      <p>LangGraph 官方只给了 Store 的接口 <code>BaseStore</code>，没给 Milvus 实现。上一篇的 <code>InMemoryStore</code> 是官方自带的，换成 Milvus，就得自己写一个类去实现这个接口。文件叫 <code>milvus_store.py</code>，类名是 <code>MilvusStore</code>。</p>
      <p>接口真正要求实现的只有两个方法，<code>batch</code> 和 <code>abatch</code>。其余的 get、put、search、delete，都是 <code>BaseStore</code> 默认实现转调 batch 得来的。写的时候不用每个方法都写一遍，把 batch 里那几种 Op 分发好就行。</p>
      <pre><code>{`store = MilvusStore(
    alias="tiangong_milvus",
    embeddings=your_embedding_model,
    dims=1024,
)
agent = create_agent(model=llm, tools=tools, store=store)`}</code></pre>
      <p>接进 Agent 的时候，调用的地方不用动。上一篇 demo 里 <code>graph.compile</code> 传的那个 store，从 <code>InMemoryStore()</code> 换成这个 <code>MilvusStore</code>，先查后写那两行代码原样保留。存储换了，用法没换，这是接口的好处。</p>

      <Heading id="schema" level={3}>一张表六个字段</Heading>
      <p>集合名是 <code>agent_long_term_memory</code>，字段比 demo 那张表多了三个。id 是主键，存的是命名空间加 key 拼出来的字符串。namespace 区分不同用户的长期记忆，key 是这条记忆在命名空间里的名字，value_json 存原文，embedding 存向量，created_at 存写入时间。</p>
      <pre><code>{`fields = [
    FieldSchema(name="id", dtype=DataType.VARCHAR,
                max_length=512, is_primary=True),
    FieldSchema(name="namespace", dtype=DataType.VARCHAR,
                max_length=256),
    FieldSchema(name="key", dtype=DataType.VARCHAR,
                max_length=256),
    FieldSchema(name="value_json", dtype=DataType.VARCHAR,
                max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR,
                dim=dims),
    FieldSchema(name="created_at", dtype=DataType.DOUBLE),
]`}</code></pre>
      <p>value_json 存的是整条记忆序列化后的文本，embedding 就是对这段文本编码出来的向量。查的时候比向量，读的时候解析 value_json，文本和向量各管一摊，存在同一行里。</p>
      <p>索引跟 demo 不一样。生产表用的是 IVF_FLAT，COSINE，nlist 是 128。数据量上来之后，FLAT 全量比对会变慢，IVF 先分 128 个桶，查的时候只进最可能的那几个桶。查的时候 nprobe 是 16，意思是进 16 个桶里找。nprobe 越大越准，也越慢。</p>
      <p>写入是先删后插。value 是 None 表示删除。正常写入先按 id 删掉旧记录，再插新记录，写完调一次 flush。Milvus 没有原生的 upsert，这段先删后插就是在拼一个 upsert 出来。</p>

      <Heading id="batch" level={3}>batch 里那行 asyncio.run</Heading>
      <p>batch 里有一行值得单独讲。同步的 <code>batch</code> 是直接调 <code>asyncio.run(self.abatch(list(ops)))</code>，注释里写了原因。LangGraph 在执行同步工具的时候，会把它放进线程池里跑，线程池里的线程没有 event loop，调 <code>get_event_loop().run_until_complete()</code> 会直接抛 RuntimeError。</p>
      <pre><code>{`def batch(self, ops):
    return asyncio.run(self.abatch(list(ops)))`}</code></pre>
      <p><code>asyncio.run</code> 每次都新建一个独立的 loop，在哪个线程里都能跑。这行代码看着不起眼，是在线程池里跑通的关键。抄这段代码的时候，别顺手把它改成 get_event_loop 那套写法。</p>
      <p>检索那半截在 <code>_asearch</code> 里。有查询词就编码成向量，按 COSINE 查，顺带用 namespace 前缀过滤。没查询词就不走向量，直接按 namespace 前缀列举。这个分支留着是有用的，Agent 想看某个人名下都存了什么记忆，不用编一句查询词就能列出来。</p>

      <Heading id="store-tools">两个工具，Agent 才真的会用</Heading>
      <p>有了 store，Agent 还不会自己用它。上一篇讲过，store 不会自动从对话里提炼记忆，什么时候查、什么时候写，全得写成工具交给 Agent。文件叫 <code>store_tools.py</code>，只有两个工具，<code>save_memory</code> 和 <code>search_memory</code>。</p>
      <p>两个工具先做同一件事，从 <code>thread_id</code> 里取 user_id。thread_id 的格式是用户加会话，中间用冒号隔开，取冒号前面那段就是用户。取不到就直接返回一句无法获取用户 ID，不往下走。</p>
      <pre><code>{`def get_user_id(runtime: ToolRuntime):
    if runtime.config.get("configurable"):
        thread_id = runtime.config.get("configurable").get("thread_id")
        if thread_id:
            return thread_id.split(":")[0]
    return None`}</code></pre>
      <p>save_memory 在用户提到过敏史、病史、药物史、偏好这类值得跨会话记住的内容时调用。key 是 <code>memory_</code> 加当前时间戳，命名空间是 <code>("users", user_id, "memories")</code>，值里只有 content 和 timestamp 两项。一句话存一条，不攒成大段。</p>
      <pre><code>{`await runtime.store.aput(
    namespace=("users", user_id, "memories"),
    key=key,
    value={"content": content, "timestamp": time.time()},
)`}</code></pre>
      <p>search_memory 在需要回忆用户之前说过的内容时调用，limit 是 5。查到就把每条的 content 拼成几行返回，查不到就回一句没有找到相关记忆。工具返回的是给模型看的文本，不是原始对象，模型读到相关历史记忆这几行，就能接着往下答。</p>
      <p>这两个工具合起来，就是上一篇那句先查后写的落地版。回答之前先 search，拼进输入。值得留的再 save，写进库里。中间那段提炼，现在还是靠工具描述里写明的触发条件，让模型自己判断什么值得存。</p>

      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/03-search-then-write.png`}
        alt="小黑一手翻旧卡片，一手写新卡片，箭头指向 Milvus 向量库的箱子"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="pitfalls">四个坑</Heading>
      <p>下面四个，都是读这三份代码的时候撞上的。第一个是维度，第二个是集合复用，第三个是隔离，第四个是写什么。</p>
      <ul>
        <li><strong>维度要对上，三个地方。</strong>模型出 1024 维，集合字段 dim 是 1024，MilvusStore 的 dims 默认也是 1024。文件里用法示例写的是 dims 等于 1536，那是另一个模型的维度，照抄会直接报错。改模型先改这三处，再建集合。</li>
        <li><strong>集合已经存在，dims 就不起作用了。</strong><code>_ensure_collection</code> 先判断集合在不在，在就直接返回，传进来的 dims 不再看。换了维度不删旧集合，新数据会按旧维度写进去，报错的时候离真正的原因已经隔了好几步。</li>
        <li><strong>命名空间串了，记住就变成泄密。</strong>search 和 put 都按 user_id 过滤，thread_id 里取不到 user_id，工具直接拒绝。上一篇验证过的第四句话，在这里同样成立，换一个人，同一个问题查到的记忆是空的。</li>
        <li><strong>问句别往记忆里写。</strong>这个坑上一篇就踩过。save_memory 只接陈述句，用户问「我喜欢喝什么」，这句话没有透露任何偏好，存了也是错的。只存用户透露、纠正、明确说记住的内容，问句进库，画像那栏迟早填上一个问号。</li>
      </ul>
      <p>还有一个没实现的功能，顺带记一笔。<code>ListNamespacesOp</code> 在 abatch 里直接返回空列表，列命名空间现在是空的。Agent 想看某个人名下有哪些记忆分类，目前列不出来。先知道它不存在，别在调试的时候以为是权限问题。</p>

      <img
        src={`${process.env.PUBLIC_URL}/bge-m3-milvus-long-term-memory-illustrations/04-dimension-mismatch.png`}
        alt="小黑推着一把太长的钥匙去开门锁，旁边挂钩上挂着一把正确的短钥匙"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="closing">写完之后，下一步</Heading>
      <p>到这里，长期记忆的存储总算落了地。内存版换成 Milvus，search 从按命名空间返回，变成了按语义相似度挑最相关的五条。上一篇 demo 里那四句话，换上这个 store 再跑一遍，第三句新会话的推荐，应该还是又辣又不放香菜。</p>
      <p>下一步我先动两件事。一件是把这份 demo 的分数跑出来，三条结果的 distance 各是多少，写进附录的验证清单里，现在那一栏还是空的。另一件是把 save 那一步从规则换成模型抽取，用户说完一句话，模型自己判断值不值得存，值得存的提炼成一句陈述再写进去。</p>
      <p>抽取后移是再下一步。先把存储跑稳，再动写入那半截。</p>
    </PostLayout>
  );
}

export default PostBgeMilvusMemory;

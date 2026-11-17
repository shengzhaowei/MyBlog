import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
import { Compare } from '../figures';

const TOC_ITEMS = [
  { id: 'intro', label: '引言' },
  { id: 'chatbi', label: 'ChatBI 还是 Agent，先分清' },
  { id: 'architecture', label: '四层架构，只读是底线' },
  { id: 'semantic', label: '语义层才是本体' },
  { id: 'permission', label: '权限与安全，在数据层强制执行' },
  { id: 'evaluation', label: '没有评测就没有改进' },
  { id: 'test-data', label: '测试数据要像真的一样' },
  { id: 'kernel', label: '不用重写内核' },
  { id: 'closing', label: '收尾，上线之前' },
];

const REFERENCES = [
  {
    href: 'https://github.com/Eynzof/Hermes-CN-Core',
    label: 'Hermes-CN-Core',
    note: '本文所用 Agent 内核的上游开源项目',
  },
  {
    href: 'https://modelcontextprotocol.io/',
    label: 'Model Context Protocol',
    note: '数据服务与内核之间的 MCP 协议',
  },
  {
    href: 'https://github.com/Canner/WrenAI',
    label: 'WrenAI',
    note: '开源 Text-to-SQL 项目，语义层的参考实现',
  },
  {
    href: 'https://github.com/eosphoros-ai/DB-GPT',
    label: 'DB-GPT',
    note: '开源数据库对话框架，Text-to-SQL 的另一条路线',
  },
  {
    href: '/posts/agent-evaluation-with-fixed-evidence',
    label: '本站文章 · 用固定证据评测已经上线的 Agent',
    note: '本文评测一节的方法论在那篇文章里有更完整的展开',
  },
];

const APPENDIX = [
  {
    id: 'appendix-checklist',
    title: '四层架构速查',
    body: (
      <React.Fragment>
        <p>每一层只做一件事，出问题能定位到层。</p>
        <ul>
          <li><strong>客户端。</strong>业务人员提问的入口；登录一次，随处可用；只展示答案，不直连数据库。</li>
          <li><strong>网关层。</strong>身份鉴权、审计日志、限流熔断；谁在什么时候问了什么，都有记录。</li>
          <li><strong>理解层。</strong>语义层、表路由、SQL 生成与校验；这是最难的一层，也是本文的重点。</li>
          <li><strong>数据层。</strong>只读账号、行级权限、只读查询；模型永远不直连生产库。</li>
        </ul>
        <p>三条红线摆在这里。所有查询只读。权限在数据层强制执行，不写在提示词里。答案必须附带依据，可以复核。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'appendix-annotation',
    title: '表注解模板',
    body: (
      <React.Fragment>
        <p>语义层里每张表一份注解。注解是唯一可编辑的源头，改口径只改这里。</p>
        <pre><code>{`表名：发货明细表
业务含义：每一次发货的明细行，一行对应一个产品的一次发货
关键字段：单据号、产品编码、数量、换算系数、状态（正常 / 退货 / …）
业务口径：销量 = 数量 × 换算系数，再求和；退货行的数量为负数
示例 SQL：按产品汇总当年销量（略）
注意事项：不要直接对数量求和；中文查询记得加 N 前缀`}</code></pre>
      </React.Fragment>
    ),
  },
];

export function PostErpAgent() {
  return (
    <PostLayout
      title="给 ERP 接上自然语言查询，一次数据智能体实践手记"
      dek="把一句中文问题变成可信的数字，口径、权限和评测比模型更难。"
      dateTime="2026-11-13"
      date="2026 年 11 月 13 日"
      readingTime="约 6 分钟"
      metaDescription="给 ERP 接自然语言查询的一次实践记录，讲四层架构、语义层、行级权限、黄金题库评测，以及为什么不需要重写 Agent 内核。"
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>业务人员想查一个数，先找 IT 写 SQL，再等报表排期。一个简单问题，某车间今年销量多少，从提需求到拿到数字，经常按天算。报表能答固定问题，答不了临时起意的问题。</p>
      <p>我们给 ERP 接了自然语言查询。业务人员用中文问，系统查 ERP 回答，全程只读，一行生产数据没改过。数字错了是经营误判，权限错了是数据泄露，写错一笔是生产事故，所以项目第一天就定了三条边界，只读、可审计、权限在数据层。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/05-waiting-number.png`}
        alt="小黑坐在取号窗口前捏着问题纸条等叫号"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="intro">引言</Heading>
      <p>问答本身不难。答出来的数字能不能信，只给该看的人看，不动生产数据，这三件事没一样是模型自己能管的。</p>
      <p>所以我们先把边界定下来，再谈模型。只读，可审计，权限放在数据层。边界定好了，后面每一步都有地方落。</p>

      <Heading id="chatbi">ChatBI 还是 Agent，先分清</Heading>
      <p>动手之前，先把两个词分开。ChatBI 是只读问答，问、查、答。Agent 是读写执行，问、查、判断、执行、回执。ChatBI 是 Agent 的一个子集，风险也最小，适合当起点。</p>

      <Compare
        title="同一句提问，两种形态"
        caption="两种形态的分界线是权限。能不能写数据，决定了它只是问答还是真的执行。"
        pairs={[{
          id: 'chatbi-vs-agent',
          prompt: '同样问一句查一下库存，两种形态有什么不同？',
          before: {
            label: 'ChatBI（只读问答）',
            body: '问、查、答。读错一个数，最多是一场误会，复核一下就能纠正。先让问这件事可信，再谈别的。',
          },
          after: {
            label: 'Agent（读写执行）',
            body: '问、查、判断、执行、回执。写错一笔单就是事故，需要审批、回滚、审计全套机制。等问可信了再谈做。',
          },
        }]}
      />

      <p>我们选了 ChatBI 当 MVP，架构按 Agent 留口子。接口、权限、审计都按能执行写操作的强度来设计，第一阶段只开放只读查询。读可信了，写的口子才敢开。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/06-comparison-two-doors.png`}
        alt="两扇门对照，左边 ChatBI 只读问答开着小门，右边 Agent 读写执行挂着锁链的大门，分界线是权限"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="architecture">四层架构，只读是底线</Heading>
      <p>整个系统分四层，客户端、网关层、理解层、数据层。问题向下走，答案原路向上回。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/03-architecture-tower.png`}
        alt="小黑守着四层小楼，客户端、网关层、理解层、数据层，最底层上了锁"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p><strong>客户端</strong>是业务人员提问的入口，做成桌面端，登录一次，随处可用。它只展示答案，不直连数据库。<strong>网关层</strong>做身份鉴权、审计日志和限流熔断，谁在什么时候问了什么，都有记录，出了问题能追溯。</p>
      <p><strong>理解层</strong>是核心，语义层、表路由、SQL 生成与校验都在这里。<strong>数据层</strong>是 ERP 的只读账号，查询走只读权限，行级权限在这里强制执行。</p>
      <p>不直连，是为了边界清晰才好守。模型永远不碰生产库，查询账号只有读权限，SQL 要过白名单和黑名单检查，还有限行数和超时。哪一层出问题，就定位到哪一层，不用猜是不是模型又幻觉了。</p>

      <Heading id="semantic">语义层才是本体</Heading>
      <p>模型写 SQL 现在已经不错了。卡住的地方在语义层。模型不知道你们公司的销量是什么意思，库存该看哪张表，某车间对应哪个编码，这些知识不在模型里，在业务里。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/01-caliber-press.png`}
        alt="小黑摇手摇压面机，问题纸条从上面进，数字票从下面出"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>语义层的做法是每张表一份注解，写清业务含义、关键字段、业务口径和示例 SQL。注解是唯一可编辑的源头，改口径只改注解，表路由和 SQL 生成跟着变。问题来了先做表路由，按注解找到相关表，再写 SQL。路由错了，后面全错。</p>
      <p>口径错，数字全错。销量不是数量直接求和，要先乘换算系数再求和，不然不同包装规格会被混在一起。库存要看库存汇总表。物料主数据里的安全库存只是预警线，不是现货。这类口径不写进注解，模型只能靠猜。</p>
      <p>中文查询还有自己的麻烦。简称、口语、模糊指代，今年是哪一年，那个车间是哪个编码，都要映射到标准维度。语义层的工作量占了整个项目的大头，大概七成。模型只是最后一公里。</p>

      <Heading id="permission">权限与安全，在数据层强制执行</Heading>
      <p>权限的第一原则是别写在提示词里。在提示词里写只能看自己的数据，模型可能遵守也可能不遵守，等于没写。权限必须在数据层强制执行。</p>
      <ul>
        <li><strong>行级权限。</strong>车间只能看到自己车间的数据，辅助部门看全公司。这个过滤发生在数据库层，由行级安全策略执行，与模型无关。</li>
        <li><strong>只读账号。</strong>查询账号只有读权限，SQL 只允许 SELECT，写操作在白名单和黑名单两道关口就被拦下。</li>
        <li><strong>审计。</strong>谁问了什么、查了哪张表、返回了多少行，全部记日志。</li>
      </ul>
      <p>这里有个容易踩的坑。会话级的权限状态会跟着数据库连接走。连接池把一条带权限的连接复用给下一个人，下一个人的查询可能带着上一个人的权限。做法是关掉连接池，或者每次新建连接，权限状态绝不能跨会话复用。</p>
      <p>桌面端登录走本地登录，企业单点登录已在改版中移除。调用查询服务的凭证仍有有效期，过期要重新登录。桌面端存凭证要用系统级的安全存储，不要把密钥写进配置文件。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/02-permission-gate.png`}
        alt="小黑抱着大红挂锁守在生产库保险库前的铁栅门外"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="evaluation">没有评测就没有改进</Heading>
      <p>凭感觉调提示词，改好改坏是不知道的。评测的做法是建一个黄金题库，每道题有自然语言问题、标准 SQL 和标准答案。跑一遍 Agent，逐题打分。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/04-eval-sort.png`}
        alt="小黑把考卷投进四个信箱，路由错、口径错、权限错、编造答案"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>打分只比一件事，SQL 的执行结果。不比 SQL 字符串，写法不同但结果一致就算对。数字比对给一点容差，空结果按零算。</p>
      <p>失败一定要分类。路由错、口径错、权限错、编造答案，分类之后才知道改哪里。路由错改语义层，口径错补注解，编造答案加护栏。不分类的评测只会告诉你有几道题错了，帮不上忙。</p>
      <p>流程上有三条规矩。先跑基线再改动，没有基线分数，调优就是凭感觉。每次改动后回归，分数掉了说明改坏了。上线后把用户真实问过的问题采样、标注，好的补进题库，题库越滚越大。评测的完整做法，可以看本站的另一篇文章《用固定证据评测已经上线的 Agent》。</p>

      <Heading id="test-data">测试数据要像真的一样</Heading>
      <p>评测和开发都不能拿生产数据做，需要假数据。假数据太假，评测就失真。分布不对，口径问题测不出来。关联不对，权限问题测不出来。</p>
      <ul>
        <li><strong>固定种子。</strong>同一份脚本两次运行结果完全一致，标准答案才不会漂移。</li>
        <li><strong>量级按真实规模缩放。</strong>各表行数按真实样本量等比缩小，保持相对比例。</li>
        <li><strong>分布符合业务。</strong>状态占比、逐年增长、退货比例，都按真实分布给，不用均匀随机。</li>
        <li><strong>关联要自洽。</strong>成品归属唯一的车间，近几年有生产记录；请验单自制与外购按真实比例分；发货单的产品只写成品。</li>
        <li><strong>号段隔离。</strong>生成数据和手工准备的受控行用不同号段，互不污染，否则评测的期望值会被生成数据冲掉。</li>
      </ul>
      <p>输出形式应该是生成器脚本，别直接给数据。一百万行贴不下对话，脚本可以重复运行、改分布、扩规模。先按百分之一试跑，校验通过再全量。</p>

      <Heading id="kernel">不用重写内核</Heading>
      <p>想做 Agent 开发，是不是要先设计一套自己的 Agent 加 harness？不用。内核用开源的，原样用，不改源码。定制发生在三层，工具层是数据服务和业务工具，管控层是登录、审计和部署形态，评测层是题库、打分和回归。</p>
      <p>读内核源码是学习的最好方式。主循环、工具调用、上下文是怎么拼的，看懂它就理解 harness 是怎么回事了。也可以写个两百行左右的最小循环当练手，但生产上还是用成熟框架。把时间花在语义层和评测上，比重写内核划算得多。</p>

      <img
        src={`${process.env.PUBLIC_URL}/erp-agent-chatbi-illustrations/07-framework-ready-engine.png`}
        alt="现成的发动机，中央是开源内核，周围是工具层、管控层、评测层三个定制"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="closing">收尾，上线之前</Heading>
      <p>上线之前有一份几十项的检查清单。代码合入、口令与凭据、真实库权限、服务部署、端到端验证、回滚方案、上线后观察，逐项打勾。清单本身不难，难的是诚实，没验证的项不要打勾。</p>
      <p>下一步是内网联调，真实问题回流，逐步放开只读范围。口径、权限、评测这三件事做扎实了，换哪个模型都能跑。没做扎实，换再强的模型也没用。</p>
    </PostLayout>
  );
}

export default PostErpAgent;

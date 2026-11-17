import React from 'react';
import { PostLayout, Heading } from '../PostLayout';
import { Compare, DotGrid, LineChart, MetricChart } from '../figures';

const formatPercent = (value) => (
  Number.isInteger(value) ? `${value}%` : `${Number(value).toFixed(2)}%`
);

const TOC_ITEMS = [
  { id: 'feedback-trace', label: '反馈来了，先还原现场' },
  { id: 'fixed-scene', label: '评测的前提是固定问题现场' },
  { id: 'metrics', label: '质量优先，再看延迟和成本' },
  { id: 'rubric', label: '五档评分，参考答案不是唯一答案' },
  { id: 'tuning', label: '调优过程会被评测抓住回落' },
  { id: 'models', label: '比较模型时，只改模型这一项' },
  { id: 'keep', label: '把修过的问题留下来' },
];

const REFERENCES = [
  {
    href: 'https://mp.weixin.qq.com/s/7e9NZZGUJa3titSHleOtXg',
    label: '得物技术 · 压测AI Agent 治理与评测调优实践',
    note: '本文评测方法与案例数据的主要来源',
  },
  {
    href: 'https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge',
    label: 'Langfuse · LLM-as-a-Judge',
    note: '用模型评测器对输出做语义评分的官方说明',
  },
  {
    href: 'https://langfuse.com/docs/evaluation/get-started/offline',
    label: 'Langfuse · Evaluate with Datasets',
    note: '用固定数据集做离线实验与回归评测的操作路径',
  },
  {
    href: 'https://langfuse.com/docs/evaluation/experiments/datasets',
    label: 'Langfuse · Datasets',
    note: '把生产 Trace 沉淀为可重复测试用例的数据模型',
  },
];

const APPENDIX = [
  {
    id: 'score-guide',
    title: '五档评分速查',
    body: (
      <React.Fragment>
        <p>下面是我对原文评分标准的归纳，便于回看，不是评测器提示词的原文。分数只从这五档中取，不取中间值。</p>
        <ul>
          <li><strong>1。</strong>已经全面解决用户的主要问题，覆盖主要评分点，没有实质性错误或矛盾；可以缺少不影响解决问题的次要细节。</li>
          <li><strong>0.75。</strong>主要问题已经解决，核心结论正确，覆盖大部分主要评分点；只有轻微遗漏或表述不完整。</li>
          <li><strong>0.5。</strong>覆盖了部分主要评分点，对解决问题有帮助，但有重要内容缺失、局部错误，或未满足用户明确提出的重要约束。</li>
          <li><strong>0.25。</strong>只覆盖少量主要评分点，核心结论不完整或不清晰，对解决问题只有有限帮助。若主要问题没有被解决，评分不得高于这一档。</li>
          <li><strong>0。</strong>与参考答案的核心结论相反、内容无关、输出为空，或没有覆盖任何有效期望内容。</li>
        </ul>
        <p>另外几条容易被忽略的边界，表达方式、推理路径或结构与参考答案不同，但语义一致，不应扣分；缺少次要评分点不应大幅扣分；补充了参考答案里没有的内容，不因此加分，只要不与核心结论或用户约束矛盾，也不应扣分；关键证据缺失会直接影响结论的可信度或可执行性时，评分不得高于 0.75；不得用评测器自己的知识推翻参考答案的核心结论。</p>
      </React.Fragment>
    ),
  },
  {
    id: 'source-metrics',
    title: '原文阶段性指标摘录',
    body: (
      <React.Fragment>
        <p>以下数字均摘自得物技术原文中的阶段性记录，用于说明「质量、延迟、成本要一起看，且中间可能回落」。它们对应不同统计范围，不能直接互相换算。</p>
        <ul>
          <li><strong>deepseek-v4-flash 007 系列（001 到 007）。</strong>评测解决率由 61.67% 升至 96.15%，平均延迟由 175 秒降至 113 秒，平均 Trace 成本由 $0.586780 降至 $0.198030。各轮显示 16 项执行成功；执行成功只表示分析运行完成，不等于方案已经合格。</li>
          <li><strong>中间回落。</strong>006 比 005 更快、更省，但评分从 92.31% 回落到 83.33%；007 再回到 96.15%。</li>
          <li><strong>Dubbo 专项。</strong>按原文给出的新版本结果，专项评测由约 50% 提升至 90%。专项、整体阶段区间和单轮 96.15% 对应不同统计范围。</li>
          <li><strong>模型对比（实验名称「HTTP &amp; Dubbo场景，第四轮」）。</strong>候选模型为 deepseek-v4-flash、qwen3.8-flash 和 glm5.3-flash。该组记录里 DeepSeek 的方案评分最高，GLM 的平均延迟最低。Qwen 与 GLM 的成本显示为 0.00，原文也说明尚不能确认是未产生费用还是计费未接入，因此不能据此比较成本。这批结果被原文明确为阶段性参考，还不足以形成正式选型结论。</li>
        </ul>
      </React.Fragment>
    ),
  },
  {
    id: 'controls',
    title: '评测对照清单',
    body: (
      <ul>
        <li><strong>验证一次修复时。</strong>固定数据集、Mock 证据、模型、评测器和执行预算，只改要验证的 Skill、规则或分析流程。</li>
        <li><strong>比较候选模型时。</strong>固定 Agent 实现、数据集、Mock 证据和评测器，只切换模型，并对每个模型重复运行。</li>
        <li><strong>结果波动大的 Case。</strong>不要只看单次最高分，应重复运行，同时看平均值、P95 延迟和成本波动。</li>
        <li><strong>高低分与争议案例。</strong>抽样人工复核；若发现评测器遗漏了有效解决路径，先修订期望答案，再用统一版本重测。</li>
        <li><strong>线上是否真的修好。</strong>离线评分通过之后，仍要用一次真实调试来确认。</li>
      </ul>
    ),
  },
];

export function PostAgentEvaluation() {
  return (
    <PostLayout
      title="用固定证据评测已经上线的 Agent"
      dek="固定问题现场、五档语义评分、质量与成本一起看。评测只回答一件事，改动到底有没有用。"
      dateTime="2026-11-11"
      date="2026 年 11 月 11 日"
      readingTime="约 8 分钟"
      metaDescription="从得物压测 Agent 的评测实践出发，整理如何用固定证据、五档评分和对照实验，验证已经上线的 Agent 是否真的变好。"
      link={{
        href: 'https://mp.weixin.qq.com/s/7e9NZZGUJa3titSHleOtXg',
        label: '原文：得物技术',
      }}
      toc={TOC_ITEMS}
      references={REFERENCES}
      appendixSections={APPENDIX}
    >
      <p>压测调不通，报错往往不止一处。协议、脚本、请求响应、执行日志、调用链，核对一圈下来，时间已经过去了。得物把智能分析 Agent 接进这条流程，让它先收材料，再给初步排查。脚本要改，它先把改法摆出来，人确认了才写回去。</p>
      <p>这套东西上线以后，最难办的反馈是分析不准。结论错了，毛病可能藏在证据采集、工具调用、规则校验这些环节里，也可能出在模型推理那一步。只看最后那份方案，找不出是哪一步出的错，也没法说下一次改完就一定对了。评测就是为了把这事钉住。同一份问题现场，同一个输入和证据，让不同版本的 Agent 各跑一遍，再比方案、延迟和成本。方法和数字都来自<a href="https://mp.weixin.qq.com/s/7e9NZZGUJa3titSHleOtXg" target="_blank" rel="noopener noreferrer">得物技术最近一篇关于压测智能分析 Agent 的治理实践</a>，引用处我标了出处。</p>

      <Heading id="feedback-trace">反馈来了，先还原现场</Heading>
      <p>压测调试是用户问题最集中的地方。平台协议多，脚本组件多，一次报错要核对场景配置、脚本、请求响应、执行日志和调用链。Agent 接进来以后，这些材料由它先收，初步排查和建议也由它先给。脚本要改，它先把改法摆出来，人确认了才写回去。用户还是从调试页面发起分析，没变。变的是治理要问的那句，这次分析是怎么走到这个结论的。</p>
      <p>上线以后，日常迭代就是两件事轮着来。先是有人说方案没有解决问题，得回到当时的输入、工具调用和中间证据，找出是哪一环出的错。再是修完以后，在同样的上下文和证据下回测一遍，确认原问题修好了，也确认没带进新的偏差。</p>
      <p>这两件事都得靠完整的过程记录。原文把 Langfuse 放在治理里，位置定得很清楚。它不管业务诊断，只留输入输出、工具调用、耗时和成本，再把用户反馈、调用证据和评测结果挂到同一次执行上。拿到 Trace ID，事后的一条反馈才能重新变成一次能检查的分析现场。先核对调用时间、业务场景、用户输入和 Agent 版本，再展开关键工具节点，看问题出在证据缺失、工具失败、规则处理偏差，还是模型没用好手头已有的证据。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-evaluation-with-fixed-evidence-illustrations/03-flowchart-restore-scene.png`}
        alt="四步流程图：一条反馈、拿到 Trace ID、核对与展开、定位问题"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>现场还原了，还得有个去处。方案不足、初步原因、待复核内容，登记进待治理队列，留着做后续修复和回归样本。进队列只说明问题被记下来了，离修好还差一步。修完以后能不能在同一个现场里重新打分，才算走完这一趟。</p>

      <Heading id="fixed-scene">评测的前提是固定问题现场</Heading>
      <p>回测要是每次都去打当天的线上数据，前后两次分数就没法比。环境变了，实例变了，日志被滚动掉了，分数涨了，你也说不清是 Agent 变好了，还是现场碰巧变简单了。评测的规矩就一条，让不同版本面对同一个问题、同一份业务上下文和同一份诊断证据，只动要验证的那一项。</p>
      <p>原文的做法是把用户问题、场景配置、脚本、日志和请求响应固化成评测 Case，每个 Case 配一份人工校对过的参考答案。回测的时候，用 Mock 返回跟原始问题一致的证据，线上数据再怎么变也干扰不到比较。有一点要说清楚，跑的还是真实的 Agent。它照正常流程调工具、读 Mock 证据、分析问题、生成方案，最后由评测器给实际输出打分。固定的是问题输入和工具证据，分析和答案每次都重新跑。</p>
      <blockquote>
        <p>要比的是同一现场里的不同实现。时间不同，现场也不同，那没法比。</p>
      </blockquote>
      <p>对照关系也得写明白。验证一次 Skill、规则或者分析流程的改动，数据集、Mock 证据、模型、评测器和执行预算都固定，只改要验证的那一部分。比较候选模型，就固定 Agent 实现和评测配置，只换模型。结果波动大的 Case 要重复跑，单次最高分说了不算。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-evaluation-with-fixed-evidence-illustrations/01-fixed-scene-clothesline.png`}
        alt="小黑拉紧晾衣绳，绳上夹着同一张现场纸，风吹不动"
        width="2048"
        height="1152"
        decoding="async"
      />

      <Heading id="metrics">质量优先，再看延迟和成本</Heading>
      <p>一套评测至少要同时看三样东西，方案质量、响应延迟、使用成本。质量先看。质量差不多的时候，才轮到延迟和成本做取舍。正式比较不能只看平均值，P95 延迟、成本波动、重复跑的稳定性都得看。平均值很容易把极端情况抹平。</p>
      <p>原文给了一组阶段性记录，正好说明这三样为什么必须一起看。deepseek-v4-flash 的 007 系列，从 001 到 007，评测解决率从 61.67% 升到 96.15%，平均延迟从 175 秒降到 113 秒，平均 Trace 成本从 $0.586780 降到 $0.198030。数字很好看，原文也写明白了，各轮显示的执行成功只说明分析跑完了，不等于方案已经合格。这些差值要归因，还得回到同样的样本、评分规则和版本变更上去看。</p>
      <p>中间那段更值得看，它不是单调往上走的。006 比 005 更快、更省，评分却从 92.31% 掉到 83.33%，到 007 才回到 96.15%。当时只看延迟和成本，很容易把一次质量回退当成优化成功。评测系统就是在这种时候把回落抓住，再带回低分案例里分析。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-evaluation-with-fixed-evidence-illustrations/02-regression-leaking-bucket.png`}
        alt="小黑往木桶里倒水，桶底有洞，水位漏到 83"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>两张图只画原文点过名的数字。两端是 001 和 007，质量、延迟、成本同时在场。中间单独抽出 005 到 007，那次回落原文点了名。002 到 004 没有单列的解决率，图上留空，不补。</p>
      <MetricChart
        title="001 与 007，质量、延迟、成本"
        caption="数字来自得物技术原文中 deepseek-v4-flash 007 系列的阶段性记录。三项单位不同，各自按自己的最大值缩放，柱长不能互相换算。各轮显示的执行成功只表示分析跑完，不等于方案合格。"
        series={[
          { key: 'v001', name: '001', tone: 'baseline' },
          { key: 'v007', name: '007', tone: 'good' },
        ]}
        groups={[
          {
            label: '评测解决率',
            bars: [
              { key: 'v001', value: 61.67, display: '61.67%' },
              { key: 'v007', value: 96.15, display: '96.15%' },
            ],
          },
          {
            label: '平均延迟',
            bars: [
              { key: 'v001', value: 175, display: '175 秒' },
              { key: 'v007', value: 113, display: '113 秒' },
            ],
          },
          {
            label: '平均 Trace 成本',
            bars: [
              { key: 'v001', value: 0.58678, display: '$0.586780' },
              { key: 'v007', value: 0.19803, display: '$0.198030' },
            ],
          },
        ]}
      />
      <LineChart
        title="原文点名的四个解决率"
        caption="数字来自得物技术原文，001 为 61.67%，005 为 92.31%，006 为 83.33%，007 为 96.15%。001 与 005 之间没有连线。纵轴从 60% 画到 100%，只是为了看清 006 的回落，不是另有一组从 60% 起算的数据。006 更快、更省，但这两轮的秒数和金额原文没有单列，所以这张图只有解决率。"
        xLabel="版本"
        x={[1, 5, 6, 7]}
        yMin={60}
        yMax={100}
        yTicks={[60, 70, 80, 90, 100]}
        formatX={(value) => String(value).padStart(3, '0')}
        formatY={formatPercent}
        pointLabels
        endLabels={false}
        marker={{ at: 6, label: '回落' }}
        series={[
          {
            key: 'solve',
            name: '评测解决率',
            tone: 'good',
            values: [61.67, 92.31, 83.33, 96.15],
            connect: [false, true, true],
          },
        ]}
      />

      <Heading id="rubric">五档评分，参考答案不是唯一答案</Heading>
      <p>方案质量不能靠看着差不多来拍板。排查类的输出尤其这样，同一个问题可以有不同的表述和推理路径。原文用模型评审，也就是 LLM-as-a-Judge，以人工校对过的期望答案为主要依据，看实际输出在语义上是不是一致，关键内容有没有被覆盖到。</p>
      <p>评测器收三样东西。用户原始问题用来弄清目标和约束，人工期望答案是评分的基准，Agent 的实际输出是要评的东西。还有一条边界得写进规则里，参考答案不是唯一的标准答案，实际输出也不用复现它的推理过程、措辞、结构、证据顺序或者风格。评测看的是实际输出有没有在语义上解决用户的主要问题。写没写出同一篇文字，不在评分里。</p>
      <p>分数只从五档里取，1、0.75、0.5、0.25、0，不取别的数。完整覆盖主要评分点，又没有实质性错误，可以给 1。主要问题解决了，只剩轻微遗漏，给 0.75。只覆盖了部分要点，或者有重要缺失，给 0.5。对解决问题只有有限帮助，给 0.25。核心结论相反、内容无关或者输出为空，给 0。规则还定了上限，主要问题没解决，最高只能给 0.25。解决了，但缺少重要内容或者用户明确要求的约束，最高只能给 0.5。缺了关键证据，结论的可信度或者可执行性会直接受影响，最高只能给 0.75。</p>

      <img
        src={`${process.env.PUBLIC_URL}/agent-evaluation-with-fixed-evidence-illustrations/04-infographic-five-tiers.png`}
        alt="五格量杯：1、0.75、0.5、0.25、0 五档评分，附三条上限规则"
        width="2048"
        height="1152"
        decoding="async"
      />

      <p>五档收成五个点，悬停、点按或者用方向键，都能读到这一档在原文里的边界。</p>
      <DotGrid
        title="五档评分"
        caption="归纳自得物技术原文的评分标准，分数只从这五档里取。完整表述、包括上限和几条容易忽略的边界，见文末附录的五档评分速查。"
        columns={5}
        legend={[
          { tone: 'good', label: '1，已经解决' },
          { tone: 'good-soft', label: '0.75，轻微遗漏' },
          { tone: 'baseline', label: '0.5，重要缺失' },
          { tone: 'warn', label: '0.25，帮助有限' },
          { tone: 'bad', label: '0，没有解决' },
        ]}
        groups={[
          {
            id: 'rubric',
            title: '由左到右',
            countLabel: '1、0.75、0.5、0.25、0，不取中间值',
            items: [
              {
                id: 'score-1',
                tone: 'good',
                short: '1',
                label: '1 · 已经解决',
                detail: '已经全面解决用户的主要问题，覆盖主要评分点，没有实质性错误或矛盾。可以缺少不影响解决问题的次要细节。',
              },
              {
                id: 'score-075',
                tone: 'good-soft',
                short: '0.75',
                label: '0.75 · 轻微遗漏',
                detail: '主要问题已经解决，核心结论正确，覆盖大部分主要评分点；只有轻微遗漏或表述不完整。',
              },
              {
                id: 'score-05',
                tone: 'baseline',
                short: '0.5',
                label: '0.5 · 重要缺失',
                detail: '覆盖了部分主要评分点，对解决问题有帮助，但有重要内容缺失、局部错误，或未满足用户明确提出的重要约束。',
              },
              {
                id: 'score-025',
                tone: 'warn',
                short: '0.25',
                label: '0.25 · 帮助有限',
                detail: '只覆盖少量主要评分点，核心结论不完整或不清晰，对解决问题只有有限帮助。主要问题没有被解决时，评分不得高于这一档。',
              },
              {
                id: 'score-0',
                tone: 'bad',
                short: '0 · 没有解决',
                detail: '与参考答案的核心结论相反、内容无关、输出为空，或没有覆盖任何有效期望内容。',
              },
            ],
          },
        ]}
      />
      <p>还有几条很实际。缺少次要评分点，不应该大幅扣分。补充了参考答案里没有的内容，只要不跟核心结论或者用户约束矛盾，不加分，也不扣分。只出现在参考答案里、用户又没有明确要求的条目，只能当参考，不能变成硬性扣分项。评测器不能用自己的知识推翻参考答案的核心结论。原文要求评测器只返回分数，不输出理由。自动汇总是干净了，事后抽查就更重要。高低分和争议案例要人工复核，期望答案有问题就改，改完用统一版本重测。</p>

      <Heading id="tuning">调优过程会被评测抓住回落</Heading>
      <p>有了固定现场和统一评分，调优就不再是凭感觉说这次更好。原文拿 Dubbo 调试当例子。这类问题跟环境、服务和方法配置都有关，还牵扯场景编排和执行状态。人工排查的时候，日志里的一句话往往只是个入口，根因还在后面。</p>
      <p>比如“Consumer is shutting down”。只凭这句话，没法判断任务为什么停。得核对是不是把注册中心地址误当成了直连地址，注册协议和命名空间对不对。“No provider available”呢，得逐项对照环境、命名空间、分组和版本，再分清是配置不匹配、实例不可用，还是被路由过滤掉了。Failfast 或者泛化调用对不上方法，先核对那个环境下的方法契约和参数类型，别把一个不存在的方法名直接改成另一个现成的方法。</p>
      <p>这些经验只留在人脑子里，Agent 下次还会在同一类问题上晃一下。原文把能编码的部分交给了程序。采集归命令行工具，解析脚本、拉取契约、执行校验、生成问题候选和证据索引归 Python。模型读组件知识和分析指引，结合原始证据确认或者修正候选，再输出根因和修改方案。规则命中了，还不等于最终诊断。它只是把该核对什么变成了可以重复的步骤。</p>
      <p>回测的结果就是看这种做法站不站得住。按原文的新版本记录，Dubbo 专项评测由约 50% 提升至 90%，成了整体改善的重要来源。前面那次 006 的回落也得一起记住。专项变好了，整体变好了，个别轮次还是可能出现质量下滑。评测就是为了在有效和回退同时出现的时候，分清哪边是哪边。</p>
      <MetricChart
        title="Dubbo 专项评测"
        caption="数字来自得物技术原文的新版本记录，专项评测由约 50% 提升至 90%。约是原文的说法，柱的起点按 50% 画。这是专项口径，与上面 007 系列的 96.15% 不是同一统计范围。"
        series={[
          { key: 'before', name: '原先', tone: 'baseline' },
          { key: 'after', name: '新版本', tone: 'good' },
        ]}
        groups={[
          {
            label: '专项评测',
            bars: [
              { key: 'before', value: 50, display: '约 50%' },
              { key: 'after', value: 90, display: '90%' },
            ],
          },
        ]}
      />

      <Heading id="models">比较模型时，只改模型这一项</Heading>
      <p>Agent 的知识、规则和执行流程都会影响分析结果，模型本身也得单独比。一边换模型，一边改提示词或者工具，最后的分数差就说不清该记在谁头上。</p>
      <p>原文整理了同一阶段的历史记录，实验名称是 HTTP &amp; Dubbo场景，第四轮。候选模型是 deepseek-v4-flash、qwen3.8-flash 和 glm5.3-flash。这组数据里，DeepSeek 的方案评分最高，GLM 的平均延迟最低。Qwen 和 GLM 的成本显示为 0.00，原文也写了，现在还确认不了，是实际没有产生费用，还是计费数据没有接进来。所以成本这一项没法比。</p>
      <p>这类对照最容易被写成选型结论，原文写得很克制。这批记录只能反映当时版本下的阶段性表现。数据集、Agent 和评测器版本要先统一起来，每个模型再重复跑，才谈得上正式比较。选的时候还是先看方案质量，质量接近了，再比延迟、成本和多次运行的稳定性。数据缺了一项，就别用这一项做决定。</p>
      <p>实验没有给出可以并列的分数，我不另画柱状图。下面能切换的只有两边，一边是原文提醒不要写成的读法，一边是原文实际停住的地方。</p>
      <Compare
        title="这组模型记录能说明什么"
        caption="左侧是原文提醒不要写成的读法，右侧是原文允许的说法。实验名称是 HTTP &amp; Dubbo场景，第四轮，候选模型为 deepseek-v4-flash、qwen3.8-flash 和 glm5.3-flash。这里没有补任何原文没给的分数。"
        pairs={[
          {
            id: 'one-variable',
            prompt: '比较模型时，还可以一起改提示词吗？',
            before: {
              label: '混在一起改',
              body: '一边换模型，一边改提示词或工具。最后的分数差说不清该记在谁头上。',
            },
            after: {
              label: '只改模型',
              body: '固定 Agent 实现、数据集、Mock 证据和评测器，只切换模型，并对每个模型重复运行。',
            },
          },
          {
            id: 'ranking',
            prompt: 'HTTP & Dubbo场景，第四轮里，谁更好？',
            before: {
              label: '容易写成的结论',
              body: '方案评分最高的是 DeepSeek，平均延迟最低的是 GLM，于是可以直接选定。',
            },
            after: {
              label: '原文停住的地方',
              body: '这组记录里 DeepSeek 的方案评分最高，GLM 的平均延迟最低。它只反映当时版本的阶段性表现，还不足以形成正式选型结论。',
            },
          },
          {
            id: 'cost',
            prompt: 'Qwen 和 GLM 的成本显示 0.00，能说它们更便宜吗？',
            before: {
              label: '把 0.00 当成更便宜',
              body: '成本是 0.00，所以比 DeepSeek 省。',
              mark: ['0.00'],
            },
            after: {
              label: '原文的限制',
              body: 'Qwen 与 GLM 的成本显示为 0.00。目前无法确认是实际没有产生费用，还是计费数据尚未接入，因此不能据此比较成本。',
              mark: ['0.00'],
            },
          },
        ]}
      />

      <Heading id="keep">把修过的问题留下来</Heading>
      <p>Trace 把一条主观反馈落到具体证据上。漏查还是误读，发生在哪一步能看见。执行失败也一样。能编码的经验交给程序，语义判断交给模型。修过的问题连同 Mock 现场和人工期望一起留下来，后续版本继续在同一个现场里接受检验。</p>
      <p>离线分数通过了，线上不一定修好了。原文把用户再次调试的结果当作最后的确认。一次排查的高分可能是偶然的，下一次还能不能复用，还能不能被证伪，得靠后面一次次的检验来回答。</p>
      <p>压测之外的地方，这套方法照样用得上。Agent 进了真实业务，评测就不是上线前的一次性检查。现场固定，标准统一，一次只改一个变量。经验可以先被人总结出来，过一遍同一套评测，才知道它管不管用。</p>
    </PostLayout>
  );
}

export default PostAgentEvaluation;

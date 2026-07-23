"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "./chapters";

const stories = [
  ["苏醒于状态回廊","探测员「诺伊」在失忆中醒来。深渊没有地图，只有环境对每次行动作出的回应。","建立第一条感知—行动—奖励回路，为远征核心供能。"],
  ["星光有远近","回廊尽头漂浮着一条奖励星河。近处的光容易取得，远处的光却可能开启真正的出口。","校准折扣镜片，决定远方奖励在今天还剩多少价值。"],
  ["未来的回声","星河的光汇入价值波场。诺伊发现每个位置都保存着未来可能性的回声。","让未来价值反向传播，为未知区域绘制第一张价值图。"],
  ["晶洞的诱惑","价值图指向三条晶洞岔路，但最亮的路可能只是一次偶然好运。远征第一次面对选择。","在好奇与确信之间找到节奏，识别真正稳定的奖励源。"],
  ["结局才能回答","岔路后的记忆剧场会保存整段旅程。只有抵达终点，沿途选择的意义才会显现。","完成整条轨迹，让最终回报倒流并评价每个曾经的状态。"],
  ["时间出现裂缝","等待结局太慢，深渊开始坍缩。诺伊必须在每一步之后立刻从下一刻借来答案。","捕捉时间差误差，在旅程尚未结束时持续更新价值。"],
  ["悬崖边的策略","捷径贴着无底悬崖延伸。理论上的最短路线，遇到仍会探索的诺伊却异常危险。","让学习考虑自己真正会采取的下一步，找到可执行的安全航线。"],
  ["离开自己的脚印","安全航线之外是一座价值迷宫。诺伊要从混乱行动中学习一条并未亲自完整走过的最优路线。","用下一状态的最大价值更新当前判断，让知识超越当前策略。"],
  ["地图装不下世界","迷宫向无数维度展开，Q 表格在诺伊手中碎裂。相似状态必须共享经验。","用少量参数塑造连续价值地形，把一次经验推广到邻近区域。"],
  ["记忆工厂启动","参数地形接入深层网络后开始震荡。连续经验彼此纠缠，目标也不断移动。","启动经验回放与目标网络，让神经估值在噪声中稳定下来。"],
  ["策略风暴","诺伊不再绕道估计每个动作，而是直面行动概率本身。每次回报都会改变风向。","顺着回报加权的梯度，直接提高有益行动出现的概率。"],
  ["双核议会","单独行动的策略风暴方差太大。深渊唤醒了评价核心，与行动核心共同决策。","让 Actor 提案、Critic 评价，用优势信号协调两种学习。"],
  ["深渊闸门","最终区域的策略能量极不稳定。一次过猛更新足以抹去此前全部经验。","穿过 PPO 裁剪闸门，用受限制的小步更新完成强化学习远征。"],
] as const;

const controls = [
  ["环境噪声",0,100,35],["折扣 γ",0,100,88],["传播速度",10,100,58],["探索率 ε",0,100,32],
  ["轨迹长度",3,12,7],["学习率 α",1,100,24],["探索风险",0,100,28],["乐观程度",0,100,70],
  ["特征数量",3,30,12],["回放批量",4,64,32],["策略步长",1,100,22],["评价权重",0,100,62],["裁剪范围",5,40,20],
] as const;

export function ChapterExperience({ slug }: { slug: string }) {
  const index = Math.max(0, chapters.findIndex((chapter) => chapter.slug === slug));
  const chapter = chapters[index];
  const [collapsed, setCollapsed] = useState(false);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<"steady"|"bold">("steady");
  const spec = controls[index];
  const [parameter, setParameter] = useState<number>(spec[3]);
  useEffect(() => {
    const mobileCollapse = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 900px)").matches) setCollapsed(true);
    }, 0);
    if (!running) return;
    const id = window.setInterval(() => setTick((value) => value + 1), 650 / speed);
    return () => { window.clearTimeout(mobileCollapse); window.clearInterval(id); };
  }, [running, speed]);
  const normalized = (parameter - spec[1]) / (spec[2] - spec[1]);
  const progress = Math.min(100, 12 + (tick % 80) + normalized * 12);
  const stability = Math.max(8, Math.min(99, 91 - normalized * 34 + Math.sin(tick * .3) * 7 + (mode === "steady" ? 8 : -5)));
  const reward = Math.max(0, 18 + normalized * 54 + (tick % 9) * 2 + (mode === "bold" ? 8 : 0));

  return <main className={`lesson-shell lesson-${chapter.slug} ${collapsed ? "nav-collapsed" : ""}`}>
    <aside className="lesson-nav">
      <div className="nav-brand"><Link href="/"><span>Ω</span><div><b>算法深渊</b><small>REINFORCEMENT LEARNING</small></div></Link><button aria-label={collapsed ? "展开目录" : "折叠目录"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? "»" : "«"}</button></div>
      <div className="nav-progress"><i style={{ width:`${(index + 1) / chapters.length * 100}%` }} /><span>{index + 1} / {chapters.length}</span></div>
      <nav>{chapters.map((item, itemIndex) => <Link key={item.slug} href={`/rl/${item.slug}`} className={item.slug === chapter.slug ? "active" : ""}><span>{item.slug}</span><div><b>{item.title}</b><small>{item.zone}</small></div>{itemIndex < index && <em>✓</em>}</Link>)}</nav>
    </aside>
    <section className="lesson-main">
      <header className="lesson-top"><button onClick={() => setCollapsed(!collapsed)}>☰ <span>学习目录</span></button><div>WORLD AUTO-RUNNING <i /></div></header>
      <div className="lesson-stage">
        <div className="lesson-heading"><span>LEVEL {chapter.slug} / {chapter.en}</span><h1>{chapter.title}</h1><p>{chapter.question}</p></div>
        <World chapter={chapter.slug} tick={tick} intensity={normalized} mode={mode} />
        <div className="watch-card"><small>这一关看什么</small><p>{chapter.watch}</p><i>观察即可 · 画面会自动演化</i></div>
      </div>
      <section className="story-brief">
        <div className="story-id"><span>远征记录</span><b>{chapter.slug}</b></div>
        <div><small>{stories[index][0]}</small><p>{stories[index][1]}</p></div>
        <div className="mission"><small>本关任务</small><p>{stories[index][2]}</p></div>
      </section>
      <section className="lab-panel">
        <div className="lab-heading"><div><span>LIVE EXPERIMENT</span><h2>{chapter.zone}控制台</h2><p>只改变一个关键量，然后观察世界如何自行演化。</p></div><div className="lab-actions"><button onClick={()=>setRunning(!running)}>{running?"Ⅱ 暂停":"▶ 继续"}</button>{[1,2,4].map(value=><button key={value} className={speed===value?"active":""} onClick={()=>setSpeed(value)}>×{value}</button>)}<button onClick={()=>setTick(0)}>↻</button></div></div>
        <div className="lab-grid">
          <article className="parameter-card"><small>关键参数</small><label><b>{spec[0]}</b><em>{parameter}{index===1||index===3||index===12?"%":""}</em></label><input aria-label={spec[0]} type="range" min={spec[1]} max={spec[2]} value={parameter} onChange={event=>setParameter(Number(event.target.value))}/><div className="mode-switch"><button className={mode==="steady"?"active":""} onClick={()=>setMode("steady")}>稳健模式</button><button className={mode==="bold"?"active":""} onClick={()=>setMode("bold")}>激进模式</button></div><p>{normalized<.34?"当前设置偏低：变化更克制，学习信号较弱。":normalized>.7?"当前设置偏高：变化明显，但更容易出现震荡。":"当前处于平衡区间，适合观察基本规律。"}</p></article>
          <article className="telemetry-board"><small>实时遥测</small><div><span><i>学习进度</i><b>{progress.toFixed(0)}%</b></span><em><i style={{width:`${progress}%`}}/></em></div><div><span><i>稳定性</i><b>{stability.toFixed(0)}%</b></span><em><i style={{width:`${stability}%`}}/></em></div><div><span><i>累计回报</i><b>{reward.toFixed(0)}</b></span><em><i style={{width:`${Math.min(100,reward)}%`}}/></em></div></article>
          <article className="signal-chart"><small>最近 32 步信号</small><div>{Array.from({length:32},(_,i)=><i key={i} style={{height:`${12+((i*17+tick*5+parameter)%76)}%`,opacity:i>25?1:.35+i/45}}/>)}</div><p>参数改变后，柱形的振幅和收敛节奏会立即响应。</p></article>
        </div>
      </section>
      <div className="lesson-explain"><div><small>核心直觉</small><p>{chapter.insight}</p></div><div className="lesson-formula"><small>最小公式</small><b>{chapter.formula}</b></div></div>
      <section className="concept-deck">
        <article><span>01</span><div><small>先看状态</small><h3>发生了什么变化？</h3><p>不要先读公式。观察画面里哪个量先改变、哪个量随后响应。</p></div></article>
        <article><span>02</span><div><small>再动参数</small><h3>把滑杆推向两端</h3><p>极端设置最容易暴露算法的取舍，再回到中间比较稳定状态。</p></div></article>
        <article><span>03</span><div><small>最后解释</small><h3>用公式复述画面</h3><p>如果你能指出公式中的每一项对应画面里的什么，本关就算通过。</p></div></article>
      </section>
      <footer className="lesson-pagination">
        {index > 0 ? <Link href={`/rl/${chapters[index - 1].slug}`}>← <span>上一关</span><b>{chapters[index - 1].title}</b></Link> : <span />}
        {index < chapters.length - 1 ? <Link href={`/rl/${chapters[index + 1].slug}`}><span>下一关</span><b>{chapters[index + 1].title}</b> →</Link> : <Link href="/rl/01"><span>完成篇章</span><b>重新探索</b> ↻</Link>}
      </footer>
    </section>
  </main>;
}

function World({ chapter, tick, intensity, mode }: { chapter: string; tick: number; intensity: number; mode: "steady"|"bold" }) {
  const active = tick % 6;
  if (chapter === "01") return <div className="world world-loop"><div className="loop-orbit">{["状态","动作","奖励","新状态"].map((x,i)=><i key={x} className={active%4===i?"on":""}>{x}</i>)}</div><b className="world-agent" style={{transform:`rotate(${active*90}deg) translateX(150px) rotate(${-active*90}deg)`}}>A</b></div>;
  if (chapter === "02") return <div className="world world-return">{[9,6,4,3,2,1].map((v,i)=><i key={i} style={{opacity:Math.max(.12,1-i*(1-intensity)*.2),transform:`scale(${1-i*(1-intensity)*.13}) translateY(${Math.sin((tick+i)*.7)*18}px)`}}><b>+{v}</b><small>γ^{i}</small></i>)}</div>;
  if (chapter === "03") return <div className="world world-bellman"><b>V(s)</b>{[0,1,2,3].map(i=><i key={i} style={{animationDelay:`${i*.45}s`}}/>)}<span>R + γV(s′)</span></div>;
  if (chapter === "04") { const chosen = (tick%100)/100<intensity ? active%3 : 2; return <div className="world world-epsilon"><div className="epsilon-core">ε<small>{intensity.toFixed(2)}</small></div>{["?","◆","★"].map((x,i)=><i key={x} className={chosen===i?"chosen":""}><b>{x}</b><small>Q {(0.2+i*.25+Math.sin((tick+i)*.3)*.08).toFixed(2)}</small></i>)}<span className={chosen===2?"exploit":"explore"}>{chosen===2?"利用当前最优":"探索未知分支"}</span></div>; }
  if (chapter === "05") return <div className="world world-film">{[0,1,2,3,4,5].map((_,i)=><i key={i} className={i<=active?"on":""}><b>{i===5?"★":`S${i}`}</b><small>{i===5?"+10":"0"}</small></i>)}<span style={{width:`${(active+1)*15}%`}}>完整回报倒流</span></div>;
  if (chapter === "06") return <div className="world world-td">{[0,1,2,3,4].map((_,i)=><i key={i} className={active%5===i?"on":""}>S{i}</i>)}<b style={{left:`${12+(active%5)*19}%`}}>δ</b></div>;
  if (chapter === "07") return <div className="world world-cliff"><div className="safe"><i style={{left:`${(tick*7)%90}%`}}/>SARSA · 安全</div><div className="risky"><i style={{left:`${(tick*11)%90}%`}}/>最短 · 危险</div><span>CLIFF</span></div>;
  if (chapter === "08") return <div className="world world-grid">{Array.from({length:64},(_,i)=><i key={i} className={i===55?"goal":i===active*9?"agent":""} style={{opacity:.15+((i*17+tick*5)%80)/100}}/>)}<b>max Q</b></div>;
  if (chapter === "09") return <div className="world world-surface">{Array.from({length:34},(_,i)=><i key={i} style={{height:`${18+((i*23+tick*3)%72)}%`}}/>)}<b>Q(s,a; θ)</b></div>;
  if (chapter === "10") return <div className="world world-network"><div>{Array.from({length:9},(_,i)=><i key={i} className={(i+tick)%3===0?"on":""}>e{i}</i>)}</div><span>REPLAY</span><section>{[3,5,4,3].map((n,l)=><div key={l}>{Array.from({length:n},(_,i)=><i key={i}/>)}</div>)}</section><b>TARGET</b></div>;
  if (chapter === "11") return <div className="world world-policy">{["←","↑","→"].map((x,i)=><i key={x} style={{height:`${25+((tick*(i+2)+i*21)%62)}%`}}><b>{x}</b></i>)}<span>∇J(θ)</span></div>;
  if (chapter === "12") return <div className="world world-ac"><div>ACTOR<small>π(a|s)</small></div><i style={{transform:`scaleX(${.55+(active/10)})`}}>A(s,a)</i><div>CRITIC<small>V(s)</small></div></div>;
  return <div className="world world-ppo"><div className="clip" style={{left:`${42-intensity*18}%`,right:`${42-intensity*18}%`}}/><i style={{left:`${18+(tick*(mode==="bold"?11:7))%65}%`}}>π</i><span>0.8</span><span>1.2</span><b>CLIPPED UPDATE</b></div>;
}

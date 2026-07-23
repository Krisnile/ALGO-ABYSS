"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "./chapters";

const stories = [
  ["苏醒于状态回廊","探测员「Kize」在失忆中醒来。深渊没有地图，只有环境对每次行动作出的回应。","建立第一条感知—行动—奖励回路，为远征核心供能。"],
  ["星光有远近","回廊尽头漂浮着一条奖励星河。近处的光容易取得，远处的光却可能开启真正的出口。","校准折扣镜片，决定远方奖励在今天还剩多少价值。"],
  ["未来的回声","星河的光汇入价值波场。Kize 发现每个位置都保存着未来可能性的回声。","让未来价值反向传播，为未知区域绘制第一张价值图。"],
  ["晶洞的诱惑","价值图指向三条晶洞岔路，但最亮的路可能只是一次偶然好运。远征第一次面对选择。","在好奇与确信之间找到节奏，识别真正稳定的奖励源。"],
  ["结局才能回答","岔路后的记忆剧场会保存整段旅程。只有抵达终点，沿途选择的意义才会显现。","完成整条轨迹，让最终回报倒流并评价每个曾经的状态。"],
  ["时间出现裂缝","等待结局太慢，深渊开始坍缩。Kize 必须在每一步之后立刻从下一刻借来答案。","捕捉时间差误差，在旅程尚未结束时持续更新价值。"],
  ["悬崖边的策略","捷径贴着无底悬崖延伸。理论上的最短路线，遇到仍会探索的 Kize 却异常危险。","让学习考虑自己真正会采取的下一步，找到可执行的安全航线。"],
  ["离开自己的脚印","安全航线之外是一座价值迷宫。Kize 要从混乱行动中学习一条并未亲自完整走过的最优路线。","用下一状态的最大价值更新当前判断，让知识超越当前策略。"],
  ["地图装不下世界","迷宫向无数维度展开，Q 表格在 Kize 手中碎裂。相似状态必须共享经验。","用少量参数塑造连续价值地形，把一次经验推广到邻近区域。"],
  ["记忆工厂启动","参数地形接入深层网络后开始震荡。连续经验彼此纠缠，目标也不断移动。","启动经验回放与目标网络，让神经估值在噪声中稳定下来。"],
  ["策略风暴","Kize 不再绕道估计每个动作，而是直面行动概率本身。每次回报都会改变风向。","顺着回报加权的梯度，直接提高有益行动出现的概率。"],
  ["双核议会","单独行动的策略风暴方差太大。深渊唤醒了评价核心，与行动核心共同决策。","让 Actor 提案、Critic 评价，用优势信号协调两种学习。"],
  ["深渊闸门","最终区域的策略能量极不稳定。一次过猛更新足以抹去此前全部经验。","穿过 PPO 裁剪闸门，用受限制的小步更新完成强化学习远征。"],
] as const;

const controls = [
  ["环境噪声",0,100,35],["折扣 γ",0,100,88],["传播速度",10,100,58],["探索率 ε",0,100,32],
  ["轨迹长度",3,12,7],["学习率 α",1,100,24],["探索风险",0,100,28],["乐观程度",0,100,70],
  ["特征数量",3,30,12],["回放批量",4,64,32],["策略步长",1,100,22],["评价权重",0,100,62],["裁剪范围",5,40,20],
] as const;

const dialogue = [
  ["这里没有地图。每次回应，就是地图的一笔。","我先迈出一步，你替我记录环境的回答。"],
  ["近处的光很暖，但最远那颗星像在呼唤我。","转动 γ 镜片，看看未来会不会消失。"],
  ["听见了吗？未来正在对现在说话。","每一圈波纹，都会改写我脚下的位置。"],
  ["最亮的不一定最好，也许只是它刚好运。","替我保留一点怀疑——那就是 ε。"],
  ["先别评价这一步，等故事走到结局。","终点出现时，所有记忆都会得到答案。"],
  ["深渊等不了完整结局，我们必须边走边学。","δ 闪烁时，就是预期与现实相撞的瞬间。"],
  ["我知道捷径在哪，但我也知道自己还会犯错。","能活着抵达的路线，才是真正可执行的策略。"],
  ["即使此刻走偏，我仍能学习那条最好的路。","把目光越过我的脚印，看下一格最大的 Q。"],
  ["表格碎了……但相似的地方应该共享记忆。","调整 θ，让一条经验改变整片地形。"],
  ["记忆太连续，网络开始把巧合当成规律。","打乱它们，再让旧目标慢一点追上来。"],
  ["这一次，我不再选择道路——我要改变风。","高回报会让那股行动之风更强。"],
  ["我负责行动，另一个我负责质疑。","当双核意见一致，策略才值得前进。"],
  ["最后的闸门不允许鲁莽。","小步并不慢；不摔回深渊，才是真正的快。"],
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
  const stability = Math.max(8, Math.min(99, 91 - normalized * 34 + Math.sin(tick * .3) * 7 + (mode === "steady" ? 8 : -5)));
  const reward = Math.max(0, 18 + normalized * 54 + (tick % 9) * 2 + (mode === "bold" ? 8 : 0));

  return <main className={`lesson-shell lesson-${chapter.slug} ${collapsed ? "nav-collapsed" : ""}`}>
    <aside className="lesson-nav">
      <div className="nav-brand"><Link href="/"><span>Ω</span><div><b>算法深渊</b><small>REINFORCEMENT LEARNING</small></div></Link><button aria-label={collapsed ? "展开目录" : "折叠目录"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? "»" : "«"}</button></div>
      <div className="nav-progress"><i style={{ width:`${(index + 1) / chapters.length * 100}%` }} /><span>{index + 1} / {chapters.length}</span></div>
      <nav>{chapters.map((item, itemIndex) => <Link key={item.slug} href={`/rl/${item.slug}`} className={item.slug === chapter.slug ? "active" : ""}><span>{item.slug}</span><div><b>{item.title}</b><small>{item.zone}</small></div>{itemIndex < index && <em>✓</em>}</Link>)}</nav>
    </aside>
    <section className="lesson-main">
      <header className="lesson-top"><button onClick={() => setCollapsed(!collapsed)}>☰ <span>学习目录</span></button><a href="#minigame">🎮 进入小游戏</a><div>WORLD AUTO-RUNNING <i /></div></header>
      <div className="lesson-stage">
        <SceneFX chapter={chapter.slug} tick={tick} />
        <div className="lesson-heading"><span>LEVEL {chapter.slug} / {chapter.en}</span><h1>{chapter.title}</h1><p>{chapter.question}</p><a className="play-now" href="#minigame"><b>PLAY</b><span>进入本关小游戏</span><i>↓</i></a></div>
        <World chapter={chapter.slug} tick={tick} intensity={normalized} mode={mode} />
        <div className="watch-card"><small>这一关看什么</small><p>{chapter.watch}</p><i>观察即可 · 画面会自动演化</i></div>
        <div className="noe-companion"><div className="pixel-noe"><i/><i/><b/><em/></div><div><small>KIZE / 深渊探测员</small><p>“{dialogue[index][tick%12<6?0:1]}”</p></div></div>
      </div>
      <section className="story-brief">
        <div className="story-id"><span>远征记录</span><b>{chapter.slug}</b></div>
        <div><small>{stories[index][0]}</small><p>{stories[index][1]}</p></div>
        <div className="mission"><small>本关任务</small><p>{stories[index][2]}</p></div>
      </section>
      <section className={`lab-panel lab-${chapter.slug}`} id="minigame">
        <div className="lab-heading"><div><span>PLAYABLE MISSION · GAME {chapter.slug}</span><h2>{chapter.zone}像素任务</h2><p>这里就是本关小游戏。完成任务，让算法规律在操作中显现。</p></div><div className="lab-actions"><button onClick={()=>setRunning(!running)}>{running?"Ⅱ 暂停":"▶ 继续"}</button>{[1,2,4].map(value=><button key={value} className={speed===value?"active":""} onClick={()=>setSpeed(value)}>×{value}</button>)}<button onClick={()=>setMode(value=>value==="steady"?"bold":"steady")}>{mode==="steady"?"稳":"激"}</button><button onClick={()=>setTick(0)}>↻</button></div></div>
        <MiniGame chapter={chapter.slug} tick={tick} parameter={parameter} setParameter={setParameter} spec={spec} />
        <div className="game-telemetry"><span>STEP <b>{tick}</b></span><span>STABILITY <b>{stability.toFixed(0)}%</b></span><span>REWARD <b>{reward.toFixed(0)}</b></span><span>MODE <b>{mode==="steady"?"稳健":"激进"}</b></span></div>
        <Instrument chapter={chapter.slug} tick={tick} parameter={parameter} intensity={normalized} />
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

function SceneFX({ chapter, tick }: { chapter:string; tick:number }) {
  if (chapter==="05") return <div className="scene-fx film-reel"><i/><i/><span>MEMORY / {String(tick%100).padStart(2,"0")}</span></div>;
  if (chapter==="07") return <div className="scene-fx cliff-run">{Array.from({length:8},(_,i)=><i key={i} style={{left:`${(i*19-tick*3)%120}%`}}/>)}<b>WARNING · EDGE</b></div>;
  if (chapter==="10") return <div className="scene-fx data-rain">{Array.from({length:14},(_,i)=><i key={i} style={{left:`${i*7.3}%`,animationDelay:`${-i*.17}s`}}>01<br/>10<br/>e{i}</i>)}</div>;
  if (chapter==="11") return <div className="scene-fx anime-storm">{Array.from({length:9},(_,i)=><i key={i} style={{"--ray":i} as React.CSSProperties}/>) }<b>∇</b></div>;
  if (chapter==="13") return <div className="scene-fx gate-scene"><i/><i/><b>FINAL GATE</b></div>;
  return <div className="scene-fx abyss-dust">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*37)%96}%`,top:`${(i*29)%88}%`,animationDelay:`${-i*.13}s`}}/>)}</div>;
}

function MiniGame({ chapter, tick, parameter, setParameter, spec }: { chapter:string; tick:number; parameter:number; setParameter:(value:number)=>void; spec:readonly [string,number,number,number] }) {
  const [score,setScore]=useState(0);
  const [step,setStep]=useState(0);
  const [choice,setChoice]=useState(0);
  const hit=(points=1)=>{setScore(value=>value+points);setStep(value=>value+1)};
  const header=(title:string,mission:string)=><div className="game-head"><div><small>PIXEL MISSION</small><h3>{title}</h3><p>{mission}</p></div><div><span>SCORE</span><b>{String(score).padStart(3,"0")}</b></div></div>;
  const slider=<label className="game-slider"><span>{spec[0]}</span><input aria-label={spec[0]} type="range" min={spec[1]} max={spec[2]} value={parameter} onChange={event=>setParameter(Number(event.target.value))}/><b>{parameter}</b></label>;
  if(chapter==="01") return <div className="mini-game game-loop">{header("修复感知回路","按正确顺序激活：状态 → 动作 → 奖励 → 新状态。")}<div className="game-field">{["状态","动作","奖励","新状态"].map((x,i)=><button key={x} className={step%4===i?"target":""} onClick={()=>i===step%4?hit(10):setScore(v=>Math.max(0,v-3))}>{x}</button>)}<i style={{transform:`rotate(${step*90}deg)`}}/></div></div>;
  if(chapter==="02") return <div className="mini-game game-stars">{header("捕捉未来星光","先调 γ，再选择一颗星。远处奖励会被折扣。")}<div className="game-field">{[1,2,3,4,5].map((d,i)=><button key={d} style={{transform:`scale(${1-i*(1-parameter/100)*.14})`,opacity:Math.max(.2,1-i*(1-parameter/100)*.18)}} onClick={()=>hit(Math.max(1,Math.round(10*Math.pow(parameter/100,i))))}>★<small>t+{d}</small></button>)}</div>{slider}</div>;
  if(chapter==="03") return <div className="mini-game game-propagate">{header("点亮价值回声","从最远节点开始，依次把未来价值传回现在。")}<div className="game-field">{[4,3,2,1,0].map((n,i)=><button key={n} className={i<step%6?"lit":""} onClick={()=>i===step%5?hit(8):setScore(v=>Math.max(0,v-2))}>V{n}<i>γ</i></button>)}</div>{slider}</div>;
  if(chapter==="04") return <div className="mini-game game-doors">{header("选择晶洞岔路","未知门可能藏着高回报；★ 是当前估值最高。")}<div className="game-field">{["?","◆","★"].map((x,i)=><button key={x} className={choice===i?"picked":""} onClick={()=>{setChoice(i);hit(i===2?6:Math.round(parameter/12))}}><b>{x}</b><small>{i===2?"利用":"探索"}</small></button>)}</div>{slider}</div>;
  if(chapter==="05") return <div className="mini-game game-episode">{header("完成一整段轨迹","逐格推进；到终点后，整条轨迹才统一结算。")}<div className="game-field">{[0,1,2,3,4,5].map((n,i)=><button key={n} className={i<=step%7?"seen":""} onClick={()=>i===step%6?hit(i===5?25:2):setScore(v=>Math.max(0,v-1))}>{i===5?"终点":"S"+n}</button>)}</div><strong>{step%6===5?"回报即将倒流！":"尚未结束，不更新"}</strong></div>;
  if(chapter==="06") {const pulse=(tick*13)%100;return <div className="mini-game game-td">{header("捕捉时间差脉冲","当 δ 进入中央绿色区域时点击采样。")}<div className="game-field"><i style={{left:`${pulse}%`}}>δ</i><span/></div><button className="game-action" onClick={()=>hit(pulse>42&&pulse<58?15:1)}>捕捉 δ</button>{slider}</div>}
  if(chapter==="07") return <div className="mini-game game-cliff-choice">{header("护送 Kize 穿过悬崖","安全路线回报较慢；危险路线可能坠落。")}<div className="game-field"><button onClick={()=>hit(6)}>安全航线 <i style={{width:`${25+step%70}%`}}/></button><button onClick={()=>hit((tick+step)%4===0?0:12)}>悬崖捷径 <i style={{width:`${20+(step*2)%75}%`}}/></button><b>☠ 深渊</b></div>{slider}</div>;
  if(chapter==="08") return <div className="mini-game game-maze">{header("追踪最大 Q 值","用方向键让 Q 探测器靠近右下角目标。")}<div className="game-field"><div className="maze-board">{Array.from({length:36},(_,i)=><i key={i} className={i===35?"goal":i===choice?"agent":""}/>)}</div><div className="dpad"><button onClick={()=>setChoice(v=>Math.max(0,v-6))}>↑</button><button onClick={()=>setChoice(v=>v%6? v-1:v)}>←</button><button onClick={()=>setChoice(v=>v%6<5?v+1:v)}>→</button><button onClick={()=>{setChoice(v=>Math.min(35,v+6));hit(choice>28?15:2)}}>↓</button></div></div></div>;
  if(chapter==="09") return <div className="mini-game game-terrain">{header("塑造参数地形","调节特征数量，再点击地形让相似状态一起抬升。")}<div className="game-field" onClick={()=>hit(4)}>{Array.from({length:20},(_,i)=><i key={i} style={{height:`${18+((i*parameter+step*7)%72)}%`}}/>)}</div>{slider}</div>;
  if(chapter==="10") return <div className="mini-game game-memory">{header("打乱经验回放","找出同符号的经验对，避免按发生顺序训练。")}<div className="game-field">{Array.from({length:12},(_,i)=><button key={i} className={choice===i?"open":""} onClick={()=>{setChoice(i);hit((i+tick)%3===0?8:2)}}>{choice===i?["S","A","R"][i%3]:"?"}</button>)}</div><button className="game-action" onClick={()=>{setChoice((tick*7)%12);hit(3)}}>随机抽样</button></div>;
  if(chapter==="11") return <div className="mini-game game-policy">{header("调节行动风向","给高回报方向增加概率，但三股风必须保持平衡。")}<div className="game-field">{["←","↑","→"].map((x,i)=><button key={x} onClick={()=>{setChoice(i);setParameter(Math.min(spec[2],parameter+4));hit(i===1?9:3)}} style={{height:`${30+((parameter+i*21)%60)}%`}}>{x}</button>)}</div>{slider}</div>;
  if(chapter==="12") return <div className="mini-game game-council">{header("主持双核议会","先让 Actor 提案，再让 Critic 评价；交替操作才能连击。")}<div className="game-field"><button className={step%2===0?"ready":""} onClick={()=>step%2===0?hit(10):setScore(v=>Math.max(0,v-3))}>ACTOR<small>提出动作</small></button><i>优势 A = {((tick%20-10)/10).toFixed(1)}</i><button className={step%2===1?"ready":""} onClick={()=>step%2===1?hit(10):setScore(v=>Math.max(0,v-3))}>CRITIC<small>评价动作</small></button></div>{slider}</div>;
  const ratio=.65+(tick%50)/30;return <div className="mini-game game-clip">{header("穿过策略裁剪闸门","移动边界，把策略比率控制在安全区间内。")}<div className="game-field"><span style={{left:`${25-parameter/3}%`,right:`${25-parameter/3}%`}}/><i style={{left:`${15+(tick*7)%70}%`}}>π</i><b>r = {ratio.toFixed(2)}</b></div><div className="clip-controls"><button onClick={()=>setParameter(Math.max(spec[1],parameter-2))}>收紧 −</button><button onClick={()=>hit(ratio>.8&&ratio<1.2?15:1)}>提交更新</button><button onClick={()=>setParameter(Math.min(spec[2],parameter+2))}>放宽 +</button></div></div>;
}

function Instrument({ chapter, tick, parameter, intensity }: { chapter:string; tick:number; parameter:number; intensity:number }) {
  const heights = Array.from({length:24},(_,i)=>12+((i*17+tick*5+parameter)%76));
  if (chapter==="01") return <article className="signal-chart instrument loop-scope"><small>交互循环监视器</small><div>{["S","A","R","S′"].map((x,i)=><i key={x} className={tick%4===i?"on":""}><b>{x}</b></i>)}</div><p>四个像素节点依次点亮，一圈就是一次完整交互。</p></article>;
  if (chapter==="02") return <article className="signal-chart instrument decay-scope"><small>折扣星轨</small><div>{[1,2,3,4,5,6,7].map((x,i)=>{const pulse=.82+Math.sin((tick+i)*.72)*.18;return <i key={x} style={{width:`${12-i}%`,height:`${(18+intensity*65*Math.pow(intensity+.1,i))*pulse}%`,opacity:Math.max(.12,(1-i*(1-intensity)*.13)*pulse),transform:`translateY(${Math.sin((tick+i)*.55)*12}px)`}}><b>γ{i}</b></i>})}</div><p>γ 越小，远方星体越快熄灭。</p></article>;
  if (chapter==="03") return <article className="signal-chart instrument ripple-scope"><small>Bellman 回传波</small><div><b>V<em>{(0.35+(tick%18)/30).toFixed(2)}</em></b>{[0,1,2,3,4].map(i=>{const phase=((tick+i*3)%18)/18;return <i key={i} style={{transform:`scale(${.35+phase*1.65})`,opacity:1-phase}}/>})}</div><p>未来价值以递推波的形式返回当前状态。</p></article>;
  if (chapter==="04") return <article className="signal-chart instrument bandit-scope"><small>动作价值竞赛</small><div>{[.28,.52,.76].map((v,i)=><i key={i} style={{height:`${(v+Math.sin((tick+i)*.3)*.08)*100}%`}}><b>{["?","◆","★"][i]}</b></i>)}</div><p>估值柱竞争时，ε 决定是否离开最高的一根。</p></article>;
  if (chapter==="05") return <article className="signal-chart instrument film-scope"><small>完整轨迹胶片</small><div>{[0,1,2,3,4,5,6].map((_,i)=><i key={i} className={i<=tick%7?"on":""}><b>{i===6?"G":"S"+i}</b></i>)}</div><p>胶片走完后，终点回报才会统一倒放。</p></article>;
  if (chapter==="06") return <article className="signal-chart instrument pulse-scope"><small>TD 误差示波器</small><div>{heights.map((h,i)=><i key={i} style={{height:`${Math.abs(50-h)*(1+intensity)}%`}}/>)}</div><b className="zero-line">δ = 0</b><p>上下跳动代表价值低估或高估，收敛时趋近零线。</p></article>;
  if (chapter==="07") return <article className="signal-chart instrument route-scope"><small>风险航线对比</small><div><i className="safe-route"><b style={{left:`${tick%90}%`}}/></i><i className="risk-route"><b style={{left:`${(tick*2)%90}%`}}/></i></div><p>蓝线更长但容错高；红线更短却紧贴悬崖。</p></article>;
  if (chapter==="08") return <article className="signal-chart instrument mini-grid"><small>Q 值热力扩散</small><div>{Array.from({length:48},(_,i)=><i key={i} style={{opacity:.12+((i*13+tick*4)%88)/100}} className={i===39?"goal":""}/>)}</div><p>最大 Q 值像热量一样从目标向外传播。</p></article>;
  if (chapter==="09") return <article className="signal-chart instrument terrain-scope"><small>参数拟合地形</small><div>{heights.map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}<b style={{transform:`rotate(${-14+intensity*22}deg)`}}/></div><p>白色拟合线改变时，整片状态同时获得新估值。</p></article>;
  if (chapter==="10") return <article className="signal-chart instrument replay-scope"><small>经验回放队列</small><div>{Array.from({length:18},(_,i)=><i key={i} className={(i+tick)%4===0?"on":""}>e{i}</i>)}</div><p>高亮样本被随机抽取，打破连续经验的相关性。</p></article>;
  if (chapter==="11") return <article className="signal-chart instrument wind-scope"><small>策略概率风向</small><div>{["←","↑","→"].map((x,i)=><i key={x} style={{width:`${22+((tick*(i+2)+i*19)%58)}%`}}><b>{x}</b></i>)}</div><p>回报推动概率质量在三个动作之间重新分配。</p></article>;
  if (chapter==="12") return <article className="signal-chart instrument dual-scope"><small>Actor / Critic 双通道</small><div><section><label>ACTOR · π</label>{heights.slice(0,12).map((h,i)=><span key={i} style={{height:`${h}%`}}/>)}</section><section><label>CRITIC · V</label>{heights.slice(12).map((h,i)=><span key={i} style={{height:`${100-h}%`}}/>)}</section></div><p>上下通道分别显示策略变化与价值误差。</p></article>;
  return <article className="signal-chart instrument clip-scope"><small>PPO 裁剪曲线</small><div><i/><i/><b style={{left:`${20+(tick*5)%62}%`}}>π</b><em style={{left:`${35-intensity*12}%`,right:`${35-intensity*12}%`}}/></div><p>策略点越过虚线边界后，收益不再继续放大。</p></article>;
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

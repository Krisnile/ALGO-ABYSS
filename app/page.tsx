"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Strategy = "greedy" | "epsilon" | "curious";
type Event = { id: number; arm: number; reward: number; explore: boolean };

const arms = [
  { name: "红晶洞", code: "R-17", color: "#ff6672", truth: .28, x: 19, y: 62 },
  { name: "青晶洞", code: "C-04", color: "#41dacd", truth: .52, x: 50, y: 29 },
  { name: "金晶洞", code: "G-31", color: "#f8da73", truth: .76, x: 81, y: 58 },
];

const strategyInfo = {
  greedy: { name: "只选最好", eps: 0, decay: 0, desc: "永远选择当前估值最高的矿洞，可能被最初几次好运欺骗。" },
  epsilon: { name: "ε-greedy", eps: .7, decay: .006, desc: "大多数时候利用已知最优选择，偶尔探索其他可能。" },
  curious: { name: "保持好奇", eps: .35, decay: 0, desc: "始终保留较高探索率，适合奖励规律会变化的环境。" },
};

const chapters = [
  ["01", "智能体与环境", "Agent Loop", "交互循环"],
  ["02", "回报与折扣", "Return γ", "奖励长河"],
  ["03", "价值与递推", "Value / Bellman", "价值波纹"],
  ["04", "探索与利用", "ε-greedy", "矿洞实验"],
  ["05", "完整经历学习", "Monte Carlo", "轨迹回放"],
  ["06", "走一步就更新", "TD Learning", "时间差"],
  ["07", "沿当前策略学习", "SARSA", "安全轨迹"],
  ["08", "学习最优动作", "Q-Learning", "价值迷宫"],
  ["09", "从表格到函数", "Approximation", "参数地形"],
  ["10", "神经网络估值", "DQN", "记忆工厂"],
  ["11", "直接学习策略", "Policy Gradient", "概率乐团"],
  ["12", "行动与评价协作", "Actor-Critic", "双核心"],
  ["13", "限制更新幅度", "PPO", "裁剪闸门"],
] as const;

export default function Home() {
  const [visualTick, setVisualTick] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [strategy, setStrategy] = useState<Strategy>("epsilon");
  const [episode, setEpisode] = useState(0);
  const [counts, setCounts] = useState([0, 0, 0]);
  const [values, setValues] = useState([0, 0, 0]);
  const [totalReward, setTotalReward] = useState(0);
  const [regret, setRegret] = useState(0);
  const [currentArm, setCurrentArm] = useState(1);
  const [lastReward, setLastReward] = useState(0);
  const [wasExplore, setWasExplore] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [rewardHistory, setRewardHistory] = useState<number[]>([0]);
  const [valueHistory, setValueHistory] = useState<number[][]>([[0, 0, 0]]);
  const valuesRef = useRef(values); const countsRef = useRef(counts); const episodeRef = useRef(episode);
  useEffect(() => { valuesRef.current = values; }, [values]);
  useEffect(() => { countsRef.current = counts; }, [counts]);
  useEffect(() => { episodeRef.current = episode; }, [episode]);
  useEffect(() => {
    const timer = window.setInterval(() => setVisualTick((tick) => tick + 1), 720);
    return () => window.clearInterval(timer);
  }, []);

  const epsilon = strategy === "epsilon" ? Math.max(.06, strategyInfo.epsilon.eps - episode * strategyInfo.epsilon.decay) : strategyInfo[strategy].eps;

  useEffect(() => {
    if (!running) return;
    const delay = speed === 1 ? 880 : speed === 2 ? 390 : 150;
    const timer = window.setInterval(() => {
      const eps = strategy === "epsilon" ? Math.max(.06, .7 - episodeRef.current * .006) : strategyInfo[strategy].eps;
      const explore = Math.random() < eps || episodeRef.current < 2;
      const maxV = Math.max(...valuesRef.current);
      const candidates = valuesRef.current.map((v, i) => v === maxV ? i : -1).filter((i) => i >= 0);
      const arm = explore ? Math.floor(Math.random() * 3) : candidates[Math.floor(Math.random() * candidates.length)];
      const reward = Math.random() < arms[arm].truth ? (Math.random() > .82 ? 2 : 1) : 0;
      const newCounts = [...countsRef.current]; newCounts[arm] += 1;
      const newValues = [...valuesRef.current]; newValues[arm] += (reward - newValues[arm]) / newCounts[arm];
      setCounts(newCounts); setValues(newValues); setEpisode((e) => e + 1); setCurrentArm(arm); setLastReward(reward); setWasExplore(explore);
      setTotalReward((v) => v + reward); setRegret((v) => v + arms[2].truth - arms[arm].truth);
      setEvents((v) => [{ id: Date.now(), arm, reward, explore }, ...v].slice(0, 7));
      setRewardHistory((v) => [...v, reward].slice(-48)); setValueHistory((v) => [...v, newValues].slice(-48));
    }, delay);
    return () => window.clearInterval(timer);
  }, [running, speed, strategy]);

  const reset = (next: Strategy = strategy) => {
    setStrategy(next); setEpisode(0); setCounts([0, 0, 0]); setValues([0, 0, 0]); setTotalReward(0); setRegret(0); setCurrentArm(1); setEvents([]); setRewardHistory([0]); setValueHistory([[0, 0, 0]]); setRunning(true);
  };

  const bestEstimate = values.indexOf(Math.max(...values));
  const task = episode < 8 ? { n: "01", title: "先观察它乱走", body: "初始时三个矿洞都未知。注意紫色虚线：智能体正在主动探索。" } : episode < 35 ? { n: "02", title: "比较三条价值柱", body: "Q 值是智能体根据历史奖励形成的估计，并不是真实概率。" } : episode < 90 ? { n: "03", title: "看 ε 如何下降", body: "随着经验增加，探索减少，智能体逐渐利用当前最优矿洞。" } : { n: "✓", title: "策略已经稳定", body: "现在切换成“只选最好”，看看没有探索时是否更容易被早期运气误导。" };
  const recentRate = rewardHistory.length > 1 ? rewardHistory.slice(-15).reduce((a, b) => a + b, 0) / Math.min(15, rewardHistory.length - 1) : 0;

  return (
    <main className="fortress">
      <header className="topbar"><div className="brand"><span>Ω</span><b>算法深渊</b><small>ALGO ABYSS / RL PATH</small></div><nav><a href="#catalog">篇章目录</a><a href="#chapter-04">实时实验</a><a href="#chapter-13">抵达 PPO</a></nav><div className="live"><i className="on" /> WORLD LIVE</div></header>

      <section className="hero">
        <div className="kicker">强化学习 · 第四关 / REINFORCEMENT LEARNING</div>
        <h1>探索 <em>VS</em> 利用</h1>
        <div className="hero-icons"><span><i>?</i></span><b>ε</b><span><i>★</i></span></div>
        <div className="observe-task"><small>你现在应该看什么</small><b><i>{task.n}</i>{task.title}</b><p>{task.body}</p></div>
      </section>

      <section className="course-map" id="catalog">
        <div className="course-title"><span>强化学习路线</span><b>13 关 · 从交互循环到 PPO</b><i>向下探索 ↓</i></div>
        <div className="course-track">{chapters.map((c, i) => <a key={c[0]} href={`#chapter-${c[0]}`} className={i === 3 ? "current" : ""}><span>{c[0]}</span><div><small>{c[2]}</small><b>{c[1]}</b></div><em>{c[3]}</em></a>)}</div>
      </section>

      <FoundationPath tick={visualTick} />

      <section className="experiment" id="chapter-04">
        <div className="section-heading"><div><span>04 / ε-GREEDY · 晶洞岔路</span><h2>探索与利用</h2><p>每一步都会自动发生。虚线代表探索，实线代表利用。</p></div><div className="controls"><button onClick={() => setRunning(!running)}>{running ? "Ⅱ 暂停" : "▶ 继续"}</button><div className="speed">{[1, 2, 4].map((s) => <button key={s} className={speed === s ? "active" : ""} onClick={() => setSpeed(s)}>×{s}</button>)}</div><button onClick={() => reset()}>↻ 重置</button></div></div>

        <div className="sim-grid">
          <div className="arena-card card">
            <div className="card-head"><span>CRYSTAL CAVERN / EPISODE {String(episode).padStart(3, "0")}</span><div><i className="legend explore" />探索 <i className="legend exploit" />利用</div></div>
            <div className="cavern">
              <div className="cave-noise" />
              <div className="stalactites">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div>
              <div className="fireflies">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--n": i, left: `${(i * 47) % 95}%`, top: `${12 + (i * 31) % 70}%` } as React.CSSProperties} />)}</div>
              <div className="rail"><i /><i /><i /><i /><div className="cart"><b>◆</b></div></div>
              <div className={`route ${wasExplore ? "explore" : "exploit"} arm-${currentArm}`} />
              <div className="agent" style={{ left: `${arms[currentArm].x}%`, top: `${arms[currentArm].y - 10}%` }}><i /><span>{wasExplore ? "EXPLORE" : "EXPLOIT"}</span></div>
              {arms.map((arm, i) => <div className={`mine mine-${i} ${currentArm === i ? "selected" : ""} ${bestEstimate === i && episode > 3 ? "best" : ""}`} key={arm.code} style={{ left: `${arm.x}%`, top: `${arm.y}%`, "--mine": arm.color } as React.CSSProperties}><div className="crystal"><i /><i /><i /></div><b>{arm.name}</b><small>{arm.code}</small><span>Q = {values[i].toFixed(2)}</span>{currentArm === i && <em className={lastReward ? "reward" : "empty"}>{lastReward ? `+${lastReward} 奖励` : "空手而归"}</em>}</div>)}
              <div className="core"><i /><span>POLICY<br />CORE</span></div>
              <div className="epsilon-orbit" style={{ opacity: .2 + epsilon }}><i>ε</i><span>{epsilon.toFixed(2)}</span></div>
              {lastReward > 0 && <div className="reward-burst" key={`${episode}-${lastReward}`}>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>}
              <div className="arena-caption">真实产出率对智能体隐藏 · 它只能看到自己获得的奖励</div>
            </div>
            <div className="event-stream">{events.length === 0 && <p>等待第一次选择…</p>}{events.map((e) => <p key={e.id}><time>#{String(episode - events.indexOf(e)).padStart(3, "0")}</time><i style={{ background: arms[e.arm].color }} /><b>{arms[e.arm].name}</b><span>{e.explore ? "随机探索" : "利用最优"}</span><em className={e.reward ? "positive" : "zero"}>{e.reward ? `R +${e.reward}` : "R 0"}</em></p>)}</div>
          </div>

          <aside className="telemetry card">
            <div className="card-head"><span>策略遥测</span><i>LIVE</i></div>
            <div className="strategy-readout"><small>CURRENT STRATEGY</small><b>{strategyInfo[strategy].name}</b><p>{strategyInfo[strategy].desc}</p></div>
            <div className="big-metric"><span>ε</span><b>{epsilon.toFixed(2)}</b><div><i style={{ width: `${epsilon * 100}%` }} /></div><small>{epsilon > .4 ? "探索期：频繁尝试未知选择" : epsilon > .1 ? "平衡期：以利用为主，保留探索" : "收敛期：很少离开当前最优"}</small></div>
            <div className="mini-stats"><div><small>回合</small><b>{episode}</b></div><div><small>总奖励</small><b>{totalReward}</b></div><div><small>近期收益</small><b>{recentRate.toFixed(2)}</b></div><div><small>累计遗憾</small><b>{regret.toFixed(1)}</b></div></div>
            <div className="value-bars"><div className="subhead">动作价值估计 Q(a)</div>{arms.map((arm, i) => <div key={arm.code}><label><span style={{ color: arm.color }}>{arm.code}</span><b>{values[i].toFixed(3)}</b><small>{counts[i]} 次</small></label><div><i style={{ width: `${Math.min(100, values[i] * 100)}%`, background: arm.color }} /></div></div>)}</div>
            <div className="noe-quote"><span>NOE / 观测员</span><p>“{episode < 8 ? "最初的选择几乎都是猜测。没有探索，就没有证据。" : bestEstimate !== 2 ? "它暂时相信了错误的矿洞。继续观察：探索可能会纠正这次误判。" : epsilon > .15 ? "它已经发现了金晶洞，但仍会偶尔离开——这是必要的怀疑。" : "现在它大多利用金晶洞，探索只剩下很小的保险。"}”</p></div>
          </aside>
        </div>

        <div className="metric-ribbon"><div><small>BEST ESTIMATE</small><b style={{ color: arms[bestEstimate].color }}>{episode ? arms[bestEstimate].name : "未知"}</b></div><div><small>EXPLORE / EXPLOIT</small><b>{wasExplore ? "探索" : "利用"}</b></div><div><small>LAST REWARD</small><b>{lastReward ? `+${lastReward}` : "0"}</b></div><div><small>CONFIDENCE</small><b>{Math.round(Math.max(...values) * 100)}%</b></div><div><small>TRUE BEST</small><b className="classified">机密</b></div></div>
      </section>

      <section className="charts-section">
        <div className="section-heading"><div><span>02 / 价值如何形成</span><h2>看见学习发生</h2><p>曲线不是装饰：它记录了智能体每次更新对世界的判断。</p></div></div>
        <div className="chart-grid">
          <div className="chart-card card"><div className="chart-title"><div><span>Q VALUE ESTIMATES</span><b>三座矿洞的价值估计</b></div><div>{arms.map((a) => <i key={a.code} style={{ background: a.color }} />)}</div></div><LineChart history={valueHistory} colors={arms.map((a) => a.color)} /><p>样本越多，估值越稳定。金晶洞的曲线通常会逐渐高于其他选择。</p></div>
          <div className="chart-card card"><div className="chart-title"><div><span>REWARD PULSE</span><b>最近 48 次即时奖励</b></div><em>R ∈ {"{0, 1, 2}"}</em></div><RewardChart values={rewardHistory} /><p>单次奖励噪声很大，强化学习依赖长期平均，而不是一次输赢。</p></div>
        </div>
      </section>

      <section className="why" id="why">
        <div className="section-heading"><div><span>03 / 一个小知识点</span><h2>ε-greedy 到底做了什么？</h2><p>只需要理解一个判断：这一步是尝试未知，还是使用当前最好？</p></div></div>
        <div className="concept-grid"><article className="card"><span className="number">A</span><small>EXPLORE / 探索</small><h3>以 ε 的概率随机选择</h3><p>即使某个矿洞当前看起来最好，也主动去试试其他矿洞。这是在购买新信息。</p><div className="pixel-diagram random"><i /><i /><i /><b>?</b></div></article><article className="card"><span className="number">B</span><small>EXPLOIT / 利用</small><h3>以 1−ε 的概率选择最大 Q</h3><p>使用已经积累的经验，选择目前估值最高的动作。这是在兑现已有信息。</p><div className="pixel-diagram exploit"><i /><i /><i /><b>MAX</b></div></article><article className="card formula-card"><span className="number">Q</span><small>INCREMENTAL UPDATE</small><h3>每次奖励都修正一点估值</h3><div className="equation">Q<sub>new</sub> = Q + <em>1/N</em>(R − Q)</div><p>新估值＝旧估值＋一小步误差。尝试次数 N 越多，一次偶然奖励的影响越小。</p></article></div>
      </section>

      <section className="compare" id="compare">
        <div className="section-heading"><div><span>04 / 改变策略</span><h2>同一个世界，三种性格</h2><p>选择策略后实验会自动重置。观察它们是否都能找到真正最好的矿洞。</p></div></div>
        <div className="strategy-cards">{(Object.keys(strategyInfo) as Strategy[]).map((key) => <button key={key} className={strategy === key ? "active" : ""} onClick={() => reset(key)}><span>{key === "greedy" ? "00" : key === "epsilon" ? "ε↓" : "ε="}</span><div><small>{key.toUpperCase()}</small><b>{strategyInfo[key].name}</b><p>{strategyInfo[key].desc}</p></div><i>{strategy === key ? "运行中" : "运行实验 →"}</i></button>)}</div>
      </section>
      <LearningPath tick={visualTick} />
      <footer><span>ALGO ABYSS / RL</span><b>13 个世界 · 一条强化学习主线</b><span>LOCAL EXPERIMENT BUILD</span></footer>
    </main>
  );
}

function LineChart({ history, colors }: { history: number[][]; colors: string[] }) {
  return <div className="line-plot"><div className="grid-lines" />{colors.map((color, series) => <div className="series" key={color}>{history.slice(0, -1).map((point, i) => { const next = history[i + 1]; const x1 = i / Math.max(1, history.length - 1) * 100; const x2 = (i + 1) / Math.max(1, history.length - 1) * 100; const y1 = 92 - point[series] * 78; const y2 = 92 - next[series] * 78; const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; return <i key={i} style={{ left: `${x1}%`, top: `${y1}%`, width: `${Math.hypot(x2 - x1, y2 - y1)}%`, transform: `rotate(${angle}deg)`, background: color }} />})}</div>)}</div>;
}

function RewardChart({ values }: { values: number[] }) {
  return <div className="reward-plot"><div className="grid-lines" />{values.map((v, i) => <i key={i} className={v ? "hit" : "miss"} style={{ left: `${i / Math.max(1, values.length) * 100}%`, height: `${v ? 24 + v * 29 : 5}%` }} />)}</div>;
}

function LearningPath({ tick }: { tick: number }) {
  return <section className="learning-path">
    <Chapter no="05" type="mc" title="完整经历学习" term="Monte Carlo" question="等冒险结束，再回头评价每一步。" insight="蒙特卡洛方法用完整回报更新价值，不需要环境模型。"><MonteCarloVisual tick={tick} /></Chapter>
    <Chapter no="06" type="td" title="走一步就更新" term="TD Learning" question="还没走到终点，能不能提前学习？" insight="TD 用下一状态的估值作为临时答案，边走边修正。"><TDVisual tick={tick} /></Chapter>
    <Chapter no="07" type="sarsa" title="沿当前策略学习" term="SARSA" question="如果下一步真的还会探索呢？" insight="SARSA 使用实际选择的下一动作，学习更贴近当前策略的价值。"><SarsaVisual tick={tick} /></Chapter>
    <Chapter no="08" type="q" title="学习最优动作" term="Q-Learning" question="当前乱走，也能学习最优路线吗？" insight="Q-Learning 更新时假设下一步选择最大 Q，是离策略学习。"><QVisual tick={tick} /></Chapter>
    <Chapter no="09" type="approx" title="从表格到函数" term="Function Approximation" question="状态多到表格装不下怎么办？" insight="用参数函数概括相似状态，把经验推广到没见过的位置。"><ApproxVisual tick={tick} /></Chapter>
    <Chapter no="10" type="dqn" title="神经网络估值" term="DQN" question="让神经网络预测每个动作的 Q 值。" insight="经验回放打乱相关样本，目标网络减慢目标变化，让训练稳定。"><DQNVisual tick={tick} /></Chapter>
    <Chapter no="11" type="pg" title="直接学习策略" term="Policy Gradient" question="不估值每个动作，直接调整行动概率。" insight="高回报动作的概率被提高，低回报动作的概率被压低。"><PolicyVisual tick={tick} /></Chapter>
    <Chapter no="12" type="ac" title="行动与评价协作" term="Actor-Critic" question="一个负责行动，一个负责指出好坏。" insight="Actor 更新策略，Critic 估计价值并提供更低方差的学习信号。"><ActorCriticVisual tick={tick} /></Chapter>
    <Chapter no="13" type="ppo" title="限制更新幅度" term="PPO" question="学得太猛，为什么反而会崩？" insight="PPO 裁剪新旧策略比率，限制单次更新，换取稳定进步。"><PPOVisual tick={tick} /></Chapter>
  </section>;
}

function FoundationPath({ tick }: { tick: number }) {
  return <section className="learning-path foundations">
    <Chapter no="01" type="mdp" title="智能体与环境" term="Agent Loop / MDP" question="强化学习从哪里开始？" insight="智能体观察状态、采取动作、得到奖励，环境再进入下一状态。"><MDPVisual tick={tick} /></Chapter>
    <Chapter no="02" type="return" title="回报与折扣" term="Return / γ" question="很久以后的奖励还值多少？" insight="折扣因子 γ 决定智能体更看重眼前，还是愿意为长期结果等待。"><ReturnVisual tick={tick} /></Chapter>
    <Chapter no="03" type="bellman" title="价值与递推" term="Value / Bellman" question="怎样把未来压缩成一个数？" insight="状态价值等于即时奖励，加上折扣后的下一状态价值。"><BellmanVisual tick={tick} /></Chapter>
  </section>;
}

function Chapter({ no, type, title, term, question, insight, children }: { no: string; type: string; title: string; term: string; question: string; insight: string; children: React.ReactNode }) {
  return <article className={`chapter chapter-${type}`} id={`chapter-${no}`}><div className="chapter-copy"><span>{no} / {term}</span><h2>{title}</h2><b>{question}</b><p>{insight}</p><a href="#catalog">返回目录 ↑</a></div><div className="chapter-visual">{children}</div></article>;
}

function MDPVisual({ tick }: { tick: number }) { const active = tick % 4; return <div className="mdp-world"><div className="mdp-agent" style={{ left: `${[12,38,65,82][active]}%`, top: `${[62,28,66,35][active]}%` }}>A</div>{["S₀","S₁","S₂","S₃"].map((s,i)=><i key={s} className={i===active?"on":""} style={{left:`${[12,38,65,82][i]}%`,top:`${[62,28,66,35][i]}%`}}>{s}</i>)}<div className="mdp-path"/><span className="reward-token">R +{active+1}</span></div> }
function BellmanVisual({ tick }: { tick: number }) { return <div className="bellman-world"><div className="value-core">V(s)<i/><i/><i/></div>{[0,1,2,3].map(i=><span key={i} style={{animationDelay:`${i*.4}s`}}>γ<sup>{i}</sup><b>+{Math.max(1,4-i)}</b></span>)}<em>现在</em><em>未来</em></div> }
function ReturnVisual({ tick }: { tick: number }) { return <div className="return-world"><div className="reward-river">{[8,5,3,2,1].map((r,i)=><i key={i} style={{opacity:Math.max(.18,1-i*.17),transform:`scale(${1-i*.11})`}}><b>+{r}</b><span>γ<sup>{i}</sup></span></i>)}</div><div className="gamma-dial" style={{transform:`rotate(${(tick%30)-15}deg)`}}>γ</div><strong>Gₜ = Rₜ₊₁ + γRₜ₊₂ + …</strong></div> }
function MonteCarloVisual({ tick }: { tick: number }) { const n=tick%6; return <div className="mc-world"><div className="episode-film">{[0,1,2,3,4,5].map(i=><i key={i} className={i<=n?"seen":""}><b>{i===5?"★":"S"+i}</b><span>{i===5?"+10":"0"}</span></i>)}</div><div className="return-wave" style={{width:`${(n+1)*16}%`}}/><strong>Gₜ ← 完整回报</strong></div> }
function TDVisual({ tick }: { tick: number }) { const n=tick%5; return <div className="td-world">{[0,1,2,3,4].map(i=><i key={i} className={i===n?"active":i<n?"done":""}>S{i}</i>)}<div className="td-spark" style={{left:`${10+n*20}%`}}>δ</div><strong>R + γV(S′) − V(S)</strong></div> }
function QVisual({ tick }: { tick: number }) { return <div className="q-world"><div className="heatmap">{Array.from({length:48},(_,i)=><i key={i} style={{opacity:.12+(((i*37+tick*7)%100)/100)*.75}} className={i===35?"goal":i===19?"trap":""}/>)}</div><div className="q-agent" style={{left:`${8+(tick%7)*12}%`,top:`${70-(tick%3)*22}%`}}>Q</div><b>max Q(s′,a′)</b></div> }
function SarsaVisual({ tick }: { tick: number }) { return <div className="sarsa-world"><div className="cliff"/><div className="track safe"><i style={{left:`${tick%100}%`}}/></div><div className="track risky"><i style={{left:`${(tick*1.4)%100}%`}}/></div><span>SARSA · 安全</span><span>Q · 最短</span></div> }
function ApproxVisual({ tick }: { tick: number }) { return <div className="approx-world"><div className="surface">{Array.from({length:30},(_,i)=><i key={i} style={{height:`${18+((i*29+tick)%65)}%`}}/>)}</div><div className="fit-line"/><span>θ₀</span><span>θ₁</span><b>Q(s,a; θ)</b></div> }
function DQNVisual({ tick }: { tick: number }) { return <div className="dqn-world"><div className="replay">{Array.from({length:8},(_,i)=><i key={i} className={(i+tick)%3===0?"sampled":""}>e{i}</i>)}</div><div className="network-stack">{[3,5,4,3].map((n,l)=><div key={l}>{Array.from({length:n},(_,i)=><i key={i} style={{animationDelay:`${(l+i)*.1}s`}}/>)}</div>)}</div><div className="target-net">TARGET <span>慢速同步</span></div></div> }
function PolicyVisual({ tick }: { tick: number }) { const p=.2+(tick%70)/100; return <div className="policy-world">{[["←",1-p],["↑",p],["→",.3]].map(([a,v],i)=><div key={i}><i style={{height:`${Number(v)*80}%`}}/><b>{a}</b><span>{Math.min(99,Math.round(Number(v)*100))}%</span></div>)}<div className="policy-pulse">∇J(θ)</div></div> }
function ActorCriticVisual({ tick }: { tick: number }) { return <div className="ac-world"><div className="ac-core actor"><i/>ACTOR<small>π(a|s)</small></div><div className="advantage" style={{transform:`scaleX(${.6+(tick%30)/50})`}}>A(s,a)</div><div className="ac-core critic"><i/>CRITIC<small>V(s)</small></div><span>行动 → 评价 → 修正</span></div> }
function PPOVisual({ tick }: { tick: number }) { const x=15+(tick%70); return <div className="ppo-world"><div className="clip-zone"><i/><i/></div><div className="policy-ball" style={{left:`${x}%`}}>π</div><div className="old-policy">π old</div><div className="clip-meter"><span>0.8</span><b style={{width:`${Math.min(100,x)}%`}}/><span>1.2</span></div><strong>CLIP(rₜ, 1−ε, 1+ε)</strong></div> }

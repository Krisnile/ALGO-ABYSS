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

export default function Home() {
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
      <header className="topbar"><div className="brand"><span>Ω</span><b>算法矿境</b><small>ALGO ABYSS / RL-01</small></div><nav><a href="#experiment">实时实验</a><a href="#why">概念拆解</a><a href="#compare">策略对比</a></nav><div className="live"><i className={running ? "on" : ""} /> {running ? "SIMULATION LIVE" : "PAUSED"}</div></header>

      <section className="hero">
        <div className="kicker">强化学习 · 第一关 / REINFORCEMENT LEARNING</div>
        <h1>探索，还是<br /><em>相信现在的最好？</em></h1>
        <p>三个矿洞的真实产出率被隐藏。智能体只能通过一次次选择与奖励，学会在哪里投入下一次行动。这就是 <b>ε-greedy</b> 的全部矛盾。</p>
        <div className="concept-chips"><span><i>ε</i> 探索概率</span><span><i>Q</i> 价值估计</span><span><i>R</i> 即时奖励</span><span><i>△</i> 累计遗憾</span></div>
        <div className="observe-task"><small>你现在应该看什么</small><b><i>{task.n}</i>{task.title}</b><p>{task.body}</p></div>
      </section>

      <section className="experiment" id="experiment">
        <div className="section-heading"><div><span>01 / 自动实验</span><h2>矿洞选择现场</h2><p>每一步都会自动发生。虚线代表探索，实线代表利用。</p></div><div className="controls"><button onClick={() => setRunning(!running)}>{running ? "Ⅱ 暂停" : "▶ 继续"}</button><div className="speed">{[1, 2, 4].map((s) => <button key={s} className={speed === s ? "active" : ""} onClick={() => setSpeed(s)}>×{s}</button>)}</div><button onClick={() => reset()}>↻ 重置</button></div></div>

        <div className="sim-grid">
          <div className="arena-card card">
            <div className="card-head"><span>CRYSTAL CAVERN / EPISODE {String(episode).padStart(3, "0")}</span><div><i className="legend explore" />探索 <i className="legend exploit" />利用</div></div>
            <div className="cavern">
              <div className="cave-noise" />
              <div className={`route ${wasExplore ? "explore" : "exploit"} arm-${currentArm}`} />
              <div className="agent" style={{ left: `${arms[currentArm].x}%`, top: `${arms[currentArm].y - 10}%` }}><i /><span>{wasExplore ? "EXPLORE" : "EXPLOIT"}</span></div>
              {arms.map((arm, i) => <div className={`mine mine-${i} ${currentArm === i ? "selected" : ""} ${bestEstimate === i && episode > 3 ? "best" : ""}`} key={arm.code} style={{ left: `${arm.x}%`, top: `${arm.y}%`, "--mine": arm.color } as React.CSSProperties}><div className="crystal"><i /><i /><i /></div><b>{arm.name}</b><small>{arm.code}</small><span>Q = {values[i].toFixed(2)}</span>{currentArm === i && <em className={lastReward ? "reward" : "empty"}>{lastReward ? `+${lastReward} 奖励` : "空手而归"}</em>}</div>)}
              <div className="core"><i /><span>POLICY<br />CORE</span></div>
              <div className="epsilon-orbit" style={{ opacity: .2 + epsilon }}><i>ε</i><span>{epsilon.toFixed(2)}</span></div>
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
      <footer><span>ALGO ABYSS / RL-01</span><b>这一关只讲：探索与利用</b><span>LOCAL EXPERIMENT BUILD</span></footer>
    </main>
  );
}

function LineChart({ history, colors }: { history: number[][]; colors: string[] }) {
  return <div className="line-plot"><div className="grid-lines" />{colors.map((color, series) => <div className="series" key={color}>{history.slice(0, -1).map((point, i) => { const next = history[i + 1]; const x1 = i / Math.max(1, history.length - 1) * 100; const x2 = (i + 1) / Math.max(1, history.length - 1) * 100; const y1 = 92 - point[series] * 78; const y2 = 92 - next[series] * 78; const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; return <i key={i} style={{ left: `${x1}%`, top: `${y1}%`, width: `${Math.hypot(x2 - x1, y2 - y1)}%`, transform: `rotate(${angle}deg)`, background: color }} />})}</div>)}</div>;
}

function RewardChart({ values }: { values: number[] }) {
  return <div className="reward-plot"><div className="grid-lines" />{values.map((v, i) => <i key={i} className={v ? "hit" : "miss"} style={{ left: `${i / Math.max(1, values.length) * 100}%`, height: `${v ? 24 + v * 29 : 5}%` }} />)}</div>;
}

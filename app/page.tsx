"use client";

import { useEffect, useMemo, useState } from "react";

type LabKey = "data" | "neural" | "reward";
type LabState = "inspect" | "choose" | "running" | "complete";

const labs = {
  data: { no: "01", short: "数据", name: "偏差矿场", en: "DATA BIAS FIELD", color: "#35d6c2", concept: "监督学习", desc: "观察训练数据如何决定模型眼中的世界。" },
  neural: { no: "02", short: "神经", name: "特征熔炉", en: "NEURAL FORGE", color: "#a879ff", concept: "深度学习", desc: "进入网络内部，看特征如何逐层被提炼。" },
  reward: { no: "03", short: "奖励", name: "策略竞技场", en: "POLICY ARENA", color: "#f8da73", concept: "强化学习", desc: "改变奖励，观察智能体学会完全不同的行为。" },
} as const;

const samplePoints = Array.from({ length: 34 }, (_, i) => ({
  x: 9 + ((i * 37) % 82), y: 12 + ((i * 53) % 75), type: i < 17 ? "red" : i < 30 ? "blue" : "purple",
}));

export default function Home() {
  const [active, setActive] = useState<LabKey>("data");
  const [states, setStates] = useState<Record<LabKey, LabState>>({ data: "inspect", neural: "inspect", reward: "inspect" });
  const [selected, setSelected] = useState<string | null>(null);
  const [choice, setChoice] = useState<Record<LabKey, string>>({ data: "", neural: "", reward: "" });
  const [progress, setProgress] = useState(0);
  const [episode, setEpisode] = useState(0);
  const completed = Object.values(states).filter((v) => v === "complete").length;
  const lab = labs[active];
  const state = states[active];

  const updateState = (value: LabState) => setStates((s) => ({ ...s, [active]: value }));

  useEffect(() => {
    if (state !== "running") return;
    setProgress(0); setEpisode(0);
    const duration = active === "reward" ? 5200 : 4300;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - started) / duration);
      setProgress(p); setEpisode(Math.floor(p * 100));
      if (p >= 1) { window.clearInterval(timer); updateState("complete"); }
    }, 50);
    return () => window.clearInterval(timer);
  }, [state, active]);

  const mission = useMemo(() => {
    if (state === "inspect") return active === "data"
      ? { eyebrow: "当前任务 · 观察", title: "点击一个紫色样本", body: "先查看模型为何对陌生颜色如此不确定。", action: "在散点图中找到发光的紫色方块" }
      : active === "neural"
        ? { eyebrow: "当前任务 · 探索", title: "打开一个隐藏层", body: "查看这一层从像素中提取了什么特征。", action: "点击网络中的任意隐藏层" }
        : { eyebrow: "当前任务 · 预测", title: "观察初始策略", body: "智能体还没有目标，只会在地图中随机游走。", action: "点击竞技场，读取当前策略" };
    if (state === "choose") return active === "data"
      ? { eyebrow: "当前任务 · 决策", title: "修正数据分布", body: "选择一种方式，让模型学会面对训练集之外的颜色。", action: "选择下方一个数据方案" }
      : active === "neural"
        ? { eyebrow: "当前任务 · 决策", title: "选择激活函数", body: "激活函数决定哪些信号能继续传向下一层。", action: "选择 ReLU 或 Sigmoid" }
        : { eyebrow: "当前任务 · 决策", title: "定义奖励", body: "你奖励什么，智能体就会努力成为什么。", action: "选择一种奖励规则" };
    if (state === "running") return { eyebrow: "系统正在演算", title: active === "data" ? "边界正在重绘" : active === "neural" ? "信号正在逐层传播" : `训练回合 ${episode} / 100`, body: "现在无需操作，观察画面和指标如何同步变化。", action: "等待实验完成" };
    return { eyebrow: "实验完成", title: active === "data" ? "未知分布已被覆盖" : active === "neural" ? "特征通路已稳定" : "策略已经收敛", body: active === "reward" && choice.reward === "coin" ? "它学会了贪婪：金币很多，但几乎不顾危险。" : "结果已写入探索档案，可以进入下一个实验舱。", action: completed < 3 ? "从顶部选择下一个实验" : "三个知识舱已全部完成" };
  }, [state, active, episode, completed, choice.reward]);

  const inspect = (value: string) => { if (state !== "inspect") return; setSelected(value); updateState("choose"); };
  const decide = (value: string) => { if (state !== "choose") return; setChoice((c) => ({ ...c, [active]: value })); updateState("running"); };

  return (
    <main className={`world lab-${active}`} style={{ "--lab": lab.color } as React.CSSProperties}>
      <div className="ambient"><i /><i /><i /></div>
      <header className="top-nav">
        <div className="brand"><span>A</span><div><b>ALGO ABYSS</b><small>算法探索基地 / 0.3</small></div></div>
        <div className="completion"><span>探索进度</span><div>{([0, 1, 2] as const).map((n) => <i key={n} className={n < completed ? "done" : ""} />)}</div><b>{completed}/3</b></div>
        <div className="online"><i /> Ω CORE ONLINE</div>
      </header>

      <nav className="lab-nav" aria-label="实验室导航">
        {(Object.keys(labs) as LabKey[]).map((key) => {
          const item = labs[key]; const done = states[key] === "complete";
          return <button key={key} onClick={() => { setActive(key); setSelected(null); }} className={active === key ? "active" : ""} style={{ "--tab": item.color } as React.CSSProperties}>
            <span>{item.no}</span><div><small>{item.concept}</small><b>{item.name}</b></div><i className={done ? "done" : ""}>{done ? "✓" : "→"}</i>
          </button>;
        })}
      </nav>

      <section className="main-grid">
        <aside className="mission panel">
          <div className="panel-label"><span>MISSION CONTROL</span><i>{lab.no}</i></div>
          <div className="mission-symbol"><span>{active === "data" ? "◇" : active === "neural" ? "⌬" : "◎"}</span></div>
          <small className="mission-eyebrow">{mission.eyebrow}</small>
          <h1>{mission.title}</h1><p>{mission.body}</p>
          <div className={`instruction ${state === "running" ? "running" : ""}`}><i>{state === "complete" ? "✓" : state === "running" ? "···" : "!"}</i><span>{mission.action}</span></div>
          <div className="steps">
            {(["inspect", "choose", "complete"] as LabState[]).map((s, i) => <div key={s} className={state === s ? "active" : (["choose", "running", "complete"].includes(state) && i === 0) || (state === "complete" && i === 1) ? "done" : ""}><i /><span>{i === 0 ? "观察现象" : i === 1 ? "做出决策" : "读取结果"}</span></div>)}
          </div>
          <div className="noe"><div className="noe-face"><i /><i /></div><p><b>NOE / 向导</b>“{state === "inspect" ? "我会一直告诉你下一步，不必猜按钮在哪里。" : state === "choose" ? "没有唯一正确答案，先预测，再看世界如何回应。" : state === "running" ? "现在只看，不用操作。注意颜色和结构的变化。" : "你完成的不是测验，而是一次真正的实验。"}”</p></div>
        </aside>

        <section className="lab-stage panel">
          <div className="stage-head"><div><span>{lab.en}</span><b>{lab.name}</b></div><div><span>LIVE SIMULATION</span><i className={state === "running" ? "pulse" : ""} /></div></div>

          {active === "data" && <DataLab state={state} progress={progress} selected={selected} inspect={inspect} choice={choice.data} />}
          {active === "neural" && <NeuralLab state={state} progress={progress} inspect={inspect} choice={choice.neural} />}
          {active === "reward" && <RewardLab state={state} progress={progress} inspect={inspect} choice={choice.reward} />}

          {state === "choose" && <div className="choice-dock">
            <div><small>选择一项进行实验</small><b>{active === "data" ? "如何补足训练集？" : active === "neural" ? "让哪种信号通过？" : "奖励智能体什么行为？"}</b></div>
            <div className="choice-buttons">
              {active === "data" && <><button onClick={() => decide("more")}>只补紫色样本<small>快速，但可能继续死记</small></button><button className="recommended" onClick={() => decide("augment")}>生成颜色扰动<small>推荐 · 覆盖连续分布</small></button></>}
              {active === "neural" && <><button className="recommended" onClick={() => decide("relu")}>ReLU<small>保留强信号，产生稀疏激活</small></button><button onClick={() => decide("sigmoid")}>Sigmoid<small>平滑压缩所有信号</small></button></>}
              {active === "reward" && <><button onClick={() => decide("coin")}>金币 +10<small>容易产生贪婪策略</small></button><button className="recommended" onClick={() => decide("balanced")}>存活＋探索<small>推荐 · 平衡收益与风险</small></button></>}
            </div>
          </div>}
          {state === "complete" && <div className="result-banner"><i>✓</i><div><small>EXPERIMENT ARCHIVED</small><b>{active === "data" ? "测试集泛化率 91%" : active === "neural" ? "有效神经元 78%" : choice.reward === "coin" ? "金币 42 · 受伤 9 次" : "探索率 86% · 存活率 94%"}</b></div><button onClick={() => { const keys = Object.keys(labs) as LabKey[]; const next = keys.find((k) => states[k] !== "complete"); if (next) setActive(next); }}>进入下一舱 →</button></div>}
        </section>

        <aside className="inspector panel">
          <div className="panel-label"><span>KNOWLEDGE LENS</span><i>?</i></div>
          <small className="concept-tag">{lab.concept}</small><h2>{active === "data" ? "数据决定边界" : active === "neural" ? "深度来自层级" : "奖励塑造策略"}</h2>
          <p>{active === "data" ? "分类器不会理解“颜色”这个词，它只会根据训练样本寻找能分开标签的边界。没有出现过的区域，只能猜测。" : active === "neural" ? "浅层识别边缘与颜色，中层组合纹理，深层形成与任务相关的抽象表示。每一层都在压缩信息。" : "强化学习没有标准答案。智能体通过行动获得奖励，再逐渐提高高回报行动出现的概率。"}</p>
          <div className="formula"><small>{active === "data" ? "DECISION" : active === "neural" ? "LAYER" : "UPDATE"}</small><b>{active === "data" ? "ŷ = argmax p(y|x)" : active === "neural" ? "h = σ(Wx + b)" : "Q ← Q + α[r + γQ′ − Q]"}</b></div>
          <div className="what-changed"><span>画面在表达什么</span>{active === "data" ? <><p><i className="cyan" />散点是带标签的训练样本</p><p><i className="line" />发光边界是模型的分类规则</p><p><i className="purple" />紫色位于模型没见过的区域</p></> : active === "neural" ? <><p><i className="cyan" />亮度表示神经元激活强度</p><p><i className="line" />流动连线表示权重传递</p><p><i className="purple" />越深的层提取越抽象的特征</p></> : <><p><i className="cyan" />地图亮度是当前策略概率</p><p><i className="line" />轨迹记录智能体访问过的状态</p><p><i className="purple" />奖励改变下一回合的行为分布</p></>}</div>
          <div className="takeaway"><small>完成本舱后你会知道</small><b>{active === "data" ? "为什么高准确率仍可能在现实中失败" : active === "neural" ? "神经网络为什么需要多层结构" : "奖励函数为什么比命令更重要"}</b></div>
        </aside>
      </section>

      <section className="field-notes"><span>探索档案</span><div><b>{states.data === "complete" ? "✓" : "01"}</b><p>数据分布与泛化</p></div><div><b>{states.neural === "complete" ? "✓" : "02"}</b><p>层级特征与激活</p></div><div><b>{states.reward === "complete" ? "✓" : "03"}</b><p>奖励函数与策略</p></div><em>{completed === 3 ? "探索完成：你已经连接了数据、模型与行为。" : "每个实验只需一次观察和一次决策。"}</em></section>
      <footer><span>ALGO ABYSS / EXPLORATION BUILD</span><span>数据塑造模型，奖励塑造行为。</span><span>V0.3</span></footer>
    </main>
  );
}

function DataLab({ state, progress, selected, inspect, choice }: { state: LabState; progress: number; selected: string | null; inspect: (v: string) => void; choice: string }) {
  const boundary = state === "running" || state === "complete" ? (choice === "augment" ? -8 + progress * 24 : -8 + progress * 12) : -8;
  return <div className="data-lab visual-lab"><div className="plot-grid"><span className="axis y">亮度 ↑</span><span className="axis x">色相 →</span><div className="decision-zone red-zone" /><div className="decision-zone blue-zone" /><div className="decision-line" style={{ transform: `rotate(${boundary}deg)` }} />{samplePoints.map((p, i) => <button key={i} aria-label={`${p.type}样本`} onClick={() => p.type === "purple" && inspect("purple")} className={`sample ${p.type} ${selected === "purple" && p.type === "purple" ? "selected" : ""} ${state === "running" && choice === "augment" && i % 3 === 0 ? "augmented" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * -0.07}s` }} />)}{(state === "running" || state === "complete") && choice === "augment" && Array.from({ length: 18 }, (_, i) => <i key={i} className="ghost-sample" style={{ left: `${27 + (i * 13) % 47}%`, top: `${20 + (i * 23) % 58}%`, opacity: state === "complete" ? .8 : Math.min(.8, progress * 1.4) }} />)}<div className="model-eye"><i /><span>{state === "inspect" ? "寻找异常点" : state === "choose" ? "分布外 / OOD" : state === "running" ? "重绘边界" : "泛化通过"}</span></div></div><div className="visual-stats"><span>TRAIN ACC <b>{state === "complete" ? "96" : "98"}%</b></span><span>TEST ACC <b>{state === "running" ? Math.round(31 + progress * 60) : state === "complete" ? "91" : "31"}%</b></span><span>OOD COVERAGE <b>{state === "running" ? Math.round(8 + progress * 80) : state === "complete" ? "88" : "08"}%</b></span></div></div>;
}

function NeuralLab({ state, progress, inspect, choice }: { state: LabState; progress: number; inspect: (v: string) => void; choice: string }) {
  const layers = [4, 6, 7, 4, 2];
  return <div className="neural-lab visual-lab"><div className="network"><div className="network-bg" />{layers.map((count, li) => <div className="layer" key={li}><small>{["输入", "边缘", "纹理", "形状", "类别"][li]}</small>{Array.from({ length: count }, (_, n) => <button key={n} aria-label={`第${li + 1}层神经元`} onClick={() => li > 0 && li < 4 && inspect(`layer-${li}`)} className={`${state === "running" ? "firing" : ""} ${state === "complete" ? "stable" : ""}`} style={{ "--power": state === "running" ? Math.max(.12, Math.sin(progress * 18 - li * 1.8 - n) * .5 + .5) : li === 0 ? .35 : .12, animationDelay: `${li * .16 + n * .05}s` } as React.CSSProperties}><i /></button>)}</div>)}</div><div className="feature-reel"><span>FEATURE MAP</span>{["▥", "╱", "▒", "◉", "S"].map((v, i) => <i key={i} className={state === "running" && progress > i * .15 ? "active" : state === "complete" ? "active" : ""}>{v}</i>)}<b>{state === "inspect" ? "点击隐藏层" : state === "choose" ? "选择信号门" : choice === "relu" ? "稀疏特征通路" : "平滑特征通路"}</b></div><div className="visual-stats"><span>ACTIVE UNITS <b>{state === "running" ? Math.round(22 + progress * 56) : state === "complete" ? "78" : "22"}%</b></span><span>GRADIENT <b>{state === "running" ? (0.82 - progress * .38).toFixed(2) : state === "complete" ? ".44" : ".82"}</b></span><span>DEPTH <b>5 LAYERS</b></span></div></div>;
}

function RewardLab({ state, progress, inspect, choice }: { state: LabState; progress: number; inspect: (v: string) => void; choice: string }) {
  const cells = Array.from({ length: 96 }, (_, i) => ({ x: i % 12, y: Math.floor(i / 12), value: ((i * 47) % 100) / 100 }));
  const ax = state === "running" || state === "complete" ? choice === "coin" ? Math.min(9, Math.floor(progress * 14)) : Math.min(10, Math.floor(progress * 11)) : 1;
  const ay = state === "running" || state === "complete" ? choice === "coin" ? Math.min(6, Math.floor(progress * 9)) : Math.min(5, Math.floor(progress * 7)) : 6;
  return <div className="reward-lab visual-lab"><button className="arena" onClick={() => inspect("policy")} aria-label="观察强化学习策略竞技场"><div className="arena-grid">{cells.map((c, i) => <i key={i} className={i === 34 || i === 58 ? "danger" : i === 21 || i === 82 ? "coin" : ""} style={{ opacity: state === "running" || state === "complete" ? .2 + c.value * progress * .55 : .24 }} />)}</div><div className="agent" style={{ left: `${5 + ax * 8.25}%`, top: `${6 + ay * 11.5}%` }}><i /><span>AGENT</span></div><div className="coin-token one">◆</div><div className="coin-token two">◆</div><div className="trap one">×</div><div className="trap two">×</div><div className={`policy-trail ${state === "running" ? "visible" : ""}`} /></button><div className="reward-equation"><span>总奖励</span><b>{choice === "coin" ? "+10 金币 −1 受伤" : choice === "balanced" ? "+4 探索 +6 存活 −8 受伤" : "尚未定义"}</b><i style={{ width: `${state === "running" || state === "complete" ? progress * 100 : 0}%` }} /></div><div className="visual-stats"><span>EPISODE <b>{state === "running" ? Math.floor(progress * 100) : state === "complete" ? "100" : "00"}</b></span><span>EXPLORATION <b>{choice === "coin" && state === "complete" ? "34" : state === "complete" ? "86" : Math.round(100 - progress * 14)}%</b></span><span>AVG REWARD <b>{state === "running" ? `+${(progress * (choice === "coin" ? 8.7 : 6.4)).toFixed(1)}` : state === "complete" ? choice === "coin" ? "+8.7" : "+6.4" : "0.0"}</b></span></div></div>;
}

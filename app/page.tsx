"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stage = {
  key: string;
  label: string;
  title: string;
  chapter: string;
  copy: string;
  duration: number;
  tone: "cyan" | "amber" | "violet" | "red";
};

const stages: Stage[] = [
  { key: "idle", label: "待机", chapter: "序章", title: "一座只见过两种颜色的炮塔", copy: "启动一次自动实验，看它如何学习、犯错，并修正自己。", duration: 0, tone: "cyan" },
  { key: "survey", label: "勘探", chapter: "01 / 数据", title: "无人机进入数据晶矿层", copy: "它们不会挖走所有晶体，只采集足以代表洞穴的样本。", duration: 5200, tone: "cyan" },
  { key: "label", label: "标注", chapter: "02 / 标签", title: "红色归为 0，蓝色归为 1", copy: "标签让机器第一次拥有了“正确答案”，也悄悄限定了它能想象的世界。", duration: 4300, tone: "violet" },
  { key: "train", label: "训练", chapter: "03 / 收敛", title: "决策边界正在形成", copy: "模型反复调整权重，让错误越来越少。训练集准确率一路上升。", duration: 6500, tone: "cyan" },
  { key: "deploy", label: "部署", chapter: "04 / 实战", title: "分类核心接管自动炮塔", copy: "红色与蓝色史莱姆被稳定识别。实验看起来已经成功。", duration: 5000, tone: "amber" },
  { key: "breach", label: "异常", chapter: "05 / 未知", title: "紫色史莱姆穿过了防线", copy: "模型不是看不见它，而是不知道该如何理解一个训练集中从未出现的颜色。", duration: 5600, tone: "red" },
  { key: "diagnose", label: "诊断", chapter: "06 / 泛化", title: "高分模型，也可能不理解世界", copy: "98% 是训练集里的成绩，不是面对未知环境的承诺。问题来自数据覆盖，而非炮塔火力。", duration: 6000, tone: "violet" },
  { key: "augment", label: "增强", chapter: "07 / 修正", title: "让训练集拥有颜色之间的过渡", copy: "系统生成扰动样本，重新塑造边界，而不是把紫色史莱姆当成一道新答案死记。", duration: 6100, tone: "cyan" },
  { key: "verify", label: "验证", chapter: "08 / 未知副本", title: "第二次部署，模型面对真正的未知", copy: "新的颜色、尺寸与光照同时出现。模型开始依赖特征，而不是记住表面。", duration: 6000, tone: "amber" },
  { key: "complete", label: "完成", chapter: "实验结论", title: "通过，不是因为它记住得更多", copy: "而是因为训练数据终于教会它：世界不会只出现红色和蓝色。", duration: 0, tone: "cyan" },
];

const stageIndex = (key: string) => stages.findIndex((s) => s.key === key);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [stageProgress, setStageProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const stage = stages[index];

  const metrics = useMemo(() => {
    if (index < 2) return { samples: Math.round(stageProgress * 12), acc: 50, loss: 1.84, general: 12 };
    if (index === 2) return { samples: 12, acc: 54, loss: 1.64, general: 15 };
    if (index === 3) return { samples: 12, acc: Math.round(54 + stageProgress * 44), loss: +(1.64 - stageProgress * 1.55).toFixed(2), general: 18 };
    if (index <= 5) return { samples: 12, acc: 98, loss: .09, general: index === 5 ? 8 : 18 };
    if (index === 6) return { samples: 12, acc: 98, loss: .09, general: 8 };
    if (index === 7) return { samples: Math.round(12 + stageProgress * 36), acc: Math.round(88 + stageProgress * 8), loss: +(.42 - stageProgress * .3).toFixed(2), general: Math.round(24 + stageProgress * 58) };
    if (index === 8) return { samples: 48, acc: 96, loss: .12, general: Math.round(82 + stageProgress * 14) };
    return { samples: 48, acc: 96, loss: .12, general: 96 };
  }, [index, stageProgress]);

  const start = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIndex(1); setStageProgress(0); setRunning(true);
  };

  useEffect(() => {
    if (!running || !stage.duration) return;
    const started = performance.now();
    timerRef.current = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / stage.duration);
      setStageProgress(progress);
      if (progress >= 1) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        if (index < stages.length - 1) {
          setIndex((v) => v + 1); setStageProgress(0);
          if (index + 1 === stages.length - 1) setRunning(false);
        }
      }
    }, 50);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [index, running, stage.duration]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let frame = 0;
    const particles = Array.from({ length: 70 }, (_, i) => ({ x: (i * 137) % 1000, y: (i * 83) % 560, s: 1 + i % 3 }));

    const slime = (x: number, y: number, color: string, scale = 1, angry = false) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.fillStyle = color; ctx.fillRect(-18, -13, 36, 13); ctx.fillRect(-23, -5, 46, 17);
      ctx.fillStyle = angry ? "#ffeddf" : "#111827"; ctx.fillRect(-11, -4, 5, 5); ctx.fillRect(7, -4, 5, 5); ctx.shadowBlur = 0; ctx.restore();
    };
    const drone = (x: number, y: number, beam = false) => {
      ctx.fillStyle = "#d8e7eb"; ctx.fillRect(x - 12, y - 5, 24, 10); ctx.fillStyle = "#35d6c2"; ctx.fillRect(x - 4, y - 8, 8, 4); ctx.fillRect(x - 19, y - 2, 7, 2); ctx.fillRect(x + 12, y - 2, 7, 2);
      if (beam) { const g = ctx.createLinearGradient(0, y, 0, y + 110); g.addColorStop(0, "#35d6c277"); g.addColorStop(1, "transparent"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 7, y + 5); ctx.lineTo(x + 7, y + 5); ctx.lineTo(x + 35, y + 110); ctx.lineTo(x - 35, y + 110); ctx.fill(); }
    };
    const crystal = (x: number, y: number, color: string, alpha = 1) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = 12; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x + 11, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 11, y); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const turret = (x: number, y: number, active: boolean) => {
      ctx.fillStyle = "#25354a"; ctx.fillRect(x - 26, y - 35, 52, 35); ctx.fillStyle = active ? "#35d6c2" : "#536378"; ctx.fillRect(x - 9, y - 52, 18, 19); ctx.fillRect(x + 6, y - 47, 35, 7); if (active) { ctx.shadowColor = "#35d6c2"; ctx.shadowBlur = 18; ctx.fillRect(x - 4, y - 47, 8, 8); ctx.shadowBlur = 0; }
    };
    const text = (value: string, x: number, y: number, color = "#8ea1b4", size = 10) => { ctx.fillStyle = color; ctx.font = `${size}px ui-monospace, monospace`; ctx.fillText(value, x, y); };

    const render = (now: number) => {
      const t = now / 1000; const w = 1000; const h = 560; const i = index; const p = stageProgress;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, i === 5 ? "#2b101d" : i === 6 ? "#1d1533" : "#101b2c"); bg.addColorStop(1, "#050912"); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      particles.forEach((pt, n) => { ctx.globalAlpha = .13 + (n % 4) * .05; ctx.fillStyle = n % 8 ? "#72829a" : "#35d6c2"; ctx.fillRect(pt.x, (pt.y + t * pt.s * 3) % h, pt.s, pt.s); }); ctx.globalAlpha = 1;

      const camera = i === 1 ? p * 40 : i >= 5 ? 35 : 0;
      ctx.save(); ctx.translate(-camera, 0);
      ctx.fillStyle = "#101a28"; ctx.fillRect(0, 390, 1100, 170); ctx.fillStyle = "#26354a"; ctx.fillRect(0, 390, 1100, 10);
      for (let x = 0; x < 1100; x += 32) { ctx.fillStyle = x % 64 ? "#172235" : "#1e2d42"; ctx.fillRect(x, 404, 29, 16); ctx.fillRect(x + 5, 436, 22, 11); }

      if (i <= 2) {
        const colors = ["#ef5c67", "#4fd9df", "#ef5c67", "#4fd9df", "#ef5c67", "#4fd9df"];
        colors.forEach((c, n) => crystal(150 + n * 145, 370 - (n % 2) * 54, c, i === 1 ? Math.max(.15, 1 - p * (n / 7)) : .22));
        if (i === 1) { drone(110 + p * 750, 210 + Math.sin(t * 4) * 8, true); drone(790 - p * 510, 160 + Math.cos(t * 3) * 8, p > .35); }
        if (i === 2) {
          for (let n = 0; n < 12; n++) { const targetX = 380 + (n % 6) * 42; const targetY = 210 + Math.floor(n / 6) * 62; const enter = Math.min(1, p * 1.8 - n * .055); if (enter > 0) { crystal(targetX, targetY, n % 2 ? "#4fd9df" : "#ef5c67", enter); text(n % 2 ? "1" : "0", targetX - 3, targetY + 31, "#d8e6ed", 9); } }
          ctx.strokeStyle = "#4a5c75"; ctx.strokeRect(340, 150, 310, 190); text("DATASET / 12 SAMPLES", 357, 177, "#a7b8c8", 10);
        }
      }

      if (i === 3 || i === 7) {
        const augmented = i === 7; ctx.fillStyle = "#0b1421"; ctx.fillRect(110, 105, 780, 330); ctx.strokeStyle = augmented ? "#a879ff" : "#35d6c2"; ctx.strokeRect(110, 105, 780, 330);
        for (let x = 130; x < 880; x += 35) { ctx.strokeStyle = "#1c2b40"; ctx.beginPath(); ctx.moveTo(x, 120); ctx.lineTo(x, 420); ctx.stroke(); }
        for (let y = 140; y < 420; y += 35) { ctx.beginPath(); ctx.moveTo(125, y); ctx.lineTo(875, y); ctx.stroke(); }
        const count = augmented ? 34 : 12; for (let n = 0; n < count; n++) { const mix = augmented && n > 11; const c = mix ? `hsl(${250 + (n % 9) * 9} 78% 67%)` : n % 2 ? "#4fd9df" : "#ef5c67"; const x = mix ? 260 + (n * 73) % 470 : n % 2 ? 650 + (n * 19) % 120 : 210 + (n * 23) % 120; const y = mix ? 180 + (n * 41) % 170 : n % 2 ? 190 + (n * 31) % 90 : 300 - (n * 17) % 80; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 7; ctx.fillRect(x, y, 7, 7); }
        ctx.shadowBlur = 0; ctx.save(); ctx.translate(500, 270); ctx.rotate((-.25 + p * .55) * Math.PI); ctx.fillStyle = augmented ? "#a879ff" : "#f8da73"; ctx.fillRect(-430, -2, 860, 4); ctx.restore();
        text(augmented ? "AUGMENTED FEATURE SPACE" : "LIVE DECISION BOUNDARY", 132, 135, augmented ? "#c7a9ff" : "#64e8da", 11);
      }

      if (i >= 4 && i !== 6 && i !== 7) {
        turret(150, 390, true); const speed = i === 4 ? 130 : 95;
        const sx = 930 - ((t * speed) % 900); const variant = i >= 8;
        slime(sx, 390, variant ? ["#a879ff", "#ef5c67", "#f8da73"][Math.floor(t) % 3] : i === 5 ? "#a879ff" : Math.floor(t) % 2 ? "#4fd9df" : "#ef5c67", variant ? .75 + (Math.sin(t * 2) + 1) * .28 : i === 5 ? 1.35 : 1);
        if (i === 4 || i >= 8) { const beam = Math.sin(t * 7) > .72; if (beam) { ctx.strokeStyle = "#f8da73"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(188, 342); ctx.lineTo(sx, 374); ctx.stroke(); } }
        if (i === 5) { ctx.fillStyle = "#ff6b4a"; ctx.fillRect(98, 278, 106, 4); text("UNKNOWN", sx - 29, 345, "#ff8790", 10); }
      }

      if (i === 6) {
        ctx.fillStyle = "#0b1120"; ctx.fillRect(145, 90, 710, 370); ctx.strokeStyle = "#7356a8"; ctx.strokeRect(145, 90, 710, 370);
        const nodes = [{ x: 270, y: 180 }, { x: 270, y: 300 }, { x: 500, y: 155 }, { x: 500, y: 250 }, { x: 500, y: 345 }, { x: 730, y: 250 }];
        nodes.forEach((a, n) => nodes.slice(n + 1).forEach((b) => { if (Math.abs(a.x - b.x) < 300 && a.x !== b.x) { ctx.strokeStyle = `rgba(168,121,255,${.12 + .25 * Math.sin(t * 2 + n)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }));
        nodes.forEach((n, k) => { ctx.fillStyle = k === 5 ? "#ff6b4a" : "#a879ff"; ctx.beginPath(); ctx.arc(n.x, n.y, 10 + Math.sin(t * 3 + k) * 2, 0, Math.PI * 2); ctx.fill(); });
        text("MODEL DIAGNOSTIC / OOD FAILURE", 170, 121, "#c6a9ff", 11); text("训练准确率  98%", 185, 412, "#dce5eb", 12); text("未知分布置信度  08%", 590, 412, "#ff7b72", 12);
      }
      ctx.restore();
      if (i === 9) { ctx.fillStyle = "rgba(53,214,194,.07)"; ctx.fillRect(0, 0, w, h); for (let n = 0; n < 28; n++) { ctx.fillStyle = n % 2 ? "#35d6c2" : "#f8da73"; ctx.globalAlpha = .3 + n % 3 * .2; ctx.fillRect((n * 97 + t * 40) % w, (n * 53 + t * 20) % h, 3, 9); } ctx.globalAlpha = 1; }
      text(`${stage.chapter.toUpperCase()} // ${stage.key.toUpperCase()}`, 22, 32, stage.tone === "red" ? "#ff6b4a" : "#6de7da", 10);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render); return () => cancelAnimationFrame(frame);
  }, [index, stageProgress, stage.chapter, stage.key, stage.tone]);

  const lossPoints = Array.from({ length: 22 }, (_, n) => {
    const progress = Math.min(1, index < 3 ? 0 : index === 3 ? stageProgress : 1);
    return 70 - Math.min(n / 21, progress) * 53 + Math.sin(n * 1.7) * (1 - progress) * 8;
  });

  return (
    <main className={`experience tone-${stage.tone}`}>
      <header className="nav">
        <div className="logo"><span>A</span><div><b>ALGO ABYSS</b><small>自动实验剧场</small></div></div>
        <div className="nav-center"><i className={running ? "live" : ""} /> {running ? "EXPERIMENT RUNNING" : index === 9 ? "EXPERIMENT COMPLETE" : "SYSTEM READY"}</div>
        <button className="sound" onClick={() => setMuted(!muted)} aria-label="切换声音">{muted ? "SOUND OFF" : "SOUND ON"}</button>
      </header>

      <section className="hero-copy">
        <div className="chapter">{stage.chapter}</div>
        <div className="copy-main"><div className="stage-number">{String(index).padStart(2, "0")}</div><div><h1>{stage.title}</h1><p>{stage.copy}</p></div></div>
        {!running && (index === 0 || index === 9) && <button className="launch" onClick={start}><span>{index === 9 ? "再看一次" : "启动自动实验"}</span><i>→</i></button>}
      </section>

      <section className="theater">
        <div className="world-panel">
          <div className="world-head"><div><span>OBSERVATION DECK / LIVE</span><b>{stage.label}</b></div><div className="world-tags"><span>无人值守</span><span>实时演算</span></div></div>
          <div className="canvas-wrap"><canvas ref={canvasRef} width={1000} height={560} /><div className="scanlines" /><div className="corner tl" /><div className="corner br" />{running && <div className="stage-progress"><i style={{ width: `${stageProgress * 100}%` }} /></div>}</div>
        </div>

        <aside className="telemetry">
          <div className="telemetry-head"><span>模型遥测</span><i>LIVE</i></div>
          <div className="metric-feature"><small>泛化指数</small><strong>{metrics.general}<sup>%</sup></strong><div className="gauge"><i style={{ width: `${metrics.general}%` }} /></div><p>{metrics.general < 20 ? "模型仍然依赖训练集表面特征" : metrics.general < 80 ? "未知分布正在进入模型视野" : "跨分布特征保持稳定"}</p></div>
          <div className="metric-row"><div><small>样本</small><b>{metrics.samples}</b></div><div><small>准确率</small><b>{metrics.acc}%</b></div><div><small>LOSS</small><b>{metrics.loss.toFixed(2)}</b></div></div>
          <div className="chart"><div className="chart-label"><span>损失地形</span><span>mean loss</span></div><div className="line-chart">{lossPoints.map((y, n) => n < lossPoints.length - 1 && <i key={n} style={{ left: `${n / 21 * 100}%`, top: `${y}%`, width: `${100 / 21 + .5}%`, transform: `rotate(${Math.atan2(lossPoints[n + 1] - y, 100 / 21) * 180 / Math.PI}deg)` }} />)}</div></div>
          <div className="transmission"><span>NOE / 观测员</span><p>“{index === 0 ? "你只需要启动。剩下的，让世界自己证明。" : index < 4 ? "数据正在教它看见什么，也在教它忽略什么。" : index === 5 ? "它的分数没有说谎，只是问题问错了地方。" : index < 8 ? "我们不修炮塔，我们修正它理解世界的方式。" : "未知并没有消失，但模型学会了如何面对。"}”</p></div>
        </aside>
      </section>

      <section className="timeline" aria-label="实验阶段">
        {stages.slice(1).map((s, n) => { const actual = n + 1; return <div key={s.key} className={actual === index ? "active" : actual < index ? "passed" : ""}><i /><span>{s.label}</span><small>{String(actual).padStart(2, "0")}</small></div>; })}
      </section>

      <section className="insight-strip">
        <span>本章概念</span><b>过拟合与泛化</b><p>训练成绩描述的是已经见过的世界；泛化能力决定模型如何面对尚未出现的世界。</p><div><span>DATA</span><i>→</i><span>MODEL</span><i>→</i><span>UNKNOWN</span></div>
      </section>
      <footer><span>ALGO ABYSS / CHAPTER 01</span><span>知识不是说明，它是世界的物理规则。</span><span>AUTONOMOUS BUILD 0.2</span></footer>
    </main>
  );
}

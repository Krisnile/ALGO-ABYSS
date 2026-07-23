"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "./chapters";

export function ChapterExperience({ slug }: { slug: string }) {
  const index = Math.max(0, chapters.findIndex((chapter) => chapter.slug === slug));
  const chapter = chapters[index];
  const [collapsed, setCollapsed] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(max-width: 900px)").matches) setCollapsed(true);
    const id = window.setInterval(() => setTick((value) => value + 1), 650);
    return () => window.clearInterval(id);
  }, []);

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
        <World chapter={chapter.slug} tick={tick} />
        <div className="watch-card"><small>这一关看什么</small><p>{chapter.watch}</p><i>观察即可 · 画面会自动演化</i></div>
      </div>
      <div className="lesson-explain"><div><small>核心直觉</small><p>{chapter.insight}</p></div><div className="lesson-formula"><small>最小公式</small><b>{chapter.formula}</b></div></div>
      <footer className="lesson-pagination">
        {index > 0 ? <Link href={`/rl/${chapters[index - 1].slug}`}>← <span>上一关</span><b>{chapters[index - 1].title}</b></Link> : <span />}
        {index < chapters.length - 1 ? <Link href={`/rl/${chapters[index + 1].slug}`}><span>下一关</span><b>{chapters[index + 1].title}</b> →</Link> : <Link href="/rl/01"><span>完成篇章</span><b>重新探索</b> ↻</Link>}
      </footer>
    </section>
  </main>;
}

function World({ chapter, tick }: { chapter: string; tick: number }) {
  const active = tick % 6;
  if (chapter === "01") return <div className="world world-loop"><div className="loop-orbit">{["状态","动作","奖励","新状态"].map((x,i)=><i key={x} className={active%4===i?"on":""}>{x}</i>)}</div><b className="world-agent" style={{transform:`rotate(${active*90}deg) translateX(150px) rotate(${-active*90}deg)`}}>A</b></div>;
  if (chapter === "02") return <div className="world world-return">{[9,6,4,3,2,1].map((v,i)=><i key={i} style={{opacity:1-i*.13,transform:`scale(${1-i*.1}) translateY(${Math.sin((tick+i)*.7)*18}px)`}}><b>+{v}</b><small>γ^{i}</small></i>)}</div>;
  if (chapter === "03") return <div className="world world-bellman"><b>V(s)</b>{[0,1,2,3].map(i=><i key={i} style={{animationDelay:`${i*.45}s`}}/>)}<span>R + γV(s′)</span></div>;
  if (chapter === "04") return <div className="world world-epsilon"><div className="epsilon-core">ε<small>{(Math.max(.08,.72-(tick%70)*.009)).toFixed(2)}</small></div>{["?","◆","★"].map((x,i)=><i key={x} className={active%3===i?"chosen":""}><b>{x}</b><small>Q {(0.2+i*.25+Math.sin((tick+i)*.3)*.08).toFixed(2)}</small></i>)}<span className={active%3===2?"exploit":"explore"}>{active%3===2?"利用当前最优":"探索未知分支"}</span></div>;
  if (chapter === "05") return <div className="world world-film">{[0,1,2,3,4,5].map((_,i)=><i key={i} className={i<=active?"on":""}><b>{i===5?"★":`S${i}`}</b><small>{i===5?"+10":"0"}</small></i>)}<span style={{width:`${(active+1)*15}%`}}>完整回报倒流</span></div>;
  if (chapter === "06") return <div className="world world-td">{[0,1,2,3,4].map((_,i)=><i key={i} className={active%5===i?"on":""}>S{i}</i>)}<b style={{left:`${12+(active%5)*19}%`}}>δ</b></div>;
  if (chapter === "07") return <div className="world world-cliff"><div className="safe"><i style={{left:`${(tick*7)%90}%`}}/>SARSA · 安全</div><div className="risky"><i style={{left:`${(tick*11)%90}%`}}/>最短 · 危险</div><span>CLIFF</span></div>;
  if (chapter === "08") return <div className="world world-grid">{Array.from({length:64},(_,i)=><i key={i} className={i===55?"goal":i===active*9?"agent":""} style={{opacity:.15+((i*17+tick*5)%80)/100}}/>)}<b>max Q</b></div>;
  if (chapter === "09") return <div className="world world-surface">{Array.from({length:34},(_,i)=><i key={i} style={{height:`${18+((i*23+tick*3)%72)}%`}}/>)}<b>Q(s,a; θ)</b></div>;
  if (chapter === "10") return <div className="world world-network"><div>{Array.from({length:9},(_,i)=><i key={i} className={(i+tick)%3===0?"on":""}>e{i}</i>)}</div><span>REPLAY</span><section>{[3,5,4,3].map((n,l)=><div key={l}>{Array.from({length:n},(_,i)=><i key={i}/>)}</div>)}</section><b>TARGET</b></div>;
  if (chapter === "11") return <div className="world world-policy">{["←","↑","→"].map((x,i)=><i key={x} style={{height:`${25+((tick*(i+2)+i*21)%62)}%`}}><b>{x}</b></i>)}<span>∇J(θ)</span></div>;
  if (chapter === "12") return <div className="world world-ac"><div>ACTOR<small>π(a|s)</small></div><i style={{transform:`scaleX(${.55+(active/10)})`}}>A(s,a)</i><div>CRITIC<small>V(s)</small></div></div>;
  return <div className="world world-ppo"><div className="clip"/><i style={{left:`${18+(tick*7)%65}%`}}>π</i><span>0.8</span><span>1.2</span><b>CLIPPED UPDATE</b></div>;
}

export const chapters = [
  { slug:"01", title:"智能体与环境", en:"Agent Loop / MDP", zone:"状态回廊", question:"强化学习从哪里开始？", insight:"智能体观察状态、采取动作、得到奖励，环境再进入下一状态。", formula:"Sₜ → Aₜ → Rₜ₊₁ → Sₜ₊₁", watch:"跟随发光的智能体，看一次完整交互如何循环。" },
  { slug:"02", title:"回报与折扣", en:"Return / γ", zone:"回报星河", question:"很久以后的奖励还值多少？", insight:"折扣因子 γ 决定智能体更看重眼前，还是愿意为长期结果等待。", formula:"Gₜ = Rₜ₊₁ + γRₜ₊₂ + …", watch:"观察越远的奖励如何逐渐变暗、变小。" },
  { slug:"03", title:"价值与递推", en:"Value / Bellman", zone:"价值波场", question:"怎样把未来压缩成一个数？", insight:"状态价值等于即时奖励，加上折扣后的下一状态价值。", formula:"V(s) = 𝔼[R + γV(s′)]", watch:"看未来价值形成波纹，反向传回当前状态。" },
  { slug:"04", title:"探索与利用", en:"ε-greedy", zone:"晶洞岔路", question:"尝试未知，还是使用当前最好？", insight:"以 ε 的概率探索，其余时间选择当前价值最高的动作。", formula:"A = random, p=ε · argmax Q, p=1−ε", watch:"黄色路线是探索，绿色路线是利用；策略会自行切换。" },
  { slug:"05", title:"完整经历学习", en:"Monte Carlo", zone:"记忆剧场", question:"能否等冒险结束，再回头学习？", insight:"蒙特卡洛方法用完整回报更新价值，不需要环境模型。", formula:"V(Sₜ) ← V(Sₜ) + α(Gₜ−V(Sₜ))", watch:"等待轨迹抵达终点，再看回报从结局倒流。" },
  { slug:"06", title:"走一步就更新", en:"TD Learning", zone:"时间差断层", question:"还没走到终点，能不能提前学习？", insight:"TD 用下一状态的估值作为临时答案，边走边修正。", formula:"δ = R + γV(S′) − V(S)", watch:"δ 闪光出现时，当前状态立刻获得一次修正。" },
  { slug:"07", title:"沿当前策略学习", en:"SARSA", zone:"悬崖航线", question:"如果下一步真的还会探索呢？", insight:"SARSA 使用实际选择的下一动作，学习贴近当前策略的安全路线。", formula:"Q(S,A) ← Q + α[R+γQ(S′,A′)−Q]", watch:"比较蓝色安全航线与贴近悬崖的短路线。" },
  { slug:"08", title:"学习最优动作", en:"Q-Learning", zone:"价值迷宫", question:"当前乱走，也能学习最优路线吗？", insight:"Q-Learning 更新时假设下一步选择最大 Q，是离策略学习。", formula:"R + γ maxₐ Q(S′,a)", watch:"热度会在迷宫里传播，智能体逐渐朝最亮的格子移动。" },
  { slug:"09", title:"从表格到函数", en:"Approximation", zone:"参数地形", question:"状态多到表格装不下怎么办？", insight:"用参数函数概括相似状态，把经验推广到没见过的位置。", formula:"Q(s,a; θ) ≈ Q*(s,a)", watch:"观察参数曲面改变后，一整片相似状态同时变化。" },
  { slug:"10", title:"神经网络估值", en:"DQN", zone:"记忆工厂", question:"怎样让神经网络稳定预测 Q 值？", insight:"经验回放打乱样本，目标网络减慢目标变化，让训练稳定。", formula:"Replay Buffer + Target Network", watch:"样本被抽入网络，目标网络只会间歇同步。" },
  { slug:"11", title:"直接学习策略", en:"Policy Gradient", zone:"策略风暴", question:"能否直接调整行动概率？", insight:"高回报动作的概率被提高，低回报动作的概率被压低。", formula:"∇J(θ)=𝔼[∇ log πθ(a|s)G]", watch:"三股行动气流会随回报改变强弱。" },
  { slug:"12", title:"行动与评价协作", en:"Actor-Critic", zone:"双核议会", question:"谁行动，谁负责判断好坏？", insight:"Actor 更新策略，Critic 估计价值并提供更低方差的学习信号。", formula:"Actor π(a|s) ↔ Critic V(s)", watch:"看优势信号在两个核心间往返，推动策略修正。" },
  { slug:"13", title:"限制更新幅度", en:"PPO", zone:"裁剪闸门", question:"学得太猛，为什么反而会崩？", insight:"PPO 裁剪新旧策略比率，限制单次更新，换取稳定进步。", formula:"clip(rₜ, 1−ε, 1+ε)", watch:"策略球会撞上裁剪边界，而不是无限偏移。" },
] as const;

export type Chapter = typeof chapters[number];

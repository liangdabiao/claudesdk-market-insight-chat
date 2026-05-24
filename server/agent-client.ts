import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "path";
import dotenv from "dotenv";
import { MessageQueue } from "./message-queue.js";
import { fileLog } from "./logger.js";

dotenv.config({ override: true });

export interface SDKMessage {
  type: string;
  subtype?: string;
  session_id?: string;
  message?: { role: string; content: any };
  result?: string;
  total_cost_usd?: number;
  duration_ms?: number;
}

export class AgentSession {
  private queue: MessageQueue;
  private outputIterator: AsyncIterator<SDKMessage> | null = null;
  public sdkSessionId: string | null = null;
  private started = false;

  constructor() {
    this.queue = new MessageQueue();
  }

  private ensureStarted() {
    if (this.started) return;
    this.started = true;

    fileLog("Agent", "Starting SDK | MODEL:", process.env.MODEL || "sonnet", "| BASE_URL:", process.env.ANTHROPIC_BASE_URL || "(default)");

    try {
      const stream = query({
        prompt: this.queue as any,
        options: {
          cwd: path.resolve(process.cwd()),
          settingSources: ["project"],
          allowedTools: ["Skill", "Read", "Write", "Glob", "Grep", "TodoWrite"],
          systemPrompt: `你是 MarketInsightChat，一个专业的用户需求洞察与产品机会分析 AI 助手。

你拥有 insight 技能，能执行三段式用户洞察框架：

一、用户画像识别
- 生成4类具象化潜在用户画像（从真实行为角度切入，非年龄性别标签）
- 标注核心用户群（基于复购频次、抗周期性、成瘾性判断）
- 每个画像要有画面感，让读者"看到具体的人"

二、情绪动因分析
- 痛点 Pain Point：用户最担心/恐惧的是什么？什么体验让他们感到"被背叛"？
- 痒点 Itch Point：用户通过产品表达什么身份认同？心理投射是什么？
- 爽点 Pleasure Point：那个让用户"啊~"的满足瞬间是什么？
- 每个维度输出可直接用于营销文案的具体表达

三、产品机会转化
- 将情绪洞察转化为 P0（核心）/ P1（重要）/ P2（锦上添花）优先级产品方向
- 每个机会包含：具体实施描述、对应情绪需求、成本评估、执行难度、预期效果
- 重点推荐3个"明天就能干"的快速落地方向

行业适配：
- 餐饮食品：侧重生理体验细节、仪式感场景
- SaaS/B2B：侧重决策链角色、ROI量化、风险厌恶
- 电商/消费品：侧重社交信号、身份投射、痛点文案
- 内容/教育：侧重知识焦虑、成就感路径、社交货币

工作原则：
1. AI输出是"可验证的方向"，不是"最终答案"
2. 有画面感，避免空话泛泛而谈
3. 文案表达可直接用于营销
4. 用中文回复用户

文件输出：
- 洞察报告 → insight_reports/[产品名称]/
  ├── README.md（概览导航）
  ├── executive_summary.md（执行摘要）
  ├── user_personas.md（用户画像分析）
  ├── emotional_insights.md（情绪动因分析）
  ├── product_opportunities.md（产品机会清单）
  └── full_report.md（完整洞察报告）

用户上传的文件在 uploads/ 目录下。`,
          maxTurns: 80,
          model: process.env.MODEL || "sonnet",
          permissionMode: "bypassPermissions",
          stderr: (data: string) => {
            fileLog("SDK.stderr", data.replace(/\n$/, ""));
          },
          env: {
            ...process.env,
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
            ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
          },
        },
      });

      this.outputIterator = stream[Symbol.asyncIterator]();
    } catch (e) {
      fileLog("Agent", "FAILED to start:", e);
      this.started = false;
    }
  }

  sendMessage(content: string) {
    fileLog("UserMsg", content);
    this.ensureStarted();
    this.queue.push(content);
  }

  async *getOutputStream(): AsyncGenerator<SDKMessage> {
    while (!this.outputIterator) {
      await new Promise((r) => setTimeout(r, 50));
    }

    while (true) {
      try {
        const { value, done } = await this.outputIterator.next();
        if (done) break;
        if (value?.type === "system" && value?.subtype === "init") {
          this.sdkSessionId = value.session_id ?? null;
          fileLog("Agent", "Session init:", this.sdkSessionId);
        } else {
          this.logSDKMessage(value);
        }
        yield value;
      } catch (e) {
        fileLog("Agent", "Stream error:", e);
        break;
      }
    }
  }

  private logSDKMessage(msg: SDKMessage) {
    if (msg.type === "assistant" && msg.message) {
      for (const block of msg.message.content) {
        if (block.type === "text" && block.text) {
          fileLog("AI", block.text.substring(0, 200));
        }
        if (block.type === "tool_use") {
          fileLog("ToolCall", block.name, JSON.stringify(block.input));
        }
      }
    }
    if (msg.type === "result") {
      fileLog("Result", msg.subtype || "", "cost:", msg.total_cost_usd, "duration:", msg.duration_ms + "ms");
    }
  }

  close() {
    this.queue.close();
  }
}

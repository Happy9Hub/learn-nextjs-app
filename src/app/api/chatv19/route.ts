import { NextRequest } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { getCurrentDateTool, searchAllProductTool } from "@/agent-tools";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCheckpointer } from "@/db/checkpointer";
import { prisma } from "@/lib/prisma";

const llmModel = new ChatOllama({
    model: 'gemma4:31b-cloud',
    think: false,
    temperature: 0.2,
    maxRetries: 2,
});

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
      });
    
      if (!session) {
        redirect("/sign-in");
      }
      
    const { messages, sessionId }: { messages: UIMessage[], sessionId: string } = await req.json();

    // ส่งให้ agent เฉพาะข้อความทีล่าสุดของผู้ใช้เท่านั้น
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    const [lastLangchainMessage] = lastUserMessage ? await toBaseMessages([lastUserMessage]) : [];

    // shortterm memory for the agent
    const checkpointer = await getCheckpointer();

    // create AI Agent
    const agent = createAgent({
        model: llmModel,
        systemPrompt: `คุณเป็นผู้ช่วยสนับสนุนลูกค้า AI ที่มีความรู้เกี่ยวกับผลิตภัณฑ์และบริการของบริษัทของเรา
                    คุณจะตอบคำถามของลูกค้าและให้ข้อมูลที่ถูกต้องและเป็นประโยชน์
                    รหัสลูกค้า: ${session.user.id}, ชื่อลูกค้า: ${session.user.name}
                    ให้ข้อมูลเกี่ยวกับวันและเวลาปัจจุบันเมื่อถูกถาม`,
        tools: [ getCurrentDateTool, searchAllProductTool ],
        checkpointer: checkpointer,
    });

    const response = agent.streamEvents(
      { messages:  lastLangchainMessage  },
      { streamMode: ['messages'], configurable:{thread_id: sessionId} }
    );

    const uiMessageStream = toUIMessageStream(response, {
        onFinal: async () => {
            const previewText = JSON.stringify(lastLangchainMessage.content.slice(0, 50) ?? '');
            console.log(previewText);
            const res = await prisma.chatThread.upsert({
                where: { threadId: sessionId },
                update: {
                    preview: previewText,
                    messageCount: { increment: 2 },
                    updatedAt: new Date()
                },
                create: {
                    threadId: sessionId,
                    userId: session.user.id,
                    preview: previewText,
                    messageCount: 2
                }
            });
            console.log(res.threadId);
        }
    });
    return createUIMessageStreamResponse({ stream: uiMessageStream });
}
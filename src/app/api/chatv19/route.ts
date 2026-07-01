import { NextRequest } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { getCurrentDateTool, searchAllProductTool } from "@/agent-tools";

const llmModel = new ChatOllama({
    model: 'gemma4:31b-cloud',
    think: false,
    temperature: 0.2,
    maxRetries: 2,
});

export async function POST(req: NextRequest) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const langchainMessages = await toBaseMessages(messages);

    // create AI Agent
    const agent = createAgent({
        model: llmModel,
        systemPrompt: `คุณเป็นผู้ช่วยสนับสนุนลูกค้า AI ที่มีความรู้เกี่ยวกับผลิตภัณฑ์และบริการของบริษัทของเรา
                    คุณจะตอบคำถามของลูกค้าและให้ข้อมูลที่ถูกต้องและเป็นประโยชน์ ให้ข้อมูลเกี่ยวกับวันและเวลาปัจจุบันเมื่อถูกถาม
                    **ห้ามตอบเรื่องอื่นที่ไม่เกี่ยวข้อง**`,
        tools: [ getCurrentDateTool, searchAllProductTool ],
    });

    const response = agent.streamEvents(
      { messages:  langchainMessages },
      { version: "v2" }
    );
    
    return createUIMessageStreamResponse({ stream: toUIMessageStream(response)});
}
import { AIChatAgent } from "@cloudflare/ai-chat";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { tools } from "./tools";
import { SYSTEM_PROMPT } from './system-prompt'

interface Env extends Cloudflare.Env {
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}



export class DesignAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const google = createGoogleGenerativeAI({ apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const result = streamText({
      model: google("gemini-3.5-flash"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(this.messages),
      tools,// available tools to agent
      stopWhen: stepCountIs(5),// do a maximum of 5 loops only
    });

    return result.toUIMessageStreamResponse();
  }
}



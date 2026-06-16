import { AIChatAgent } from "@cloudflare/ai-chat";
import { convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamAgent } from "./agent-core";

interface Env extends Cloudflare.Env {
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}



export class DesignAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const google = createGoogleGenerativeAI({apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY});
    const model = google("gemini-3-flash-preview");
      
    const messages = await convertToModelMessages(this.messages);
      
      const result = streamAgent({
          model,
          messages,
          env:{TAVILY_API_KEY: this.env?.TAVILY_API_KEY } 
      });
    return result.toUIMessageStreamResponse();
  }
}


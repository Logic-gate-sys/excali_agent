import { AIChatAgent } from "@cloudflare/ai-chat";
import {convertToModelMessages} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamAgent } from './agent-core'



interface Env extends Cloudflare.Env {
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}



export class DesignAgent extends AIChatAgent<Env> {
    async onChatMessage() {
    // create model 
    const google = createGoogleGenerativeAI({ apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const result = streamAgent({
      model: google("gemini-3-flash-preview"),
      messages: await convertToModelMessages(this.messages)
    });

    // return streamed messages
    return result.toUIMessageStreamResponse();
  }
}



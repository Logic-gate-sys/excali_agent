import { AIChatAgent } from "@cloudflare/ai-chat";
import { convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamAgent } from "./agent-core";
import { ExcalidrawElement } from "./schemas";
import { UIMessage } from "ai";

type CanvasStatePart = {
  type: "data-canvas-state";
  data: { elements: ExcalidrawElement[] };
};

interface Env extends Cloudflare.Env {
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}

function extractCanvasState(messages: UIMessage[]): ExcalidrawElement[] {
  const last = messages.at(-1);
  const part = last?.parts.find(
    (p): p is CanvasStatePart => p.type === "data-canvas-state",
  );
  return part?.data.elements ?? [];
}

export class DesignAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    // create model
    const google = createGoogleGenerativeAI({
      apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const model = google("gemini-3-flash-preview");
    const canvasState = extractCanvasState(this.messages);
    const messages = await convertToModelMessages(this.messages);
    const result = streamAgent({ model, messages, canvasState });

    // return streamed messages
    return result.toUIMessageStreamResponse();
  }
}

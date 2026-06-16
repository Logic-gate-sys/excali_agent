import {
  generateText,
  streamText,
  stepCountIs,
  type LanguageModel,
  type ModelMessage,
} from "ai";
import { buildTools } from "./tools";
import { serializeCanvasState } from "./context/canvas-state";
import { SYSTEM_PROMPT } from "./system-prompt";

interface AgentArgs {
  model: LanguageModel;
  messages: ModelMessage[];
  canvasState?: unknown[];
  system?: string;
  maxSteps?: number;
  env?: { TAVILY_API_KEY?: string };
}

// Streaming variant. Used by the worker for the live chat experience.

// add canvas state to system prompt to give agent context
// function buildSystem(base: string, canvasState: any[] | undefined): string {
//   return `${base}\n\n# Current canvas state\n\n${serializeCanvasState(canvasState ?? [])}`;
// }

export function streamAgent({ model,messages,system = SYSTEM_PROMPT,maxSteps = 5,env = {}}: AgentArgs) {
  return streamText({
    model,
    system,
    messages,
    tools: buildTools(env),
    stopWhen: stepCountIs(maxSteps),
  });
}

// Non streaming variant. Used by the eval so we can collect the full result
// and pull out elements for scoring.
export async function runAgent({
  model,
  messages,
  system = SYSTEM_PROMPT,
  maxSteps = 5,
  env = {},
}: AgentArgs) {
  const result = await generateText({
    model,
    system,
    messages,
    tools: buildTools(env),
    stopWhen: stepCountIs(maxSteps),
  });
  return {
    text: result.text,
    elements: extractElements(result.steps),
    steps: result.steps,
  };
}

interface StepLike {
  toolResults?: { toolName: string; output: unknown }[];
}

export function extractElements(steps: StepLike[]): unknown[] {
  const elements: unknown[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults ?? []) {
      if (toolResult.toolName === "generateDiagram") {
        const output = toolResult.output as { elements?: unknown[] };
        if (Array.isArray(output?.elements)) elements.push(...output.elements);
      }
    }
  }
  return elements;
}

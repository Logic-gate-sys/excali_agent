import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { config } from 'dotenv'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Eval } from 'braintrust'
import { process } from 'zod/v4/core'
import { runAgent } from "../src/agent-core";
import { buildMessages, type GoldenTestCase } from "./buildMessages";
import { schemaScorer, type AgentOutput } from "./scorers/schema";
import { structureScorer } from "./scorers/structure";
import { preservationScorer } from "./scorers/preservation";
import { labelKeywordScorer } from "./scorers/labelKeyword";


config({path:'.dev.vars'})
const gemini = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

const testCase = JSON.parse(readFileSync(join('evals', 'datatsets', 'golden.json'), 'utf-8'))


config({ path: ".dev.vars" });

const testCases: GoldenTestCase[] = JSON.parse(
  readFileSync(join("evals", "datasets", "golden.json"), "utf-8")
);

Eval<GoldenTestCase, AgentOutput, GoldenTestCase>("Diagram Agent", {
  data: () =>
    testCases.map((tc) => ({
      input: tc,
      expected: tc,
      metadata: { id: tc.id, difficulty: tc.difficulty, category: tc.category },
    })),

  task: async (testCase) => {
    const result = await runAgent({
      model: gemini("gemini-3.5-flash"),
      messages: buildMessages(testCase),
    });
    return { text: result.text, elements: result.elements };
  },

  scores: [schemaScorer, structureScorer, preservationScorer, labelKeywordScorer],
});

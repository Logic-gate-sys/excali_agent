import { DesignAgent } from "./agent";
import { routeAgentRequest } from "agents";

// re-export so the clouadflare worker can discover it
export { DesignAgent };

interface Env {
  DesignAgent: DurableObjectNamespace;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;

import { handle } from "@astrojs/cloudflare/handler";

// For modularity, export all from your durable objects here
// e.g. export * from "./durable-objects/ExampleDurableObject";

export default {
    async fetch(request, env, ctx) {
        return handle(request, env, ctx);
    },
    async queue(batch, _env) {
        let messages = JSON.stringify(batch.messages);
        console.log(`consumed from our queue: ${messages}`);
    },
    async scheduled(event, env, ctx){
        // Do some time logic heere
    },
} satisfies ExportedHandler<Env>;

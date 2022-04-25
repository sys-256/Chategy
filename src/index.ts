import { serve } from "https://deno.land/std@0.136.0/http/mod.ts";
import { handleWebSocket } from "./websocket.ts";

console.log(`Listening on port 3006.`);
serve(
    async (request: Request) => {
        const { pathname: path } = new URL(request.url);

        if (path === `/`) {
            const file = await Deno.readFile(`./public/index.html`);
            return new Response(file, {
                status: 200,
                headers: new Headers({
                    "Content-Type": `text/html`,
                }),
            });
        } else if (path === `/websocket`) {
            if (request.headers.get(`upgrade`) === `websocket`) {
                const { socket, response } = Deno.upgradeWebSocket(request);
                handleWebSocket(socket);
                return response;
            } else {
                return new Response(
                    JSON.stringify({
                        message: `Bad Request - Try sending a valid WebSocket request`,
                        status: 400,
                    }),
                    {
                        status: 400,
                        headers: new Headers({
                            "Content-Type": `application/json`,
                        }),
                    },
                );
            }
        } else {
            return new Response(
                JSON.stringify({
                    message: `Not Found - Only / contains HTML content`,
                    status: 404,
                }),
                {
                    status: 404,
                    headers: new Headers({
                        "Content-Type": `application/json`,
                    }),
                },
            );
        }
    },
    { port: 3006 },
);

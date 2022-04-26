// Import JWT functions
import { createJWT, verifyJWT } from "./jwt.ts";

// Add the connections array to the window object
declare global {
    interface Window {
        connections: {
            socket: WebSocket;
            username: string;
            JWT: string;
        }[];
    }
}

// Initialize the connections array
window.connections = [];

export const handleWebSocket = (socket: WebSocket) => {
    socket.onmessage = async (event) => {
        // Parse the message from the event
        const message = (event.data as string).trim();

        const [validJWT, JWTdata] = await verifyJWT(message);

        // If they are sending a JWT
        if (validJWT) {
            // Register the username and socket
            window.connections.push({
                socket: socket,
                username: JWTdata?.payload.username as string,
                JWT: message,
            });

            // Send the JWT back to the client
            socket.send(message);

            // Remove the socket from the connections array when it closes
            socket.onclose = () => {
                window.connections.splice(
                    window.connections.indexOf({
                        socket: socket,
                        username: JWTdata!.payload.username as string,
                        JWT: message,
                    }),
                    1,
                );
            };
        }
        // If they are sending a username
        else {
            // Parse the message from the event
            const message = (event.data as string).trim();

            // Check if the message and username are valid
            if (message.length <= 0 || !/^[A-Za-z0-9_-]{1,10}$/.test(message)) {
                socket.close(666, `Invalid username`);
                return;
            }

            // Check if the username is already taken
            if (
                window.connections.find((connection) => connection.username === message)
            ) {
                socket.close(666, `Username already taken`);
                return;
            }

            // Create the JWT
            const JWT = await createJWT({ username: message });

            // Register the username and socket
            window.connections.push({
                socket: socket,
                username: message,
                JWT: JWT,
            });

            // Send the JWT to the client
            socket.send(JWT);

            // Remove the socket from the connections array when it closes
            socket.onclose = () => {
                window.connections.splice(
                    window.connections.indexOf({
                        socket: socket,
                        username: message,
                        JWT: JWT,
                    }),
                    1,
                );
            };
        }

        // Listen for messages from the socket
        socket.onmessage = async (event) => {
            // Parse the message from the event
            const messageArray = (event.data as string).trim();
            const [JWT, message] = messageArray.split(`\0`);

            // Verify the JWT
            const [validJWT, JWTdata] = await verifyJWT(JWT);
            if (!validJWT) {
                socket.close(666, `Invalid JWT`);
                return;
            } else {
                // Send the message to the other clients
                for (let i = 0; i < window.connections.length; i++) {
                    if (window.connections[i].socket !== socket) {
                        window.connections[i].socket.send(
                            `${event.timeStamp}\0${JWTdata?.payload.username}: ${message}`,
                        );
                    }
                }
            }
        };
    };
};

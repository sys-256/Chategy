// Add the connections array to the window object
declare global {
    interface Window {
        connections: WebSocket[];
    }
}

// Initialize the connections array
window.connections = [];

export const handleWebSocket = (socket: WebSocket) => {
    // Add the socket to the connections array
    window.connections.push(socket);

    // Listen for messages from the socket
    socket.onmessage = (event) => {
        // Parse the message from the event
        const message = (<string>event.data).trim();

        // Send the message to the other clients
        window.connections.forEach((connection) => {
            if (connection !== socket) {
                connection.send(
                    `${event.timeStamp},Node ${window.connections.indexOf(
                        socket,
                    )}: ${message}`,
                );
            }
        });
    };

    // Remove the socket from the connections array when it closes
    socket.onclose = () => {
        window.connections.splice(window.connections.indexOf(socket), 1);
    };
};

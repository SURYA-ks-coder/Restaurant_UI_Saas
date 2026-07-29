import { io } from "socket.io-client";

let socket = null;

export const connectSocket = ({ token }) => {
  if (socket && socket.connected) return socket;

  socket = io("https://restaurant-server-saas.onrender.com", {
    //http://localhost:5000"
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);
  });
  socket.on("socket:connected", (payload) => {
    console.log("Socket Authenticated:", payload);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket Error:", error.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

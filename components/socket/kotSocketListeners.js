import { getSocket } from "../services/socket";

export const registerKotListeners = ({
  onKotCreated,
  onOrderCreated,
  onKotStatusUpdated,
}) => {
  const socket = getSocket();

  if (!socket) return;

  socket.on("kot:created", (payload) => {
    console.log("New KOT:", payload);

    if (onKotCreated) {
      onKotCreated(payload);
    }
  });

  socket.on("order:created", (payload) => {
    console.log("Order Created:", payload);
    onOrderCreated(payload);
  });

  socket.on("kot:status:updated", (payload) => {
    console.log("KOT Status Updated:", payload);

    if (onKotStatusUpdated) {
      onKotStatusUpdated(payload);
    }
  });
};

export const removeKotListeners = () => {
  const socket = getSocket();

  if (!socket) return;

  socket.off("kot:created");
  socket.off("order:created");
  socket.off("kot:status:updated");
};

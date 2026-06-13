import { getSocket } from "../services/socket";

export const joinDashboard = (branchId) => {
  const socket = getSocket();

  socket.emit("dashboard:subscribe", {
    branchId,
  });
};

export const joinBranch = (branchId) => {
  const socket = getSocket();

  socket.emit(`branch:${branchId}`, {
    branchId,
  });
};

export const leaveBranch = (branchId) => {
  const socket = getSocket();

  socket.emit(`branch:${branchId}:leave`, {
    branchId,
  });
};

export const updateKotStatus = ({ kotId, orderId, branchId, status }) => {
  const socket = getSocket();

  socket.emit("kot:status:update", {
    kotId,
    orderId,
    branchId,
    status,
    updatedAt: new Date(),
  });
};

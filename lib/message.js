"use client";

// Global message singleton — populated by AntdApp on first render.
// Import { message } from "@/lib/message" instead of "antd" everywhere.

let _msg = null;

export function _setMessageInstance(instance) {
  _msg = instance;
}

const noop = () => Promise.resolve();
const get = (key) => (...args) => (_msg?.[key] ?? noop)(...args);

export const message = {
  success: get("success"),
  error: get("error"),
  warning: get("warning"),
  info: get("info"),
  loading: get("loading"),
  open: get("open"),
  destroy: get("destroy"),
};

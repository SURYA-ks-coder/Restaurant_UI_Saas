"use client";

import { App } from "antd";
import { _setMessageInstance } from "@/lib/message";

function MessageSync() {
  const { message } = App.useApp();
  _setMessageInstance(message);
  return null;
}

export default function AntdApp({ children }) {
  return (
    <App>
      <MessageSync />
      {children}
    </App>
  );
}

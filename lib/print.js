"use client";

import { action, URL as API_URL } from "@/lib/API";
import { getAccessToken } from "@/lib/auth";
import { message } from "@/lib/message";

export function printHtmlInBrowser(html) {
  if (!html) return;
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}

export async function triggerPrint({ endpoint, id }) {
  const result = await action(`${endpoint}/${id}`, {}, "POST");
  const html = result?.data?.html;
  const printers = result?.data?.printers || [];

  const needsBrowserPrint =
    printers.length === 0 || printers.some((p) => !p.dispatched);

  const failedLan = printers.filter(
    (p) => p.connectionType === "lan" && !p.dispatched && p.error,
  );

  if (needsBrowserPrint) {
    printHtmlInBrowser(html);
  }

  if (failedLan.length) {
    message.warning(
      `Kitchen printer offline: ${failedLan.map((p) => p.name).join(", ")}`,
    );
  }

  return { html, printers, needsBrowserPrint, failedLan };
}

export async function getPrintPreviewHtml(endpoint, id) {
  const res = await fetch(`${API_URL}${endpoint}/${id}/preview`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return res.text();
}

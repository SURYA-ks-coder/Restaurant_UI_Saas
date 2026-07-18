"use client";

import { useMemo, useState } from "react";
import { Modal, Segmented } from "antd";
import { Printer } from "lucide-react";
import { printHtmlInBrowser } from "@/lib/print";
import { renderTemplateHtml, TEMPLATE_STYLES } from "./templates";

export default function TemplatePreviewModal({
  open,
  close,
  docType,
  docLabel,
  styleId,
  settings,
}) {
  const [paperWidth, setPaperWidth] = useState("80mm");

  const style = (TEMPLATE_STYLES[docType] || []).find((t) => t.id === styleId);

  const html = useMemo(() => {
    if (!open || !docType || !styleId) return "";
    return renderTemplateHtml(docType, styleId, settings, paperWidth);
  }, [open, docType, styleId, settings, paperWidth]);

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={460}
      title={
        <div>
          <span>{style?.name || "Template"} — {docLabel}</span>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            Preview with sample data. Actual prints use your live order data.
          </p>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Segmented
            options={[
              { label: "58 mm", value: "58mm" },
              { label: "80 mm", value: "80mm" },
            ]}
            value={paperWidth}
            onChange={setPaperWidth}
          />
          <button
            type="button"
            onClick={() => printHtmlInBrowser(html)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Printer size={14} />
            Test Print
          </button>
        </div>

        <div className="flex justify-center rounded-lg border border-border bg-gray-100 p-4 dark:bg-gray-800">
          <iframe
            title="Template preview"
            srcDoc={html}
            className="rounded bg-white shadow-md"
            style={{
              width: paperWidth === "58mm" ? 236 : 318,
              height: 480,
              border: "none",
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "antd";
import { CheckCircle2, Eye } from "lucide-react";
import { AntInput } from "@/components/ui/AntInput";
import AntTextArea from "@/components/ui/AntTextArea";
import ButtonClick from "@/components/ui/ButtonClick";
import { API, action, getAction } from "@/lib/API";
import { getDefaultBranchId, hasPermission } from "@/lib/auth";
import { message } from "@/lib/message";
import TemplatePreviewModal from "./TemplatePreviewModal";
import { DOC_TYPES, TEMPLATE_STYLES, renderTemplateHtml } from "./templates";

const DEFAULTS = {
  receipt: {
    template: "classic",
    headerText: "",
    footerText: "",
    showGSTNumber: false,
    gstNumber: "",
    currencySymbol: "₹",
  },
  kot: {
    template: "classic",
    headerText: "",
    showTableName: true,
  },
  qrOrderSlip: {
    template: "classic",
    headerText: "",
  },
};

// Selected template ids also live in localStorage (per branch) so the choice
// survives even if the backend strips the unknown `template` field.
const templateStorageKey = () => {
  const branchId =
    (typeof window !== "undefined" && localStorage.getItem("branchId")) ||
    getDefaultBranchId() ||
    "default";
  return `printTemplates:${branchId}`;
};

const readStoredTemplates = () => {
  try {
    return JSON.parse(localStorage.getItem(templateStorageKey())) || {};
  } catch {
    return {};
  }
};

const storeTemplate = (section, templateId) => {
  try {
    const stored = readStoredTemplates();
    stored[section] = templateId;
    localStorage.setItem(templateStorageKey(), JSON.stringify(stored));
  } catch {}
};

function TemplateCard({ docType, style, settings, selected, canManage, onSelect, onPreview }) {
  const html = useMemo(
    () => renderTemplateHtml(docType, style.id, settings, "80mm"),
    [docType, style.id, settings],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => canManage && onSelect(style.id)}
      onKeyDown={(e) => {
        if (canManage && (e.key === "Enter" || e.key === " ")) onSelect(style.id);
      }}
      className={`group relative w-37.5 shrink-0 cursor-pointer rounded-lg border-2 p-2 transition ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      } ${canManage ? "" : "cursor-default"}`}
    >
      {selected && (
        <CheckCircle2
          size={18}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-white text-primary"
        />
      )}

      <div className="relative h-37.5 overflow-hidden rounded bg-gray-100">
        <iframe
          title={`${style.name} thumbnail`}
          srcDoc={html}
          scrolling="no"
          tabIndex={-1}
          className="pointer-events-none origin-top-left bg-white"
          style={{ width: 302, height: 340, border: "none", transform: "scale(0.44)" }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(style.id);
          }}
          className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100"
        >
          <Eye size={12} />
          View
        </button>
      </div>

      <p className="mt-1.5 text-center text-xs font-semibold">{style.name}</p>
      <p className="text-center text-[10px] leading-tight text-muted-foreground">
        {style.description}
      </p>
    </div>
  );
}

export default function TemplateSettings() {
  const [sections, setSections] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [preview, setPreview] = useState(null); // { docType, styleId }
  const canManage = hasPermission("print:manage");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_PRINT_SETTINGS);
      const stored = readStoredTemplates();
      const data = result?.statusCode === 200 ? result.data || {} : {};
      setSections({
        receipt: {
          ...DEFAULTS.receipt,
          template: stored.receipt || DEFAULTS.receipt.template,
          ...data.receipt,
        },
        kot: {
          ...DEFAULTS.kot,
          template: stored.kot || DEFAULTS.kot.template,
          ...data.kot,
        },
        qrOrderSlip: {
          ...DEFAULTS.qrOrderSlip,
          template: stored.qrOrderSlip || DEFAULTS.qrOrderSlip.template,
          ...data.qrOrderSlip,
        },
      });
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const updateSection = (key, patch) =>
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const selectTemplate = (key, templateId) => {
    updateSection(key, { template: templateId });
    storeTemplate(key, templateId);
  };

  const saveSection = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await action(
        API.UPDATE_PRINT_SETTINGS,
        { [key]: sections[key] },
        "PUT",
      );
      if (result?.statusCode === 200) {
        storeTemplate(key, sections[key].template);
        message.success(result?.message || "Template settings updated");
      } else {
        message.error(result?.message || "Unable to update template settings");
      }
    } catch {
      message.error("Unable to update template settings");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading templates...</div>;
  }

  const renderGallery = (docType) => (
    <div>
      <p className="mb-2 text-sm font-medium">Template Design</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(TEMPLATE_STYLES[docType] || []).map((style) => (
          <TemplateCard
            key={style.id}
            docType={docType}
            style={style}
            settings={sections[docType]}
            selected={sections[docType].template === style.id}
            canManage={canManage}
            onSelect={(id) => selectTemplate(docType, id)}
            onPreview={(id) => setPreview({ docType, styleId: id })}
          />
        ))}
      </div>
    </div>
  );

  const sectionShell = (docType, title, fields) => (
    <div key={docType} className="space-y-4 rounded-lg border border-border p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {canManage && (
          <ButtonClick
            buttonName="Save"
            handleSubmit={() => saveSection(docType)}
            loading={saving[docType]}
          />
        )}
      </div>
      {renderGallery(docType)}
      <div className="grid gap-4 md:grid-cols-2">{fields}</div>
    </div>
  );

  const { receipt, kot, qrOrderSlip } = sections;

  return (
    <div className="space-y-6 py-4">
      {sectionShell(
        "receipt",
        "Receipt / Bill",
        <>
          <AntInput
            label="Header Text"
            value={receipt.headerText}
            disabled={!canManage}
            onChange={(e) => updateSection("receipt", { headerText: e.target.value })}
          />
          <AntInput
            label="Currency Symbol"
            value={receipt.currencySymbol}
            disabled={!canManage}
            onChange={(e) => updateSection("receipt", { currencySymbol: e.target.value })}
          />
          <AntTextArea
            label="Footer Text"
            rows={2}
            value={receipt.footerText}
            disabled={!canManage}
            onChange={(e) => updateSection("receipt", { footerText: e.target.value })}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show GST Number</span>
              <Switch
                checked={receipt.showGSTNumber}
                disabled={!canManage}
                onChange={(checked) => updateSection("receipt", { showGSTNumber: checked })}
              />
            </div>
            {receipt.showGSTNumber && (
              <AntInput
                label="GST Number"
                value={receipt.gstNumber}
                disabled={!canManage}
                onChange={(e) => updateSection("receipt", { gstNumber: e.target.value })}
              />
            )}
          </div>
        </>,
      )}

      {sectionShell(
        "kot",
        "KOT",
        <>
          <AntInput
            label="Header Text"
            value={kot.headerText}
            disabled={!canManage}
            onChange={(e) => updateSection("kot", { headerText: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Show Table Name</span>
            <Switch
              checked={kot.showTableName}
              disabled={!canManage}
              onChange={(checked) => updateSection("kot", { showTableName: checked })}
            />
          </div>
        </>,
      )}

      {sectionShell(
        "qrOrderSlip",
        "QR Order Slip",
        <AntInput
          label="Header Text"
          value={qrOrderSlip.headerText}
          disabled={!canManage}
          onChange={(e) => updateSection("qrOrderSlip", { headerText: e.target.value })}
        />,
      )}

      <TemplatePreviewModal
        open={Boolean(preview)}
        close={() => setPreview(null)}
        docType={preview?.docType}
        docLabel={DOC_TYPES.find((d) => d.key === preview?.docType)?.label}
        styleId={preview?.styleId}
        settings={preview ? sections[preview.docType] : {}}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Switch } from "antd";
import { AntInput } from "@/components/ui/AntInput";
import AntTextArea from "@/components/ui/AntTextArea";
import ButtonClick from "@/components/ui/ButtonClick";
import { API, action, getAction } from "@/lib/API";
import { hasPermission } from "@/lib/auth";
import { message } from "@/lib/message";

const DEFAULTS = {
  receipt: {
    headerText: "",
    footerText: "",
    showGSTNumber: false,
    gstNumber: "",
    currencySymbol: "₹",
  },
  kot: {
    headerText: "",
    showTableName: true,
  },
  qrOrderSlip: {
    headerText: "",
  },
};

export default function TemplateSettings() {
  const [receipt, setReceipt] = useState(DEFAULTS.receipt);
  const [kot, setKot] = useState(DEFAULTS.kot);
  const [qrOrderSlip, setQrOrderSlip] = useState(DEFAULTS.qrOrderSlip);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({ receipt: false, kot: false, qrOrderSlip: false });
  const canManage = hasPermission("print:manage");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_PRINT_SETTINGS);
      if (result?.statusCode === 200 && result.data) {
        setReceipt({ ...DEFAULTS.receipt, ...result.data.receipt });
        setKot({ ...DEFAULTS.kot, ...result.data.kot });
        setQrOrderSlip({ ...DEFAULTS.qrOrderSlip, ...result.data.qrOrderSlip });
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const saveSection = async (section, value) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    try {
      const result = await action(
        API.UPDATE_PRINT_SETTINGS,
        { [section]: value },
        "PUT",
      );
      if (result?.statusCode === 200) {
        message.success(result?.message || "Template settings updated");
      } else {
        message.error(result?.message || "Unable to update template settings");
      }
    } catch {
      message.error("Unable to update template settings");
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="grid gap-6 py-4 lg:grid-cols-3">
      <div className="space-y-4 rounded-lg border border-border p-5">
        <h3 className="font-semibold">Receipt / Bill</h3>
        <AntInput
          label="Header Text"
          value={receipt.headerText}
          disabled={!canManage}
          onChange={(e) => setReceipt({ ...receipt, headerText: e.target.value })}
        />
        <AntTextArea
          label="Footer Text"
          rows={2}
          value={receipt.footerText}
          disabled={!canManage}
          onChange={(e) => setReceipt({ ...receipt, footerText: e.target.value })}
        />
        <AntInput
          label="Currency Symbol"
          value={receipt.currencySymbol}
          disabled={!canManage}
          onChange={(e) => setReceipt({ ...receipt, currencySymbol: e.target.value })}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show GST Number</span>
          <Switch
            checked={receipt.showGSTNumber}
            disabled={!canManage}
            onChange={(checked) => setReceipt({ ...receipt, showGSTNumber: checked })}
          />
        </div>
        {receipt.showGSTNumber && (
          <AntInput
            label="GST Number"
            value={receipt.gstNumber}
            disabled={!canManage}
            onChange={(e) => setReceipt({ ...receipt, gstNumber: e.target.value })}
          />
        )}
        {canManage && (
          <ButtonClick
            buttonName="Save"
            handleSubmit={() => saveSection("receipt", receipt)}
            loading={saving.receipt}
          />
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-border p-5">
        <h3 className="font-semibold">KOT</h3>
        <AntInput
          label="Header Text"
          value={kot.headerText}
          disabled={!canManage}
          onChange={(e) => setKot({ ...kot, headerText: e.target.value })}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show Table Name</span>
          <Switch
            checked={kot.showTableName}
            disabled={!canManage}
            onChange={(checked) => setKot({ ...kot, showTableName: checked })}
          />
        </div>
        {canManage && (
          <ButtonClick
            buttonName="Save"
            handleSubmit={() => saveSection("kot", kot)}
            loading={saving.kot}
          />
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-border p-5">
        <h3 className="font-semibold">QR Order Slip</h3>
        <AntInput
          label="Header Text"
          value={qrOrderSlip.headerText}
          disabled={!canManage}
          onChange={(e) => setQrOrderSlip({ ...qrOrderSlip, headerText: e.target.value })}
        />
        {canManage && (
          <ButtonClick
            buttonName="Save"
            handleSubmit={() => saveSection("qrOrderSlip", qrOrderSlip)}
            loading={saving.qrOrderSlip}
          />
        )}
      </div>
    </div>
  );
}

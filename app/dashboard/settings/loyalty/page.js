"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Save, Trash2 } from "lucide-react";
import { Skeleton, InputNumber, Switch, Select, Input } from "antd";
import { message } from "@/lib/message";
import { getAction, API, postAction } from "@/lib/API";

export default function LoyaltySettingsPage() {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAction(API.GET_LOYALTY_PROGRAM)
      .then((res) => {
        if (res?.statusCode === 200) setProgram(res.data);
        else message.error(res?.message || "Unable to load loyalty program");
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setProgram((p) => ({ ...p, ...patch }));
  const setNested = (key, patch) =>
    setProgram((p) => ({ ...p, [key]: { ...p[key], ...patch } }));

  const setTier = (index, patch) =>
    setProgram((p) => ({
      ...p,
      tiers: p.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));

  const addTier = () =>
    setProgram((p) => ({
      ...p,
      tiers: [...p.tiers, { name: "New tier", threshold: 0, multiplier: 1, color: "#888888" }],
    }));

  const removeTier = (index) =>
    setProgram((p) => ({ ...p, tiers: p.tiers.filter((_, i) => i !== index) }));

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        status: program.status,
        earnRate: program.earnRate,
        redeemValue: program.redeemValue,
        minRedeemPoints: program.minRedeemPoints,
        maxRedeemPercentPerBill: program.maxRedeemPercentPerBill,
        pointsExpiryDays: program.pointsExpiryDays,
        tiers: program.tiers.map(({ name, threshold, multiplier, color }) => ({
          name, threshold, multiplier, color,
        })),
        birthdayReward: {
          enabled: program.birthdayReward?.enabled || false,
          type: program.birthdayReward?.type || "points",
          value: program.birthdayReward?.value || 0,
          windowDays: program.birthdayReward?.windowDays || 7,
        },
        referral: {
          enabled: program.referral?.enabled || false,
          referrerPoints: program.referral?.referrerPoints || 0,
          refereePoints: program.referral?.refereePoints || 0,
          minFirstBillAmount: program.referral?.minFirstBillAmount || 0,
        },
        walletEnabled: program.walletEnabled || false,
      };
      const res = await postAction(API.UPDATE_LOYALTY_PROGRAM, body, "PUT");
      if (res?.statusCode === 200) message.success("Loyalty program saved");
      else message.error(res?.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!program) return null;

  const Section = ({ title, children, extra }) => (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {extra}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
            <Gift className="w-3.5 h-3.5" />
            Settings / Loyalty Program
          </div>
          <h1 className="text-xl font-semibold text-foreground">Loyalty & Rewards</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Program active
            <Switch
              checked={program.status === "active"}
              onChange={(v) => set({ status: v ? "active" : "inactive" })}
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Earning & redemption">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Points earned per ₹1 spent">
              <InputNumber className="w-full" min={0} step={0.01} value={program.earnRate} onChange={(v) => set({ earnRate: v })} />
            </Field>
            <Field label="₹ value of 1 point">
              <InputNumber className="w-full" min={0} step={0.05} value={program.redeemValue} onChange={(v) => set({ redeemValue: v })} />
            </Field>
            <Field label="Minimum points to redeem">
              <InputNumber className="w-full" min={0} value={program.minRedeemPoints} onChange={(v) => set({ minRedeemPoints: v })} />
            </Field>
            <Field label="Max % of a bill payable by points">
              <InputNumber className="w-full" min={1} max={100} value={program.maxRedeemPercentPerBill} onChange={(v) => set({ maxRedeemPercentPerBill: v })} />
            </Field>
            <Field label="Points expire after (days of inactivity, 0 = never)">
              <InputNumber className="w-full" min={0} value={program.pointsExpiryDays} onChange={(v) => set({ pointsExpiryDays: v })} />
            </Field>
            <Field label="Customer wallet">
              <div className="pt-1.5">
                <Switch checked={program.walletEnabled} onChange={(v) => set({ walletEnabled: v })} />
                <span className="ml-2 text-xs text-muted-foreground">Allow prepaid wallet payments</span>
              </div>
            </Field>
          </div>
        </Section>

        <Section
          title="Membership tiers (by lifetime spend)"
          extra={
            <button onClick={addTier} className="flex items-center gap-1 text-xs text-primary">
              <Plus className="w-3.5 h-3.5" /> Add tier
            </button>
          }
        >
          <div className="space-y-2">
            {program.tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_90px_70px_28px] items-center gap-2">
                <Input value={tier.name} onChange={(e) => setTier(i, { name: e.target.value })} />
                <InputNumber className="w-full" min={0} value={tier.threshold} onChange={(v) => setTier(i, { threshold: v })} placeholder="₹ spend" />
                <InputNumber className="w-full" min={0} step={0.05} value={tier.multiplier} onChange={(v) => setTier(i, { multiplier: v })} placeholder="×" />
                <input
                  type="color"
                  value={tier.color || "#888888"}
                  onChange={(e) => setTier(i, { color: e.target.value })}
                  className="h-8 w-full cursor-pointer rounded border border-border bg-card"
                />
                <button onClick={() => removeTier(i)} className="text-destructive" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_100px_90px_70px_28px] gap-2 text-[10px] text-muted-foreground">
              <span>Name</span><span>Spend threshold</span><span>Earn multiplier</span><span>Color</span><span />
            </div>
          </div>
        </Section>

        <Section
          title="Birthday reward"
          extra={
            <Switch
              checked={program.birthdayReward?.enabled}
              onChange={(v) => setNested("birthdayReward", { enabled: v })}
            />
          }
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Reward type">
              <Select
                className="w-full"
                value={program.birthdayReward?.type || "points"}
                onChange={(v) => setNested("birthdayReward", { type: v })}
                options={[
                  { value: "points", label: "Bonus points" },
                  { value: "percent_discount", label: "% discount voucher" },
                  { value: "flat_discount", label: "Flat ₹ voucher" },
                ]}
              />
            </Field>
            <Field label="Value">
              <InputNumber className="w-full" min={0} value={program.birthdayReward?.value} onChange={(v) => setNested("birthdayReward", { value: v })} />
            </Field>
            <Field label="Window (± days)">
              <InputNumber className="w-full" min={1} max={31} value={program.birthdayReward?.windowDays} onChange={(v) => setNested("birthdayReward", { windowDays: v })} />
            </Field>
          </div>
        </Section>

        <Section
          title="Referral program"
          extra={
            <Switch
              checked={program.referral?.enabled}
              onChange={(v) => setNested("referral", { enabled: v })}
            />
          }
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Referrer gets (points)">
              <InputNumber className="w-full" min={0} value={program.referral?.referrerPoints} onChange={(v) => setNested("referral", { referrerPoints: v })} />
            </Field>
            <Field label="New customer gets (points)">
              <InputNumber className="w-full" min={0} value={program.referral?.refereePoints} onChange={(v) => setNested("referral", { refereePoints: v })} />
            </Field>
            <Field label="Min first bill (₹)">
              <InputNumber className="w-full" min={0} value={program.referral?.minFirstBillAmount} onChange={(v) => setNested("referral", { minFirstBillAmount: v })} />
            </Field>
          </div>
        </Section>
      </div>
    </div>
  );
}

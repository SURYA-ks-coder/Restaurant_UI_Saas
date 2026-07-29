"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Save, Trash2 } from "lucide-react";
import { Skeleton, Switch } from "antd";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import ButtonClick from "@/components/ui/ButtonClick";
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
          <ButtonClick
            BtnType="primary"
            buttonName={saving ? "Saving…" : "Save changes"}
            icon={<Save className="w-3.5 h-3.5" />}
            handleSubmit={save}
            loading={saving}
            disabled={saving}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Earning & redemption">
          <div className="grid grid-cols-2 gap-4">
            <AntInput
              label="Points earned per ₹1 spent"
              type="number"
              min={0}
              step={0.01}
              value={program.earnRate}
              onChange={(e) => set({ earnRate: Number(e.target.value) })}
            />
            <AntInput
              label="₹ value of 1 point"
              type="number"
              min={0}
              step={0.05}
              value={program.redeemValue}
              onChange={(e) => set({ redeemValue: Number(e.target.value) })}
            />
            <AntInput
              label="Minimum points to redeem"
              type="number"
              min={0}
              value={program.minRedeemPoints}
              onChange={(e) => set({ minRedeemPoints: Number(e.target.value) })}
            />
            <AntInput
              label="Max % of a bill payable by points"
              type="number"
              min={1}
              max={100}
              value={program.maxRedeemPercentPerBill}
              onChange={(e) => set({ maxRedeemPercentPerBill: Number(e.target.value) })}
            />
            <AntInput
              label="Points expire after (days of inactivity, 0 = never)"
              type="number"
              min={0}
              value={program.pointsExpiryDays}
              onChange={(e) => set({ pointsExpiryDays: Number(e.target.value) })}
            />
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Customer wallet</div>
              <div className="pt-1.5">
                <Switch checked={program.walletEnabled} onChange={(v) => set({ walletEnabled: v })} />
                <span className="ml-2 text-xs text-muted-foreground">Allow prepaid wallet payments</span>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Membership tiers (by lifetime spend)"
          extra={
            <ButtonClick
              BtnType="link"
              size="small"
              buttonName="Add tier"
              icon={<Plus className="w-3.5 h-3.5" />}
              handleSubmit={addTier}
            />
          }
        >
          <div className="space-y-2">
            {program.tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_90px_70px_28px] items-center gap-2">
                <AntInput value={tier.name} onChange={(e) => setTier(i, { name: e.target.value })} />
                <AntInput
                  type="number"
                  min={0}
                  value={tier.threshold}
                  onChange={(e) => setTier(i, { threshold: Number(e.target.value) })}
                  placeholder="₹ spend"
                />
                <AntInput
                  type="number"
                  min={0}
                  step={0.05}
                  value={tier.multiplier}
                  onChange={(e) => setTier(i, { multiplier: Number(e.target.value) })}
                  placeholder="×"
                />
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
            <AntSelect
              label="Reward type"
              value={program.birthdayReward?.type || "points"}
              onChange={(v) => setNested("birthdayReward", { type: v })}
              options={[
                { value: "points", label: "Bonus points" },
                { value: "percent_discount", label: "% discount voucher" },
                { value: "flat_discount", label: "Flat ₹ voucher" },
              ]}
            />
            <AntInput
              label="Value"
              type="number"
              min={0}
              value={program.birthdayReward?.value}
              onChange={(e) => setNested("birthdayReward", { value: Number(e.target.value) })}
            />
            <AntInput
              label="Window (± days)"
              type="number"
              min={1}
              max={31}
              value={program.birthdayReward?.windowDays}
              onChange={(e) => setNested("birthdayReward", { windowDays: Number(e.target.value) })}
            />
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
            <AntInput
              label="Referrer gets (points)"
              type="number"
              min={0}
              value={program.referral?.referrerPoints}
              onChange={(e) => setNested("referral", { referrerPoints: Number(e.target.value) })}
            />
            <AntInput
              label="New customer gets (points)"
              type="number"
              min={0}
              value={program.referral?.refereePoints}
              onChange={(e) => setNested("referral", { refereePoints: Number(e.target.value) })}
            />
            <AntInput
              label="Min first bill (₹)"
              type="number"
              min={0}
              value={program.referral?.minFirstBillAmount}
              onChange={(e) => setNested("referral", { minFirstBillAmount: Number(e.target.value) })}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

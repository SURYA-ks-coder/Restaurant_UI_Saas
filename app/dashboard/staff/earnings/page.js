"use client";

import { useCallback, useEffect, useState } from "react";
import { HandCoins, Plus, Trash2, Wallet } from "lucide-react";
import { Modal, Skeleton, Select, InputNumber, Input } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction, patchAction } from "@/lib/API";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const TABS = [
  { id: "pending", label: "Pending payouts" },
  { id: "tips", label: "Tips ledger" },
  { id: "commissions", label: "Commissions" },
  { id: "rules", label: "Commission rules" },
  { id: "payouts", label: "Payout history" },
];

export default function EarningsPage() {
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [tips, setTips] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [rules, setRules] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payoutTarget, setPayoutTarget] = useState(null);
  const [payoutForm, setPayoutForm] = useState({ method: "cash", note: "", recordExpense: true });
  const [ruleModal, setRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: "", basis: "revenue_percent", value: 1, userIds: [] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "pending") {
        const res = await getAction(API.GET_PENDING_EARNINGS);
        if (res?.statusCode === 200) setPending(res.data || []);
      } else if (tab === "tips") {
        const res = await getAction(`${API.GET_TIPS}?limit=50`);
        if (res?.statusCode === 200) setTips(res.data || []);
      } else if (tab === "commissions") {
        const res = await getAction(`${API.GET_COMMISSIONS}?limit=50`);
        if (res?.statusCode === 200) setCommissions(res.data || []);
      } else if (tab === "rules") {
        const res = await getAction(API.GET_COMMISSION_RULES);
        if (res?.statusCode === 200) setRules(res.data || []);
      } else if (tab === "payouts") {
        const res = await getAction(`${API.GET_PAYOUTS}?limit=50`);
        if (res?.statusCode === 200) setPayouts(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAction(`${API.GET_STAFF_LIST}?limit=100`).then((res) => {
      if (res?.statusCode === 200) setStaff(res.data || []);
    });
  }, []);

  const submitPayout = async () => {
    setSaving(true);
    try {
      const res = await action(API.CREATE_PAYOUT, {
        userId: payoutTarget.userId,
        ...payoutForm,
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        message.success(`Payout of ${currency.format(res?.data?.totalAmount || 0)} recorded`);
        setPayoutTarget(null);
        await load();
      } else {
        message.error(res?.message || "Unable to record payout");
      }
    } finally {
      setSaving(false);
    }
  };

  const submitRule = async () => {
    if (!ruleForm.name) return message.error("Rule name is required");
    setSaving(true);
    try {
      const res = await action(API.CREATE_COMMISSION_RULE, {
        name: ruleForm.name,
        basis: ruleForm.basis,
        value: ruleForm.value,
        appliesTo: { userIds: ruleForm.userIds, designationIds: [] },
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        message.success("Rule created");
        setRuleModal(false);
        setRuleForm({ name: "", basis: "revenue_percent", value: 1, userIds: [] });
        await load();
      } else {
        message.error(res?.message || "Unable to create rule");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (id) => {
    const res = await action(`${API.DELETE_COMMISSION_RULE}/${id}`, {}, "DELETE");
    if (res?.statusCode === 200) {
      message.success("Rule deleted");
      await load();
    } else message.error(res?.message || "Unable to delete rule");
  };

  const thead = (cols) => (
    <thead>
      <tr className="border-b border-border bg-muted/40 text-muted-foreground">
        {cols.map((c, i) => (
          <th
            key={c}
            className={cn("px-4 py-3 font-medium", i === 0 ? "text-left" : "text-center", i === cols.length - 1 && "text-right")}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <HandCoins className="w-3.5 h-3.5" />
          Staff / Earnings
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">Tips & Commission</h1>
          {tab === "rules" && (
            <button
              onClick={() => setRuleModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <Plus className="w-3.5 h-3.5" /> New rule
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {tab === "pending" && (
            <table className="w-full min-w-[700px] text-sm">
              {thead(["Staff", "Tips", "Commission", "Total due", "Action"])}
              <tbody>
                {pending.map((row) => (
                  <tr key={String(row.userId)} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{row.user?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-center">
                      {currency.format(row.tipAmount)} <span className="text-[11px] text-muted-foreground">({row.tipCount})</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {currency.format(row.commissionAmount)} <span className="text-[11px] text-muted-foreground">({row.commissionCount})</span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{currency.format(row.totalAmount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setPayoutTarget(row)}
                        className="rounded-lg bg-success/10 px-3 py-1.5 text-[11px] font-medium text-success hover:bg-success/20"
                      >
                        <Wallet className="mr-1 inline w-3.5 h-3.5" />
                        Pay out
                      </button>
                    </td>
                  </tr>
                ))}
                {!pending.length && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nothing pending. 🎉</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "tips" && (
            <table className="w-full min-w-[700px] text-sm">
              {thead(["Waiter", "Bill", "Amount", "Method", "Status", "Date"])}
              <tbody>
                {tips.map((t) => (
                  <tr key={t._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{t.waiterId?.name || "—"}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{t.billNo}</td>
                    <td className="px-4 py-3 text-center">{currency.format(t.amount)}</td>
                    <td className="px-4 py-3 text-center uppercase text-[11px]">{t.method}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", t.payoutStatus === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                        {t.payoutStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmtDate(t.createdAt)}</td>
                  </tr>
                ))}
                {!tips.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No tips recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "commissions" && (
            <table className="w-full min-w-[700px] text-sm">
              {thead(["Staff", "Bill", "Rule", "Base", "Amount", "Status"])}
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{c.userId?.name || "—"}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{c.billNo}</td>
                    <td className="px-4 py-3 text-center">{c.ruleName}</td>
                    <td className="px-4 py-3 text-center">{currency.format(c.baseAmount)}</td>
                    <td className="px-4 py-3 text-center font-medium">{currency.format(c.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", c.payoutStatus === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                        {c.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {!commissions.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No commissions yet — create a rule first.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "rules" && (
            <table className="w-full min-w-[700px] text-sm">
              {thead(["Rule", "Basis", "Value", "Applies to", "Status", ""])}
              <tbody>
                {rules.map((r) => (
                  <tr key={r._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-center">{r.basis === "revenue_percent" ? "% of revenue" : "Flat per bill"}</td>
                    <td className="px-4 py-3 text-center">{r.basis === "revenue_percent" ? `${r.value}%` : currency.format(r.value)}</td>
                    <td className="px-4 py-3 text-center text-[11px] text-muted-foreground">
                      {(r.appliesTo?.userIds || []).map((u) => u.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", r.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteRule(r._id)} className="text-destructive hover:opacity-80" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!rules.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No commission rules yet.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "payouts" && (
            <table className="w-full min-w-[700px] text-sm">
              {thead(["Staff", "Tips", "Commission", "Total", "Method", "Paid on"])}
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{p.userId?.name || "—"}</td>
                    <td className="px-4 py-3 text-center">{currency.format(p.tipAmount)}</td>
                    <td className="px-4 py-3 text-center">{currency.format(p.commissionAmount)}</td>
                    <td className="px-4 py-3 text-center font-semibold">{currency.format(p.totalAmount)}</td>
                    <td className="px-4 py-3 text-center uppercase text-[11px]">{p.method}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
                {!payouts.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No payouts recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        title={payoutTarget ? `Pay out — ${payoutTarget.user?.name}` : ""}
        open={!!payoutTarget}
        onCancel={() => setPayoutTarget(null)}
        onOk={submitPayout}
        okText={payoutTarget ? `Pay ${currency.format(payoutTarget.totalAmount)}` : "Pay"}
        confirmLoading={saving}
      >
        <div className="space-y-3 pt-2">
          <Select
            className="w-full"
            value={payoutForm.method}
            onChange={(v) => setPayoutForm((f) => ({ ...f, method: v }))}
            options={[
              { value: "cash", label: "Cash" },
              { value: "bank", label: "Bank transfer" },
              { value: "upi", label: "UPI" },
            ]}
          />
          <Input.TextArea
            rows={2}
            placeholder="Note (optional)"
            value={payoutForm.note}
            onChange={(e) => setPayoutForm((f) => ({ ...f, note: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={payoutForm.recordExpense}
              onChange={(e) => setPayoutForm((f) => ({ ...f, recordExpense: e.target.checked }))}
            />
            Record as expense (shows in P&L)
          </label>
        </div>
      </Modal>

      <Modal
        title="New commission rule"
        open={ruleModal}
        onCancel={() => setRuleModal(false)}
        onOk={submitRule}
        okText="Create"
        confirmLoading={saving}
      >
        <div className="space-y-3 pt-2">
          <Input
            placeholder="Rule name (e.g. Waiter 2% of sales)"
            value={ruleForm.name}
            onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            className="w-full"
            value={ruleForm.basis}
            onChange={(v) => setRuleForm((f) => ({ ...f, basis: v }))}
            options={[
              { value: "revenue_percent", label: "% of bill revenue" },
              { value: "per_bill_flat", label: "Flat amount per bill" },
            ]}
          />
          <InputNumber
            className="w-full"
            min={0}
            value={ruleForm.value}
            onChange={(v) => setRuleForm((f) => ({ ...f, value: v }))}
            addonAfter={ruleForm.basis === "revenue_percent" ? "%" : "₹"}
          />
          <Select
            className="w-full"
            mode="multiple"
            placeholder="Applies to staff (leave empty + add designations later)"
            value={ruleForm.userIds}
            onChange={(v) => setRuleForm((f) => ({ ...f, userIds: v }))}
            options={staff.map((s) => ({ value: s._id, label: s.name }))}
            optionFilterProp="label"
          />
        </div>
      </Modal>
    </div>
  );
}

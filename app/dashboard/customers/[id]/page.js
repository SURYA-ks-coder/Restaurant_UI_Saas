"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Cake, Coins, Gift, HeartHandshake, Phone, Star, Wallet,
} from "lucide-react";
import { Modal, Skeleton, InputNumber, Input, Select } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const TXN_LABELS = {
  earn: { label: "Earned", className: "text-success" },
  redeem: { label: "Redeemed", className: "text-destructive" },
  expire: { label: "Expired", className: "text-muted-foreground" },
  adjust: { label: "Adjusted", className: "text-warning" },
  referral: { label: "Referral", className: "text-primary" },
  birthday: { label: "Birthday", className: "text-primary" },
  wallet_topup: { label: "Wallet top-up", className: "text-success" },
  wallet_debit: { label: "Wallet payment", className: "text-destructive" },
};

export default function Customer360Page() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null); // "adjust" | "topup"
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, l, t] = await Promise.all([
        getAction(API.GET_CUSTOMER_360.replace(":id", id)),
        getAction(API.GET_LOYALTY_SUMMARY.replace(":customerId", id)),
        getAction(`${API.GET_LOYALTY_TRANSACTIONS.replace(":customerId", id)}?limit=50`),
      ]);
      if (p?.statusCode === 200) setProfile(p.data);
      if (l?.statusCode === 200) setLoyalty(l.data);
      if (t?.statusCode === 200) setLedger(t.data || []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submitModal = async () => {
    setSaving(true);
    try {
      let res;
      if (modal === "adjust") {
        res = await action(API.LOYALTY_ADJUST, {
          customerId: id,
          points: Number(form.points),
          note: form.note || "Manual adjustment",
        });
      } else if (modal === "topup") {
        res = await action(API.LOYALTY_WALLET_TOPUP, {
          customerId: id,
          amount: Number(form.amount),
          method: form.method || "cash",
        });
      }
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        message.success(res?.message || "Done");
        setModal(null);
        setForm({});
        await load();
      } else {
        message.error(res?.message || "Failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const issueBirthday = async () => {
    const res = await action(API.LOYALTY_BIRTHDAY_REWARD, { customerId: id });
    if (res?.statusCode === 200 || res?.statusCode === 201) {
      message.success("Birthday reward issued 🎂");
      await load();
    } else message.error(res?.message || "Unable to issue reward");
  };

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!profile) return <div className="p-8 text-muted-foreground">Customer not found.</div>;

  const { customer, stats, favoriteItems, recentBills } = profile;
  const tierColor = loyalty?.tier?.current?.color;

  return (
    <div className="min-h-screen bg-background">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to customers
      </button>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">{customer.customerName}</h1>
              {loyalty?.tier?.current && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
                >
                  <Star className="mr-1 inline w-3 h-3" />
                  {loyalty.tier.current.name}
                </span>
              )}
              {loyalty?.birthdayRewardAvailable && (
                <button
                  onClick={issueBirthday}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20"
                >
                  <Cake className="w-3 h-3" /> Birthday reward available — issue
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.mobileNumber}</span>
              {customer.birthday && <span className="flex items-center gap-1"><Cake className="w-3 h-3" />{fmtDate(customer.birthday)}</span>}
              {customer.referralCode && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">Ref: {customer.referralCode}</span>
              )}
            </div>
            {loyalty?.tier?.next && (
              <div className="mt-3 w-72">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Progress to {loyalty.tier.next.name}</span>
                  <span>{Math.round(loyalty.tier.progressToNext * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.round(loyalty.tier.progressToNext * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal("adjust")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary"
            >
              <Coins className="w-3.5 h-3.5" /> Adjust points
            </button>
            {loyalty?.program?.walletEnabled && (
              <button
                onClick={() => setModal("topup")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                <Wallet className="w-3.5 h-3.5" /> Top up wallet
              </button>
            )}
          </div>
        </div>

        {/* Stat tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Points", value: customer.loyaltyPoints || 0 },
            { label: "Wallet", value: currency.format(customer.walletBalance || 0) },
            { label: "Visits", value: stats.totalBills },
            { label: "Total spent", value: currency.format(stats.totalSpent || 0) },
            { label: "Avg bill", value: currency.format(stats.avgBill || 0) },
            { label: "Last visit", value: fmtDate(stats.lastVisit) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
        {["overview", "visits", "ledger", "rewards"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium capitalize",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Favorite items</h3>
            {favoriteItems.length ? (
              <div className="space-y-2">
                {favoriteItems.map((f) => (
                  <div key={String(f._id)} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{f.itemName}</span>
                    <span className="text-xs text-muted-foreground">
                      ×{f.timesOrdered} · {currency.format(f.totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No paid orders yet.</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Loyalty program</h3>
            {loyalty ? (
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div>Earn rate: <b className="text-foreground">{loyalty.program.earnRate} pts / ₹1</b></div>
                <div>Redeem value: <b className="text-foreground">₹{loyalty.program.redeemValue} / point</b></div>
                <div>Min points to redeem: <b className="text-foreground">{loyalty.program.minRedeemPoints}</b></div>
                <div>Max per bill: <b className="text-foreground">{loyalty.program.maxRedeemPercentPerBill}%</b></div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Loyalty program not configured.</p>
            )}
          </div>
        </div>
      )}

      {tab === "visits" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Bill</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((b) => (
                <tr key={b._id} className="border-b border-border last:border-0 text-center">
                  <td className="px-4 py-3 text-left font-medium text-foreground">{b.billNo}</td>
                  <td className="px-4 py-3 text-[11px] uppercase">{b.orderType}</td>
                  <td className="px-4 py-3">{b.items?.length || 0}</td>
                  <td className="px-4 py-3">{currency.format(b.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", b.paymentStatus === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{fmtDate(b.createdAt)}</td>
                </tr>
              ))}
              {!recentBills.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No bills yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "ledger" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Wallet</th>
                <th className="px-4 py-3 font-medium">Balance after</th>
                <th className="px-4 py-3 text-left font-medium">Note</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((t) => {
                const meta = TXN_LABELS[t.type] || { label: t.type, className: "" };
                return (
                  <tr key={t._id} className="border-b border-border last:border-0 text-center">
                    <td className={cn("px-4 py-3 text-left font-medium", meta.className)}>{meta.label}</td>
                    <td className="px-4 py-3">{t.points ? (t.points > 0 ? `+${t.points}` : t.points) : "—"}</td>
                    <td className="px-4 py-3">{t.walletAmount ? currency.format(t.walletAmount) : "—"}</td>
                    <td className="px-4 py-3 font-medium">{t.balanceAfter ?? "—"}</td>
                    <td className="px-4 py-3 text-left text-xs text-muted-foreground">{t.note || t.billNo || ""}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmtDate(t.createdAt)}</td>
                  </tr>
                );
              })}
              {!ledger.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No loyalty activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "rewards" && (
        <div className="rounded-xl border border-border bg-card p-4">
          {loyalty?.activeRewards?.length ? (
            <div className="space-y-2">
              {loyalty.activeRewards.map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="font-mono font-medium text-foreground">{r.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.discountType === "percent" ? `${r.value}% off` : `${currency.format(r.value)} off`}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">valid till {fmtDate(r.validTill)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">No active rewards.</p>
          )}
        </div>
      )}

      <Modal
        title={modal === "adjust" ? "Adjust points" : "Top up wallet"}
        open={!!modal}
        onCancel={() => setModal(null)}
        onOk={submitModal}
        okText={modal === "adjust" ? "Adjust" : "Top up"}
        confirmLoading={saving}
      >
        <div className="space-y-3 pt-2">
          {modal === "adjust" ? (
            <>
              <InputNumber
                className="w-full"
                placeholder="Points (negative to deduct)"
                value={form.points}
                onChange={(v) => setForm((f) => ({ ...f, points: v }))}
              />
              <Input
                placeholder="Reason (required)"
                value={form.note || ""}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </>
          ) : (
            <>
              <InputNumber
                className="w-full"
                min={1}
                placeholder="Amount"
                value={form.amount}
                onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
              />
              <Select
                className="w-full"
                value={form.method || "cash"}
                onChange={(v) => setForm((f) => ({ ...f, method: v }))}
                options={["cash", "card", "upi", "bank"].map((m) => ({ value: m, label: m.toUpperCase() }))}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

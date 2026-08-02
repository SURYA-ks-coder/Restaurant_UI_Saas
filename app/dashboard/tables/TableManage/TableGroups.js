"use client";

import { useEffect, useState } from "react";
import { Modal, Tag, Spin, Empty, Divider } from "antd";
import { Plus, Users } from "lucide-react";
import { action, getAction, API } from "@/lib/API";
import { message } from "@/lib/message";
import ButtonClick from "@/components/ui/ButtonClick";

const POLL_MS = 5000;
const isSettled = (group) => group.paymentStatus === "paid";

const STATUS_TAG_COLOR = {
  ordering: "blue",
  placed: "gold",
  paid: "green",
  cancelled: "default",
};

const groupTagLabel = (group) => {
  if (group.paymentStatus === "paid") return "Paid";
  if (group.billStatus) return group.billStatus;
  return group.status;
};

const groupTagColor = (group) =>
  STATUS_TAG_COLOR[
    group.paymentStatus === "paid" ? "paid" : group.status
  ] || "default";

// Lists the independent order groups (families/parties) currently sharing a
// table's QR code, and lets staff add a walk-in group the same way a
// customer would by scanning and tapping "Create New Group".
export default function TableGroups({ open, onOpenChange, table, onChanged }) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [guestCount, setGuestCount] = useState(2);
  const [groupLabel, setGroupLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [billDetail, setBillDetail] = useState(null);
  const [billLoading, setBillLoading] = useState(false);

  // `silent` skips the spinner/error toast so the background poll below
  // doesn't flicker the modal every 5s.
  const load = async ({ silent = false } = {}) => {
    if (!table?._id) return;
    if (!silent) setLoading(true);
    try {
      const result = await getAction(
        `${API.GET_TABLE_SESSION_GROUPS}/${table._id}/staff`,
        {},
      );
      if (result?.statusCode === 200) {
        const fetched = result.data.groups || [];
        setGroups((prev) => {
          const previouslySettled = new Set(
            prev.filter(isSettled).map((g) => g.groupId),
          );
          const newlySettled = fetched.filter(
            (g) => isSettled(g) && !previouslySettled.has(g.groupId),
          );
          if (newlySettled.length) {
            newlySettled.forEach((g) =>
              message.success(`${g.groupLabel} settled`),
            );
            onChanged?.();
          }
          return fetched;
        });
      }
    } catch {
      if (!silent) message.error("Unable to load table groups");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setExpandedGroupId(null);
      setBillDetail(null);
      return;
    }
    load();
    // Poll while the modal is open so a group that gets paid elsewhere
    // (billing/Razorpay) drops off this list without staff refreshing.
    const interval = setInterval(() => load({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, table?._id]);

  // Settled groups are kept in state briefly (for the toast/onChanged diff
  // above) but never rendered — a paid group is done occupying the table.
  const visibleGroups = groups.filter((g) => !isSettled(g));

  const createGroup = async () => {
    setCreating(true);
    try {
      const result = await action(
        `${API.CREATE_TABLE_SESSION_GROUP}/${table._id}/staff/groups`,
        {
          guestCount: Number(guestCount) || 1,
          groupLabel: groupLabel || undefined,
        },
      );
      if (result?.statusCode === 201 || result?.statusCode === 200) {
        message.success(
          `${result.data.groupLabel} created — code ${result.data.groupCode}`,
        );
        setGroupLabel("");
        setGuestCount(2);
        await load();
        onChanged?.();
      } else {
        message.error(result?.message || "Unable to create group");
      }
    } catch {
      message.error("Unable to create group");
    } finally {
      setCreating(false);
    }
  };

  const toggleBill = async (group) => {
    if (expandedGroupId === group.groupId) {
      setExpandedGroupId(null);
      setBillDetail(null);
      return;
    }
    setExpandedGroupId(group.groupId);
    setBillDetail(null);
    if (!group.billId) return;
    setBillLoading(true);
    try {
      const result = await getAction(`pos/${group.billId}`, {});
      if (result?.statusCode === 200) setBillDetail(result.data);
    } catch {
      message.error("Unable to load bill");
    } finally {
      setBillLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      centered
      width={520}
      title={`Order Groups — Table ${table?.tableNumber || ""}`}
    >
      <p className="mb-4 text-xs text-muted-foreground">
        Everyone at this table scans the same QR code, then either starts a
        new group or joins one with its 4-digit code — each group gets its
        own order and its own bill.
      </p>

      <Spin spinning={loading}>
        {visibleGroups.length === 0 ? (
          <Empty description="No groups yet" className="py-6" />
        ) : (
          <div className="mb-4 space-y-2">
            {visibleGroups.map((group) => (
              <div
                key={group.groupId}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{group.groupLabel}</p>
                    <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> {group.guestCount} guest(s)
                      {group.status === "ordering" && (
                        <span className="ml-1">
                          · code{" "}
                          <span className="font-mono font-semibold text-foreground">
                            {group.groupCode}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Tag color={groupTagColor(group)}>{groupTagLabel(group)}</Tag>
                    {group.billId && (
                      <span className="text-sm font-semibold">
                        ₹{group.grandTotal}
                      </span>
                    )}
                  </div>
                </div>
                {group.billId && (
                  <button
                    onClick={() => toggleBill(group)}
                    className="mt-2 text-xs font-medium text-primary"
                  >
                    {expandedGroupId === group.groupId
                      ? "Hide bill"
                      : "View bill"}
                  </button>
                )}
                {expandedGroupId === group.groupId && group.billId && (
                  <div className="mt-2 rounded-lg bg-muted/30 p-2 text-xs">
                    {billLoading ? (
                      <Spin size="small" />
                    ) : billDetail?.items?.length ? (
                      billDetail.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between py-0.5"
                        >
                          <span>
                            {item.itemName} × {item.quantity}
                          </span>
                          <span>₹{item.total}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        No items yet.
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Spin>

      <Divider className="my-3" />

      <p className="mb-2 text-sm font-medium">Add walk-in group</p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            Guests
          </label>
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="h-9 w-full rounded-lg border border-border px-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex-[2]">
          <label className="mb-1 block text-xs text-muted-foreground">
            Label (optional)
          </label>
          <input
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.target.value)}
            placeholder="e.g. Family 2"
            className="h-9 w-full rounded-lg border border-border px-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <ButtonClick
          BtnType="primary"
          buttonName="Add"
          icon={<Plus className="h-4 w-4" />}
          loading={creating}
          handleSubmit={createGroup}
        />
      </div>
    </Modal>
  );
}

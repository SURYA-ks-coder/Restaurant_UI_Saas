"use client";

import { useCallback, useEffect, useState } from "react";
import { ChefHat, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API, getAction, patchAction } from "@/lib/API";
import { getUserId } from "@/lib/auth";
import { message } from "@/lib/message";
import { Button, Tooltip } from "antd";

// Mirrors the Kitchen Display page's card shape, trimmed to the two things
// this screen cares about: tickets nobody has started yet (so a chef can
// claim one) and tickets this chef has already claimed (self-claim happens
// server-side the moment a chef moves a ticket to "preparing" — see
// kot.service.js#updateKotStatus).
const normalizeKot = (kot) => {
  const createdAt = kot.createdAt || new Date();
  const createdDate = new Date(createdAt);
  const hasValidDate = !Number.isNaN(createdDate.getTime());
  const elapsed = hasValidDate
    ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000))
    : 0;

  return {
    ...kot,
    id: kot._id,
    table: kot.tableName || kot.tableId?.tableName || kot.tableId?.tableNumber || "Table",
    elapsed,
    items: kot.items || [],
  };
};

export default function MyKotsPage() {
  const [unclaimed, setUnclaimed] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const [unclaimedResult, mineResult] = await Promise.all([
        getAction(`${API.GET_KOT_LIST}?status=pending`, {}),
        getAction(`${API.GET_KOT_LIST}?chefId=${userId}&status=preparing,ready`, {}),
      ]);
      if (unclaimedResult?.statusCode === 200) {
        setUnclaimed((unclaimedResult.data || []).map(normalizeKot));
      }
      if (mineResult?.statusCode === 200) {
        setMine((mineResult.data || []).map(normalizeKot));
      }
    } catch {
      message.error("Unable to load your kitchen tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const claimTicket = async (kot) => {
    setBusyId(kot.id);
    try {
      const result = await patchAction(API.UPDATE_KOT_STATUS, {
        id: kot.id,
        status: "preparing",
      });
      if (result?.statusCode === 200) {
        message.success(`${kot.kitchenSection || "Ticket"} claimed`);
        await load();
      } else {
        message.error(result?.message || "Unable to claim this ticket");
      }
    } catch {
      message.error("Unable to claim this ticket");
    } finally {
      setBusyId(null);
    }
  };

  const markItemReady = async (kot, item) => {
    setBusyId(kot.id);
    try {
      const result = await patchAction(API.UPDATE_KOT_ITEM_STATUS, {
        id: kot.id,
        itemId: item._id,
        status: "ready",
      });
      if (result?.statusCode === 200) await load();
      else message.error(result?.message || "Unable to update item");
    } catch {
      message.error("Unable to update item");
    } finally {
      setBusyId(null);
    }
  };

  const markTicketReady = async (kot) => {
    setBusyId(kot.id);
    try {
      const result = await patchAction(API.UPDATE_KOT_STATUS, {
        id: kot.id,
        status: "ready",
      });
      if (result?.statusCode === 200) {
        message.success("Marked ready to serve");
        await load();
      } else {
        message.error(result?.message || "Unable to update ticket");
      }
    } catch {
      message.error("Unable to update ticket");
    } finally {
      setBusyId(null);
    }
  };

  const KotCard = ({ kot, footer }) => (
    <article className="border rounded-lg p-5 flex flex-col justify-between bg-white dark:bg-card">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="font-semibold">{kot.kitchenSection}</h2>
            <p className="text-sm text-muted-foreground">{kot.table}</p>
          </div>
          <Badge className="bg-muted text-muted-foreground border-border capitalize">
            {kot.status}
          </Badge>
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {kot.elapsed}m ago
        </div>
        <div className="space-y-2">
          {kot.items.map((item, index) => (
            <div
              key={item._id || index}
              className={cn(
                "flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm",
                item.status === "ready" && "opacity-60 line-through",
              )}
            >
              <span>
                <span className="font-medium">{item.quantity}x</span>{" "}
                {item.itemName}
              </span>
              {kot.status === "preparing" && item.status !== "ready" && (
                <Tooltip title="Mark item ready">
                  <button
                    onClick={() => markItemReady(kot, item)}
                    disabled={busyId === kot.id}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Ready
                  </button>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">{footer}</div>
    </article>
  );

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My KOTs</h1>
            <p className="text-muted-foreground">
              Unclaimed tickets you can start, plus what you're already preparing
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 self-start"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Unclaimed · {unclaimed.length}
      </h2>
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {unclaimed.map((kot) => (
          <KotCard
            key={kot.id}
            kot={kot}
            footer={
              <Button
                type="primary"
                size="large"
                loading={busyId === kot.id}
                onClick={() => claimTicket(kot)}
                className="w-full"
              >
                Start &amp; Claim
              </Button>
            }
          />
        ))}
        {!loading && unclaimed.length === 0 && (
          <div className="col-span-full rounded-lg border border-border p-8 text-center text-muted-foreground">
            No unclaimed tickets right now
          </div>
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Assigned to Me · {mine.length}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mine.map((kot) => (
          <KotCard
            key={kot.id}
            kot={kot}
            footer={
              kot.status === "preparing" ? (
                <Button
                  type="primary"
                  size="large"
                  loading={busyId === kot.id}
                  onClick={() => markTicketReady(kot)}
                  className="w-full"
                >
                  Mark Ready
                </Button>
              ) : (
                <Badge className="w-full justify-center bg-success/20 text-success border-success/30">
                  Ready to serve
                </Badge>
              )
            }
          />
        ))}
        {!loading && mine.length === 0 && (
          <div className="col-span-full rounded-lg border border-border p-8 text-center text-muted-foreground">
            You haven't claimed any tickets yet
          </div>
        )}
      </div>
    </div>
  );
}

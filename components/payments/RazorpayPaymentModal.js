"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, Spin, Typography, Button } from "antd";
import { Copy, QrCode } from "lucide-react";
import { message } from "@/lib/message";
import { API, action } from "@/lib/API";

const POLL_MS = 4000;

/**
 * Shared "pay via Razorpay" modal — generates a payment link + QR for the
 * given bill (customer scans/opens it on their own device) and polls the
 * bill until `paymentStatus` flips to "paid". Reused across billing, orders,
 * and POS instead of duplicating the gateway call + polling logic three
 * times, one per page.
 */
export default function RazorpayPaymentModal({ open, billId, billNo, onClose, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!open || !billId) return;

    let cancelled = false;
    setLoading(true);
    setLink(null);

    action(API.RAZORPAY_LINK, { billId }, "POST").then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        setLink(result.data);
      } else {
        message.error(result?.message || "Unable to generate payment link");
        onClose?.();
      }
    });

    pollRef.current = setInterval(async () => {
      const result = await action(`pos/${billId}`, {}, "GET");
      if (cancelled) return;
      if (result?.statusCode === 200 && result?.data?.paymentStatus === "paid") {
        clearInterval(pollRef.current);
        message.success(`Bill ${billNo || ""} paid via Razorpay`);
        onPaid?.(result.data);
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, billId]);

  const copyLink = async () => {
    if (!link?.paymentLink) return;
    try {
      await navigator.clipboard.writeText(link.paymentLink);
      message.success("Payment link copied");
    } catch {
      message.error("Unable to copy link");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      title={
        <div className="flex items-center gap-2">
          <QrCode size={18} />
          <span>Razorpay Payment</span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {loading && <Spin />}

        {!loading && link && (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Ask the customer to scan this code or open the link to pay
              {typeof link.amount === "number" ? ` ₹${link.amount}` : ""}.
            </p>
            <img
              src={link.qrImage}
              alt="Razorpay payment QR"
              width={220}
              height={220}
              className="rounded-lg border border-border"
            />
            <div className="flex w-full items-center gap-2">
              <Typography.Text
                ellipsis
                className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs"
              >
                {link.paymentLink}
              </Typography.Text>
              <Button icon={<Copy size={14} />} onClick={copyLink} size="small" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spin size="small" />
              Waiting for payment…
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

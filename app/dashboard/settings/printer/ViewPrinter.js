"use client";

import { Globe, Monitor, Printer as PrinterIcon } from "lucide-react";
import DrawerPop from "@/components/ui/DrawerPop";

const PURPOSE_LABELS = {
  kot: "KOT (Kitchen Order Ticket)",
  bill: "Bill",
  qr_order: "QR Order Slip",
};

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 whitespace-nowrap text-muted-foreground">
        {label}:
      </span>
      <span className={`text-right font-medium break-all ${valueClass}`}>
        {value || "-"}
      </span>
    </div>
  );
}

export default function ViewPrinter({ open, close, printer }) {
  if (!printer) return null;

  const isLan = printer.connectionType === "lan";
  const isUsb = printer.connectionType === "usb";

  return (
    <DrawerPop
      open={open}
      close={close}
      header={["Printer Details", printer.name]}
      isFooter={false}
      width={480}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <PrinterIcon size={20} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{printer.name}</p>
            <p className="text-xs text-muted-foreground">
              {PURPOSE_LABELS[printer.purpose] || printer.purpose}
            </p>
          </div>
          <span
            className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              printer.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {printer.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {isLan ? <Globe size={15} /> : <Monitor size={15} />}
            Connection
          </div>
          <InfoRow
            label="Type"
            value={
              isLan
                ? "LAN (network printer)"
                : isUsb
                  ? "USB (connected to agent PC)"
                  : "Browser"
            }
          />
          {isLan && (
            <>
              <InfoRow label="IP Address" value={printer.ip} />
              <InfoRow label="Port" value={printer.port} />
            </>
          )}
          {isUsb && (
            <InfoRow label="Printer Name" value={printer.printerName} />
          )}
          <InfoRow label="Paper Width" value={printer.paperWidth} />
        </div>

        {printer.purpose === "kot" && (
          <div className="space-y-2 rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">
              Kitchen Sections
            </p>
            {printer.kitchenSections?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {printer.kitchenSections.map((section) => (
                  <span
                    key={section}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs"
                  >
                    {section}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Matches every section
              </p>
            )}
          </div>
        )}

        {(printer.createdAt || printer.updatedAt) && (
          <div className="space-y-2 rounded-xl border bg-card p-4">
            {printer.createdAt && (
              <InfoRow
                label="Created"
                value={new Date(printer.createdAt).toLocaleString()}
              />
            )}
            {printer.updatedAt && (
              <InfoRow
                label="Updated"
                value={new Date(printer.updatedAt).toLocaleString()}
              />
            )}
          </div>
        )}
      </div>
    </DrawerPop>
  );
}

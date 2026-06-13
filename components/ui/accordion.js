"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Root ──────────────────────────────────────────────────────────────── */

function Accordion({ className, ...props }) {
  return (
    <AccordionPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/* ─── Item ───────────────────────────────────────────────────────────────── */

function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-xl border border-border bg-white dark:bg-[#1e293b] overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Trigger ────────────────────────────────────────────────────────────── */

function AccordionTrigger({ className, children, rightSlot, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between px-5 py-3.5",
          "text-sm font-semibold text-foreground",
          "border-b border-border transition-colors",
          "data-[state=closed]:border-transparent",
          "hover:bg-muted/40 transition-colors duration-200",
          "group",
          className,
        )}
        {...props}
      >
        {children}
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-300 ease-in-out",
              "group-data-[state=open]:rotate-180",
            )}
          />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/* ─── Content ────────────────────────────────────────────────────────────── */

function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden text-sm",
        "data-[state=open]:animate-accordion-down",
        "data-[state=closed]:animate-accordion-up",
      )}
      {...props}
    >
      <div className={cn("px-5 py-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

/* ─── Convenience: single self-contained item ────────────────────────────── */

/**
 * Drop-in accordion panel — wraps Item + Trigger + Content into one component.
 *
 * Usage:
 *   <Accordion type="multiple">
 *     <AccordionPanel value="discover" title="Discover">
 *       ...content...
 *     </AccordionPanel>
 *   </Accordion>
 */
function AccordionPanel({
  value,
  title,
  children,
  contentClassName,
  rightSlot,
  defaultOpen = false,
  ...itemProps
}) {
  return (
    <AccordionItem value={value} {...itemProps}>
      <AccordionTrigger rightSlot={rightSlot}>{title}</AccordionTrigger>
      <AccordionContent className={contentClassName}>{children}</AccordionContent>
    </AccordionItem>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionPanel };

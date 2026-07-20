"use client";

import {
  AlignLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Hash,
  IndianRupee,
  Link2,
  ListFilter,
  Lock,
  Mail,
  MapPin,
  PenLine,
  Percent,
  Phone,
  Search,
  Tag,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  email: Mail,
  tel: Phone,
  number: Hash,
  url: Link2,
  search: Search,
  password: Lock,
};

// Matched top-to-bottom against "label name placeholder" — keep the more
// specific patterns (restaurant, item, gender…) above the generic ones (name).
const KEYWORD_ICONS = [
  [/search/, Search],
  [/e-?mail/, Mail],
  [/phone|mobile|whatsapp|contact/, Phone],
  [/password|\bpin\b|\botp\b/, Lock],
  [/address|city|state|location|area|landmark|\bzip\b|pincode/, MapPin],
  [/country/, Globe],
  [/price|amount|cost|salary|wage|total|\bmrp\b|rupee|₹/, IndianRupee],
  [/percent|discount|tax|\bgst\b|commission/, Percent],
  [/qty|quantity|stock|count|capacity|table/, Hash],
  [/date|\bdob\b|birth|joining|expiry/, Calendar],
  [/time/, Clock],
  [/\burl\b|website|link/, Link2],
  [/gender/, Users],
  [/role|designation|department|position/, Briefcase],
  [/category|\btype\b|\bunit\b|status|item|product|dish|menu/, Tag],
  [/description|notes|remarks|comment|about/, AlignLeft],
  [/restaurant|branch|outlet|company|organization/, Building2],
  [/card|\bupi\b|payment/, CreditCard],
  [/\bcode\b|\bsku\b|gstin|\bpan\b|fssai|license/, FileText],
  [/name|owner|manager|staff|employee|customer|supplier|vendor|user/, User],
];

/**
 * Picks an icon for a form field: explicit HTML `type` first, then keywords
 * found in the label / name / placeholder, then the per-component fallback.
 */
export function resolveFieldIcon({ type, label, name, placeholder, fallback }) {
  const ByType = TYPE_ICONS[type];
  if (ByType) return <ByType />;

  const text = [label, name, placeholder]
    .filter((part) => typeof part === "string")
    .join(" ")
    .toLowerCase();

  if (text) {
    for (const [pattern, Icon] of KEYWORD_ICONS) {
      if (pattern.test(text)) return <Icon />;
    }
  }

  const Fallback = fallback;
  return Fallback ? <Fallback /> : null;
}

export function FieldIcon({ icon, error, className }) {
  if (!icon) return null;
  return (
    <span
      className={cn(
        "flex items-center justify-center [&_svg]:h-4 [&_svg]:w-4",
        error ? "!text-destructive" : "!text-primary",
        className,
      )}
    >
      {icon}
    </span>
  );
}

export {
  AlignLeft as TextAreaFallbackIcon,
  Calendar as DateFallbackIcon,
  Clock as TimeFallbackIcon,
  ListFilter as SelectFallbackIcon,
  Lock as PasswordFallbackIcon,
  PenLine as InputFallbackIcon,
};

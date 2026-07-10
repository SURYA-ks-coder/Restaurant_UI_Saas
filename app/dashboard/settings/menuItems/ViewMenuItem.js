"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import DrawerPop from "@/components/ui/DrawerPop";
import { API, getAction } from "@/lib/API";

const ITEM_TYPE_LABELS = {
  veg: "Veg",
  non_veg: "Non-Veg",
  egg: "Egg",
};

const FOOD_TYPE_LABELS = {
  starter: "Starter",
  main: "Main",
  dessert: "Dessert",
  drink: "Drink",
};

const SPICY_LEVEL_LABELS = {
  mild: "Mild",
  medium: "Medium",
  hot: "Hot",
  extra_hot: "Extra Hot",
};

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 whitespace-nowrap text-muted-foreground">
        {label}:
      </span>
      <span className={`text-right font-medium break-all ${valueClass}`}>
        {value || value === 0 ? value : "-"}
      </span>
    </div>
  );
}

const getName = (value, fallbackKey) =>
  value?.[fallbackKey] || (typeof value === "string" ? value : "") || "-";

export default function ViewMenuItem({ open, close, itemId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    const getMenuItem = async () => {
      setLoading(true);
      try {
        const result = await getAction(`${API.GET_MENU_ITEM_BY_ID}/${itemId}`);
        if (result?.statusCode === 200) {
          setItem(result?.data || null);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    getMenuItem();
  }, [open, itemId]);

  useEffect(() => {
    if (!open) setItem(null);
  }, [open]);

  const prices = item?.prices || {};
  const isAvailable = item?.availabilityStatus === "available";
  const imageSrc =
    typeof item?.itemImage === "string" && item.itemImage.startsWith("http")
      ? item.itemImage
      : null;

  return (
    <DrawerPop
      open={open}
      close={close}
      header={["Menu Item Details", item?.itemName || item?.name || ""]}
      isFooter={false}
      width={480}
    >
      <div className="space-y-4 p-6">
        {!item && !loading ? null : (
          <>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={item?.itemName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed size={20} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {item?.itemName || item?.name || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item?.itemCode || "-"}
                </p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isAvailable
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isAvailable ? "Available" : "Out of Stock"}
              </span>
            </div>

            <div className="space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">
                Basic Info
              </p>
              <InfoRow
                label="Category"
                value={getName(item?.categoryId, "categoryName")}
              />
              <InfoRow
                label="Sub Category"
                value={getName(item?.subCategoryId, "subCategoryName")}
              />
              <InfoRow label="Barcode" value={item?.barcode} />
              {item?.description && (
                <InfoRow label="Description" value={item.description} />
              )}
            </div>

            <div className="space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Pricing</p>
              <InfoRow
                label="Dine In"
                value={
                  prices.dineInPrice ?? item?.price
                    ? `Rs ${prices.dineInPrice ?? item?.price}`
                    : "-"
                }
              />
              <InfoRow
                label="Parcel"
                value={prices.parcelPrice ? `Rs ${prices.parcelPrice}` : "-"}
              />
              <InfoRow
                label="Swiggy/Zomato"
                value={prices.onlinePrice ? `Rs ${prices.onlinePrice}` : "-"}
              />
              <InfoRow
                label="Discount"
                value={
                  prices.discountPrice ? `Rs ${prices.discountPrice}` : "-"
                }
              />
              <InfoRow
                label="GST"
                value={
                  item?.gstPercentage || item?.gstPercentage === 0
                    ? `${item.gstPercentage}%`
                    : "-"
                }
              />
            </div>

            <div className="space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">
                Type &amp; Kitchen
              </p>
              <InfoRow
                label="Item Type"
                value={ITEM_TYPE_LABELS[item?.itemType] || item?.itemType}
              />
              <InfoRow
                label="Food Type"
                value={FOOD_TYPE_LABELS[item?.foodType] || item?.foodType}
              />
              <InfoRow
                label="Spicy Level"
                value={
                  SPICY_LEVEL_LABELS[item?.spicyLevel] || item?.spicyLevel
                }
              />
              <InfoRow label="Kitchen Section" value={item?.kitchenSection} />
              <InfoRow
                label="Prep Time"
                value={item?.prepTime ? `${item.prepTime} min` : "-"}
              />
            </div>

            {item?.stockEnabled && (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Stock</p>
                <InfoRow label="Current Stock" value={item?.currentStock} />
                <InfoRow
                  label="Min Stock Alert"
                  value={item?.minimumStock}
                />
                <InfoRow label="Unit Type" value={item?.unitType} />
              </div>
            )}

            {(item?.createdAt || item?.updatedAt) && (
              <div className="space-y-2 rounded-xl border bg-card p-4">
                {item?.createdAt && (
                  <InfoRow
                    label="Created"
                    value={new Date(item.createdAt).toLocaleString()}
                  />
                )}
                {item?.updatedAt && (
                  <InfoRow
                    label="Updated"
                    value={new Date(item.updatedAt).toLocaleString()}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DrawerPop>
  );
}

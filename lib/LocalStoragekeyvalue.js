import { getRestaurantId, getDefaultBranchId } from "@/lib/auth";

const LocalStorageData = {
  get branchId() { return getDefaultBranchId(); },
  get restaurantId() { return getRestaurantId(); },
};

export { LocalStorageData };

// Encrypted auth storage — single key "_fh_s", XOR + Base64 cipher.
// Call saveAuthData(loginResult) on login, then use the getters anywhere.

const _K = "FlvH@2026#xK9mR2vBqZ5wY";
const _SK = "_fh_s";

function _encode(str) {
  if (typeof window === "undefined") return "";
  try {
    const data = new TextEncoder().encode(str);
    const key = new TextEncoder().encode(_K);
    const enc = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      enc[i] = data[i] ^ key[i % key.length];
    }
    return btoa(String.fromCharCode(...enc));
  } catch {
    return "";
  }
}

function _decode(b64) {
  if (typeof window === "undefined") return "";
  try {
    const raw = atob(b64);
    const data = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
    const key = new TextEncoder().encode(_K);
    const dec = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) dec[i] = data[i] ^ key[i % key.length];
    return new TextDecoder().decode(dec);
  } catch {
    return "";
  }
}

function _parseSafe(str, fallback) {
  try { return JSON.parse(str ?? "null") ?? fallback; } catch { return fallback; }
}

function _readLegacy() {
  // Migrate from the old plaintext keys written before encryption was added
  const oldToken = localStorage.getItem("accessToken");
  if (!oldToken) return null;
  const u = _parseSafe(localStorage.getItem("userData"), {});
  const data = {
    accessToken: _parseSafe(oldToken, ""),
    refreshToken: _parseSafe(localStorage.getItem("refreshToken"), ""),
    userId: u.id || u._id || "",
    name: u.name || "",
    email: u.email || "",
    role: (u.roleName || u.role || "staff").toLowerCase(),
    roleId: u.roleId || "",
    roleName: u.roleName || u.role || "staff",
    restaurantId: _parseSafe(localStorage.getItem("restaurantId"), ""),
    defaultBranchId: _parseSafe(localStorage.getItem("branchIds"), ""),
    branchIds: u.branchIds || [],
    permissionIds: u.permissionIds || [],
    menus: u.menus || [],
    status: u.status || "active",
  };
  // Migrate on the fly so next read uses encrypted key
  try {
    localStorage.setItem(_SK, _encode(JSON.stringify(data)));
    ["accessToken", "refreshToken", "userData", "restaurantId", "branchIds"].forEach((k) =>
      localStorage.removeItem(k),
    );
  } catch {}
  return data;
}

function _read() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(_SK);
    if (raw) return JSON.parse(_decode(raw));
    return _readLegacy();
  } catch {
    return null;
  }
}

export function saveAuthData(result) {
  if (typeof window === "undefined") return;
  try {
    const u = result?.data?.user;
    const t = result?.data?.tokens;
    if (!u || !t) return;
    const payload = {
      accessToken: t.accessToken,
      refreshToken: t.refreshToken,
      userId: u.id,
      name: u.name,
      email: u.email,
      role: (u.roleName || u.role || "staff").toLowerCase(),
      roleId: u.roleId,
      roleName: u.roleName,
      restaurantId: u.restaurantId,
      branchIds: u.branchIds || [],
      defaultBranchId: u.defaultBranchId,
      permissionIds: u.permissionIds || [],
      menus: u.menus || [],
      status: u.status,
    };
    localStorage.setItem(_SK, _encode(JSON.stringify(payload)));
    // Remove legacy plaintext keys
    ["accessToken", "refreshToken", "userData", "restaurantId", "branchIds"].forEach((k) =>
      localStorage.removeItem(k),
    );
  } catch {}
}

export function clearAuthData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(_SK);
  ["accessToken", "refreshToken", "userData", "restaurantId", "branchIds"].forEach((k) =>
    localStorage.removeItem(k),
  );
}

export function getAuthData() {
  return _read();
}

export function getAccessToken() {
  return _read()?.accessToken || "";
}

export function getRefreshToken() {
  return _read()?.refreshToken || "";
}

export function getUserData() {
  return _read() || {};
}

export function getUserId() {
  return _read()?.userId || "";
}

export function getUserRole() {
  return _read()?.role || "staff";
}

export function getRestaurantId() {
  return _read()?.restaurantId || "";
}

export function getBranchIds() {
  return _read()?.branchIds || [];
}

export function getDefaultBranchId() {
  return _read()?.defaultBranchId || "";
}

export function getPermissionIds() {
  return _read()?.permissionIds || [];
}

export function getMenuIds() {
  return _read()?.menus || [];
}

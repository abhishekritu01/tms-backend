import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tms-dev-secret";

export const ROLE = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

export function signToken({ userId, role }) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "8h" });
}

export function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) {
    const allowed = roles.join(", ");
    throw new Error(`Not authorized. Required role: ${allowed}`);
  }
}

import crypto from "crypto";

const DEFAULT_SECRET = crypto.randomBytes(32).toString("hex");

export const jwtConfig = {
  secret: process.env.JWT_SECRET || DEFAULT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};

export const generateToken = (id) => {
  if (!jwtConfig.secret) {
    throw new Error("JWT_SECRET no está configurado");
  }
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

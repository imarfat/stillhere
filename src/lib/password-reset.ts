import { createHash, randomBytes } from "crypto"

export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export function generatePasswordResetToken() {
  return randomBytes(32).toString("hex")
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function getPasswordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS)
}

export function getAppBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export function buildPasswordResetUrl(token: string) {
  return `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`
}

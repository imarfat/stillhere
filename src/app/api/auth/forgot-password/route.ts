import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  buildPasswordResetUrl,
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from "@/lib/password-reset"
import { sendPasswordResetEmail } from "@/lib/send-email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (user) {
      const rawToken = generatePasswordResetToken()
      const tokenHash = hashPasswordResetToken(rawToken)
      const expiresAt = getPasswordResetExpiry()

      await db.passwordResetToken.deleteMany({ where: { userId: user.id } })
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      })

      const resetUrl = buildPasswordResetUrl(rawToken)

      try {
        await sendPasswordResetEmail(user.email, resetUrl)
      } catch (error) {
        console.error("Password reset email error:", error)
        return NextResponse.json(
          { error: "Unable to send reset email right now. Please try again later." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "If an account exists for that email, we sent password reset instructions.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

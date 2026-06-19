interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (apiKey && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("Failed to send email:", error)
      throw new Error("Failed to send email")
    }

    return
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[dev email]", { to, subject, text })
    return
  }

  throw new Error("Email is not configured")
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset your StillHere password"
  const text = `Reset your StillHere password by visiting this link (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2a2620;">
      <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Reset your password</h1>
      <p style="font-family: system-ui, sans-serif; line-height: 1.6; color: #5c554c;">
        We received a request to reset your StillHere password. This link expires in 1 hour.
      </p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #c4944a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600;">
          Reset password
        </a>
      </p>
      <p style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.6; color: #8a8278;">
        If the button does not work, copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #c4944a; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-family: system-ui, sans-serif; font-size: 13px; color: #8a8278; margin-top: 24px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `

  await sendEmail({ to, subject, html, text })
}

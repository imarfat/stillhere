import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LIMITS, sanitizeRequiredText } from "@/lib/security"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: memorialId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    const isOwner = session?.user?.id === memorial.userId

    if (isOwner) {
      const entries = await db.guestbookEntry.findMany({
        where: { memorialId },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(entries)
    }

    const entries = await db.guestbookEntry.findMany({
      where: { memorialId, approved: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Fetch guestbook error:", error)
    return NextResponse.json(
      { error: "Failed to fetch guestbook entries" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    const body = await request.json()
    const { visitorName, message } = body

    const sanitizedName = sanitizeRequiredText(visitorName, LIMITS.visitorName)
    if (!sanitizedName) {
      return NextResponse.json({ error: "Visitor name is required" }, { status: 400 })
    }

    const sanitizedMessage = sanitizeRequiredText(message, LIMITS.guestbookMessage)
    if (!sanitizedMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const entry = await db.guestbookEntry.create({
      data: {
        memorialId,
        visitorName: sanitizedName,
        message: sanitizedMessage,
        approved: false,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Create guestbook entry error:", error)
    return NextResponse.json(
      { error: "Failed to submit guestbook entry" },
      { status: 500 }
    )
  }
}

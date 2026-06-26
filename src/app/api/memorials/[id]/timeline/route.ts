import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LIMITS, sanitizeOptionalText, sanitizeRequiredText } from "@/lib/security"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: memorialId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }
    if (memorial.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { eventDate, title, description } = body

    const sanitizedTitle = sanitizeRequiredText(title, LIMITS.timelineTitle)
    if (!sanitizedTitle) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const event = await db.timelineEvent.create({
      data: {
        memorialId,
        eventDate: eventDate ? new Date(eventDate) : null,
        title: sanitizedTitle,
        description: sanitizeOptionalText(description, LIMITS.timelineDescription),
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Add timeline event error:", error)
    return NextResponse.json(
      { error: "Failed to add timeline event" },
      { status: 500 }
    )
  }
}

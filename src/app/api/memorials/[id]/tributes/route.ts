import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    const [candles, flowers] = await Promise.all([
      db.tribute.count({ where: { memorialId, kind: "candle" } }),
      db.tribute.count({ where: { memorialId, kind: "flower" } }),
    ])

    const recent = await db.tribute.findMany({
      where: { memorialId },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    return NextResponse.json({ candles, flowers, recent })
  } catch (error) {
    console.error("Fetch tributes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tributes" },
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
    const { kind, visitorName, note } = body

    if (kind !== "candle" && kind !== "flower") {
      return NextResponse.json(
        { error: "Kind must be 'candle' or 'flower'" },
        { status: 400 }
      )
    }

    const tribute = await db.tribute.create({
      data: {
        memorialId,
        kind,
        visitorName: visitorName || null,
        note: note || null,
      },
    })

    const count = await db.tribute.count({
      where: { memorialId, kind },
    })

    return NextResponse.json({ ...tribute, count }, { status: 201 })
  } catch (error) {
    console.error("Create tribute error:", error)
    return NextResponse.json(
      { error: "Failed to create tribute" },
      { status: 500 }
    )
  }
}

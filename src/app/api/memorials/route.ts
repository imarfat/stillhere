import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateUniqueSlug } from "@/lib/slug"
import {
  isAllowedMediaUrl,
  LIMITS,
  sanitizeOptionalText,
  sanitizeRequiredText,
} from "@/lib/security"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const memorials = await db.memorial.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            photos: true,
            videos: true,
            guestbookEntries: { where: { approved: false } },
            tributes: true,
          },
        },
      },
    })

    return NextResponse.json(memorials)
  } catch (error) {
    console.error("Fetch memorials error:", error)
    return NextResponse.json(
      { error: "Failed to fetch memorials" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, dob, dod, tagline, restingPlace, coverPhotoUrl, bio } = body

    const sanitizedName = sanitizeRequiredText(name, LIMITS.name)
    if (!sanitizedName) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const sanitizedCover =
      typeof coverPhotoUrl === "string" && coverPhotoUrl.trim()
        ? coverPhotoUrl.trim()
        : null
    if (sanitizedCover && !isAllowedMediaUrl(sanitizedCover)) {
      return NextResponse.json({ error: "Invalid cover photo URL" }, { status: 400 })
    }

    const birthYear = dob ? new Date(dob).getFullYear() : undefined
    const deathYear = dod ? new Date(dod).getFullYear() : undefined

    const existingSlugs = (
      await db.memorial.findMany({ select: { slug: true } })
    ).map((m) => m.slug)

    const slug = await generateUniqueSlug(sanitizedName, birthYear, deathYear, existingSlugs)

    const memorial = await db.memorial.create({
      data: {
        userId: session.user.id,
        slug,
        name: sanitizedName,
        dob: dob ? new Date(dob) : null,
        dod: dod ? new Date(dod) : null,
        tagline: sanitizeOptionalText(tagline, LIMITS.tagline),
        restingPlace: sanitizeOptionalText(restingPlace, LIMITS.restingPlace),
        coverPhotoUrl: sanitizedCover,
        bio: sanitizeOptionalText(bio, LIMITS.bio),
      },
    })

    return NextResponse.json(memorial, { status: 201 })
  } catch (error) {
    console.error("Create memorial error:", error)
    return NextResponse.json(
      { error: "Failed to create memorial" },
      { status: 500 }
    )
  }
}

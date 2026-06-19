import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { storeUploadedFile } from "@/lib/upload-storage"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/", "audio/"]
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type))
    if (!isValidType) {
      return NextResponse.json(
        { error: "Only image and audio files are allowed" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      )
    }

    const url = await storeUploadedFile(session.user.id, file)

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "File upload failed. Please try again." },
      { status: 500 }
    )
  }
}

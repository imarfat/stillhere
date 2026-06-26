import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { storeUploadedFile } from "@/lib/upload-storage"
import { validateUploadedFile } from "@/lib/upload-validation"

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

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

    const validated = await validateUploadedFile(file, MAX_UPLOAD_SIZE)
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const url = await storeUploadedFile(session.user.id, validated.buffer, validated.ext)

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "File upload failed. Please try again." },
      { status: 500 }
    )
  }
}

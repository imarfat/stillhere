import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { put } from "@vercel/blob"
import { isSafeUserId } from "@/lib/security"

function buildSafeFilename(ext: string) {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
}

function shouldUseBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL
  )
}

export async function storeUploadedFile(userId: string, buffer: Buffer, ext: string) {
  if (!isSafeUserId(userId)) {
    throw new Error("Invalid user id")
  }

  const filename = buildSafeFilename(ext)

  if (shouldUseBlobStorage()) {
    const blob = await put(`uploads/${userId}/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
    })
    return blob.url
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", userId)
  await mkdir(uploadDir, { recursive: true })

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/${userId}/${filename}`
}

import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { put } from "@vercel/blob"

function buildLocalFilename(originalName: string) {
  const ext = path.extname(originalName) || ".bin"
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
}

function shouldUseBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL
  )
}

export async function storeUploadedFile(userId: string, file: File) {
  const filename = buildLocalFilename(file.name)

  if (shouldUseBlobStorage()) {
    const blob = await put(`uploads/${userId}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    })
    return blob.url
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), "public", "uploads", userId)

  await mkdir(uploadDir, { recursive: true })

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/${userId}/${filename}`
}

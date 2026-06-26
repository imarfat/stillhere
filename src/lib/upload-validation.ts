import sharp from "sharp"
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  AUDIO_MIME_TO_EXT,
  IMAGE_MIME_TO_EXT,
} from "@/lib/security"

function isValidAudioBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false

  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE") {
    return true
  }
  if (buffer.toString("ascii", 0, 4) === "OggS") return true
  if (buffer.length >= 8 && buffer.toString("ascii", 4, 8) === "ftyp") return true

  return false
}

export type ValidatedUpload =
  | { kind: "image"; buffer: Buffer; ext: string }
  | { kind: "audio"; buffer: Buffer; ext: string }

export async function validateUploadedFile(
  file: File,
  maxSizeBytes: number
): Promise<ValidatedUpload | { error: string }> {
  if (file.size <= 0) {
    return { error: "File is empty" }
  }

  if (file.size > maxSizeBytes) {
    return { error: "File size must be less than 10MB" }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (IMAGE_MIME_TO_EXT[file.type]) {
    try {
      const metadata = await sharp(buffer).metadata()
      const format = metadata.format
      if (!format || !["jpeg", "png", "webp", "gif"].includes(format)) {
        return { error: "Invalid image file" }
      }
      const ext = format === "jpeg" ? ".jpg" : `.${format}`
      if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
        return { error: "Unsupported image format" }
      }
      return { kind: "image", buffer, ext }
    } catch {
      return { error: "Invalid image file" }
    }
  }

  const audioExt = AUDIO_MIME_TO_EXT[file.type]
  if (audioExt) {
    if (!isValidAudioBuffer(buffer)) {
      return { error: "Invalid audio file" }
    }
    if (!ALLOWED_UPLOAD_EXTENSIONS.has(audioExt)) {
      return { error: "Unsupported audio format" }
    }
    return { kind: "audio", buffer, ext: audioExt }
  }

  return { error: "Only image and audio files are allowed" }
}

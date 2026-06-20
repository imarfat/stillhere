"use client"

import { useParams } from "next/navigation"
import { MemorialPage } from "@/components/app/MemorialPage"

export default function MemorialRoutePage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""

  return <MemorialPage slug={slug} />
}

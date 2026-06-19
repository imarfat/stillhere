"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/slug"

interface TimelineEvent {
  id: string
  eventDate: string | null
  title: string
  description: string | null
}

const timelineVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.55 },
  },
}

const eventRowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
}

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 22 },
  },
}

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export function LifeTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <motion.div
      variants={timelineVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={eventRowVariants} className="flex gap-4">
          <div className="flex w-3 shrink-0 flex-col items-center self-stretch">
            <motion.div
              variants={dotVariants}
              className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-background bg-primary z-10"
            />
            <motion.div
              variants={lineVariants}
              className="w-px min-h-6 flex-1 origin-top bg-primary/25"
            />
          </div>

          <motion.div
            variants={cardVariants}
            className="flex-1 rounded-xl bg-muted/30 p-4 pb-6"
          >
            {event.eventDate && (
              <Badge variant="secondary" className="text-xs mb-2">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(event.eventDate)}
              </Badge>
            )}
            <h3 className="font-serif text-lg font-semibold">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}

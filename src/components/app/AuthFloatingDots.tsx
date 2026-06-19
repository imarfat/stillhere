const authFloatingDots = [
  { top: "12%", left: "7%", size: "w-1 h-1", color: "bg-primary/30", anim: "animate-float", delay: "0s" },
  { top: "18%", right: "9%", size: "w-0.5 h-0.5", color: "bg-amber-light/25", anim: "animate-float-slow", delay: "1.1s" },
  { top: "8%", left: "22%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.5s" },
  { top: "10%", right: "18%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "1.8s" },
  { top: "38%", left: "4%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "0.9s" },
  { top: "44%", right: "5%", size: "w-0.5 h-0.5", color: "bg-primary/25", anim: "animate-float-slow", delay: "2.1s" },
  { top: "55%", left: "10%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float", delay: "1.6s" },
  { top: "58%", right: "11%", size: "w-1 h-1", color: "bg-primary/15", anim: "animate-float-slow", delay: "0.2s" },
  { top: "70%", right: "12%", size: "w-1.5 h-1.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.7s" },
  { bottom: "25%", left: "15%", size: "w-0.5 h-0.5", color: "bg-candle/30", anim: "animate-float", delay: "1.4s" },
  { bottom: "18%", left: "24%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "2.4s" },
  { bottom: "14%", right: "22%", size: "w-0.5 h-0.5", color: "bg-primary/30", anim: "animate-float-slow", delay: "1s" },
  { bottom: "32%", right: "18%", size: "w-0.5 h-0.5", color: "bg-candle/40", anim: "animate-float-slow", delay: "1.3s" },
  { top: "28%", left: "28%", size: "w-0.5 h-0.5", color: "bg-primary/15", anim: "animate-float", delay: "2s" },
  { top: "32%", right: "26%", size: "w-0.5 h-0.5", color: "bg-accent/20", anim: "animate-float-slow", delay: "0.6s" },
] as const

export function AuthFloatingDots() {
  return (
    <>
      {authFloatingDots.map((dot, i) => (
        <div
          key={i}
          className={`absolute rounded-full pointer-events-none ${dot.size} ${dot.color} ${dot.anim}`}
          style={{
            top: "top" in dot ? dot.top : undefined,
            bottom: "bottom" in dot ? dot.bottom : undefined,
            left: "left" in dot ? dot.left : undefined,
            right: "right" in dot ? dot.right : undefined,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </>
  )
}

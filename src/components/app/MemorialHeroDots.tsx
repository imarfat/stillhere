type DotConfig = {
  top?: string
  bottom?: string
  left?: string
  right?: string
  size: string
  color: string
  anim: string
  delay: string
}

const memorialHeroDots: DotConfig[] = [
  { top: "10vh", left: "8%", size: "w-1 h-1", color: "bg-primary/30", anim: "animate-float", delay: "0s" },
  { top: "18vh", right: "10%", size: "w-0.5 h-0.5", color: "bg-amber-light/25", anim: "animate-float-slow", delay: "1.2s" },
  { top: "26vh", left: "6%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.6s" },
  { top: "22vh", right: "7%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "1.9s" },
  { top: "34vh", left: "11%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "0.8s" },
  { top: "40vh", right: "9%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float", delay: "1.5s" },
  { top: "48vh", left: "5%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float-slow", delay: "1.1s" },
  { top: "54vh", right: "12%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float", delay: "2.1s" },
  { bottom: "18vh", left: "10%", size: "w-1 h-1", color: "bg-accent/20", anim: "animate-float", delay: "2s" },
  { bottom: "14vh", right: "8%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float-slow", delay: "1.4s" },
  { bottom: "10vh", left: "7%", size: "w-0.5 h-0.5", color: "bg-primary/25", anim: "animate-float", delay: "0.5s" },
  { bottom: "12vh", right: "11%", size: "w-1 h-1", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.8s" },
]

const memorialContentDots: DotConfig[] = [
  { top: "10%", left: "5%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float", delay: "0.9s" },
  { top: "10%", right: "7%", size: "w-0.5 h-0.5", color: "bg-accent/15", anim: "animate-float-slow", delay: "1.2s" },
  { top: "13%", left: "9%", size: "w-1 h-1", color: "bg-candle/20", anim: "animate-float", delay: "2.5s" },
  { top: "16%", right: "4%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.3s" },
  { top: "19%", left: "4%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float", delay: "0.4s" },
  { top: "22%", right: "9%", size: "w-0.5 h-0.5", color: "bg-accent/25", anim: "animate-float", delay: "2.1s" },
  { top: "25%", left: "11%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float-slow", delay: "1.7s" },
  { top: "28%", right: "6%", size: "w-1 h-1", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.7s" },
  { top: "31%", left: "6%", size: "w-0.5 h-0.5", color: "bg-amber-light/25", anim: "animate-float", delay: "2.3s" },
  { top: "34%", right: "11%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "1.6s" },
  { top: "37%", left: "3%", size: "w-0.5 h-0.5", color: "bg-primary/15", anim: "animate-float-slow", delay: "0.2s" },
  { top: "40%", right: "5%", size: "w-1 h-1", color: "bg-candle/20", anim: "animate-float", delay: "2.8s" },
  { top: "43%", left: "10%", size: "w-0.5 h-0.5", color: "bg-primary/30", anim: "animate-float-slow", delay: "2.4s" },
  { top: "46%", right: "8%", size: "w-0.5 h-0.5", color: "bg-accent/20", anim: "animate-float", delay: "0.2s" },
  { top: "49%", left: "7%", size: "w-1 h-1", color: "bg-amber-light/25", anim: "animate-float-slow", delay: "1.9s" },
  { top: "52%", right: "3%", size: "w-0.5 h-0.5", color: "bg-primary/25", anim: "animate-float", delay: "0.6s" },
  { top: "55%", left: "5%", size: "w-1.5 h-1.5", color: "bg-primary/15", anim: "animate-float", delay: "1s" },
  { top: "58%", right: "10%", size: "w-0.5 h-0.5", color: "bg-candle/30", anim: "animate-float-slow", delay: "2.7s" },
  { top: "61%", left: "12%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "2.2s" },
  { top: "64%", right: "6%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.5s" },
  { top: "67%", left: "4%", size: "w-1 h-1", color: "bg-primary/20", anim: "animate-float", delay: "0.9s" },
  { top: "70%", right: "9%", size: "w-0.5 h-0.5", color: "bg-accent/25", anim: "animate-float-slow", delay: "1.8s" },
  { top: "73%", left: "8%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float", delay: "2.6s" },
  { top: "76%", right: "4%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float-slow", delay: "1.1s" },
  { top: "79%", left: "6%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float", delay: "2.2s" },
  { top: "82%", right: "7%", size: "w-1 h-1", color: "bg-accent/20", anim: "animate-float-slow", delay: "0.8s" },
  { top: "85%", left: "11%", size: "w-0.5 h-0.5", color: "bg-primary/30", anim: "animate-float", delay: "2.1s" },
  { top: "88%", right: "5%", size: "w-0.5 h-0.5", color: "bg-candle/20", anim: "animate-float-slow", delay: "0.6s" },
  { top: "91%", left: "3%", size: "w-1 h-1", color: "bg-primary/20", anim: "animate-float", delay: "1.4s" },
  { top: "94%", right: "10%", size: "w-0.5 h-0.5", color: "bg-accent/30", anim: "animate-float-slow", delay: "2.4s" },
  { top: "97%", left: "8%", size: "w-0.5 h-0.5", color: "bg-amber-light/15", anim: "animate-float", delay: "1.3s" },
  { bottom: "10%", left: "4%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float-slow", delay: "1.3s" },
  { bottom: "8%", right: "6%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "1.8s" },
  { bottom: "6%", left: "10%", size: "w-0.5 h-0.5", color: "bg-primary/25", anim: "animate-float", delay: "0.5s" },
  { bottom: "4%", right: "4%", size: "w-1 h-1", color: "bg-candle/20", anim: "animate-float", delay: "2.4s" },
  { bottom: "2%", left: "7%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.1s" },
  { bottom: "1%", right: "9%", size: "w-0.5 h-0.5", color: "bg-primary/15", anim: "animate-float", delay: "2s" },
]

const memorialGutterLeftDots: DotConfig[] = [
  { top: "8%", left: "18%", size: "w-1 h-1", color: "bg-primary/30", anim: "animate-float", delay: "0s" },
  { top: "14%", left: "42%", size: "w-0.5 h-0.5", color: "bg-amber-light/25", anim: "animate-float-slow", delay: "1.2s" },
  { top: "20%", left: "28%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.6s" },
  { top: "26%", left: "55%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "1.9s" },
  { top: "32%", left: "12%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "0.8s" },
  { top: "38%", left: "38%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float", delay: "1.5s" },
  { top: "44%", left: "62%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float-slow", delay: "1.1s" },
  { top: "50%", left: "22%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float", delay: "2.1s" },
  { top: "56%", left: "48%", size: "w-1 h-1", color: "bg-accent/20", anim: "animate-float", delay: "2s" },
  { top: "62%", left: "15%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float-slow", delay: "1.4s" },
  { top: "68%", left: "35%", size: "w-0.5 h-0.5", color: "bg-primary/25", anim: "animate-float", delay: "0.5s" },
  { top: "74%", left: "58%", size: "w-1 h-1", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.8s" },
  { top: "80%", left: "20%", size: "w-1.5 h-1.5", color: "bg-primary/15", anim: "animate-float", delay: "1s" },
  { top: "86%", left: "45%", size: "w-0.5 h-0.5", color: "bg-candle/30", anim: "animate-float-slow", delay: "2.7s" },
  { top: "92%", left: "30%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "2.2s" },
  { bottom: "6%", left: "52%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.9s" },
]

const memorialGutterRightDots: DotConfig[] = [
  { top: "10%", right: "20%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float", delay: "0.9s" },
  { top: "16%", right: "45%", size: "w-0.5 h-0.5", color: "bg-accent/15", anim: "animate-float-slow", delay: "1.2s" },
  { top: "22%", right: "28%", size: "w-1 h-1", color: "bg-candle/20", anim: "animate-float", delay: "2.5s" },
  { top: "28%", right: "58%", size: "w-0.5 h-0.5", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1.3s" },
  { top: "34%", right: "14%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float", delay: "0.4s" },
  { top: "40%", right: "36%", size: "w-0.5 h-0.5", color: "bg-accent/25", anim: "animate-float", delay: "2.1s" },
  { top: "46%", right: "62%", size: "w-0.5 h-0.5", color: "bg-candle/25", anim: "animate-float-slow", delay: "1.7s" },
  { top: "52%", right: "18%", size: "w-1 h-1", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.7s" },
  { top: "58%", right: "42%", size: "w-0.5 h-0.5", color: "bg-amber-light/25", anim: "animate-float", delay: "2.3s" },
  { top: "64%", right: "55%", size: "w-1 h-1", color: "bg-accent/30", anim: "animate-float", delay: "1.6s" },
  { top: "70%", right: "24%", size: "w-0.5 h-0.5", color: "bg-primary/15", anim: "animate-float-slow", delay: "0.2s" },
  { top: "76%", right: "48%", size: "w-1 h-1", color: "bg-candle/20", anim: "animate-float", delay: "2.8s" },
  { top: "82%", right: "32%", size: "w-0.5 h-0.5", color: "bg-primary/30", anim: "animate-float-slow", delay: "2.4s" },
  { top: "88%", right: "60%", size: "w-0.5 h-0.5", color: "bg-accent/20", anim: "animate-float", delay: "0.2s" },
  { top: "94%", right: "16%", size: "w-1 h-1", color: "bg-amber-light/25", anim: "animate-float-slow", delay: "1.9s" },
  { bottom: "4%", right: "40%", size: "w-0.5 h-0.5", color: "bg-candle/20", anim: "animate-float-slow", delay: "0.6s" },
]

function FloatingDots({ dots, className }: { dots: DotConfig[]; className?: string }) {
  return (
    <div className={`pointer-events-none ${className ?? ""}`}>
      {dots.map((dot, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${dot.size} ${dot.color} ${dot.anim}`}
          style={{
            top: dot.top,
            bottom: dot.bottom,
            left: dot.left,
            right: dot.right,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  )
}

export function MemorialHeroDots() {
  return (
    <FloatingDots
      dots={memorialHeroDots}
      className="absolute inset-0 hidden md:block z-[1] memorial-hero-dots"
    />
  )
}

export function MemorialContentDots() {
  return (
    <FloatingDots
      dots={memorialContentDots}
      className="absolute inset-0 hidden md:block z-0"
    />
  )
}

export function MemorialGutterDots() {
  return (
    <div
      className="memorial-gutter-dots-layer absolute inset-0 hidden md:block pointer-events-none z-0 overflow-hidden"
      aria-hidden
    >
      <FloatingDots dots={memorialGutterLeftDots} className="memorial-gutter-dots memorial-gutter-dots--left" />
      <FloatingDots dots={memorialGutterRightDots} className="memorial-gutter-dots memorial-gutter-dots--right" />
    </div>
  )
}

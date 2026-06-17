'use client'

import { useEffect, useRef, useCallback } from 'react'

const TOTAL_FRAMES = 230
const MOBILE_BREAKPOINT = 768
const LERP_FACTOR = 0.06

interface ScrollState {
  targetProgress: number
  currentProgress: number
  frameIndex: number
  animationId: number | null
}

export function useCinematicScroll(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  frames: (HTMLImageElement | null)[],
  isMobile: boolean,
  isReady: boolean,
) {
  const stateRef = useRef<ScrollState>({
    targetProgress: 0,
    currentProgress: 0,
    frameIndex: 0,
    animationId: null,
  })

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = frames[index]
      if (!img?.complete || !img.naturalWidth) return

      const cw = canvas.width
      const ch = canvas.height
      const FW = img.naturalWidth || (isMobile ? 800 : 1920)
      const FH = img.naturalHeight || (isMobile ? 822 : 1080)

      // Cover-fit: fill canvas, centered
      const scale = Math.max(cw / FW, ch / FH)
      const dw = FW * scale
      const dh = FH * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    },
    [canvasRef, frames, isMobile],
  )

  const animate = useCallback(() => {
    const state = stateRef.current
    const diff = state.targetProgress - state.currentProgress
    
    if (Math.abs(diff) < 0.0001) {
      state.currentProgress = state.targetProgress
      const newFrameIndex = Math.min(
        Math.floor(state.currentProgress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1,
      )
      if (newFrameIndex !== state.frameIndex) {
        state.frameIndex = newFrameIndex
        drawFrame(newFrameIndex)
      }
      state.animationId = null
      return
    }

    state.currentProgress += diff * LERP_FACTOR

    const newFrameIndex = Math.min(
      Math.floor(state.currentProgress * (TOTAL_FRAMES - 1)),
      TOTAL_FRAMES - 1,
    )

    if (newFrameIndex !== state.frameIndex) {
      state.frameIndex = newFrameIndex
      drawFrame(newFrameIndex)
    }

    state.animationId = requestAnimationFrame(animate)
  }, [drawFrame])

  useEffect(() => {
    if (!isReady) return

    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return
      
      const containerTop = container.offsetTop
      const containerHeight = container.offsetHeight
      const scrollDistance = containerHeight - window.innerHeight
      if (scrollDistance <= 0) return
      
      const scrollTop = window.scrollY - containerTop
      const rawProgress = scrollTop / scrollDistance
      stateRef.current.targetProgress = Math.max(0, Math.min(1, rawProgress))

      if (!stateRef.current.animationId) {
        stateRef.current.animationId = requestAnimationFrame(animate)
      }
    }

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawFrame(stateRef.current.frameIndex)
    }

    const state = stateRef.current

    // Initial canvas size
    handleResize()

    // Draw first frame immediately
    drawFrame(0)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (state.animationId) cancelAnimationFrame(state.animationId)
    }
  }, [isReady, animate, drawFrame, canvasRef, containerRef])

  return stateRef.current
}

export function getChapterOpacity(progress: number): number[] {
  // Returns opacity for each of 4 chapters
  const chapters = [
    { start: 0, end: 0.22 },
    { start: 0.25, end: 0.47 },
    { start: 0.50, end: 0.72 },
    { start: 0.75, end: 0.97 },
  ]

  return chapters.map(({ start, end }) => {
    if (progress >= start && progress <= end) return 1
    // Fade in
    if (progress >= start - 0.04 && progress < start) return (progress - (start - 0.04)) / 0.04
    // Fade out
    if (progress > end && progress <= end + 0.04) return 1 - (progress - end) / 0.04
    return 0
  })
}

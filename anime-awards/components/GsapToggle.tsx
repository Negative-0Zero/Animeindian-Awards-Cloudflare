'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GsapToggleProps {
  onToggle?: (state: boolean) => void
  initialState?: boolean
}

export default function GsapToggle({ onToggle, initialState = false }: GsapToggleProps) {
  const toggleRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const shortStrokeRef = useRef<SVGLineElement>(null)
  const longStrokeRef = useRef<SVGLineElement>(null)
  const tl = useRef<gsap.core.Timeline>(null) // ✅ fixed: pass null

  useEffect(() => {
    // Initialize the strokes in the "off" position
    if (shortStrokeRef.current && longStrokeRef.current) {
      gsap.set(longStrokeRef.current, { attr: { x1: 332.5, y1: 290, x2: 332.5, y2: 310 } })
      gsap.set(shortStrokeRef.current, { attr: { x1: 338.5, y1: 290, x2: 358.5, y2: 310 } })
    }
    gsap.set(toggleRef.current, { rotation: 0, x: 0 })
    if (circleRef.current) gsap.set(circleRef.current, { fill: '#F3E5D3' })

    // Create the animation timeline, paused initially
    tl.current = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .to(toggleRef.current, { rotation: -180, transformOrigin: '50% 50%', x: 70, duration: 0.5 }, 'animation')
      .to(circleRef.current, { fill: '#7E86F9', duration: 0.5 }, 'animation')
      .to(longStrokeRef.current, { attr: { x1: 364, y1: 278, x2: 364, y2: 322 }, y: -12, x: 3.5, duration: 0.5 }, 'animation')
      .to(shortStrokeRef.current, { attr: { x1: 338.5, y1: 290, x2: 358.5, y2: 310 }, y: -12, x: 3.5, duration: 0.5 }, 'animation')
      .to(circleRef.current, { attr: { filter: 'url(#dropShadow)' }, duration: 0.25, ease: 'power1' }, 'animation+=0.25')
      .timeScale(0.7)

    // Set initial state based on prop
    if (initialState) {
      tl.current.progress(1)
    }
  }, [initialState])

  const handleClick = () => {
    if (!tl.current) return
    if (tl.current.progress() === 1) {
      tl.current.reverse()
      onToggle?.(false)
    } else {
      tl.current.play()
      onToggle?.(true)
    }
  }

  return (
    <div onClick={handleClick} className="cursor-pointer w-32 h-24 flex items-center justify-center">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <filter id="dropShadow" width="125%" height="125%">
            <feOffset result="offOut" in="SourceGraphic" dx="0" dy="-2" />
            <feGaussianBlur in="offOut" stdDeviation="2" result="blur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6" intercept="0" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" operator="over" />
          </filter>
        </defs>
        <path fill="#FEFDFF" d="M348,340h75c22.091,0,40-17.909,40-40v0c0-22.091-17.909-40-40-40h-75c-22.091,0-40,17.909-40,40v0C308,322.091,325.909,340,348,340z" />
        <g id="toggleContainer" ref={toggleRef}>
          <circle ref={circleRef} id="toggleCircle" fill="#F3E5D3" cx="348.5" cy="300" r="34" />
          <line ref={longStrokeRef} id="longStroke" stroke="#FEFDFF" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10" x1="332.5" y1="290" x2="332.5" y2="310" />
          <line ref={shortStrokeRef} id="shortStroke" stroke="#FEFDFF" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10" x1="338.5" y1="290" x2="358.5" y2="310" />
        </g>
      </svg>
    </div>
  )
      }

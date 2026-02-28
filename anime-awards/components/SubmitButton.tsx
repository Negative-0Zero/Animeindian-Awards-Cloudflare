'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import './SubmitButton.css'

interface SubmitButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export default function SubmitButton({ onClick, children, className = '', disabled = false }: SubmitButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])
  const count = 110

  // Create dots once on mount
  useEffect(() => {
    if (!bottomRef.current) return
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div')
      dot.classList.add('dot')
      fragment.appendChild(dot)
    }
    bottomRef.current.appendChild(fragment)
    dotsRef.current = Array.from(bottomRef.current.children) as HTMLDivElement[]
  }, [])

  const animate = () => {
    if (disabled || isAnimating) return
    setIsAnimating(true)

    // Burst animation: move each dot randomly
    dotsRef.current.forEach((dot) => {
      const translateX = (Math.random() - 0.5) * 200
      const translateY = (Math.random() - 0.5) * 200
      const rotate = Math.random() * 360
      dot.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`
      dot.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    })

    setTimeout(() => {
      // Reset dots
      dotsRef.current.forEach((dot) => {
        dot.style.transform = 'translate(0, 0) rotate(0deg)'
        dot.style.transition = ''
      })
      setIsAnimating(false)
      onClick?.()
    }, 800)
  }

  return (
    <div
      className={`container ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={animate}
    >
      <div className="bottom" ref={bottomRef}></div>
      <div className="cover cut"></div>
      <div className="text-container">
        <div className="text text-dark">{children}</div>
      </div>
      <div className="text-container cut">
        <div className="text">{children}</div>
      </div>
      <div className="overlay"></div>
    </div>
  )
}

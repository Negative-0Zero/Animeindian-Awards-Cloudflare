'use client'

import { useEffect, useRef, useState } from 'react'
import './SubmitButton.css' // We'll create this file next

interface SubmitButtonProps {
  onSubmit?: () => void
  text?: string
  className?: string
}

export default function SubmitButton({ onSubmit, text = 'Submit', className = '' }: SubmitButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])
  const count = 110

  // Create dots on mount
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
    if (isAnimating) return
    setIsAnimating(true)

    dotsRef.current.forEach((dot, i) => {
      const translateX = (Math.random() - 0.5) * 200
      const translateY = (Math.random() - 0.5) * 200
      const rotate = Math.random() * 360
      dot.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`
      dot.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    })

    setTimeout(() => {
      dotsRef.current.forEach((dot) => {
        dot.style.transform = 'translate(0, 0) rotate(0deg)'
        dot.style.transition = ''
      })
      setIsAnimating(false)
      onSubmit?.()
    }, 800)
  }

  return (
    <div
      ref={buttonRef}
      className={`container ${className}`}
      onClick={animate}
    >
      <div className="bottom" ref={bottomRef}></div>
      <div className="cover cut"></div>
      <div className="text-container">
        <div className="text text-dark">{text}</div>
      </div>
      <div className="text-container cut">
        <div className="text">{text}</div>
      </div>
      <div className="overlay"></div>
    </div>
  )
}

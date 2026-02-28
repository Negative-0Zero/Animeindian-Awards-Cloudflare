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
  const bottomRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])
  const buttonRef = useRef<HTMLDivElement>(null)
  const animeRef = useRef<any>(null)
  const [animeLoaded, setAnimeLoaded] = useState(false)
  const count = 110
  const dotSize = 4

  // Load anime dynamically on client side
  useEffect(() => {
    import('animejs').then(module => {
      animeRef.current = module;
      setAnimeLoaded(true);
    }).catch(err => {
      console.error('Failed to load animejs', err);
    });
  }, [])

  const positionDots = () => {
    if (!dotsRef.current.length || !buttonRef.current) return
    const buttonWidth = buttonRef.current.offsetWidth;
    dotsRef.current.forEach((dot, i) => {
      const x = (i / count) * (buttonWidth + dotSize) - dotSize / 2;
      const y = Math.random() * 52 - dotSize / 2;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.opacity = '1';
      dot.style.transform = 'scale(1)';
    });
  };

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
    requestAnimationFrame(() => {
      positionDots();
    });

    const handleResize = () => positionDots();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const resetDots = () => {
    if (!dotsRef.current.length) return
    positionDots();
  }

  const handleClick = () => {
    if (disabled) return

    if (animeLoaded && animeRef.current) {
      const anime = animeRef.current;
      anime({
        targets: dotsRef.current,
        opacity: [{ value: 0, duration: 600, delay: anime.stagger(10) }],
        translateX: {
          value: () => anime.random(-30, 30),
          duration: 400,
          delay: anime.stagger(10)
        },
        translateY: {
          value: () => anime.random(-30, 30),
          duration: 400,
          delay: anime.stagger(10)
        },
        scale: {
          value: 0,
          duration: 400,
          delay: anime.stagger(10)
        },
        easing: 'linear',
        complete: () => {
          onClick?.()
          setTimeout(resetDots, 50)
        }
      });
    } else {
      onClick?.();
    }
  }

  return (
    <div
      ref={buttonRef}
      className={`container ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      style={{ width: '100%' }}
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

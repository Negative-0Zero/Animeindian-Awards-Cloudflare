'use client'

import './FingerLoader.css'

interface FingerLoaderProps {
  className?: string
}

export default function FingerLoader({ className = '' }: FingerLoaderProps) {
  return (
    <div className={`loading ${className}`}>
      <div className="finger finger-1">
        <div className="finger-item">
          <span></span><i></i>
        </div>
      </div>
      <div className="finger finger-2">
        <div className="finger-item">
          <span></span><i></i>
        </div>
      </div>
      <div className="finger finger-3">
        <div className="finger-item">
          <span></span><i></i>
        </div>
      </div>
      <div className="finger finger-4">
        <div className="finger-item">
          <span></span><i></i>
        </div>
      </div>
    </div>
  )
}

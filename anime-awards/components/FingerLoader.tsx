'use client'

import './FingerLoader.css'

export default function FingerLoader() {
  return (
    <div className="loading">
      <div className="finger finger-1">
        <div className="finger-item"><span></span><i></i></div>
      </div>
      <div className="finger finger-2">
        <div className="finger-item"><span></span><i></i></div>
      </div>
      <div className="finger finger-3">
        <div className="finger-item"><span></span><i></i></div>
      </div>
      <div className="finger finger-4">
        <div className="finger-item"><span></span><i></i></div>
      </div>
      <div className="finger finger-5 thumb">
        <div className="finger-item"><span></span><i></i></div>
      </div>
    </div>
  )
}

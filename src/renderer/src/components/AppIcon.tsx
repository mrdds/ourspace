import React from 'react'
import logo from '../assets/appstore.png'

// Logo import

interface AppIconProps {
  size?: number
  className?: string
}

const AppIcon: React.FC<AppIconProps> = ({ size = 40, className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-black rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logo}
        alt="OurSpace Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}

export default AppIcon

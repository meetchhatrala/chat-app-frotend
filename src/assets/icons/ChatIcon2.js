import React from 'react'

export const ChatIcon2 = ({ width = 20, height = 20, color = "currentColor" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="button" width={width} height={height} fill={color} className="bi bi-chevron-right" viewBox="0 0 16 16">
      <title>Chat</title>
      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
    </svg>
  )
}

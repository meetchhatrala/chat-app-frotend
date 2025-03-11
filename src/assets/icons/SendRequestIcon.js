import React from 'react'

export const SendRequestIcon = ({ width = 20, height = 20, onclick, color = "currentColor" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role="button" width={width} height={height} fill={color} className="bi bi-person-plus-fill" viewBox="0 0 16 16" onClick={onclick ? onclick : undefined}>
      <title>Send Friend Request</title>
      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
      <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" />
    </svg>
  )
}

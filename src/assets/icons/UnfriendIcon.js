import React from 'react'

export const UnfriendIcon = ({ width = 20, height = 20, onclick, color = "currentColor" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={color} className="bi bi-person-fill-x" viewBox="0 0 16 16" role="button" onClick={onclick ? onclick : undefined} >
      <title>Unfriend</title>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4" />
      <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708" />
    </svg>
  )
}

import React from 'react'

function UserDistance({ distance }) {
  let component = null;
  let backgroundColor = ''
  
  if (distance < 25) {
    backgroundColor = 'green'
  } else if (distance < 50) {
    backgroundColor = 'yellow'
  } else if (distance < 100) {
    backgroundColor = 'orange'
  } else {
    backgroundColor = 'red'
  }
  return (
    <span style={{backgroundColor}}>{distance}</span>
  )
}

export default UserDistance
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import EntryNotification from './EntryNotification'
import ExitNotification from './ExitNotification'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<EntryNotification></EntryNotification>
<ExitNotification></ExitNotification>
    </>
  )
}

export default App

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatMessages from './components/Chat.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatMessages />
  </StrictMode>,
)

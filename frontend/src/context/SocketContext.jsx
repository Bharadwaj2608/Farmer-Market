import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('/', { transports: ['websocket'] })
    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (user && socketRef.current) {
      socketRef.current.emit('register', user._id)
    }
  }, [user])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)

'use client'
import { useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localMessage, setlocalMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [somebodyIsTyping, setsomebodyIsTyping] = useState(false)

  useEffect(() => {
    const initSocket = async () => {
      await fetch("/api/socket")

      const socketInstance = io();

      socketInstance.on('connect', () => {
        console.log('Connected to socket');
        setConnected(true);
      });
      
      socketInstance.on('message', (data: string) => {
        setMessages((prev) => [...prev, data]);
      });

      socketInstance.on('is-typing', (data: boolean) => {
        setsomebodyIsTyping(data)
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket');
        setConnected(false);
      });
      
      setSocket(socketInstance);

    };

    initSocket()
    
      // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleLocalMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const message : string = e.target.value
    setlocalMessage(message.trim())

    if (!socket) return

    if(message.length > 0) {
      socket.emit('is-typing', true);
    }
    else {
      socket.emit('is-typing', false);
    }
  }
  
  // Send message function
  const sendMessage = () => {
    if (socket && localMessage.trim()) {
      socket.emit('message', localMessage);
      setlocalMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8">
      <main className="flex-grow gap-[32px] row-start-2 items-center sm:items-start">
        <div className="">
          Status: {connected ? 'Connected' : 'Disconnected'}
        </div>
        <div>
          {somebodyIsTyping && "somebody else is typing"}
        </div>
        <div>
          <input
            type="text"
            value={localMessage}
            onChange={handleLocalMessageChange}
            placeholder="Type a message"
            onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </div>
      </main>
      <footer className="flex flex-wrap items-center justify-center">
        Socketss!
      </footer>
    </div>
  );
}

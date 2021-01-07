import React, { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        videoRef.current!.srcObject = stream
      } catch (error) {
        console.error('Error opening video camera.', error)
      }
    }

    setupCamera()
  }, [])

  return <video ref={videoRef} autoPlay playsInline controls={false} />
}

export default App

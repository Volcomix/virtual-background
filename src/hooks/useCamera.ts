import { useEffect, useRef } from 'react'

function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null!)

  useEffect(() => {
    async function playVideoFromCamera() {
      try {
        const constraints = { video: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        videoRef.current.srcObject = stream
      } catch (error) {
        console.error('Error opening video camera.', error)
        alert(`Error opening video camera. ${error}`)
      }
    }

    playVideoFromCamera()
  }, [])

  return videoRef
}

export default useCamera

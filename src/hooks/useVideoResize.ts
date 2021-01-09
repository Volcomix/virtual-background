import { RefObject, useEffect, useState } from 'react'

function useVideoResize(videoRef: RefObject<HTMLVideoElement>) {
  const [videoWidth, setVideoWidth] = useState<number>()
  const [videoHeight, setVideoHeight] = useState<number>()

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
    const video = videoRef.current

    function handleVideoResize() {
      console.log('Video was resized')
      setVideoWidth(video.videoWidth)
      setVideoHeight(video.videoHeight)
    }

    console.log('Listening for video resize')
    video.addEventListener('resize', handleVideoResize)

    return () => {
      video.removeEventListener('resize', handleVideoResize)
    }
  }, [videoRef])

  return { videoWidth, videoHeight }
}

export default useVideoResize

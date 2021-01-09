import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useState } from 'react'
import useCamera from '../hooks/useCamera'
import useVideoResize from '../hooks/useVideoResize'
import VideoControl from './VideoControl'
import './VideoPlayer.css'

type VideoPlayerProps = {
  // BodyPix must be loaded outside this component to prevent
  // GPU memory issues with Create React App HMR
  bodyPixNeuralNetwork: BodyPix
}

type ControlNames = 'noBackground' | 'blur' | 'image'

function VideoPlayer(props: VideoPlayerProps) {
  const videoRef = useCamera()
  const { videoWidth, videoHeight } = useVideoResize(videoRef)
  const [isVideoPlaying, setVideoPlaying] = useState(false)
  const [activatedControl, setActivatedControl] = useState<ControlNames>(
    'noBackground'
  )
  const [inferenceDuration, setInferenceDuration] = useState(0)
  const [fps, setFps] = useState(0)

  // const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (activatedControl === 'noBackground' || !isVideoPlaying) {
      return
    }

    // Required to stop looping in useEffect in development mode
    let shouldDrawBackground = true

    let animationFrameHandle: number
    let previousTime = Date.now()
    let frameCount = 0

    async function drawBackground() {
      if (!shouldDrawBackground) {
        return
      }
      const beginTime = Date.now()
      const segmentation = await props.bodyPixNeuralNetwork.segmentPerson(
        videoRef.current
      )
      const time = Date.now()

      frameCount++
      if (time >= previousTime + 1000) {
        setInferenceDuration(time - beginTime)
        setFps((frameCount * 1000) / (time - previousTime))
        previousTime = time
        frameCount = 0
      }

      animationFrameHandle = requestAnimationFrame(drawBackground)
    }

    drawBackground()
    console.log('Animation started:', activatedControl)

    return () => {
      shouldDrawBackground = false
      cancelAnimationFrame(animationFrameHandle)
      console.log('Animation stopped:', activatedControl)
    }
  }, [props.bodyPixNeuralNetwork, videoRef, activatedControl, isVideoPlaying])

  // return <canvas ref={canvasRef} className="VideoPlayer"></canvas>
  return (
    <div className="VideoPlayer">
      <div className="VideoPlayer-stats">
        {Math.round(fps)} fps (Inference {inferenceDuration}ms)
      </div>
      <video
        ref={videoRef}
        className="VideoPlayer-video"
        width={videoWidth}
        height={videoHeight}
        autoPlay
        playsInline
        controls={false}
        onLoadedData={() => setVideoPlaying(true)}
        onAbort={() => setVideoPlaying(false)}
      ></video>
      <div className="VideoPlayer-controls">
        <VideoControl
          iconName="do_not_disturb"
          isActivated={activatedControl === 'noBackground'}
          onClick={() => setActivatedControl('noBackground')}
        ></VideoControl>
        <VideoControl
          iconName="blur_on"
          isActivated={activatedControl === 'blur'}
          onClick={() => setActivatedControl('blur')}
        ></VideoControl>
        <VideoControl
          iconName="image"
          isActivated={activatedControl === 'image'}
          onClick={() => setActivatedControl('image')}
        ></VideoControl>
      </div>
    </div>
  )
}

export default VideoPlayer

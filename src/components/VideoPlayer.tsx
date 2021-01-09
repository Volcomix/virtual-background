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
  const [activatedControl, setActivatedControl] = useState<ControlNames>(
    'noBackground'
  )
  const [inferenceDuration, setInferenceDuration] = useState(0)
  const [fps, setFps] = useState(0)

  // const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (activatedControl === 'noBackground') {
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
      setInferenceDuration(time - beginTime)

      frameCount++
      if (time >= previousTime + 1000) {
        setFps((frameCount * 1000) / (time - previousTime))
        previousTime = time
        frameCount = 0
      }

      animationFrameHandle = requestAnimationFrame(drawBackground)
    }

    drawBackground()
    console.log('Animation started')

    return () => {
      shouldDrawBackground = false
      cancelAnimationFrame(animationFrameHandle)
      console.log('Animation stopped')
    }
  }, [props.bodyPixNeuralNetwork, videoRef, activatedControl])

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

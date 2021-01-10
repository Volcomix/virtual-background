import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useRef, useState } from 'react'
import useCamera from '../hooks/useCamera'
import useStats from '../hooks/useStats'
import useVideoResize from '../hooks/useVideoResize'
import VideoControl from './VideoControl'
import './VideoPlayer.css'

type VideoPlayerProps = {
  // BodyPix must be loaded outside this component to prevent
  // GPU memory issues with Create React App HMR
  bodyPixNeuralNetwork: BodyPix
}

type Background = 'none' | 'blur' | 'image'

function VideoPlayer(props: VideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const videoRef = useCamera()
  const { videoWidth, videoHeight } = useVideoResize(videoRef)
  const [isVideoPlaying, setVideoPlaying] = useState(false)
  const [background, setBackground] = useState<Background>('none')
  const {
    fps,
    durations: [inferenceDuration, postProcessingDuration],
    beginFrame,
    addFrameEvent,
    endFrame,
  } = useStats()

  useEffect(() => {
    if (!isVideoPlaying) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')!
    const mask = new ImageData(videoWidth, videoHeight)
    const videoPixelCount = videoWidth * videoHeight

    // Required to stop looping in useEffect in development mode
    let shouldDrawBackground = true

    let animationRequestId: number

    async function drawBackground() {
      if (!shouldDrawBackground) {
        return
      }

      beginFrame()
      if (background !== 'none') {
        const segmentation = await props.bodyPixNeuralNetwork.segmentPerson(
          videoRef.current
        )
        for (let i = 0; i < videoPixelCount; i++) {
          // Set only the alpha component of each pixel
          mask.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
        }
      }
      addFrameEvent()
      if (background === 'blur') {
        ctx.putImageData(mask, 0, 0)
        ctx.globalCompositeOperation = 'source-out'
        ctx.filter = 'blur(4px)' // Does not work on Safari
        ctx.drawImage(videoRef.current, 0, 0)
        ctx.globalCompositeOperation = 'destination-over'
        ctx.filter = 'none'
      } else {
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.drawImage(videoRef.current, 0, 0)
      endFrame()

      animationRequestId = requestAnimationFrame(drawBackground)
    }

    drawBackground()
    console.log('Animation started:', background)

    return () => {
      shouldDrawBackground = false
      cancelAnimationFrame(animationRequestId)
      console.log('Animation stopped:', background)
    }
  }, [
    props.bodyPixNeuralNetwork,
    videoRef,
    background,
    videoWidth,
    videoHeight,
    isVideoPlaying,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  return (
    <div className="VideoPlayer">
      <div className="VideoPlayer-stats">
        <span>{Math.round(fps)} fps</span> (
        <span>inference {inferenceDuration}ms</span>,{' '}
        <span>post-processing {postProcessingDuration}ms</span>)
      </div>
      <video
        ref={videoRef}
        width={videoWidth}
        height={videoHeight}
        autoPlay
        playsInline
        controls={false}
        hidden
        onLoadedData={() => setVideoPlaying(true)}
        onAbort={() => setVideoPlaying(false)}
      ></video>
      <canvas
        ref={canvasRef}
        className="VideoPlayer-video"
        width={videoWidth}
        height={videoHeight}
      ></canvas>
      <div className="VideoPlayer-controls">
        <VideoControl
          iconName="do_not_disturb"
          isActivated={background === 'none'}
          onClick={() => setBackground('none')}
        ></VideoControl>
        <VideoControl
          iconName="blur_on"
          isActivated={background === 'blur'}
          onClick={() => setBackground('blur')}
        ></VideoControl>
        <VideoControl
          iconName="image"
          isActivated={background === 'image'}
          onClick={() => setBackground('image')}
        ></VideoControl>
      </div>
    </div>
  )
}

export default VideoPlayer

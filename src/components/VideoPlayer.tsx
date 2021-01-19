import BlockIcon from '@material-ui/icons/Block'
import BlurOnIcon from '@material-ui/icons/BlurOn'
import ImageIcon from '@material-ui/icons/Image'
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

// FIXME No background icon is displayed while initializing camera
function VideoPlayer(props: VideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null!)
  const imageRef = useRef<HTMLImageElement>(null!)
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
    const maskCtx = maskCanvasRef.current.getContext('2d')!
    const mask = new ImageData(videoWidth, videoHeight)
    const videoPixelCount = videoWidth * videoHeight

    let imageWidth = imageRef.current.naturalWidth
    let imageHeight = imageRef.current.naturalHeight
    const imageScale = Math.max(
      1,
      videoWidth / imageWidth,
      videoHeight / imageHeight
    )
    imageWidth *= imageScale
    imageHeight *= imageScale

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
        maskCtx.putImageData(mask, 0, 0)
      }
      addFrameEvent()
      if (background === 'blur') {
        ctx.globalCompositeOperation = 'copy'
        ctx.filter = 'blur(8px)' // FIXME Does not work on Safari
        ctx.drawImage(maskCanvasRef.current, 0, 0)
        ctx.globalCompositeOperation = 'source-out'
        ctx.drawImage(videoRef.current, 0, 0)
        ctx.globalCompositeOperation = 'destination-over'
        ctx.filter = 'none'
      } else if (background === 'image') {
        ctx.globalCompositeOperation = 'copy'
        ctx.filter = 'blur(2px)' // FIXME Does not work on Safari
        ctx.drawImage(maskCanvasRef.current, 0, 0)
        ctx.globalCompositeOperation = 'source-out'
        ctx.filter = 'none'
        ctx.drawImage(imageRef.current, 0, 0, imageWidth, imageHeight)
        ctx.globalCompositeOperation = 'destination-over'
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
      <div className="VideoPlayer-root">
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
        <img
          ref={imageRef}
          src={`${process.env.PUBLIC_URL}/backgrounds/trees-4830285_640.jpg`}
          alt=""
          hidden
        ></img>
        <canvas
          ref={maskCanvasRef}
          width={videoWidth}
          height={videoHeight}
          hidden
        ></canvas>
        <canvas
          ref={canvasRef}
          className="VideoPlayer-video"
          width={videoWidth}
          height={videoHeight}
        ></canvas>
        <div className="VideoPlayer-controls">
          <VideoControl
            isActivated={background === 'none'}
            onClick={() => setBackground('none')}
          >
            <BlockIcon />
          </VideoControl>
          <VideoControl
            isActivated={background === 'blur'}
            onClick={() => setBackground('blur')}
          >
            <BlurOnIcon />
          </VideoControl>
          <VideoControl
            isActivated={background === 'image'}
            onClick={() => setBackground('image')}
          >
            <ImageIcon />
          </VideoControl>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

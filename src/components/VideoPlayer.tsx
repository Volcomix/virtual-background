import { BodyPix } from '@tensorflow-models/body-pix'
import { useState } from 'react'
import useCamera from '../hooks/useCamera'
import useVideoResize from '../hooks/useVideoResize'
import VideoControl from './VideoControl'
// import { useRef } from 'react'
import './VideoPlayer.css'

type VideoPlayerProps = {
  // BodyPix must be loaded outside this component to prevent
  // GPU memory issues with Create React App HMR
  bodyPixNeuralNetwork: BodyPix
}

type ControlNames = 'noBackground' | 'blur' | 'image'

function VideoPlayer(props: VideoPlayerProps) {
  const [activatedControl, setActivatedControl] = useState<ControlNames>(
    'noBackground'
  )
  const videoRef = useCamera()
  const { videoWidth, videoHeight } = useVideoResize(videoRef)
  // const canvasRef = useRef<HTMLCanvasElement>(null)

  async function drawBackground() {
    const segmentation = await props.bodyPixNeuralNetwork.segmentPerson(
      videoRef.current
    )

    requestAnimationFrame(drawBackground)
  }

  // return <canvas ref={canvasRef} className="VideoPlayer"></canvas>
  return (
    <div className="VideoPlayer">
      <video
        ref={videoRef}
        className="VideoPlayer-video"
        width={videoWidth}
        height={videoHeight}
        autoPlay
        playsInline
        controls={false}
        onLoadedData={drawBackground}
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

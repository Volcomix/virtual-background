import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useRef } from 'react'
import { Background } from '../helpers/backgroundHelper'
import { buildCanvas2dCpuPipeline } from '../helpers/canvas2dCpuPipeline'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from './useStats'
import { TFLite } from './useTFLite'

function useRenderingPipeline(
  sourcePlayback: SourcePlayback,
  background: Background,
  bodyPix: BodyPix,
  tflite: TFLite,
  segmentationConfig: SegmentationConfig,
  postProcessingConfig: PostProcessingConfig
) {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { fps, durations, beginFrame, addFrameEvent, endFrame } = useStats()

  useEffect(() => {
    // The useEffect cleanup function is not enough to stop
    // the rendering loop when the framerate is low
    let shouldRender = true

    let renderRequestId: number

    const runPipeline = buildCanvas2dCpuPipeline(
      sourcePlayback,
      background,
      canvasRef.current,
      bodyPix,
      tflite,
      segmentationConfig,
      postProcessingConfig,
      addFrameEvent
    )

    async function render() {
      if (!shouldRender) {
        return
      }
      beginFrame()
      await runPipeline()
      endFrame()
      renderRequestId = requestAnimationFrame(render)
    }

    render()
    console.log(
      'Animation started:',
      sourcePlayback,
      background,
      segmentationConfig,
      postProcessingConfig
    )

    return () => {
      shouldRender = false
      cancelAnimationFrame(renderRequestId)
      console.log(
        'Animation stopped:',
        sourcePlayback,
        background,
        segmentationConfig,
        postProcessingConfig
      )
    }
  }, [
    sourcePlayback,
    background,
    bodyPix,
    tflite,
    segmentationConfig,
    postProcessingConfig,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  return { canvasRef, fps, durations }
}

export default useRenderingPipeline

import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useRef, useState } from 'react'
import { buildCanvas2dPipeline } from '../../pipelines/canvas2d/canvas2dPipeline'
import { buildWebGL2Pipeline } from '../../pipelines/webgl2/webgl2Pipeline'
import { BackgroundConfig } from '../helpers/backgroundHelper'
import { RenderingPipeline } from '../helpers/renderingPipelineHelper'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from './useStats'
import { TFLite } from './useTFLite'

function useRenderingPipeline(
  sourcePlayback: SourcePlayback,
  backgroundConfig: BackgroundConfig,
  segmentationConfig: SegmentationConfig,
  bodyPix: BodyPix,
  tflite: TFLite
) {
  const [pipeline, setPipeline] = useState<RenderingPipeline | null>(null)
  const backgroundImageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { fps, durations, beginFrame, addFrameEvent, endFrame } = useStats()

  useEffect(() => {
    // The useEffect cleanup function is not enough to stop
    // the rendering loop when the framerate is low
    let shouldRender = true

    let renderRequestId: number

    const newPipeline =
      segmentationConfig.pipeline === 'webgl2'
        ? buildWebGL2Pipeline(
            sourcePlayback,
            backgroundImageRef.current,
            backgroundConfig,
            segmentationConfig,
            canvasRef.current,
            tflite,
            addFrameEvent
          )
        : buildCanvas2dPipeline(
            sourcePlayback,
            backgroundConfig,
            segmentationConfig,
            canvasRef.current,
            bodyPix,
            tflite,
            addFrameEvent
          )

    async function render() {
      if (!shouldRender) {
        return
      }
      beginFrame()
      await newPipeline.render()
      endFrame()
      renderRequestId = requestAnimationFrame(render)
    }

    render()
    console.log(
      'Animation started:',
      sourcePlayback,
      backgroundConfig,
      segmentationConfig
    )

    setPipeline(newPipeline)

    return () => {
      shouldRender = false
      cancelAnimationFrame(renderRequestId)
      newPipeline.cleanUp()
      console.log(
        'Animation stopped:',
        sourcePlayback,
        backgroundConfig,
        segmentationConfig
      )

      setPipeline(null)
    }
  }, [
    sourcePlayback,
    backgroundConfig,
    segmentationConfig,
    bodyPix,
    tflite,
    setPipeline,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  return {
    pipeline,
    backgroundImageRef,
    canvasRef,
    fps,
    durations,
  }
}

export default useRenderingPipeline

import { BodyPix } from '@tensorflow-models/body-pix'
import { MutableRefObject, useEffect, useRef } from 'react'
import { buildCanvas2dPipeline } from '../../pipelines/canvas2d/canvas2dPipeline'
import { buildWebGL2Pipeline } from '../../pipelines/webgl2/webgl2Pipeline'
import { BackgroundConfig } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from './useStats'
import { TFLite } from './useTFLite'

function useRenderingPipeline(
  sourcePlayback: SourcePlayback,
  backgroundConfig: BackgroundConfig,
  segmentationConfig: SegmentationConfig,
  // Post-processing config change must not rebuild the pipeline
  postProcessingConfigRef: MutableRefObject<PostProcessingConfig>,
  bodyPix: BodyPix,
  tflite: TFLite
) {
  const backgroundImageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { fps, durations, beginFrame, addFrameEvent, endFrame } = useStats()

  useEffect(() => {
    // The useEffect cleanup function is not enough to stop
    // the rendering loop when the framerate is low
    let shouldRender = true

    let renderRequestId: number

    const pipeline =
      segmentationConfig.pipeline === 'webgl2'
        ? buildWebGL2Pipeline(
            sourcePlayback,
            backgroundImageRef.current,
            segmentationConfig,
            postProcessingConfigRef,
            canvasRef.current,
            tflite,
            addFrameEvent
          )
        : buildCanvas2dPipeline(
            sourcePlayback,
            backgroundConfig,
            segmentationConfig,
            postProcessingConfigRef,
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
      await pipeline.render()
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

    return () => {
      shouldRender = false
      cancelAnimationFrame(renderRequestId)
      pipeline.cleanUp()
      console.log(
        'Animation stopped:',
        sourcePlayback,
        backgroundConfig,
        segmentationConfig
      )
    }
  }, [
    sourcePlayback,
    backgroundConfig,
    segmentationConfig,
    postProcessingConfigRef,
    bodyPix,
    tflite,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  return {
    backgroundImageRef,
    canvasRef,
    fps,
    durations,
  }
}

export default useRenderingPipeline

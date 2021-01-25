import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { BodyPix } from '@tensorflow-models/body-pix'
import React, { useEffect, useRef } from 'react'
import { Background } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from '../hooks/useStats'
import { TFLite } from '../hooks/useTFLite'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
  background: Background
  bodyPix: BodyPix
  tflite: TFLite
  segmentationConfig: SegmentationConfig
  postProcessingConfig: PostProcessingConfig
}

function OutputViewer(props: OutputViewerProps) {
  const classes = useStyles()
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const {
    fps,
    durations: [resizingDuration, inferenceDuration, postProcessingDuration],
    beginFrame,
    addFrameEvent,
    endFrame,
  } = useStats()

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')!

    const [segmentationWidth, segmentationHeight] = inputResolutions[
      props.segmentationConfig.inputResolution
    ]
    const segmentationPixelCount = segmentationWidth * segmentationHeight
    const segmentationMask = new ImageData(
      segmentationWidth,
      segmentationHeight
    )
    const segmentationMaskCanvas = document.createElement('canvas')
    segmentationMaskCanvas.width = segmentationWidth
    segmentationMaskCanvas.height = segmentationHeight
    const segmentationMaskCtx = segmentationMaskCanvas.getContext('2d')!

    const inputMemoryOffset = props.tflite._getInputMemoryOffset() / 4
    const outputMemoryOffset = props.tflite._getOutputMemoryOffset() / 4

    // The useEffect cleanup function is not enough to stop
    // the rendering loop when the framerate is low
    let shouldRender = true

    let renderRequestId: number

    async function render() {
      if (!shouldRender) {
        return
      }

      beginFrame()

      if (props.background.type !== 'none') {
        segmentationMaskCtx.drawImage(
          props.sourcePlayback.htmlElement,
          0,
          0,
          props.sourcePlayback.width,
          props.sourcePlayback.height,
          0,
          0,
          segmentationWidth,
          segmentationHeight
        )
      }

      addFrameEvent()

      if (props.background.type !== 'none') {
        if (props.segmentationConfig.model === 'bodyPix') {
          const segmentation = await props.bodyPix.segmentPerson(
            segmentationMaskCanvas
          )
          for (let i = 0; i < segmentationPixelCount; i++) {
            // Sets only the alpha component of each pixel
            segmentationMask.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
          }
          segmentationMaskCtx.putImageData(segmentationMask, 0, 0)
        } else {
          // TODO Use a shader to directly output the resizing result in memory
          const imageData = segmentationMaskCtx.getImageData(
            0,
            0,
            segmentationWidth,
            segmentationHeight
          )

          for (let i = 0; i < segmentationPixelCount; i++) {
            props.tflite.HEAPF32[inputMemoryOffset + i * 3] =
              imageData.data[i * 4] / 255
            props.tflite.HEAPF32[inputMemoryOffset + i * 3 + 1] =
              imageData.data[i * 4 + 1] / 255
            props.tflite.HEAPF32[inputMemoryOffset + i * 3 + 2] =
              imageData.data[i * 4 + 2] / 255
          }

          props.tflite._runInference()

          // TODO Use shaders to completely avoid this kind of CPU manipulations
          for (let i = 0; i < segmentationPixelCount; i++) {
            // TODO Implement softmax on GPU instead
            // Sets only the alpha component of each pixel
            segmentationMask.data[i * 4 + 3] =
              props.tflite.HEAPF32[outputMemoryOffset + i * 2] <
              props.tflite.HEAP32[outputMemoryOffset + i * 2 + 1]
                ? 255
                : 0
          }
          segmentationMaskCtx.putImageData(segmentationMask, 0, 0)
        }
      }

      addFrameEvent()

      ctx.globalCompositeOperation = 'copy'
      ctx.filter = 'none'

      if (props.postProcessingConfig.smoothSegmentationMask) {
        if (props.background.type === 'blur') {
          ctx.filter = 'blur(8px)' // FIXME Does not work on Safari
        } else if (props.background.type === 'image') {
          ctx.filter = 'blur(2px)' // FIXME Does not work on Safari
        }
      }

      if (props.background.type !== 'none') {
        ctx.drawImage(
          segmentationMaskCanvas,
          0,
          0,
          segmentationWidth,
          segmentationHeight,
          0,
          0,
          props.sourcePlayback.width,
          props.sourcePlayback.height
        )
        ctx.globalCompositeOperation = 'source-in'
        ctx.filter = 'none'
      }

      ctx.drawImage(props.sourcePlayback.htmlElement, 0, 0)

      if (props.background.type === 'blur') {
        ctx.globalCompositeOperation = 'destination-over'
        ctx.filter = 'blur(8px)' // FIXME Does not work on Safari
        ctx.drawImage(props.sourcePlayback.htmlElement, 0, 0)
      }

      endFrame()
      renderRequestId = requestAnimationFrame(render)
    }

    render()
    console.log(
      'Animation started:',
      props.sourcePlayback,
      props.background,
      props.segmentationConfig,
      props.postProcessingConfig
    )

    return () => {
      shouldRender = false
      cancelAnimationFrame(renderRequestId)
      console.log(
        'Animation stopped:',
        props.sourcePlayback,
        props.background,
        props.segmentationConfig,
        props.postProcessingConfig
      )
    }
  }, [
    props.sourcePlayback,
    props.background,
    props.bodyPix,
    props.tflite,
    props.segmentationConfig,
    props.postProcessingConfig,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  const statDetails = [
    `resizing ${resizingDuration}ms`,
    `inference ${inferenceDuration}ms`,
    `post-processing ${postProcessingDuration}ms`,
  ]
  const stats = `${Math.round(fps)} fps (${statDetails.join(', ')})`

  return (
    <div className={classes.root}>
      {props.background.type === 'image' && (
        <img className={classes.render} src={props.background.url} alt="" />
      )}
      <canvas
        ref={canvasRef}
        className={classes.render}
        width={props.sourcePlayback.width}
        height={props.sourcePlayback.height}
      />
      <Typography className={classes.stats} variant="caption">
        {stats}
      </Typography>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
      position: 'relative',
    },
    render: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    stats: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.48)',
      color: theme.palette.common.white,
    },
  })
)

export default OutputViewer

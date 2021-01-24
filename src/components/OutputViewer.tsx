import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { BodyPix } from '@tensorflow-models/body-pix'
import React, { useEffect, useRef } from 'react'
import { Background } from '../helpers/backgroundHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from '../hooks/useStats'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
  background: Background
  bodyPix: BodyPix
}

function OutputViewer(props: OutputViewerProps) {
  const classes = useStyles()
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const {
    fps,
    durations: [inferenceDuration, postProcessingDuration],
    beginFrame,
    addFrameEvent,
    endFrame,
  } = useStats()

  const statDetails = [
    `inference ${inferenceDuration}ms`,
    `post-processing ${postProcessingDuration}ms`,
  ]
  const stats = `${Math.round(fps)} fps (${statDetails.join(', ')})`

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')!

    // BodyPix needs width and height properties to be set
    props.sourcePlayback.htmlElement.width = props.sourcePlayback.width
    props.sourcePlayback.htmlElement.height = props.sourcePlayback.height

    const videoPixelCount =
      props.sourcePlayback.width * props.sourcePlayback.height

    const mask = new ImageData(
      props.sourcePlayback.width,
      props.sourcePlayback.height
    )
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = props.sourcePlayback.width
    maskCanvas.height = props.sourcePlayback.height
    const maskCtx = maskCanvas.getContext('2d')!

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
        const segmentation = await props.bodyPix.segmentPerson(
          props.sourcePlayback.htmlElement
        )
        for (let i = 0; i < videoPixelCount; i++) {
          // Sets only the alpha component of each pixel
          mask.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
        }
        maskCtx.putImageData(mask, 0, 0)
      }

      addFrameEvent()

      ctx.globalCompositeOperation = 'copy'

      if (props.background.type !== 'none') {
        // TODO Set as post-processing option
        ctx.filter = 'blur(2px)' // FIXME Does not work on Safari

        ctx.drawImage(maskCanvas, 0, 0)
        ctx.globalCompositeOperation = 'source-in'
      }

      // TODO Fix image source
      ctx.filter = 'none'
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
    console.log('Animation started:', props.sourcePlayback, props.background)

    return () => {
      shouldRender = false
      cancelAnimationFrame(renderRequestId)
      console.log('Animation stopped:', props.sourcePlayback, props.background)
    }
  }, [
    props.sourcePlayback,
    props.background,
    props.bodyPix,
    beginFrame,
    addFrameEvent,
    endFrame,
  ])

  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

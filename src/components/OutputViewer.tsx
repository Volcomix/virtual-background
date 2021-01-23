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
    const videoPixelCount =
      props.sourcePlayback.width * props.sourcePlayback.height

    const mask = new ImageData(
      props.sourcePlayback.width,
      props.sourcePlayback.height
    )
    const maskCanvas = document.createElement('canvas')
    const maskCtx = maskCanvas.getContext('2d')!

    let renderRequestId: number

    async function render() {
      beginFrame()
      if (props.background.type !== 'none') {
        const segmentation = await props.bodyPix.segmentPerson(
          props.sourcePlayback.htmlElement
        )
        for (let i = 0; i < videoPixelCount; i++) {
          // Set only the alpha component of each pixel
          mask.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
        }
        maskCtx.putImageData(mask, 0, 0)
      }
      addFrameEvent()
      ctx.drawImage(props.sourcePlayback.htmlElement, 0, 0)
      endFrame()

      renderRequestId = requestAnimationFrame(render)
    }

    render()
    console.log('Animation started:', props.sourcePlayback, props.background)

    return () => {
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
      <Typography className={classes.stats} variant="caption">
        {stats}
      </Typography>
      <canvas
        ref={canvasRef}
        className={classes.canvas}
        width={props.sourcePlayback.width}
        height={props.sourcePlayback.height}
      />
    </React.Fragment>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    canvas: {
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

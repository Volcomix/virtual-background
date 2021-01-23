import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React, { useEffect, useRef } from 'react'
import { SourcePlayback } from '../helpers/sourceHelper'
import useStats from '../hooks/useStats'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
}

function OutputViewer(props: OutputViewerProps) {
  const classes = useStyles()
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { fps, beginFrame, endFrame } = useStats()

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')!
    let renderRequestId: number

    function render() {
      renderRequestId = requestAnimationFrame(render)

      beginFrame()
      ctx.drawImage(props.sourcePlayback.htmlElement, 0, 0)
      endFrame()
    }

    render()

    return () => {
      cancelAnimationFrame(renderRequestId)
    }
  }, [props.sourcePlayback, beginFrame, endFrame])

  return (
    <React.Fragment>
      <Typography className={classes.stats} variant="caption">
        {Math.round(fps)} fps
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

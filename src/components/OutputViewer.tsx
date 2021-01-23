import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useEffect, useRef } from 'react'
import { SourcePlayback } from '../helpers/sourceHelper'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
}

function OutputViewer(props: OutputViewerProps) {
  const classes = useStyles()
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')!
    let renderRequestId: number

    function render() {
      renderRequestId = requestAnimationFrame(render)

      ctx.drawImage(props.sourcePlayback.htmlElement, 0, 0)
    }

    render()

    return () => {
      cancelAnimationFrame(renderRequestId)
    }
  }, [props.sourcePlayback])

  return (
    <canvas
      ref={canvasRef}
      className={classes.canvas}
      width={props.sourcePlayback.width}
      height={props.sourcePlayback.height}
    />
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    canvas: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  })
)

export default OutputViewer

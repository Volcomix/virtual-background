import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useEffect, useRef } from 'react'
import { Source, SourcePlayback } from '../helpers/sourceHelper'

type SourceViewerProps = {
  source: Source
  onLoad: (sourcePlayback: SourcePlayback) => void
}

function SourceViewer(props: SourceViewerProps) {
  const classes = useStyles()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function getCameraStream() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }

    if (props.source.type === 'camera') {
      getCameraStream()
    } else if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [props.source])

  if (props.source.type === 'image') {
    return (
      <img
        className={classes.root}
        src={props.source.url}
        alt=""
        onLoad={(event) => {
          props.onLoad({ htmlElement: event.target as HTMLImageElement })
        }}
      />
    )
  } else {
    return (
      <video
        ref={videoRef}
        className={classes.root}
        src={props.source.url}
        autoPlay
        playsInline
        controls={false}
        muted
        loop
        onLoadedData={(event) => {
          props.onLoad({ htmlElement: event.target as HTMLVideoElement })
        }}
      />
    )
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: theme.spacing(52),
      objectFit: 'cover',
    },
  })
)

export default SourceViewer

import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import React, { useEffect, useRef, useState } from 'react'
import { Source, SourcePlayback } from '../helpers/sourceHelper'

type SourceViewerProps = {
  source: Source
  onLoad: (sourcePlayback: SourcePlayback) => void
}

function SourceViewer(props: SourceViewerProps) {
  const classes = useStyles()
  const [sourceUrl, setSourceUrl] = useState<string>()
  const [isLoading, setLoading] = useState(false)
  const [isCameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setSourceUrl(undefined)
    setLoading(true)
    setCameraError(false)

    // Enforces reloading the resource, otherwise
    // onLoad event is not always dispatched and the
    // progress indicator never disappears
    setTimeout(() => setSourceUrl(props.source.url))
  }, [props.source])

  useEffect(() => {
    async function getCameraStream() {
      try {
        const constraint = { video: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraint)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          return
        }
      } catch (error) {
        console.error('Error opening video camera.', error)
      }
      setLoading(false)
      setCameraError(true)
    }

    if (props.source.type === 'camera') {
      getCameraStream()
    } else if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [props.source])

  return (
    <React.Fragment>
      {isLoading && <CircularProgress />}
      {props.source.type === 'image' ? (
        <img
          className={classes.sourcePlayback}
          src={sourceUrl}
          hidden={isLoading}
          alt=""
          onLoad={(event) => {
            props.onLoad({ htmlElement: event.target as HTMLImageElement })
            setLoading(false)
          }}
        />
      ) : isCameraError ? (
        <VideocamOffIcon fontSize="large" />
      ) : (
        <video
          ref={videoRef}
          className={classes.sourcePlayback}
          src={sourceUrl}
          hidden={isLoading}
          autoPlay
          playsInline
          controls={false}
          muted
          loop
          onLoadedData={(event) => {
            props.onLoad({ htmlElement: event.target as HTMLVideoElement })
            setLoading(false)
          }}
        />
      )}
    </React.Fragment>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sourcePlayback: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  })
)

export default SourceViewer

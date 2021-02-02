import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { SourceConfig, SourcePlayback } from '../helpers/sourceHelper'

type SourceViewerProps = {
  sourceConfig: SourceConfig
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
    setTimeout(() => setSourceUrl(props.sourceConfig.url))
  }, [props.sourceConfig])

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

    if (props.sourceConfig.type === 'camera') {
      getCameraStream()
    } else if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [props.sourceConfig])

  function handleImageLoad(event: SyntheticEvent) {
    const image = event.target as HTMLImageElement
    props.onLoad({
      htmlElement: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
    setLoading(false)
  }

  function handleVideoLoad(event: SyntheticEvent) {
    const video = event.target as HTMLVideoElement
    props.onLoad({
      htmlElement: video,
      width: video.videoWidth,
      height: video.videoHeight,
    })
    setLoading(false)
  }

  return (
    <div className={classes.root}>
      {isLoading && <CircularProgress />}
      {props.sourceConfig.type === 'image' ? (
        <img
          className={classes.sourcePlayback}
          src={sourceUrl}
          hidden={isLoading}
          alt=""
          onLoad={handleImageLoad}
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
          onLoadedData={handleVideoLoad}
        />
      )}
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      [theme.breakpoints.down('xs')]: {
        width: 0,
        overflow: 'hidden',
      },

      [theme.breakpoints.up('sm')]: {
        flex: 1,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: theme.palette.divider,
      },
    },
    sourcePlayback: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  })
)

export default SourceViewer

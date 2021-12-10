import { Button } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { BodyPix } from '@tensorflow-models/body-pix'
import React, { useEffect } from 'react'
import { BackgroundConfig } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import useRenderingPipeline from '../hooks/useRenderingPipeline'
import { TFLite } from '../hooks/useTFLite'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
  backgroundConfig: BackgroundConfig
  segmentationConfig: SegmentationConfig
  postProcessingConfig: PostProcessingConfig
  bodyPix: BodyPix
  tflite: TFLite
}

function OutputViewer(props: OutputViewerProps) {
  const classes = useStyles()

  const {
    pipeline,
    backgroundImageRef,
    canvasRef,
    fps,
    durations: [resizingDuration, inferenceDuration, postProcessingDuration],
  } = useRenderingPipeline(
    props.sourcePlayback,
    props.backgroundConfig,
    props.segmentationConfig,
    props.bodyPix,
    props.tflite
  )

  useEffect(() => {
    if (pipeline) {
      pipeline.updatePostProcessingConfig(props.postProcessingConfig)
    }
  }, [pipeline, props.postProcessingConfig])

  const statDetails = [
    `resizing ${resizingDuration}ms`,
    `inference ${inferenceDuration}ms`,
    `post-processing ${postProcessingDuration}ms`,
  ]
  const stats = `${Math.round(fps)} fps (${statDetails.join(', ')})`

  const [imgSrc, setImgSrc] = React.useState<any>(null)
  const webcamRef = React.useRef(null)
  // const canvasRef = useRef(null)

  const capture = React.useCallback(() => {
    // const imageSrc = canvasRef.current.getScreenshot()
    // setImgSrc(null)

    let can = document.getElementById("canvas");
    let imgSrc = canvasRef.current.toDataURL();
    setImgSrc(imgSrc);

  }, [canvasRef, setImgSrc])

  const handleClick = (e: any) => {
    const img_ids = ['img1', 'img2', 'img3']
    const id = e.target.id

    const images = document.getElementsByClassName('camel')[0].childNodes
    // for (let i = 0, j = 0; i < images.length; i++) {
    //   let currentImgId = images[i].id

    //   if (id === currentImgId) {
    //     images[i].className = 'order2'
    //     images[i].setAttribute('style', 'width: 20%; height: 65%;')
    //   } else {
    //     images[i].className = `order${++j}`
    //     images[i].setAttribute('style', 'width: 15%; height: 50%;')
    //     j++
    //   }
    // }
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div className={`${classes.root} container`}>
        {props.backgroundConfig.type === 'image' && (
          <img
            ref={backgroundImageRef}
            className={classes.render}
            src={props.backgroundConfig.url}
            alt=""
            hidden={props.segmentationConfig.pipeline === 'webgl2'}
          />
        )}
        <canvas
          // The key attribute is required to create a new canvas when switching
          // context mode
          id="canvas"
          key={props.segmentationConfig.pipeline}
          ref={canvasRef}
          className={classes.render}
          width={props.sourcePlayback.width}
          height={props.sourcePlayback.height}
        />
        {/* <Typography className={classes.stats} variant="caption">
          {stats}
        </Typography> */}

        <Button
          variant="contained"
          className="skip-btn"
        >
          Next
      </Button>
      </div>


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

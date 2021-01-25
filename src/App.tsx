import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import BackgroundSelectionCard from './components/BackgroundSelectionCard'
import PostProcessingConfigCard from './components/PostProcessingConfigCard'
import SegmentationConfigCard from './components/SegmentationConfigCard'
import SourceSelectionCard from './components/SourceSelectionCard'
import ViewerCard from './components/ViewerCard'
import { Background, backgroundImageUrls } from './helpers/backgroundHelper'
import { PostProcessingConfig } from './helpers/postProcessingHelper'
import { SegmentationConfig } from './helpers/segmentationHelper'
import { Source, sourceImageUrls } from './helpers/sourceHelper'
import useBodyPix from './hooks/useBodyPix'
import useMeetModel from './hooks/useMeetModel'
import useTFLite from './hooks/useTFLite'

function App() {
  const bodyPix = useBodyPix()
  const tflite = useTFLite()

  const classes = useStyles()
  const [source, setSource] = useState<Source>({
    type: 'image',
    url: sourceImageUrls[0],
  })
  const [background, setBackground] = useState<Background>({
    type: 'image',
    url: backgroundImageUrls[0],
  })
  const [
    segmentationConfig,
    setSegmentationConfig,
  ] = useState<SegmentationConfig>({
    model: 'meet',
    inputResolution: '96p',
    pipeline: 'canvas2dCpu',
  })
  const [
    postProcessingConfig,
    setPostProcessingConfig,
  ] = useState<PostProcessingConfig>({ smoothSegmentationMask: true })

  // FIXME Animation stops, starts and stops again when changing segmentation config
  const isMeetModelLoaded = useMeetModel(tflite, segmentationConfig)

  return (
    <div className={classes.root}>
      <ViewerCard
        source={source}
        background={background}
        bodyPix={bodyPix}
        tflite={
          // TODO Find a better way to handle both bodyPix and tflite props
          isMeetModelLoaded || segmentationConfig.model === 'bodyPix'
            ? tflite
            : undefined
        }
        segmentationConfig={segmentationConfig}
        postProcessingConfig={postProcessingConfig}
      />
      <SourceSelectionCard source={source} onChange={setSource} />
      <BackgroundSelectionCard
        background={background}
        onChange={setBackground}
      />
      <SegmentationConfigCard
        config={segmentationConfig}
        onChange={setSegmentationConfig}
      />
      <PostProcessingConfigCard
        config={postProcessingConfig}
        onChange={setPostProcessingConfig}
      />
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',

      [theme.breakpoints.up('xs')]: {
        margin: theme.spacing(1),
        gap: theme.spacing(1),
        gridTemplateColumns: '1fr',
      },

      [theme.breakpoints.up('md')]: {
        margin: theme.spacing(2),
        gap: theme.spacing(2),
        gridTemplateColumns: 'repeat(2, 1fr)',
      },

      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
    },
    resourceSelectionCards: {
      display: 'flex',
      flexDirection: 'column',
    },
  })
)

export default App

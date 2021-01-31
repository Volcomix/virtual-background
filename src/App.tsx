import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import BackgroundSelectionCard from './core/components/BackgroundSelectionCard'
import PostProcessingConfigCard from './core/components/PostProcessingConfigCard'
import SegmentationConfigCard from './core/components/SegmentationConfigCard'
import SourceSelectionCard from './core/components/SourceSelectionCard'
import ViewerCard from './core/components/ViewerCard'
import {
  Background,
  backgroundImageUrls,
} from './core/helpers/backgroundHelper'
import { PostProcessingConfig } from './core/helpers/postProcessingHelper'
import { SegmentationConfig } from './core/helpers/segmentationHelper'
import { Source, sourceImageUrls } from './core/helpers/sourceHelper'
import useBodyPix from './core/hooks/useBodyPix'
import useMeetModel from './core/hooks/useMeetModel'
import useTFLite from './core/hooks/useTFLite'

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
  ] = useState<PostProcessingConfig>({
    smoothSegmentationMask: true,
    jointBilateralFilter: { sigmaSpace: 1, sigmaColor: 0.05 },
  })

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
        pipeline={segmentationConfig.pipeline}
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

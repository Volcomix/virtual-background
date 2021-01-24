import Grid from '@material-ui/core/Grid'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import BackgroundSelectionCard from './components/BackgroundSelectionCard'
import PostProcessingConfigCard from './components/PostProcessingConfigCard'
import SegmentationConfigCard from './components/SegmentationConfigCard'
import SourceSelectionCard from './components/SourceSelectionCard'
import VideoPlayer from './components/VideoPlayer'
import ViewerCard from './components/ViewerCard'
import { Background } from './helpers/backgroundHelper'
import { PostProcessingConfig } from './helpers/postProcessingHelper'
import { SegmentationConfig } from './helpers/segmentationHelper'
import { Source, sourceImageUrls } from './helpers/sourceHelper'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPix = useBodyPix()

  useTFLite()

  const classes = useStyles()
  const [source, setSource] = useState<Source>({
    type: 'image',
    url: sourceImageUrls[0],
  })
  const [background, setBackground] = useState<Background>({ type: 'none' })
  const [
    segmentationConfig,
    setSegmentationConfig,
  ] = useState<SegmentationConfig>({ model: 'bodyPix' })
  const [
    postProcessingConfig,
    setPostProcessingConfig,
  ] = useState<PostProcessingConfig>({ smoothSegmentationMask: true })

  return process.env.NODE_ENV === 'development' ? (
    // The root level is required to fix negative margin limitations
    // https://material-ui.com/components/grid/#negative-margin
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <ViewerCard
            source={source}
            background={background}
            bodyPix={bodyPix}
            postProcessingConfig={postProcessingConfig}
          />
        </Grid>
        <Grid item xs={4}>
          <SourceSelectionCard source={source} onChange={setSource} />
        </Grid>
        <Grid item xs={4}>
          <SegmentationConfigCard
            config={segmentationConfig}
            onChange={setSegmentationConfig}
          />
        </Grid>
        <Grid item xs={4}>
          <PostProcessingConfigCard
            config={postProcessingConfig}
            onChange={setPostProcessingConfig}
          />
        </Grid>
        <Grid item xs={4}>
          <BackgroundSelectionCard
            background={background}
            onChange={setBackground}
          />
        </Grid>
      </Grid>
    </div>
  ) : bodyPix ? (
    <VideoPlayer bodyPixNeuralNetwork={bodyPix} />
  ) : null
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  })
)

export default App

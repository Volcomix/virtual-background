import Grid from '@material-ui/core/Grid'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import BackgroundSelectionCard from './components/BackgroundSelectionCard'
import SourceSelectionCard from './components/SourceSelectionCard'
import VideoPlayer from './components/VideoPlayer'
import ViewerCard from './components/ViewerCard'
import { Background, backgroundImageUrls } from './helpers/backgroundHelper'
import { Source, sourceImageUrls } from './helpers/sourceHelper'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  useTFLite()

  const classes = useStyles()
  const [source, setSource] = useState<Source>({
    type: 'image',
    url: sourceImageUrls[0],
  })
  const [background, setBackground] = useState<Background>({
    type: 'image',
    url: backgroundImageUrls[0],
  })

  return process.env.NODE_ENV === 'development' ? (
    <Grid className={classes.root} container spacing={2}>
      <Grid item xs={8}>
        <ViewerCard source={source} />
      </Grid>
      <Grid item xs={4}>
        <SourceSelectionCard source={source} onSourceChange={setSource} />
      </Grid>
      <Grid item xs={4}>
        <BackgroundSelectionCard
          background={background}
          onBackgroundChange={setBackground}
        />
      </Grid>
    </Grid>
  ) : (
    bodyPixNeuralNetwork && (
      <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork} />
    )
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  })
)

export default App

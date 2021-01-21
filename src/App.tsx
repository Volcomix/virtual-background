import Grid from '@material-ui/core/Grid'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import SourceSelectionCard from './components/SourceSelectionCard'
import VideoPlayer from './components/VideoPlayer'
import ViewerCard from './components/ViewerCard'
import { imageUrls } from './helpers/sourceHelper'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  useTFLite()

  const classes = useStyles()
  const [sourceUrl, setSourceUrl] = useState<string>(imageUrls[0])

  return process.env.NODE_ENV === 'development' ? (
    <Grid className={classes.root} container spacing={2}>
      <Grid item xs={8}>
        <ViewerCard sourceUrl={sourceUrl} />
      </Grid>
      <Grid item xs={4}>
        <SourceSelectionCard
          sourceUrl={sourceUrl}
          onSourceUrlChange={setSourceUrl}
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

import Grid from '@material-ui/core/Grid'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import PlayerCard from './components/PlayerCard'
import SourceSelectionCard from './components/SourceSelectionCard'
import VideoPlayer from './components/VideoPlayer'
import { imageUrls } from './helpers/sourceHelper'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

const isNewUI = false

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  })
)

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  useTFLite()

  const classes = useStyles()
  const [sourceUrl, setSourceUrl] = useState<string>(imageUrls[0])

  return isNewUI ? (
    <Grid className={classes.root} container spacing={2}>
      <Grid item xs={8}>
        <PlayerCard sourceUrl={sourceUrl} />
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

export default App

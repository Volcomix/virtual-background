import Grid from '@material-ui/core/Grid'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import SourceCard from './components/SourceCard'
import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

const isNewUI = false

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
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

  return isNewUI ? (
    <Grid className={classes.root} container>
      <Grid item xs={4}>
        <SourceCard />
      </Grid>
    </Grid>
  ) : (
    bodyPixNeuralNetwork && (
      <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork} />
    )
  )
}

export default App

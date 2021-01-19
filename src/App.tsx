import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'
import useTFLite from './hooks/useTFLite'

const isNewUI = false

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  useTFLite()

  return isNewUI
    ? null
    : bodyPixNeuralNetwork && (
        <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork} />
      )
}

export default App

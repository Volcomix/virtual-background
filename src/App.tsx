import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'

function App() {
  // Load BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  return (
    bodyPixNeuralNetwork && (
      <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork}></VideoPlayer>
    )
  )
}

export default App

import { useEffect } from 'react'
import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'

declare function createTFLiteModule(): Promise<{
  _add(a: number, b: number): number
}>

function App() {
  // Load BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  // Demo effect to test WASM function integration
  useEffect(() => {
    async function initTFLite() {
      const Module = await createTFLiteModule()
      console.log('Demo WASM function result:', Module._add(1, 2))
    }

    initTFLite()
  }, [])

  return (
    bodyPixNeuralNetwork && (
      <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork}></VideoPlayer>
    )
  )
}

export default App

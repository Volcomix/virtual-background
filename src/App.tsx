import { useEffect } from 'react'
import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'

declare function createTFLiteModule(): Promise<TFLiteModule>

interface TFLiteModule extends EmscriptenModule {
  _getModelBufferMemoryOffset(): number
  _getInputMemoryOffset(): number
  _getInputHeight(): number
  _getInputWidth(): number
  _getInputChannelCount(): number
  _getOutputMemoryOffset(): number
  _getOutputHeight(): number
  _getOutputWidth(): number
  _getOutputChannelCount(): number
  _loadModel(bufferSize: number): number
  _runInference(): number
}

function App() {
  // TODO Inititialize the camera and segmentation models in parallel

  // Loads BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  // TODO Extract to a custom hook
  // Loads Meet segmentation model and TFLite
  useEffect(() => {
    async function loadTFLite() {
      // TODO Fetch every resources in parallel
      // TODO Load full or light model depending on the environment
      // TODO Detect WASM features to handle SIMD and multithreading
      const tfliteModule = await createTFLiteModule()
      const lightModelResponse = await fetch(
        `${process.env.PUBLIC_URL}/models/segm_lite_v681.tflite`
      )
      const lightModel = await lightModelResponse.arrayBuffer()
      console.log('Lite model buffer size:', lightModel.byteLength)

      const fullModelResponse = await fetch(
        `${process.env.PUBLIC_URL}/models/segm_full_v679.tflite`
      )
      const fullModel = await fullModelResponse.arrayBuffer()
      console.log('Full model buffer size:', fullModel.byteLength)

      const modelBufferOffset = tfliteModule._getModelBufferMemoryOffset()
      console.log('Model buffer memory offset:', modelBufferOffset)
      console.log('Loading light model buffer...')
      tfliteModule.HEAPU8.set(new Uint8Array(lightModel), modelBufferOffset)
      console.log(
        '_loadModel result:',
        tfliteModule._loadModel(lightModel.byteLength)
      )

      console.log('Input memory offset:', tfliteModule._getInputMemoryOffset())
      console.log('Input height:', tfliteModule._getInputHeight())
      console.log('Input width:', tfliteModule._getInputWidth())
      console.log('Input channels:', tfliteModule._getInputChannelCount())

      console.log(
        'Output memory offset:',
        tfliteModule._getOutputMemoryOffset()
      )
      console.log('Output height:', tfliteModule._getOutputHeight())
      console.log('Output width:', tfliteModule._getOutputWidth())
      console.log('Output channels:', tfliteModule._getOutputChannelCount())

      // TODO Move inference to the real-time render loop
      const start = Date.now()
      const inferenceResult = tfliteModule._runInference()
      const inferenceDuration = Date.now() - start
      console.log(
        `_runInference result: ${inferenceResult} (${inferenceDuration}ms)`
      )
    }

    loadTFLite()
  }, [])

  return (
    bodyPixNeuralNetwork && (
      <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork}></VideoPlayer>
    )
  )
}

export default App

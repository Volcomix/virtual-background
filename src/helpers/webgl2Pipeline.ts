import { TFLite } from '../hooks/useTFLite'
import { Background } from './backgroundHelper'
import { PostProcessingConfig } from './postProcessingHelper'
import { SegmentationConfig } from './segmentationHelper'
import { SourcePlayback } from './sourceHelper'

export function buildWebGL2Pipeline(
  sourcePlayback: SourcePlayback,
  background: Background,
  canvas: HTMLCanvasElement,
  tflite: TFLite,
  segmentationConfig: SegmentationConfig,
  postProcessingConfig: PostProcessingConfig,
  addFrameEvent: () => void
) {
  // const gl = canvas.getContext('webgl2')

  async function runPipeline() {
    // Source resizing
    addFrameEvent()
    // Inference
    addFrameEvent()
    // Post-processing
  }

  return runPipeline
}

// const vertexShaderSource = `#version 300 es

// in vec4 a_position;

// void main() {
//   gl_Position = a_position;
// }
// `

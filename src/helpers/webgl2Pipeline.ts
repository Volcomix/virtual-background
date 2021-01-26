import { TFLite } from '../hooks/useTFLite'
import { Background } from './backgroundHelper'
import { PostProcessingConfig } from './postProcessingHelper'
import { SegmentationConfig } from './segmentationHelper'
import { SourcePlayback } from './sourceHelper'
import { glsl } from './webglHelper'

export function buildWebGL2Pipeline(
  sourcePlayback: SourcePlayback,
  background: Background,
  canvas: HTMLCanvasElement,
  tflite: TFLite,
  segmentationConfig: SegmentationConfig,
  postProcessingConfig: PostProcessingConfig,
  addFrameEvent: () => void
) {
  const gl = canvas.getContext('webgl2')!

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )
  const program = createProgram(gl, vertexShader, fragmentShader)

  async function run() {
    // Source resizing
    addFrameEvent()
    // Inference
    addFrameEvent()
    // Post-processing
  }

  function cleanUp() {
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)
  }

  return { run, cleanUp }
}

const vertexShaderSource = glsl`#version 300 es

  in vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
`

const fragmentShaderSource = glsl`#version 300 es
 
  precision highp float;
  
  out vec4 outColor;
  
  void main() {
    outColor = vec4(1, 0, 0.5, 1);
  }
`

function compileShader(
  gl: WebGL2RenderingContext,
  shaderType: number,
  shaderSource: string
) {
  const shader = gl.createShader(shaderType)!
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      `Could not link WebGL program: ${gl.getProgramInfoLog(program)}`
    )
  }
  return program
}

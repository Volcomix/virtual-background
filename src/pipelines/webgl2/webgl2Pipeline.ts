import { Background } from '../../core/helpers/backgroundHelper'
import { PostProcessingConfig } from '../../core/helpers/postProcessingHelper'
import {
  inputResolutions,
  SegmentationConfig,
} from '../../core/helpers/segmentationHelper'
import { SourcePlayback } from '../../core/helpers/sourceHelper'
import { TFLite } from '../../core/hooks/useTFLite'
import { compileShader, createTexture, glsl } from '../helpers/webglHelper'
import { buildJointBilateralFilterStage } from './jointBilateralFilterStage'
import { buildResizingStage } from './resizingStage'
import { buildSoftmaxStage } from './softmaxStage'

export function buildWebGL2Pipeline(
  sourcePlayback: SourcePlayback,
  background: Background,
  canvas: HTMLCanvasElement,
  tflite: TFLite,
  segmentationConfig: SegmentationConfig,
  postProcessingConfig: PostProcessingConfig,
  addFrameEvent: () => void
) {
  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]

  const gl = canvas.getContext('webgl2')!

  // TODO Check if the extension is available otherwise convert to floats on CPU
  gl.getExtension('EXT_color_buffer_float')

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)

  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)

  const positionBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )

  const texCoordBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )

  const segmentationTexture = createTexture(
    gl,
    gl.RGBA8,
    segmentationWidth,
    segmentationHeight
  )!

  const resizingStage = buildResizingStage(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    sourcePlayback,
    segmentationConfig,
    tflite
  )
  const softmaxStage = buildSoftmaxStage(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    segmentationConfig,
    tflite,
    segmentationTexture
  )
  const jointBilateralFilterStage = buildJointBilateralFilterStage(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    segmentationTexture,
    canvas
  )

  async function render() {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindVertexArray(vertexArray)

    resizingStage.render()

    addFrameEvent()

    tflite._runInference()

    addFrameEvent()

    softmaxStage.render()
    jointBilateralFilterStage.render()
  }

  function cleanUp() {
    jointBilateralFilterStage.cleanUp()
    softmaxStage.cleanUp()
    resizingStage.cleanUp()

    gl.deleteTexture(segmentationTexture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteShader(vertexShader)
  }

  return { render, cleanUp }
}

export const vertexShaderSource = glsl`#version 300 es

in vec4 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}
`

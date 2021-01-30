import {
  inputResolutions,
  SegmentationConfig,
} from '../../core/helpers/segmentationHelper'
import { TFLite } from '../../core/hooks/useTFLite'
import {
  compileShader,
  createPiplelineStageProgram,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

export function buildSoftmaxStage(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  segmentationConfig: SegmentationConfig,
  tflite: TFLite,
  canvas: HTMLCanvasElement
) {
  // TFLite memory will be accessed as float32
  const tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4

  const [inputWidth, inputHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const { width: outputWidth, height: outputHeight } = canvas

  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )
  const program = createPiplelineStageProgram(
    gl,
    vertexShader,
    fragmentShader,
    positionBuffer,
    texCoordBuffer
  )
  const inputLocation = gl.getUniformLocation(program, 'u_inputSegmentation')
  const inputTexture = createTexture(gl, gl.RG32F, inputWidth, inputHeight)

  function render() {
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      inputWidth,
      inputHeight,
      gl.RG,
      gl.FLOAT,
      tflite.HEAPF32,
      tfliteOutputMemoryOffset
    )
    gl.uniform1i(inputLocation, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteTexture(inputTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

const fragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_inputSegmentation;

  in vec2 v_texCoord;

  out vec4 outColor;

  void main() {
    vec2 segmentation = texture(u_inputSegmentation, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).rg;
    float shift = max(segmentation.r, segmentation.g);
    float backgroundExp = exp(segmentation.r - shift);
    float personExp = exp(segmentation.g - shift);
    outColor = vec4(vec3(personExp / (backgroundExp + personExp)), 1.0);
  }
`

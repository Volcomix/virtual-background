import { Background } from '../../core/helpers/backgroundHelper'
import { PostProcessingConfig } from '../../core/helpers/postProcessingHelper'
import {
  inputResolutions,
  SegmentationConfig,
} from '../../core/helpers/segmentationHelper'
import { SourcePlayback } from '../../core/helpers/sourceHelper'
import { TFLite } from '../../core/hooks/useTFLite'
import {
  compileShader,
  createProgram,
  glsl,
  vertexShaderSource,
} from '../helpers/webglHelper'
import { buildResizingStage } from './resizingStage'

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
  const outputMemoryOffset = tflite._getOutputMemoryOffset() / 4

  const gl = canvas.getContext('webgl2')!

  // TODO Check if the extension is available otherwise convert to floats on CPU
  gl.getExtension('EXT_color_buffer_float')

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)

  const postProcessingFragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    postProcessingFragmentShaderSource
  )

  const postProcessingProgram = createProgram(
    gl,
    vertexShader,
    postProcessingFragmentShader
  )

  const positionAttributeLocation = gl.getAttribLocation(
    postProcessingProgram,
    'a_position'
  )
  const texCoordAttributeLocation = gl.getAttribLocation(
    postProcessingProgram,
    'a_texCoord'
  )

  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)

  const positionBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const texCoordBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(texCoordAttributeLocation)
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const segmentationMaskTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, segmentationMaskTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texStorage2D(
    gl.TEXTURE_2D,
    1,
    gl.RG32F,
    segmentationWidth,
    segmentationHeight
  )

  const resizingStage = buildResizingStage(
    gl,
    positionBuffer,
    texCoordBuffer,
    tflite,
    sourcePlayback,
    segmentationConfig
  )

  async function render() {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindVertexArray(vertexArray)

    // Source resizing
    resizingStage.render()

    addFrameEvent()

    // Inference
    tflite._runInference()

    addFrameEvent()

    // Post-processing
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.useProgram(postProcessingProgram)

    gl.bindTexture(gl.TEXTURE_2D, segmentationMaskTexture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      segmentationWidth,
      segmentationHeight,
      gl.RG,
      gl.FLOAT,
      tflite.HEAPF32,
      outputMemoryOffset
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteTexture(segmentationMaskTexture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteProgram(postProcessingProgram)
    gl.deleteShader(postProcessingFragmentShader)
    gl.deleteShader(vertexShader)

    resizingStage.cleanUp()
  }

  return { render, cleanUp }
}

const postProcessingFragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_image;

  in vec2 v_texCoord;

  out vec4 outColor;

  float segmentPerson() {
    vec2 segmentation = texture(u_image, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).rg;
    float shift = max(segmentation.r, segmentation.g);
    float backgroundExp = exp(segmentation.r - shift);
    float personExp = exp(segmentation.g - shift);
    return personExp / (backgroundExp + personExp); // softmax
  }

  void main() {
    float person = segmentPerson();
    outColor = vec4(vec3(person), 1.0);
  }
`

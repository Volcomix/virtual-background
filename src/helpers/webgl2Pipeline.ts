import { TFLite } from '../hooks/useTFLite'
import { Background } from './backgroundHelper'
import { PostProcessingConfig } from './postProcessingHelper'
import { inputResolutions, SegmentationConfig } from './segmentationHelper'
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
  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const segmentationPixelCount = segmentationWidth * segmentationHeight

  const inputMemoryOffset = tflite._getInputMemoryOffset() / 4
  const outputMemoryOffset = tflite._getOutputMemoryOffset() / 4

  const gl = canvas.getContext('webgl2')!

  // TODO Check if the extension is available otherwise convert to floats on CPU
  gl.getExtension('EXT_color_buffer_float')

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)

  const resizingFragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    resizingFragmentShaderSource
  )
  const postProcessingFragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    postProcessingFragmentShaderSource
  )

  const resizingProgram = createProgram(
    gl,
    vertexShader,
    resizingFragmentShader
  )
  const postProcessingProgram = createProgram(
    gl,
    vertexShader,
    postProcessingFragmentShader
  )

  const positionAttributeLocation = gl.getAttribLocation(
    resizingProgram,
    'a_position'
  )
  const texCoordAttributeLocation = gl.getAttribLocation(
    resizingProgram,
    'a_texCoord'
  )

  const imageLocation = gl.getUniformLocation(resizingProgram, 'u_image')

  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(texCoordAttributeLocation)
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  const resizedTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, resizedTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F,
    segmentationWidth,
    segmentationHeight,
    0,
    gl.RGBA,
    gl.FLOAT,
    null
  )

  const frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    resizedTexture,
    0
  )

  const resizedPixels = new Float32Array(
    segmentationWidth * segmentationHeight * 4
  )

  async function run() {
    // Source resizing
    gl.viewport(0, 0, segmentationWidth, segmentationHeight)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(resizingProgram)

    gl.bindVertexArray(vertexArray)

    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      sourcePlayback.htmlElement
    )
    gl.uniform1i(imageLocation, 0)

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    gl.readPixels(
      0,
      0,
      segmentationWidth,
      segmentationHeight,
      gl.RGBA,
      gl.FLOAT,
      resizedPixels
    )

    for (let i = 0; i < segmentationPixelCount; i++) {
      tflite.HEAPF32[inputMemoryOffset + i * 3] = resizedPixels[i * 4]
      tflite.HEAPF32[inputMemoryOffset + i * 3 + 1] = resizedPixels[i * 4 + 1]
      tflite.HEAPF32[inputMemoryOffset + i * 3 + 2] = resizedPixels[i * 4 + 2]
    }

    addFrameEvent()

    // Inference
    tflite._runInference()

    addFrameEvent()

    // Post-processing
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.useProgram(postProcessingProgram)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG32F,
      segmentationWidth,
      segmentationHeight,
      0,
      gl.RG,
      gl.FLOAT,
      tflite.HEAPF32,
      outputMemoryOffset
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(resizedTexture)
    gl.deleteTexture(texture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteProgram(postProcessingProgram)
    gl.deleteProgram(resizingProgram)
    gl.deleteShader(postProcessingFragmentShader)
    gl.deleteShader(resizingFragmentShader)
    gl.deleteShader(vertexShader)
  }

  return { run, cleanUp }
}

const vertexShaderSource = glsl`#version 300 es

  in vec4 a_position;
  in vec2 a_texCoord;

  out vec2 v_texCoord;

  void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`

const resizingFragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_image;

  in vec2 v_texCoord;

  out vec4 outColor;

  void main() {
    outColor = texture(u_image, v_texCoord);
  }
`

const postProcessingFragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_image;

  in vec2 v_texCoord;

  out vec4 outColor;

  void main() {
    vec2 segmentation = texture(u_image, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).rg;
    float backgroundExp = exp(segmentation.r);
    float personExp = exp(segmentation.g);
    float person = personExp / (backgroundExp + personExp);
    outColor = vec4(vec3(person), 1.0);
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

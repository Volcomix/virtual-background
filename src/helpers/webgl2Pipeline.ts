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

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord')

  const imageLocation = gl.getUniformLocation(program, 'u_image')

  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]),
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
  gl.activeTexture(gl.TEXTURE0 + 0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  async function run() {
    // Source resizing

    addFrameEvent()

    // Inference

    addFrameEvent()

    // Post-processing
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      sourcePlayback.htmlElement
    )
    gl.uniform1i(imageLocation, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteTexture(texture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
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

const fragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_image;

  in vec2 v_texCoord;

  out vec4 outColor;

  void main() {
    outColor = texture(u_image, v_texCoord);
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

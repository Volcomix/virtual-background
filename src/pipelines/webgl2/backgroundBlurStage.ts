import {
  compileShader,
  createPiplelineStageProgram,
  glsl,
} from '../helpers/webglHelper'

export function buildBackgroundBlurStage(
  gl: WebGL2RenderingContext,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  personMaskTexture: WebGLTexture,
  canvas: HTMLCanvasElement
) {
  const vertexShaderSource = glsl`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;

    void main() {
      // Flipping Y is required when rendering to canvas
      gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `

  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_personMask;
    uniform vec2 u_coverage;

    in vec2 v_texCoord;

    out vec4 outColor;

    void main() {
      vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
      outColor = vec4(frameColor * personMask, 1.0);
    }
  `

  const { width: outputWidth, height: outputHeight } = canvas

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
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
  const inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame')
  const personMaskLocation = gl.getUniformLocation(program, 'u_personMask')
  const coverageLocation = gl.getUniformLocation(program, 'u_coverage')

  gl.useProgram(program)
  gl.uniform1i(inputFrameLocation, 0)
  gl.uniform1i(personMaskLocation, 1)
  gl.uniform2f(coverageLocation, 0, 1)

  function render() {
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, personMaskTexture)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function updateCoverage(coverage: [number, number]) {
    gl.useProgram(program)
    gl.uniform2f(coverageLocation, coverage[0], coverage[1])
  }

  function cleanUp() {
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)
  }

  return {
    render,
    updateCoverage,
    cleanUp,
  }
}

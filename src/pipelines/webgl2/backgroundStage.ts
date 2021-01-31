import {
  compileShader,
  createPiplelineStageProgram,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

export function buildBackgroundStage(
  gl: WebGL2RenderingContext,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  personMaskTexture: WebGLTexture,
  background: HTMLImageElement | null,
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
    uniform sampler2D u_background;

    in vec2 v_texCoord;

    out vec4 outColor;

    vec3 screen(vec3 a, vec3 b) {
      return 1.0 - (1.0 - a) * (1.0 - b);
    }

    vec3 linearDodge(vec3 a, vec3 b) {
      return a + b;
    }

    void main() {
      vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
      vec3 backgroundColor = texture(u_background, v_texCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      float edge = smoothstep(1.0, 0.8, personMask);
      personMask = smoothstep(0.5, 0.7, personMask);
      vec3 lightWrap = backgroundColor * edge * 0.4;
      vec3 person = screen(frameColor, lightWrap);
      // TODO Switch between screen and linearDodge based on use configuration
      // vec3 person = linearDodge(frameColor, lightWrap);
      outColor = vec4(person * personMask + backgroundColor * (1.0 - personMask), 1.0);
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
  const backgroundLocation = gl.getUniformLocation(program, 'u_background')

  let backgroundTexture: WebGLTexture | null = null
  // TODO Find a better to handle background being loaded
  // TODO Fix background image deformation and interpolation
  if (background?.complete) {
    backgroundTexture = createTexture(
      gl,
      gl.RGBA8,
      background.naturalWidth,
      background.naturalHeight
    )
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      background
    )
  } else if (background) {
    background.onload = () => {
      backgroundTexture = createTexture(
        gl,
        gl.RGBA8,
        background.naturalWidth,
        background.naturalHeight
      )
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        background
      )
    }
  }

  function render() {
    gl.useProgram(program)
    gl.uniform1i(inputFrameLocation, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, personMaskTexture)
    gl.uniform1i(personMaskLocation, 1)
    if (backgroundTexture !== null) {
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture)
      gl.uniform1i(backgroundLocation, 2)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteTexture(backgroundTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)
  }

  return { render, cleanUp }
}

import { BlendMode } from '../../core/helpers/postProcessingHelper'
import {
  compileShader,
  createPiplelineStageProgram,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

export type BackgroundImageStage = {
  render(): void
  updateCoverage(coverage: [number, number]): void
  updateLightWrapping(lightWrapping: number): void
  updateBlendMode(blendMode: BlendMode): void
  cleanUp(): void
}

export function buildBackgroundImageStage(
  gl: WebGL2RenderingContext,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  personMaskTexture: WebGLTexture,
  backgroundImage: HTMLImageElement | null,
  canvas: HTMLCanvasElement
): BackgroundImageStage {
  const vertexShaderSource = glsl`#version 300 es

    uniform vec2 u_backgroundScale;
    uniform vec2 u_backgroundOffset;

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;
    out vec2 v_backgroundCoord;

    void main() {
      // Flipping Y is required when rendering to canvas
      gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
      v_texCoord = a_texCoord;
      v_backgroundCoord = a_texCoord * u_backgroundScale + u_backgroundOffset;
    }
  `

  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_personMask;
    uniform sampler2D u_background;
    uniform vec2 u_coverage;
    uniform float u_lightWrapping;
    uniform float u_blendMode;

    in vec2 v_texCoord;
    in vec2 v_backgroundCoord;

    out vec4 outColor;

    vec3 screen(vec3 a, vec3 b) {
      return 1.0 - (1.0 - a) * (1.0 - b);
    }

    vec3 linearDodge(vec3 a, vec3 b) {
      return a + b;
    }

    void main() {
      vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
      vec3 backgroundColor = texture(u_background, v_backgroundCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      float lightWrapMask = 1.0 - max(0.0, personMask - u_coverage.y) / (1.0 - u_coverage.y);
      vec3 lightWrap = u_lightWrapping * lightWrapMask * backgroundColor;
      frameColor = u_blendMode * linearDodge(frameColor, lightWrap) +
        (1.0 - u_blendMode) * screen(frameColor, lightWrap);
      personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
      outColor = vec4(frameColor * personMask + backgroundColor * (1.0 - personMask), 1.0);
    }
  `

  const { width: outputWidth, height: outputHeight } = canvas
  const outputRatio = outputWidth / outputHeight

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
  const backgroundScaleLocation = gl.getUniformLocation(
    program,
    'u_backgroundScale'
  )
  const backgroundOffsetLocation = gl.getUniformLocation(
    program,
    'u_backgroundOffset'
  )
  const inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame')
  const personMaskLocation = gl.getUniformLocation(program, 'u_personMask')
  const backgroundLocation = gl.getUniformLocation(program, 'u_background')
  const coverageLocation = gl.getUniformLocation(program, 'u_coverage')
  const lightWrappingLocation = gl.getUniformLocation(
    program,
    'u_lightWrapping'
  )
  const blendModeLocation = gl.getUniformLocation(program, 'u_blendMode')

  gl.useProgram(program)
  gl.uniform2f(backgroundScaleLocation, 1, 1)
  gl.uniform2f(backgroundOffsetLocation, 0, 0)
  gl.uniform1i(inputFrameLocation, 0)
  gl.uniform1i(personMaskLocation, 1)
  gl.uniform2f(coverageLocation, 0, 1)
  gl.uniform1f(lightWrappingLocation, 0)
  gl.uniform1f(blendModeLocation, 0)

  let backgroundTexture: WebGLTexture | null = null
  // TODO Find a better to handle background being loaded
  if (backgroundImage?.complete) {
    updateBackgroundImage(backgroundImage)
  } else if (backgroundImage) {
    backgroundImage.onload = () => {
      updateBackgroundImage(backgroundImage)
    }
  }

  function render() {
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, personMaskTexture)
    if (backgroundTexture !== null) {
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture)
      // TODO Handle correctly the background not loaded yet
      gl.uniform1i(backgroundLocation, 2)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function updateBackgroundImage(backgroundImage: HTMLImageElement) {
    backgroundTexture = createTexture(
      gl,
      gl.RGBA8,
      backgroundImage.naturalWidth,
      backgroundImage.naturalHeight,
      gl.LINEAR,
      gl.LINEAR
    )
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      backgroundImage.naturalWidth,
      backgroundImage.naturalHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      backgroundImage
    )

    let xOffset = 0
    let yOffset = 0
    let backgroundWidth = backgroundImage.naturalWidth
    let backgroundHeight = backgroundImage.naturalHeight
    const backgroundRatio = backgroundWidth / backgroundHeight
    if (backgroundRatio < outputRatio) {
      backgroundHeight = backgroundWidth / outputRatio
      yOffset = (backgroundImage.naturalHeight - backgroundHeight) / 2
    } else {
      backgroundWidth = backgroundHeight * outputRatio
      xOffset = (backgroundImage.naturalWidth - backgroundWidth) / 2
    }

    const xScale = backgroundWidth / backgroundImage.naturalWidth
    const yScale = backgroundHeight / backgroundImage.naturalHeight
    xOffset /= backgroundImage.naturalWidth
    yOffset /= backgroundImage.naturalHeight

    gl.uniform2f(backgroundScaleLocation, xScale, yScale)
    gl.uniform2f(backgroundOffsetLocation, xOffset, yOffset)
  }

  function updateCoverage(coverage: [number, number]) {
    gl.useProgram(program)
    gl.uniform2f(coverageLocation, coverage[0], coverage[1])
  }

  function updateLightWrapping(lightWrapping: number) {
    gl.useProgram(program)
    gl.uniform1f(lightWrappingLocation, lightWrapping)
  }

  function updateBlendMode(blendMode: BlendMode) {
    gl.useProgram(program)
    gl.uniform1f(blendModeLocation, blendMode === 'screen' ? 0 : 1)
  }

  function cleanUp() {
    gl.deleteTexture(backgroundTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)
  }

  return {
    render,
    updateCoverage,
    updateLightWrapping,
    updateBlendMode,
    cleanUp,
  }
}

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
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  personMaskTexture: WebGLTexture,
  backgroundImage: HTMLImageElement | null,
  canvas: HTMLCanvasElement
): BackgroundImageStage {
  const backgroundImageVertexShaderSource = glsl`#version 300 es

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
    uniform sampler2D u_blurredBackground;
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
      vec3 blurredBackground = texture(u_blurredBackground, v_backgroundCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      float lightWrapMask = 1.0 - max(0.0, personMask - u_coverage.y) / (1.0 - u_coverage.y);
      vec3 lightWrap = u_lightWrapping * lightWrapMask * blurredBackground;
      frameColor = u_blendMode * linearDodge(frameColor, lightWrap) +
        (1.0 - u_blendMode) * screen(frameColor, lightWrap);
      personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
      outColor = vec4(frameColor * personMask + backgroundColor * (1.0 - personMask), 1.0);
    }
  `

  const { width: outputWidth, height: outputHeight } = canvas
  const outputRatio = outputWidth / outputHeight

  const backgroundImageVertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    backgroundImageVertexShaderSource
  )
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )
  const program = createPiplelineStageProgram(
    gl,
    backgroundImageVertexShader,
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
  const blurredBackgroundLocation = gl.getUniformLocation(
    program,
    'u_blurredBackground'
  )
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
  gl.uniform1i(blurredBackgroundLocation, 3)
  gl.uniform2f(coverageLocation, 0, 1)
  gl.uniform1f(lightWrappingLocation, 0)
  gl.uniform1f(blendModeLocation, 0)

  let backgroundImageBlurPass: ReturnType<typeof buildBackgroundImageBlurPass>

  let backgroundTexture: WebGLTexture | null = null
  // TODO Find a better way to handle background being loaded
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function updateBackgroundImage(backgroundImage: HTMLImageElement) {
    gl.activeTexture(gl.TEXTURE2)
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

    gl.useProgram(program)
    gl.uniform1i(backgroundLocation, 2)
    gl.uniform2f(backgroundScaleLocation, xScale, yScale)
    gl.uniform2f(backgroundOffsetLocation, xOffset, yOffset)

    if (backgroundImageBlurPass) {
      // FIXME attempt to use a deleted object
      // FIXME Could not link WebGL program: No compiled vertex shader
      //       when at least one graphics shader is attached
      backgroundImageBlurPass.cleanUp()
    }
    gl.activeTexture(gl.TEXTURE3)
    backgroundImageBlurPass = buildBackgroundImageBlurPass(
      gl,
      vertexShader,
      positionBuffer,
      texCoordBuffer,
      backgroundImage
    )
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture)
    backgroundImageBlurPass.render()
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
    if (backgroundImageBlurPass) {
      backgroundImageBlurPass.cleanUp()
    }
    gl.deleteTexture(backgroundTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(backgroundImageVertexShader)
  }

  return {
    render,
    updateCoverage,
    updateLightWrapping,
    updateBlendMode,
    cleanUp,
  }
}

function buildBackgroundImageBlurPass(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  backgroundImage: HTMLImageElement
) {
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_background;
    uniform vec2 u_texelSize;

    in vec2 v_texCoord;

    out vec4 outColor;

    const float offset[5] = float[](0.0, 1.0, 2.0, 3.0, 4.0);
    const float weight[5] = float[](0.2270270270, 0.1945945946, 0.1216216216,
      0.0540540541, 0.0162162162);

    void main() {
      outColor = texture(u_background, v_texCoord) * weight[0];
      for (int i = 1; i < 5; i++) {
        vec2 offset = vec2(offset[i]) * u_texelSize;
        outColor += texture(u_background, v_texCoord + offset) * weight[i];
        outColor += texture(u_background, v_texCoord - offset) * weight[i];
      }
    }
  `

  const scale = 0.2
  const outputWidth = backgroundImage.naturalWidth * scale
  const outputHeight = backgroundImage.naturalHeight * scale
  const texelWidth = 1 / outputWidth
  const texelHeight = 1 / outputHeight

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
  const backgroundLocation = gl.getUniformLocation(program, 'u_background')
  const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize')
  const texture1 = createTexture(
    gl,
    gl.RGBA8,
    outputWidth,
    outputHeight,
    gl.NEAREST,
    gl.LINEAR
  )
  const texture2 = createTexture(
    gl,
    gl.RGBA8,
    outputWidth,
    outputHeight,
    gl.NEAREST,
    gl.LINEAR
  )

  const frameBuffer1 = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture1,
    0
  )

  const frameBuffer2 = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture2,
    0
  )

  gl.useProgram(program)
  gl.uniform1i(backgroundLocation, 3)

  function render() {
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.useProgram(program)

    for (let i = 0; i < 5; i++) {
      gl.uniform2f(texelSizeLocation, 0, texelHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.bindTexture(gl.TEXTURE_2D, texture1)

      gl.uniform2f(texelSizeLocation, texelWidth, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.bindTexture(gl.TEXTURE_2D, texture2)
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer2)
    gl.deleteFramebuffer(frameBuffer1)
    gl.deleteTexture(texture2)
    gl.deleteTexture(texture1)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return {
    render,
    cleanUp,
  }
}

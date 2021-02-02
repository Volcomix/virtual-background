import { MutableRefObject } from 'react'
import { PostProcessingConfig } from '../../core/helpers/postProcessingHelper'
import {
  inputResolutions,
  SegmentationConfig,
} from '../../core/helpers/segmentationHelper'
import {
  compileShader,
  createPiplelineStageProgram,
  glsl,
} from '../helpers/webglHelper'

export function buildJointBilateralFilterStage(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  inputTexture: WebGLTexture,
  segmentationConfig: SegmentationConfig,
  postProcessingConfigRef: MutableRefObject<PostProcessingConfig>,
  outputTexture: WebGLTexture,
  canvas: HTMLCanvasElement
) {
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_segmentationMask;
    uniform vec2 u_texelSize;
    uniform float u_sigmaSpace;
    uniform float u_sigmaColor;

    in vec2 v_texCoord;

    out vec4 outColor;

    const float kSparsityFactor = 0.66;  // Higher is more sparse.

    float gaussian(float x, float sigma) {
      float coeff = -0.5 / (sigma * sigma * 4.0 + 1.0e-6);
      return exp((x * x) * coeff);
    }

    void main() {
      float sparsity = max(1.0, sqrt(u_sigmaSpace) * kSparsityFactor);
      float step = sparsity;
      float radius = u_sigmaSpace;
      float offset = (step > 1.0) ? (step * 0.5) : (0.0);

      vec2 centerCoord = v_texCoord;
      vec3 centerColor = texture(u_inputFrame, centerCoord).rgb;
      float newVal = 0.0;

      float spaceWeight = 0.0;
      float colorWeight = 0.0;
      float totalWeight = 0.0;

      float sigmaTexel = max(u_texelSize.x, u_texelSize.y) * u_sigmaSpace;

      // Subsample kernel space.
      for (float i = -radius + offset; i <= radius; i += step) {
        for (float j = -radius + offset; j <= radius; j += step) {
          vec2 shift = vec2(j, i) * u_texelSize;
          vec2 coord = vec2(centerCoord + shift);
          vec3 frameColor = texture(u_inputFrame, coord).rgb;
          float outVal = texture(u_segmentationMask, coord).a;

          spaceWeight = gaussian(distance(centerCoord, coord), sigmaTexel);
          colorWeight = gaussian(distance(centerColor, frameColor), u_sigmaColor);
          totalWeight += spaceWeight * colorWeight;

          newVal += spaceWeight * colorWeight * outVal;
        }
      }
      newVal /= totalWeight;

      outColor = vec4(vec3(0.0), newVal);
    }
  `

  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const { width: outputWidth, height: outputHeight } = canvas
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
  const inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame')
  const segmentationMaskLocation = gl.getUniformLocation(
    program,
    'u_segmentationMask'
  )
  const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize')
  const sigmaSpaceLocation = gl.getUniformLocation(program, 'u_sigmaSpace')
  const sigmaColorLocation = gl.getUniformLocation(program, 'u_sigmaColor')

  const frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  )

  function render() {
    let {
      sigmaSpace,
      sigmaColor,
    } = postProcessingConfigRef.current.jointBilateralFilter
    sigmaSpace *= Math.max(
      outputWidth / segmentationWidth,
      outputHeight / segmentationHeight
    )

    gl.useProgram(program)
    gl.uniform1i(inputFrameLocation, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.uniform1i(segmentationMaskLocation, 1)
    gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)
    gl.uniform1f(sigmaSpaceLocation, sigmaSpace)
    gl.uniform1f(sigmaColorLocation, sigmaColor)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

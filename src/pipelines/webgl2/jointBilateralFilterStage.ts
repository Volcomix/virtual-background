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
  canvas: HTMLCanvasElement
) {
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
  const inputLocation = gl.getUniformLocation(
    program,
    'u_inputSegmentationMask'
  )
  const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize')

  function render() {
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.uniform1i(inputLocation, 0)
    gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

const fragmentShaderSource = glsl`#version 300 es

  precision highp float;

  uniform sampler2D u_inputSegmentationMask;
  uniform vec2 u_texelSize;

  in vec2 v_texCoord;

  out vec4 outColor;

  const float sigmaSpace = 8.0;
  const float sigmaColor = 2.0;

  const float kSparsityFactor = 0.66;  // Higher is more sparse.
  const float sparsity = max(1.0, sqrt(sigmaSpace) * kSparsityFactor);
  const float step = sparsity;
  const float radius = sigmaSpace;
  const float offset = (step > 1.0) ? (step * 0.5) : (0.0);

  float gaussian(float x, float sigma) {
    float coeff = -0.5 / (sigma * sigma * 4.0 + 1.0e-6);
    return exp((x * x) * coeff);
  }

  void main() {
    vec2 centerCoord = v_texCoord;
    vec3 centerColor = texture(u_inputSegmentationMask, centerCoord).rgb;
    vec3 newColor = vec3(0.0);

    float spaceWeight = 0.0;
    float colorWeight = 0.0;
    float totalWeight = 0.0;

    float sigmaTexel = max(u_texelSize.x, u_texelSize.y) * sigmaSpace;

    // Subsample kernel space.
    for (float i = -radius + offset; i <= radius; i += step) {
      for (float j = -radius + offset; j <= radius; j += step) {
        vec2 shift = vec2(j, i) * u_texelSize;
        vec2 coord = vec2(centerCoord + shift);
        vec3 color = texture(u_inputSegmentationMask, coord).rgb;

        spaceWeight = gaussian(distance(centerCoord, coord), sigmaTexel);
        colorWeight = gaussian(distance(centerColor, color), sigmaColor);
        totalWeight += spaceWeight * colorWeight;

        newColor += vec3(spaceWeight * colorWeight) * color;
      }
    }
    newColor /= vec3(totalWeight);

    outColor = vec4(newColor, 1.0);
  }
`

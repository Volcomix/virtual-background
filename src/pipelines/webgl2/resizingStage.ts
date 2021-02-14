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

export function buildResizingStage(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  segmentationConfig: SegmentationConfig,
  tflite: TFLite
) {
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;

    in vec2 v_texCoord;

    out vec4 outColor;

    void main() {
      outColor = texture(u_inputFrame, v_texCoord);
    }
  `

  // TFLite memory will be accessed as float32
  const tfliteInputMemoryOffset = tflite._getInputMemoryOffset() / 4

  const [outputWidth, outputHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const outputPixelCount = outputWidth * outputHeight

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
  const outputTexture = createTexture(gl, gl.RGBA8, outputWidth, outputHeight)

  const frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  )
  const outputPixels = new Uint8Array(outputPixelCount * 4)

  gl.useProgram(program)
  gl.uniform1i(inputFrameLocation, 0)

  function clientWaitAsync(sync: WebGLSync, flags: number, intervalMs: number) {
    return new Promise<void>((resolve, reject) => {
      function test() {
        const res = gl.clientWaitSync(sync, flags, 0)
        if (res === gl.WAIT_FAILED) {
          reject()
          return
        }
        if (res === gl.TIMEOUT_EXPIRED) {
          setTimeout(test, intervalMs)
          return
        }
        resolve()
      }
      test()
    })
  }

  async function getBufferSubDataAsync(
    target: number,
    buffer: WebGLBuffer,
    srcByteOffset: number,
    dstBuffer: ArrayBufferView,
    dstOffset?: number,
    length?: number
  ) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!
    gl.flush()

    await clientWaitAsync(sync, 0, 10)
    gl.deleteSync(sync)

    gl.bindBuffer(target, buffer)
    gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length)
    gl.bindBuffer(target, null)
  }

  async function readPixelsAsync(
    x: number,
    y: number,
    width: number,
    height: number,
    format: number,
    type: number,
    dest: ArrayBufferView
  ) {
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf)
    gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ)
    gl.readPixels(x, y, width, height, format, type, 0)
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)

    await getBufferSubDataAsync(gl.PIXEL_PACK_BUFFER, buf, 0, dest)

    gl.deleteBuffer(buf)
    return dest
  }

  function render() {
    gl.useProgram(program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    readPixelsAsync(
      0,
      0,
      outputWidth,
      outputHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      outputPixels
    )
    for (let i = 0; i < outputPixelCount; i++) {
      const tfliteIndex = tfliteInputMemoryOffset + i * 3
      const outputIndex = i * 4
      tflite.HEAPF32[tfliteIndex] = outputPixels[outputIndex] / 255
      tflite.HEAPF32[tfliteIndex + 1] = outputPixels[outputIndex + 1] / 255
      tflite.HEAPF32[tfliteIndex + 2] = outputPixels[outputIndex + 2] / 255
    }
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(outputTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

/**
 * Use it along with boyswan.glsl-literal VSCode extension
 * to get GLSL syntax highlighting.
 * https://marketplace.visualstudio.com/items?itemName=boyswan.glsl-literal
 *
 * On VSCode OSS, boyswan.glsl-literal requires slevesque.shader extension
 * to be installed as well.
 * https://marketplace.visualstudio.com/items?itemName=slevesque.shader
 */
export const glsl = String.raw

export function createProgram(
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

export function compileShader(
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

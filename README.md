# Virtual Background

> Demo on adding virtual background to a live video stream in the browser.

:point_right: [Try it live here!](https://volcomix.github.io/virtual-background)

## Implementation details

The current demo only uses [BodyPix](https://github.com/tensorflow/tfjs-models/blob/master/body-pix) model (for now :crossed_fingers:). The drawing utils provided in BodyPix are not optimized for the simple background image use case of this demo. That's why I haven't used [toMask](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixtomask) nor [drawMask](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawmask) methods from the API to get a higher framerate.

## Possible improvements

More work is needed to improve the visual result and the performance. Few ideas are:

- Using Google Meet background segmentation model directly if possible. Several approaches are discussed in [this issue](https://github.com/tensorflow/tfjs/issues/4177).
- Using [WebAssembly](https://webassembly.org/), [XNNPACK](https://github.com/google/XNNPACK) and [TFLite](https://blog.tensorflow.org/2020/07/accelerating-tensorflow-lite-xnnpack-integration.html) if possible to speed up ML model inference. **Note: it is slower when just running BodyPix model on [TensorFlow.js WASM backend](https://github.com/tensorflow/tfjs/tree/master/tfjs-backend-wasm) (verified).**
- Adding WebGL shaders to add smoother transition between the background and the person, and to have more control on several parameters.
- Adding WebGL shaders to propose another option to blur the background instead of displaying an image. The [drawBokehEffect](https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawbokeheffect) method from BodyPix API gives medium quality results and poor performance.

## Related work

You can learn more about a pre-trained TensorFlow.js model in the [BodyPix repository](https://github.com/tensorflow/tfjs-models/blob/master/body-pix).

Here is a technical overview of [background features in Google Meet](https://ai.googleblog.com/2020/10/background-features-in-google-meet.html) which relies on:

- [MediaPipe](https://mediapipe.dev/)
- [WebAssembly](https://webassembly.org/)
- [WebAssembly SIMD](https://github.com/WebAssembly/simd)
- [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [XNNPACK](https://github.com/google/XNNPACK)
- [TFLite](https://blog.tensorflow.org/2020/07/accelerating-tensorflow-lite-xnnpack-integration.html)
- [Custom segmentation ML models from Google](https://mediapipe.page.link/meet-mc)
- Custom rendering effects through OpenGL shaders from Google

## Running locally

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

---

**:warning: The sections below are work in progress while trying to build TensorFlow Lite with XNNPACK in WebAssembly**

## TensorFlow Lite

A Docker development environment must be initialized before building TensorFlow Lite.

### Notes

- The Bazel WORKSPACE configuration is inspired from [MediaPipe repository](https://github.com/google/mediapipe/blob/master/WORKSPACE).
- Emscripten toolchain for Bazel was setup following [Emsdk repository instructions](https://github.com/emscripten-core/emsdk/tree/master/bazel) and changed to match [XNNPACK build config](https://github.com/google/XNNPACK/blob/ec0bf144ad55cde0698083f12e0a20d4525689a6/BUILD.bazel#L7340).
- TensorFlow sources [are patched](tflite/Dockerfile) to match Emscripten toolchain and WASM CPU.
- C++ functions are [called directly from JavaScript](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#call-compiled-c-c-code-directly-from-javascript) to achieve the best performance.
- [Memory is accessed directly](https://emscripten.org/docs/porting/emscripten-runtime-environment.html#emscripten-memory-representation) from JavaScript through pointer offsets to exchange image data with WASM.
- [**WIP**] Some Emscripten configurations are inspired from [TensorFlow.js WASM backend](https://github.com/tensorflow/tfjs/blob/master/tfjs-backend-wasm/src/cc/BUILD).
- [**WIP**] WASM feature detection is inspired from [TensorFlow.js WASM backend](https://github.com/tensorflow/tfjs/blob/master/tfjs-backend-wasm/src/flags_wasm.ts) which relies on [GoogleChromeLabs/wasm-feature-detect](https://github.com/GoogleChromeLabs/wasm-feature-detect)

### `yarn init:tflite`

Builds a Docker development image, starts the container and initializes dependencies required for building tflite tool.

### `yarn start:tflite:container`

Starts the container, then updates TensorFlow and MediaPipe repositories inside the container.

### `yarn build:tflite`

Builds WASM functions that can infer Meet segmentation models.

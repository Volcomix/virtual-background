#!/bin/sh

sed -i 's/"crosstool_top": "\/\/external:android\/emscripten"/"crosstool_top": "@emsdk\/\/emscripten_toolchain:everything"/' /tensorflow_src/tensorflow/BUILD

cd tflite

bazel build --config=wasm -c opt :tflite
bazel build --config=wasm -c opt --copt='-msimd128' :tflite-simd
#!/bin/sh
set -e

git -C /tensorflow_src pull --rebase
git -C /mediapipe_src pull --rebase

sed -i 's/"crosstool_top": "\/\/external:android\/emscripten"/"crosstool_top": "@emsdk\/\/emscripten_toolchain:everything"/' /tensorflow_src/tensorflow/BUILD

cd tflite

bazel build --config=wasm -c opt :tflite
bazel build --config=wasm -c opt --copt='-msimd128' :tflite-simd

tar xvf bazel-bin/tflite -C ../public/tflite
tar xvf bazel-bin/tflite-simd -C ../public/tflite

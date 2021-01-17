# Description:
#   TensorFlow Lite minimal inference tool.

load("@org_tensorflow//tensorflow/lite:build_def.bzl", "tflite_linkopts")

cc_binary(
  name = "tflite",
  srcs = ["tflite.cc"],
  linkopts = tflite_linkopts() + ["-s USE_PTHREADS=0"],
  deps = [
    "@org_tensorflow//tensorflow/lite:framework",
    "@org_tensorflow//tensorflow/lite:tflite_with_xnnpack",
    "@org_tensorflow//tensorflow/lite/kernels:builtin_ops",
    "@org_mediapipe//mediapipe/util/tflite/operations:transpose_conv_bias",
  ],
)
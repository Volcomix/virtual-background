# Description:
#   TensorFlow Lite minimal inference tool.

load("//tensorflow/lite:build_def.bzl", "tflite_linkopts")

cc_binary(
  name = "tflite",
  srcs = [
    "transpose_conv_bias.h",
    "transpose_conv_bias.cc",
    "tflite.cc",
  ],
  linkopts = tflite_linkopts(),
  deps = [
    "//tensorflow/lite:framework",
    "//tensorflow/lite/kernels:builtin_ops",
  ],
)
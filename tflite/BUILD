# Description:
#   TensorFlow Lite minimal inference tool.

load("@org_tensorflow//tensorflow/lite:build_def.bzl", "tflite_linkopts")

# TODO Build TFLite with XNNPACK

cc_binary(
  name = "tflite",
  srcs = ["tflite.cc"],
  linkopts = tflite_linkopts(),
  deps = [
    "@org_tensorflow//tensorflow/lite:framework",
    # TODO Handle the next dep without threads
    # "@org_tensorflow//tensorflow/lite/kernels:builtin_ops",
    "@org_mediapipe//mediapipe/util/tflite/operations:transpose_conv_bias",
  ],
)
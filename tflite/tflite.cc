#include <cstdio>
#include <emscripten.h>
#include "tensorflow/lite/kernels/register.h"
#include "tensorflow/lite/model.h"
#include "mediapipe/util/tflite/operations/transpose_conv_bias.h"

#define CHECK_TFLITE_ERROR(x)                                \
  if (!(x)) {                                                \
    fprintf(stderr, "Error at %s:%d\n", __FILE__, __LINE__); \
    return 1;                                                \
  }

char modelBuffer[410000];
std::unique_ptr<tflite::Interpreter> interpreter;

extern "C" {

EMSCRIPTEN_KEEPALIVE
char* getModelBufferMemoryOffset() {
  return modelBuffer;
}

EMSCRIPTEN_KEEPALIVE
float* getInputMemoryOffset() {
  return interpreter->typed_input_tensor<float>(0);
}

EMSCRIPTEN_KEEPALIVE
int getInputHeight() {
  return interpreter->input_tensor(0)->dims->data[1];
}

EMSCRIPTEN_KEEPALIVE
int getInputWidth() {
  return interpreter->input_tensor(0)->dims->data[2];
}

EMSCRIPTEN_KEEPALIVE
int getInputChannelCount() {
  return interpreter->input_tensor(0)->dims->data[3];
}

EMSCRIPTEN_KEEPALIVE
float* getOutputMemoryOffset() {
  return interpreter->typed_output_tensor<float>(0);
}

EMSCRIPTEN_KEEPALIVE
int getOutputHeight() {
  return interpreter->output_tensor(0)->dims->data[1];
}

EMSCRIPTEN_KEEPALIVE
int getOutputWidth() {
  return interpreter->output_tensor(0)->dims->data[2];
}

EMSCRIPTEN_KEEPALIVE
int getOutputChannelCount() {
  return interpreter->output_tensor(0)->dims->data[3];
}

EMSCRIPTEN_KEEPALIVE
int loadModel(int bufferSize) {
  printf("[WASM] Loading model of size: %d\n", bufferSize);

  // Load model
  std::unique_ptr<tflite::FlatBufferModel> model =
    tflite::FlatBufferModel::BuildFromBuffer(modelBuffer, bufferSize);
  CHECK_TFLITE_ERROR(model != nullptr);

  // Build the interpreter with the InterpreterBuilder.
  // Note: all Interpreters should be built with the InterpreterBuilder,
  // which allocates memory for the Interpreter and does various set up
  // tasks so that the Interpreter can read the provided model.
  tflite::ops::builtin::BuiltinOpResolver resolver;
  resolver.AddCustom("Convolution2DTransposeBias",
    mediapipe::tflite_operations::RegisterConvolution2DTransposeBias());
  tflite::InterpreterBuilder builder(*model, resolver);
  builder(&interpreter);
  CHECK_TFLITE_ERROR(interpreter != nullptr);

  // Allocate tensor buffers.
  CHECK_TFLITE_ERROR(interpreter->AllocateTensors() == kTfLiteOk);

  return 0;
}

EMSCRIPTEN_KEEPALIVE
int runInference() {
  CHECK_TFLITE_ERROR(interpreter->Invoke() == kTfLiteOk);
  return 0;
}

}
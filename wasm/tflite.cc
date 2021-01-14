#include <emscripten.h>

extern "C" {

  // Demo function to test WASM function integration
  EMSCRIPTEN_KEEPALIVE
  int add(int a, int b) {
    return a + b;
  }

}
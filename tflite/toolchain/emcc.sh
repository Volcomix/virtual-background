#!/bin/bash

source toolchain/env.sh

exec python3 external/emscripten/emscripten/emcc.py "$@"

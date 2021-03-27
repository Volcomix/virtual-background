#!/bin/bash

source emscripten_toolchain/env.sh

exec python3 $EMSCRIPTEN/emcc.py "$@"

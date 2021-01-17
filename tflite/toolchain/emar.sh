#!/bin/bash

source toolchain/env.sh

exec python3 $EMSCRIPTEN/emar.py "$@"

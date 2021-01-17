#!/bin/bash

source toolchain/env.sh

exec python3 toolchain/link_wrapper.py "$@"

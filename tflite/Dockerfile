FROM tensorflow/tensorflow:devel
# TODO emsdk might not be required anymore if Bazel could download it
RUN git clone https://github.com/emscripten-core/emsdk.git /emsdk \
  && cd /emsdk \
  && ./emsdk install latest \
  && ./emsdk activate latest \
  && . ./emsdk_env.sh \
  && echo '. /emsdk/emsdk_env.sh' >> /etc/bash.bashrc \
  && cd - \
  && mkdir /tflite_build \
  && mkdir /tflite_src \
  && git clone https://github.com/google/mediapipe.git /mediapipe_src
ENV EMSDK=/emsdk \
  EM_CONFIG=/emsdk/.emscripten \
  EMSDK_NODE=/emsdk/node/12.18.1_64bit/bin/node \
  PATH="/emsdk:/emsdk/upstream/emscripten:/emsdk/upstream/bin:/emsdk/node/12.18.1_64bit/bin:${PATH}"
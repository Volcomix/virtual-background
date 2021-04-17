FROM tensorflow/tensorflow:devel
RUN git -C /tensorflow_src pull
RUN git clone https://github.com/google/mediapipe.git /mediapipe_src
RUN sed -i 's/"crosstool_top": "\/\/external:android\/emscripten"/"crosstool_top": "@emsdk\/\/emscripten_toolchain:everything"/' /tensorflow_src/tensorflow/BUILD
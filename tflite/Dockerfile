FROM tensorflow/tensorflow:devel
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /etc/apt/trusted.gpg.d/kitware.gpg >/dev/null \
  && apt-add-repository 'deb https://apt.kitware.com/ubuntu/ bionic main' \
  && apt-get update && apt-get install -y cmake \
  && mkdir /tflite_build \
  && mkdir /tflite_src \
  && git clone https://github.com/google/mediapipe.git /mediapipe_src
COPY CMakeLists.txt *.cc /tflite_src/
WORKDIR /tflite_build
RUN git -C /tensorflow_src pull \
  && git -C /mediapipe_src pull \
  && cp /mediapipe_src/mediapipe/util/tflite/operations/transpose_conv_bias.* /tflite_src \
  && sed -i 's/mediapipe\/util\/tflite\/operations\///' /tflite_src/transpose_conv_bias.cc \
  && cmake -DTENSORFLOW_SOURCE_DIR=/tensorflow_src /tflite_src \
  && cmake --build . -j 4
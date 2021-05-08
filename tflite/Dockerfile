FROM tensorflow/tensorflow:devel
RUN git clone https://github.com/google/mediapipe.git /mediapipe_src
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

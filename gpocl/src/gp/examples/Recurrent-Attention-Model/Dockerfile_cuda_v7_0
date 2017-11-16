# Start with CUDA Torch base image
FROM kaixhin/cuda-torch:7.0
MAINTAINER Kai Arulkumaran <design@kaixhin.com>

# Install Torch packages
RUN luarocks install torchx && \
  luarocks install dpnn && \
  luarocks install rnn && \
  luarocks install mnist

# Clone FGMachine repo for RAM example
RUN cd /root && git clone https://github.com/Kaixhin/FGMachine.git

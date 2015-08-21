# Projects

This folder is used to store [Protocol Buffers](https://developers.google.com/protocol-buffers/) for project (hyperparameter) schemas. Protocol buffers allow a structure to be defined for a protocol buffer *message*, which can both be read and written by a variety of languages, as well as be efficiently serialized.

FGLab/FGMachine use the [proto3](https://developers.google.com/protocol-buffers/docs/proto3) syntax. Each field has a name, type and unique numbered tag.

## Example

The following is an example message for a project:

```protobuf
syntax = "proto3";

message Mnist {
  string name = 1;
  string id = 2;
  int32 seed = 3 [default = 123];
  int32 batchSize = 4 [default = 8];
  int32 maxEpochs = 5 [default = 100];

  enum Method {
    SGD = 0;
    NESTEROV = 1;
    RMSPROP = 2;
    ADAGRAD = 3;
    ADADELTA = 4;
    ADAM = 5;
  }

  message Solver {
    Method method = 1 [default = ADAGRAD];
    float learningRate = 2 [default = 0.001];
    float momentum = 3 [default = 0.9];
    bool L2 = 4 [default = true];
  }

  Solver solver = 6;
}
```

## Recommended libaries

The following libraries can be used to compile project .proto files for use in your machine learning code.

- [C++/Java/Python](https://github.com/google/protobuf)
- [MATLAB/Octave](https://github.com/elap/protobuf-matlab)
- [Lua](https://github.com/starwing/lua-protobuf)
- [JavaScript](https://github.com/dcodeIO/ProtoBuf.js)

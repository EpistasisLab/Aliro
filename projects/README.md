# Projects

This folder is used to store [Protocol Buffers](https://developers.google.com/protocol-buffers/) for project (hyperparameter) schemas. Protocol buffers allow a structure to be defined for a protocol buffer *message*, which can both be read and written by a variety of languages, as well as be efficiently serialized.

FGLab/FGMachine use the [proto3](https://developers.google.com/protocol-buffers/docs/proto3) syntax. Each field has a name, type and unique numbered tag.

## Instructions

A project's .proto file must have the same name as its message e.g. the following example would be stored under `projects/Mnist.proto`:

```protobuf
syntax = "proto3";

message Mnist {
  string id = 1;
  int32 seed = 2;
  int32 batchSize = 3;
  int32 maxEpochs = 4;

  enum Method {
    SGD = 0;
    NESTEROV = 1;
    RMSPROP = 2;
    ADAGRAD = 3;
    ADADELTA = 4;
    ADAM = 5;
  }

  message Solver {
    Method method = 1;
    float learningRate = 2;
    float momentum = 3;
    bool L2 = 4;
  }

  string model = 5;
  Solver solver = 6;
}
```

To register a project with FGLab, run `node register.js <message name>` e.g. `node register.js Mnist`.

## Recommended libaries

The following libraries can be used to compile project .proto files for use in your machine learning code.

- [C++/Java/Python](https://github.com/google/protobuf)
- [MATLAB/Octave](https://github.com/elap/protobuf-matlab)
- [Lua](https://github.com/starwing/lua-protobuf)
- [JavaScript](https://github.com/dcodeIO/ProtoBuf.js)

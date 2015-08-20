# Projects

This folder is used to store [Protocol Buffers](https://developers.google.com/protocol-buffers/) for project (hyperparameter) schemas. Protocol buffers allow a structure to be defined for a protocol buffer *message*, which can both be read and written by a variety of languages, as well as be efficiently serialized.

```protobuf
message Mnist {
  required string name = 1;
  required string id = 2;
  optional int32 seed = 3 [default = 123];
  optional int32 batchSize = 4 [default = 8];
  optional int32 maxEpochs = 5 [default = 100];

  enum Method {
    SGD = 0;
    NESTEROV = 1;
    RMSPROP = 2;
    ADAGRAD = 3;
    ADADELTA = 4;
    ADAM = 5;
  }

  message Solver {
    optional Method method = 1 [default = ADAGRAD];
    optional float learningRate = 2 [default = 0.001];
    optional float momentum = 3 [default = 0.9];
    optional bool L2 = 4 [default = true];
  }

  required Solver solver = 6;
}
```

## Recommended libaries

- [C++/Java/Python](https://github.com/google/protobuf)
- [MATLAB/Octave](https://github.com/elap/protobuf-matlab)
- [Lua](https://github.com/starwing/lua-protobuf)
- [JavaScript](https://github.com/dcodeIO/ProtoBuf.js)

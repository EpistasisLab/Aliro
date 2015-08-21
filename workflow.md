1. User uploads .proto file to be saved in database
1. Server loads project.proto for usage
1. Server encodes hyperparams and sends to ML via client
1. ML performs experiment and sends encoded results to server via client
1. Server decodes and saves results

Server requirements: results.proto

Client requirements: project.proto

ML requirements: project.proto, results.proto

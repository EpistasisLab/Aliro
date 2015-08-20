1. Server receives {String name, String project.proto} from client and saves in db
1. Server loads project.proto for usage
1. Server encodes hyperparams and sends to ML via client
1. ML performs experiment and sends encoded results to server via client
1. Server decodes and saves results

Server requirements: results.proto
Client requirements: project.proto
ML requirements: project.proto, results.proto

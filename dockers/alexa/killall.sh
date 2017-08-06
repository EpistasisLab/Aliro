docker stop $(docker ps -a -q --filter 'name=alexa')
docker rm $(docker ps -a -q --filter 'name=alexa')
# Delete all images
#docker rmi $(docker images -q)

docker stop $(docker ps -a -q --filter 'name=redis')
docker rm $(docker ps -a -q --filter 'name=redis')
# Delete all images
#docker rmi $(docker images -q)

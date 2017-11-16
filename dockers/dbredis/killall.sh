docker stop $(docker ps -a -q --filter 'name=dbredis')
docker rm $(docker ps -a -q --filter 'name=dbredis')
# Delete all images
#docker rmi $(docker images -q)

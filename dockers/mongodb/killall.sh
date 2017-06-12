docker stop $(docker ps -a -q --filter 'name=fglab')
docker rm $(docker ps -a -q --filter 'name=fglab')
# Delete all images
#docker rmi $(docker images -q)

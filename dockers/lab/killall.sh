docker stop $(docker ps -a -q --filter 'name=lab')
docker rm $(docker ps -a -q --filter 'name=lab')
# Delete all images
#docker rmi $(docker images -q)

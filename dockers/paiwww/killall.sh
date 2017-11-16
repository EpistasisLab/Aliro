docker stop $(docker ps -a -q --filter 'name=paiwww')
docker rm $(docker ps -a -q --filter 'name=paiwww')
# Delete all images
#docker rmi $(docker images -q)

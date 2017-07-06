docker stop $(docker ps -a -q --filter 'name=paix01')
docker rm $(docker ps -a -q --filter 'name=paix01')
# Delete all images
#docker rmi $(docker images -q)

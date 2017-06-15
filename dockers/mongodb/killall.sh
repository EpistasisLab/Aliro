docker stop $(docker ps -a -q --filter 'name=mongodb')
docker rm $(docker ps -a -q --filter 'name=mongodb')
# Delete all images
#docker rmi $(docker images -q)

docker stop $(docker ps -a -q --filter 'name=machine')
docker rm $(docker ps -a -q --filter 'name=machine')
# Delete all images
#docker rmi $(docker images -q)

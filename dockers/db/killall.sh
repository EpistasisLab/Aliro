docker stop $(docker ps -a -q --filter 'name=db')
docker rm $(docker ps -a -q --filter 'name=db')
# Delete all images
#docker rmi $(docker images -q)

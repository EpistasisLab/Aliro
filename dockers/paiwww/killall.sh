docker stop $(docker ps -a -q --filter 'name=www')
docker rm $(docker ps -a -q --filter 'name=www')
# Delete all images
#docker rmi $(docker images -q)

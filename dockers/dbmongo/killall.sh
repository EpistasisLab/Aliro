docker stop $(docker ps -a -q --filter 'name=dbmongo')
docker rm $(docker ps -a -q --filter 'name=dbmongo')
# Delete all images
#docker rmi $(docker images -q)

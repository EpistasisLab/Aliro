#we started out with nothing
FROM scratch
#ubuntu wily rootfs
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
RUN apt-get update && apt-get install -y vim  git openssh-client openssh-server htop net-tools iputils-ping xz-utils wget ngrep ca-cacert --no-install-recommends

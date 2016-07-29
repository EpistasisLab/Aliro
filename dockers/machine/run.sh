# build
docker build -t rtools .
#run 
docker run -i -v /Users:/Users -t rtools Rscript /share/devel/blair/code/xlgrp/R/xlgrp.R

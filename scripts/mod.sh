#/bin/sh
fswatch src/  --exclude=.* --include=.java$ | while read FILE; 
	do
      [[ $FILE == *.java ]] &&  mvn test

done

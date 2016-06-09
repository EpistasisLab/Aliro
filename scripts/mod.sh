#/bin/sh
while true; do
    inotifywait -q -e close_write,moved_to  -r src/ --exclude=".*sw[px]" --format "%f" | while read FILE
    do
      [[ $FILE == *.java ]] &&  mvn test

    done
done

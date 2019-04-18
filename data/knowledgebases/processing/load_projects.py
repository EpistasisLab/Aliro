import json
import re
NOT_WHITESPACE = re.compile(r'[^\s]')

def decode_stacked(document, pos=0, decoder=json.JSONDecoder()):
    while True:
        match = NOT_WHITESPACE.search(document, pos)
        if not match:
            return
        pos = match.start()

        try:
            obj, pos = decoder.raw_decode(document, pos)
        except json.JSONDecodeError:
            # do something sensible if there's some error
            raise
        yield obj

# projects information
projects_json = "../../dockers/dbmongo/files/projects.json"
json_file = open(projects_json, encoding="utf8")
projects_json_data = [obj for obj in decode_stacked(json_file.read())]

with open('projects_newlines.json','w') as out:
    for pjd in projects_json_data:
        json.dump(pjd, out)
        out.write('\n')


import os
from pathlib import Path

with open('utils/source_file_header.txt','r') as f:
    header = f.read()

exts = ['.py','.jsx','.js']

# get file paths recursively
python_files = Path('./').rglob('*.py') 
json_files = list(Path('./').rglob('*.js'))
json_files += list(Path('./').rglob('*.jsx')) 

python_header = '"""'+header+'\n"""\n'
json_header = '/* '+header+'\n*/\n'
print('python_header',python_header)
print('json_header',json_header)

# recurse thru files and add header w/ appropriate block comments
for f in python_files:
    print('updating',f)
    with open(f, 'r') as original: 
        data = original.read()
    with open(f, 'w') as modified: 
        modified.write(python_header + data)

for f in json_files:
    print('updating',f)
    with open(f, 'r') as original: 
        data = original.read()
    with open(f, 'w') as modified: 
        modified.write(json_header + data)

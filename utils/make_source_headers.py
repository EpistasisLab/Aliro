"""This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""
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
    with open(f, 'r') as original: 
        data = original.read()
    if "This file is part of the PennAI library" in data:
        print('skipping',f,', already has header')
        continue
    print('updating',f)
    with open(f, 'w') as modified: 
        modified.write(python_header + data)

for f in json_files:
    if any([jf in str(f) for jf in ['node_modules','dist','src']]):
        print('skipping',f)
        continue
    with open(f, 'r') as original: 
        data = original.read()
    if "This file is part of the PennAI library" in data:
        print('skipping',f,', already has header')
        continue
    print('updating',f)
    with open(f, 'w') as modified: 
        modified.write(json_header + data)

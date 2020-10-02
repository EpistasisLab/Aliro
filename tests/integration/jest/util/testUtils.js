/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - Michael Stauffer (stauffer@upenn.edu)
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

(Autogenerated header, do not modify)

*/

var os = require("os");


export const EXPECTED_MACHINE_ALGO_COUNT = 12; // number of algorithms registered with a machine instance
export const MIN_EXPECTED_LAB_ALGO_COUNT = 10; // min number of algorithms registered with in the server
export const MIN_EXPECTED_DATASET_COUNT = 5; // min number of datasets registered with the lab server, more may be added w. tests

export const DATASET_PATH = '/appsrc/data/datasets/test/integration'  // datasets for testing
export const NUM_AI_RECS = 1
//export const NUM_AI_RECS = os.environ['AI_NUMRECOMMEND']
export const JEST_TIMEOUT = 50000

// hacky delay
export const delay = (ms) => {
   ms += new Date().getTime();
   while (new Date() < ms){}
};

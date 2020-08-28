/* This file is part of the PennAI library.

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

*/
import moment from 'moment';
import twix from 'twix'; // eslint-disable-line no-unused-vars

export const formatDataset = (str) => {
  if (str !== undefined) {
    str = str.replace(/_/g, ' '); // remove underscore
    str = str.replace(/-/g, ' '); // remove dashes
    str = str.replace(/(^|\s)[a-z]/g, f => f.toUpperCase()); // uppercase each new word
  }
  return str;
};

export const formatAlgorithm = (str) => {
  if (str !== undefined) {
    // put spaces between capitalized words
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    str = str.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  }
  return str;
};

export const formatParam = (str) => {
  if (str !== undefined) {
    str = str.replace(/_/g, ' '); // remove underscore
    str = str.replace(/(^|\s)[a-z]/g, f => f.toUpperCase()); // uppercase each new word
  }
  return str;
};

export const formatTime = (time) => {
  return moment(time).format('M/DD/YY h:mm a');
};

export const formatDuration = (startTime, finishTime) => {
  let duration = moment(startTime).twix(finishTime).asDuration();
  return `${duration._data.hours}h ${duration._data.minutes}m ${duration._data.seconds}s`;
};

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

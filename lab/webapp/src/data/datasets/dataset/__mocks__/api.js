
export function toggleAI(datasetId, nextAIState) {
  return new Promise((resolve,reject) => {
    process.nextTick(() => {
      //resolve({uploadedID: 12345})
      datasetId === 12345
        ? resolve({uploadedID: datasetId})
        : reject({error: 'wrong id ' + datasetId + ' ,expected 12345'});
    })
  });
}

export function uploadDataset(datasetId, nextAIState) {
  return new Promise((resolve,reject) => {
    process.nextTick(() => {
      datasetId === 9876
        ? resolve({uploadedID: datasetId})
        : reject({error: 'wrong id ' + datasetId + ' ,expected 09876'});
    })
  });
}

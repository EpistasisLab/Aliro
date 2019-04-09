// mock api calls & data for testing

// use mock id as key, dataset info as value
const datasets = {
  1234321: {
    name: 'auto.csv',
    dependent_col : "class",
    categorical_features: "",
    ordinal_features: {}
  },
  7654321: {
    name: 'iris.csv',
    dependent_col : "class",
    categorical_features: "",
    ordinal_features: {}
  }
}

// hardcoded to return iris data
export function uploadFile(url) {
  return new Promise((resolve, reject) => {
    resolve(datasets[7654321]);
    // process.nextTick(() =>
    //   url
    //     ? resolve(datasets[7654321])
    //     : reject({ error: 'no url provided' })
    //   )
  })
}

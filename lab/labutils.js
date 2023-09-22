const db = require("./db").db;

async function getByIdHandler(collection, id) {
  try {
    const result = await collection.findByIdAsync(id);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function deleteByIdHandler(collection, id) {
  try {
    const result = await collection.removeByIdAsync(id);
    return (result === 1) ? { msg: 'success' } : { msg: 'error' };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getByFieldHandler(collection, field) {
  try {
    const result = await collection.find(field);
    return result.toArrayAsync();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteByFieldHandler(collection, field) {
  try {
    const result = await collection.removeAsync(field);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getExperimentsByDatasetId(datasetId) {
  try {
    const result = await db['experiments'].find({ _dataset_id: db.toObjectID(datasetId) });
    return result.toArrayAsync();
  } catch (err) {
    throw err;
  }
}

async function deleteFilesFromGridstore(files) {
  try {
    console.log('*** new delete from gridstore 1 ***')
    let filesP = [];

    for (let i = 0; i < files.length; i++) {
      let gfs = new db.GridStore(db, files[i]._id, 'w', {
        promiseLibrary: Promise
      });
      filesP.push(gfs.unlinkAsync());
    }

    await Promise.all(filesP);
    console.log('Promise.all files deleted');
    return { message: 'Files deleted' };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// async function deleteFilesFromGridstore(files) {
//   try {
//     let filesP = Array(files.length);

//     for (let i = 0; i < files.length; i++) {
//       let gfs = new db.GridStore(db, files[i]._id, 'w', {
//         promiseLibrary: Promise
//       });
//       filesP[i] = gfs.unlinkAsync();
//     }

//     Promise.all(filesP).then(() => {
//       console.log('Promise.all files deleted');
//       return { message: 'Files deleted' };
//     }).catch((err) => {
//       console.log(err);
//       throw err;
//     })
//   } catch (err) {
//     throw err;
//   }
// }

// async function deleteByIdHandler(req, res, next) {
//   req.collection.removeByIdAsync(req.params.id)
//   .then((result) => {
//     // Remove returns the count of affected objects
//     res.send((result === 1) ? {
//         msg: "success"
//     } : {
//         msg: "error"
//     });
//   })
//   .catch((err) => {
//     next(err);
//   });
// }

module.exports = {
  getByIdHandler,
  getByFieldHandler,
  deleteByIdHandler,
  deleteByFieldHandler,
  getExperimentsByDatasetId,
  deleteFilesFromGridstore
}
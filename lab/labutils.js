const db = require("./db").db;

async function deleteFilesFromGridstore(files) {
  try {
    let filesP = [];
    let filesDeleted = 0;

    for (let i = 0; i < files.length; i++) {
      let gfs = new db.GridStore(db, files[i]._id, 'w', {
        promiseLibrary: Promise
      });
      filesP.push(gfs.unlinkAsync().then(() => {
        filesDeleted++;
      }));
    }

    await Promise.all(filesP);
    return filesDeleted;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  deleteFilesFromGridstore
}
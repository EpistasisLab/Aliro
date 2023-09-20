const db = require("./db").db;

async function deleteByIdHandler(collection, id) {
  try {
    const result = await collection.removeByIdAsync(id);
    return (result === 1) ? { msg: 'success' } : { msg: 'error' };
  } catch (err) {
    throw err;
  }
}

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
  deleteByIdHandler
}
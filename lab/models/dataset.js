const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const metafeaturesSchema = new Schema({
  class_prob_max: Number,
  class_prob_mean: Number,
  class_prob_median: Number,
  class_prob_min: Number,
  class_prob_std: Number,
  corr_with_dependent_abs_25p: Number,
  corr_with_dependent_abs_75p: Number,
  corr_with_dependent_abs_kurtosis: Number,
  corr_with_dependent_abs_max: Number,
  corr_with_dependent_abs_mean: Number,
  corr_with_dependent_abs_median: Number,
  corr_with_dependent_abs_min: Number,
  corr_with_dependent_abs_skew: Number,
  corr_with_dependent_abs_std: Number,
  diversity_fraction: Number,
  entropy_dependent: Number,
  kurtosis_kurtosis: Number,
  kurtosis_max: Number,
  kurtosis_mean: Number,
  kurtosis_median: Number,
  kurtosis_min: Number,
  kurtosis_skew: Number,
  kurtosis_std: Number,
  _categorical_cols: String,
  _data_hash: String,
  _dependent_col: String,
  _id: mongoose.Schema.Types.ObjectId,
  _independent_cols: String,
  _metafeature_version: Number,
  _prediction_type: String,
  n_categorical: Number,
  n_classes: Number,
  n_columns: Number,
  n_numerical: Number,
  n_rows: Number,
  pca_fraction_95: Number,
  ratio_rowcol: Number,
  skew_kurtosis: Number,
  skew_max: Number,
  skew_mean: Number,
  skew_median: Number,
  skew_min: Number,
  skew_skew: Number,
  skew_std: Number,
  symbols_kurtosis: Number,
  symbols_max: Number,
  symbols_mean: Number,
  symbols_min: Number,
  symbols_skew: Number,
  symbols_std: Number,
  symbols_sum: Number,
});

const filesSchema = new Schema({
  filename: String,
  mimetype: String,
  prediction_type: String,
  dependent_col: String,
  categorical_features: [String],
  ordinal_features: String,
  timestamp: Number,
  version: Number
});

const datasetSchema = new Schema({
  name: String,
  username: String,
  metafeatures: metafeaturesSchema,
  files: [filesSchema]
});
    
module.exports = mongoose.model('Dataset', datasetSchema);

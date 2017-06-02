export const initialExperiments = [
	{
		 _id: 109283123,
		 status: 'suggested',
		 quality_metric: 0.9734,
		 notification: undefined, // if finished experiment has not been seen yet
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Random Forest',
		 params: {
			 n_estimators: 10,
			 max_features: 'sqrt',
			 min_impurity_split: 1e-9,
		 },
		 launched_by: 'user'
	},
	{
		 _id: 103283123,
		 status: 'suggested',
		 quality_metric: 0.83734,
		 notification: undefined, // if finished experiment has not been seen yet
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Random Forest',
		 params: {
			 n_estimators: 10,
			 max_features: 'sqrt',
			 min_impurity_split: 1e-9,
		 },
		 launched_by: 'user'
	},
	{
		 _id: 102283123,
		 status: 'suggested',
		 quality_metric: 0.86334,
		 notification: undefined, // if finished experiment has not been seen yet
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Random Forest',
		 params: {
			 n_estimators: 10,
			 max_features: 'sqrt',
			 min_impurity_split: 1e-9,
		 },
		 launched_by: 'user'
	},
	{
		 _id: 102283122,
		 status: 'pending',
		 notification: undefined, // if finished experiment has not been seen yet
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Random Forest',
		 params: {
			 n_estimators: 10,
			 max_features: 'sqrt',
			 min_impurity_split: 1e-9,
		 },
		 launched_by: 'user'
	},
	{
		 _id: 109283122,
		 status: 'pending',
		 notification: undefined,
		 accuracy_score: undefined,
		 dataset: 'Gametes',
		 algorithm: 'Random Forest',
		 params: {
			 n_estimators: 1000,
			 max_features: 'log2',
			 min_impurity_split: 1e-1
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283121,
		 status: 'running',
		 notification: undefined,
		 accuracy_score: undefined,
		 dataset: 'Gametes',
		 algorithm: 'Logistic Regression',
		 params: {
			 penalty: 'l1',
			 C: 0.5
		 },
		 launched_by: 'ai'
	 },
	 {
		 _id: 109283120,
		 status: 'running',
		 notification: undefined,
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Support Vector Machine',
		 params: {
			 C: 10,
			 kernal: 'linear',
			 degree: undefined,
			 test: 1
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283199,
		 status: 'running',
		 notification: undefined,
		 accuracy_score: undefined,
		 dataset: 'Thyroid',
		 algorithm: 'Decision Tree',
		 params: {
			 max_depth: 5,
			 min_impurity_split: 1e-3
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283128,
		 status: 'finished',
		 notification: 'new',
		 award: 'best_overall',
		 accuracy_score: 0.9734343,
		 dataset: 'Adults',
		 algorithm: 'k-Nearest Neighbors',
		 params: {
			 n_neighbors: 7,
			 weights: 'uniform',
			 p: 2
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283127,
		 status: 'cancelled',
		 notification: undefined,
		 accuracy_score: undefined,
		 dataset: 'Adults',
		 algorithm: 'k-Nearest Neighbors',
		 params: {
			 n_neighbors: 3,
			 weights: 'distance',
			 p: 1
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283126,
		 status: 'finished',
		 notification: 'new',
		 award: 'best_for_algorithm',
		 accuracy_score: 0.64437,
		 dataset: 'Adults',
		 algorithm: 'Logistic Regression',
		 params: {
			 penalty: 'l2',
			 C: 1
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283125,
		 status: 'finished',
		 notification: 'new',
		 accuracy_score: 0.53457,
		 dataset: 'Hepatitis',
		 algorithm: 'Gradient Boosting',
		 params: {
			 n_estimators: 100,
			 learning_rate: 1e-2,
			 max_depth: 7,
			 min_impurity_split: 1e-1,
			 subsample: 0.05,
			 max_features: 'log2'
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283165,
		 status: 'finished',
		 notification: 'new',
		 accuracy_score: 0.4335,
		 dataset: 'Hepatitis',
		 algorithm: 'Logistic Regression',
		 params: {
			 penalty: 'l2',
			 C: 1.0
		 },
		 launched_by: 'ai'
	 },
	 {
		 _id: 109283164,
		 status: 'failed',
		 notification: 'error',
		 accuracy_score: undefined,
		 dataset: 'Adults',
		 algorithm: 'Support Vector Machine',
		 params: {
			 C: 0.1,
			 kernal: 'poly',
			 degree: 3,
			 test: 8
		 },
		 launched_by: 'ai'
	 },
	 {
		 _id: 109283163,
		 status: 'finished',
		 notification: 'new',
		 accuracy_score: 0.9444,
		 dataset: 'Heart',
		 algorithm: 'Gradient Boosting',
		 params: {
			 n_estimators: 100,
			 learning_rate: 1.0,
			 max_depth: 'None',
			 min_impurity_split: 1e-5,
			 subsample: 0.75,
			 max_features: 'None'
		 },
		 launched_by: 'ai'
	 },
	 {
		 _id: 109283162,
		 status: 'finished',
		 notification: undefined,
		 accuracy_score: 0.3422,
		 dataset: 'Thyroid',
		 algorithm: 'Decision Tree',
		 params: {
			 max_depth: 3,
			 min_impurity_split: 1e-5
		 },
		 launched_by: 'user'
	 },
	 {
		 _id: 109283161,
		 status: 'finished',
		 notification: undefined,
		 accuracy_score: 0.8563,
		 dataset: 'Heart',
		 algorithm: 'Decision Tree',
		 params: {
			 max_depth: 3,
			 min_impurity_split: 1e-7
		 },
		 launched_by: 'ai'
	 },
	 {
		 _id: 109283113,
		 status: 'finished',
		 notification: undefined,
		 accuracy_score: 0.2331,
		 dataset: 'Heart',
		 algorithm: 'Gradient Boosting',
		 params: {
			 n_estimators: 100,
			 learning_rate: 1.0,
			 max_depth: 5,
			 min_impurity_split: 1e-5,
			 subsample: 0.75,
			 max_features: 'None'
		 },
		 launched_by: 'ai'
	 },
	  {
		 _id: 109283114,
		 status: 'finished',
		 notification: undefined,
		 accuracy_score: 0.2122,
		 dataset: 'Heart',
		 algorithm: 'Gradient Boosting',
		 params: {
			 n_estimators: 100,
			 learning_rate: 1.0,
			 max_depth: 'Test',
			 min_impurity_split: 1e-5,
			 subsample: 0.75,
			 max_features: 'None'
		 },
		 launched_by: 'ai'
	 }
];

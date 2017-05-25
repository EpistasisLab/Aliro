export const initialPreferences = {
	"_id":"58cacd9d74dc2899489a2816",
	"username":"testuser",
	"firstname":"Test",
	"lastname":"User",
	"Roles":["admin","beginner"],
	"Datasets":[{"name":"Gametes"},{"name":"Adults"},{"name":"Thyroid"},{"name":"Breast Cancer"},{"name":"Hypothyroid"},{"name":"Mushrooms"}],
	"Algorithms":[{
		"_id": "5817ad7f3821533540434948",
		"name": "Logistic Regression",
		"description": "Basic logistic regression that makes predictions about the outcome based on a linear combination of the features.",
		"params": {
			"penalty": { 
				"help": "Regularization type: 'l1' (Lasso) seeks to reduce the number of features included in the model; 'l2' (Ridge) seeks to reduce the size of the model coefficients for each feature.",
				"accepts": "string",
				"default": "l2",
				"ui": {
					"style": "radio",
					"choices": ["l1", "l2"]
				}
			},
			"C": {
				"help": "Regularization strength, where smaller values imply stronger regularization.",
				"accepts": "float",
				"default": 1.0,
				"ui": {
					"style": "radio",
					"choices":[1e-4,1e-3,1e-2,1e-1,0.5, 1.0, 10.0, 25.0]
				}
			}
		}
	}]
};
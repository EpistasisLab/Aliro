- sklearn.svm.LinearSVC
    - The combination of penalty='l2' and loss='hinge' are not supported when dual=False
    - The combination of penalty='l1' and loss='squared_hinge' are not supported when dual=True
    - The combination of penalty='l1' and loss='hinge' is not supported

- sklearn.svm.LinearSVR
    - The combination of dual=False and loss='epsilon_insensitive' are not supported

- sklearn.linear_model.LogisticRegression
    - The combination of penalty='l1' and dual=True is not supported

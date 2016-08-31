import os
from time import sleep
import argparse
import json
import math
import numpy as np
from mdr import MDR
import pandas as pd

# Generate MDR score function
def scoremdr(x, y):
    status_col_name='status'
    genetic_data = pd.read_csv('/share/devel/Gp/mdr/datasets/imputed.csv', sep='\t')
    features = genetic_data.drop(status_col_name, axis=1).values
    labels = genetic_data[status_col_name].values
    my_mdr = MDR(default_label=x, tie_break=y)
    my_mdr.fit(features, labels)
    score = my_mdr.score(features, labels)
    return score

if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser(description='Calculate the Branin-Hoo function.')
    parser.add_argument('--default-label', dest='x', type=float, default=None)
    parser.add_argument('--tie-break', dest='y', type=float, default=None)
    parser.add_argument('--_id', dest='_id', default=None)
    params = vars(parser.parse_args())

    # Evaluate function
    result = scoremdr(params['x'], params['y'])
    print('Result = %f' % result)

    # Save result
    _id = params['_id']
    if not os.path.exists(_id):
        os.makedirs(_id)
    with open(os.path.join(_id, 'value.json'), 'w') as outfile:
        json.dump({'_scores': {'value': result}}, outfile)


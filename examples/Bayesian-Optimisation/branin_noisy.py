import os
from time import sleep
import argparse
import json
import math
import numpy as np

# Noisy Branin-Hoo function
def branin(x, y):
    result = float(np.square(y - (5.1/(4*np.square(math.pi)))*np.square(x) + (5/math.pi)*x - 6) + 10*(1-(1./(8*math.pi)))*np.cos(x) + 10)
    noise = np.random.normal() * 50.
    sleep(np.random.randint(30)) # Sleep for maximum 1/2 minute
    return result + noise

if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser(description='Calculate the Branin-Hoo function.')
    parser.add_argument('--x', dest='x', type=float, default=None)
    parser.add_argument('--y', dest='y', type=float, default=None)
    parser.add_argument('--_id', dest='_id', default=None)
    params = vars(parser.parse_args())

    # Evaluate function
    result = branin(params['x'], params['y'])
    print 'Result = %f' % result

    # Save result
    _id = params['_id']
    if not os.path.exists(_id):
        os.makedirs(_id)
    with open(os.path.join(_id, 'value.json'), 'w') as outfile:
        json.dump({'_scores': {'value': result}}, outfile)

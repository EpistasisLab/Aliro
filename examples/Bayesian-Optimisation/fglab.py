import json
from time import sleep
from flask import Flask
from flask import request
import requests
app = Flask(__name__)

project_id = '<Project ID>' # e.g. '56297e87d1a19b9c0e21c70a'
fglab_url = '<FGLab URL>' # e.g. 'http://localhost:5080'
spearmint_helper_url = '<Spearmint helper URL>' # e.g. 'http://localhost:5000'

# Global for experiment result
exp_result = None

# Yields global experiment result when available
def yield_result():
    global exp_result
    # Wait for global experiment result
    while exp_result is None:
        sleep(1) # Sleep for 1s
    yield exp_result

# Shuts down server
def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

# Receives experiment completion information
@app.route('/webhook', methods=['POST'])
def webhook():
    global exp_result
    # Receive experiment finished notification
    finished = request.get_json()
    # Send a request for experiment results
    experiment = requests.get(fglab_url + "/api/experiments/" + finished['id'])
    # Set global experiment value
    exp_result = experiment.json()['_scores']['value']
    # Stop server 
    shutdown_server()

def main(job_id, params):
    print 'Job #%d' % job_id
    print params
    experiment_payload = {'x': params['x'][0], 'y': params['y'][0]}
    # Submit an experiment
    experiment = requests.post(fglab_url + "/api/experiments/submit", params = {'project': project_id}, json = experiment_payload)
    # Register a webhook
    webhook_payload = {'url': spearmint_helper_url + '/webhook', 'objects': 'experiments', 'id': experiment.json()['_id'], 'event': 'finished'}
    r = requests.post(fglab_url + "/api/webhooks/register", json = webhook_payload)
    # Start server
    app.run(host="0.0.0.0")
    # Yield experiment result (when available)
    return yield_result().next()

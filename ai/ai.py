"""
AI agent for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from dataset_describe import Dataset
from collections import OrderedDict
import json
import urllib
import requests
import pdb

class AI():
    """AI managing agent for Penn AI.



    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    Parameters
    ----------
    """

    def __init__(self,rec=Recommender()):
        self.rec = rec

    def check_requests(self):
        """Returns true if new AI request has been submitted by user."""

    def check_results(self):
        """Returns true if new results have been posted since the previous
        time step."""

    def get_new_results(self,timestamp=None):
        """Returns a dataframe of new results from the DB"""

    def send_rec(self):
        """Sends recommendation to the API."""

    def update(self):
        """Updates recommender based on new results."""
        # get new results
        new_data = self.get_new_results()
        self.rec.update(new_data)

    def save_state(self):
        """Save ML+P scores in pickle or to DB"""
        
######################################################## Manager
pennai = AI()
try:
    while True:
        if pennai.check_requests():
            pennai.send_rec()
        if pennai.check_results():
            pennai.update()

except (KeyboardInterrupt, SystemExit):
    print('Saving current AI state and closing....')

finally:
    pennai.save_state()

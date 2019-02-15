## AI Details

The AI system consists of an AI class that looks for new requests and results, and uses these to update an internal recommendation ssytem. It is built to be run from the command line as a module. The run command is `python -m ai.ai` from the root directory. Type `python -m ai.ai -h` to see options.

While the AI is running, it checks for new requests and results every 5 seconds.
When the user clicks on the AI button, the AI receives a request and returns `n_recs` recommendations.
Each recommendation consists of an ML method with associated parameter values, and for some recommenders, a score estimate.

Within the AI class is `self.rec`, which is the heart of the recommender system. 
Various recommenders are available in the `recommender/` folder. 
Each recommender implements an `update()` method that is called when new results are found, 
and a `recommend()` method that is called when new AI requests are receieved. 

The `LabAPI` class is a helper class that encapsulates all calls to the server. 

## Building your own recommender

To build your own recommender, start with the `recommender/base.py` file.
From there, implement `update()` and `recommend()` strategies. 
You can adjust the initialization as you wish, but be aware that you will have to handle these changes in the AI class.

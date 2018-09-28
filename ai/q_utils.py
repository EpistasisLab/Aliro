"""
Submission Queue functions for Penn-AI
"""

import queue
import threading
import time
import requests
exitFlag = 0


class DatasetThread (threading.Thread):
   """Thread for managing pending ml experiments for a particular dataset"""
   def __init__(self, ai, datasetId):
      threading.Thread.__init__(self)
      self.datasetId = datasetId
      self.name = ai.user_datasets[datasetId] # name of the dataset for the given datasetId
      self.workQueue = queue.Queue() # queue of experiment payloads
      self.queueLock = threading.Lock()
      self.ai = ai

   def run(self):
      print ("Creating queue for " + self.name)
      process_data(self)
      print ("Exiting queue for " + self.name)


def startQ(ai, datasetId):
  """Start a threaded queue for experiments for a particular dataset

  :param ai: ai.AI - instance of AI class
  :param datasetId: string - datasetId to start a queue for
  """
  if(datasetId in ai.dataset_threads):
        thread = ai.dataset_threads[datasetId]
  else:
        thread = DatasetThread(ai, datasetId)
        thread.start()
  ai.dataset_threads[datasetId] = thread
    

 
def addExperimentToQueue(ai, datasetId, experimentPayload):
  """Add ml experiment to the queue for a particular dataset

  :param ai: ai.AI - instance of AI class
  :param datasetId: string - datasetId to queue an experiment for
  :param experimentPayload: dict -  payload that describes the ml experiment
  """
  dataset_thread = ai.dataset_threads[datasetId]
  workQueue = dataset_thread.workQueue
  workQueue.put(experimentPayload); 


def process_data(dsThread):
   """Submit all experiments in this datasetThreads workQueue.  Return when the work queue is empty.

   :param dsThread: DatasetThread
   """
   while not exitFlag:
       dsThread.queueLock.acquire()
       workDone = False
       if not dsThread.workQueue.empty():
         workDone = True
         data = dsThread.workQueue.get()
         dsThread.ai.transfer_rec(data)
         if(dsThread.workQueue.qsize() % 10 == 0):
           print(str(dsThread.workQueue.qsize()) + ' Jobs in queue for ' + dsThread.name)
       #hacky way to know if the queue has just cleared
       if dsThread.workQueue.empty() and workDone:
        print(str(dsThread.workQueue.qsize()) + ' Jobs in queue for ' + dsThread.name + ', marking ai as finished.')
        dsThread.ai.labApi.set_ai_status(dsThread.datasetId, 'finished')
       dsThread.queueLock.release()
    
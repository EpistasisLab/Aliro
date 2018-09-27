"""
Submission Queue functions for Penn-AI
"""

import queue
import threading
import time
import requests
exitFlag = 0


class datasetThread (threading.Thread):
   def __init__(self, threadID, p):
      threading.Thread.__init__(self)
      self.threadID = threadID
      self.datasetId = threadID
      self.name = p.user_datasets[threadID]
      self.workQueue = queue.Queue()
      self.queueLock = threading.Lock()
      self.projects_path = p.projects_path
      self.header = p.header
      self.p = p;
   def run(self):
      print ("Creating queue for " + self.name)
      process_data(self)
      print ("Exiting queue for " + self.name)


#wrapper to keep users from starting more than one thread
def startQ(self,d):
    if(d in self.dataset_threads):
        thread = self.dataset_threads[d]
    else:
        thread = datasetThread(d,self)
        thread.start()
    self.dataset_threads[d] = thread;
    

def process_data(self):
   while not exitFlag:
       self.queueLock.acquire()
       workDone = False
       if not self.workQueue.empty():
         workDone = True
         data = self.workQueue.get()
         self.p.transfer_rec(data)
         if(self.workQueue.qsize() % 10 == 0):
           print(str(self.workQueue.qsize()) + ' Jobs in queue for ' + self.name)
       #hacky way to know if the queue has just cleared
       if self.workQueue.empty() and workDone:
        print(str(self.workQueue.qsize()) + ' Jobs in queue for ' + self.name + ', marking ai as finished.')
        self.p.labApi.set_ai_status(self.datasetId, 'finished')
       self.queueLock.release()

 
def addToQueue(self,r,rec_payload):
    dataset_thread = self.dataset_threads[r['_id']]
    workQueue = dataset_thread.workQueue
    workQueue.put(rec_payload); 
    



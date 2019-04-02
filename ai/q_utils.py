"""
Submission Queue functions for Penn-AI
"""

import queue
import threading
import time
import requests
import logging
import traceback
import sys

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

exitFlag = 0


class DatasetThread (threading.Thread):
    """Thread for managing pending ml experiments for a particular dataset"""
    def __init__(self, ai, datasetId):
        threading.Thread.__init__(self)
        self.datasetId = datasetId
        # name of the dataset for the given datasetId
        self.name = ai.user_datasets[datasetId]         
        self.workQueue = queue.Queue() # queue of experiment payloads
        self.queueLock = threading.Lock()
        self.ai = ai

        # Handle thread exceptions 
        # see <https://stackoverflow.com/questions/2829329/catch-a-threads-
        # exception-in-the-caller-thread-in-python>
        self.__threadExceptionBucket = queue.Queue()

    def run(self):
        """This overrides threading.Thread's run method, 
        and is invoked by start()"""
        logger.debug("Creating queue for thread " + self.name)
        try:
            process_data(self)
        except:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            logger.error("Exception caught in thread '" + self.name + "': " + 
                         str(exc_obj))
            logger.error(''.join(traceback.format_exception(exc_type, exc_obj, 
                                                            exc_tb))) 
        #see <https://docs.python.org/3/library/traceback.html#traceback-examples>
            self.__threadExceptionBucket.put(exc_obj)
        #raise #this will just terminate the thread; will not prop to the root thread
            logger.debug("Exiting queue for thread " + self.name)

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
    """Submit all experiments in this datasetThreads workQueue.  
    Return when the work queue is empty.

    :param dsThread: DatasetThread
    """
    logger.debug("process_data("+ str(dsThread) + ") exitFlag:" + str(exitFlag))

    while not exitFlag:
        dsThread.queueLock.acquire()
        workDone = False
        if not dsThread.workQueue.empty():
            workDone = True
            data = dsThread.workQueue.get()
            logger.debug("process_data("+ str(dsThread) + ") - transfer_rec")
            dsThread.ai.transfer_rec(data)
            if(dsThread.workQueue.qsize() % 10 == 0):
                print(str(dsThread.workQueue.qsize()) + ' Jobs in queue for ' + 
                      dsThread.name)
        #hacky way to know if the queue has just cleared
        if dsThread.workQueue.empty() and workDone:
            msg = (str(dsThread.workQueue.qsize()) + ' Jobs in queue for ' 
                      + dsThread.name)
            #logger.debug(msg)
            #print(msg)
            ##TODO: manage ai status with request manager
            #dsThread.ai.labApi.set_ai_status(dsThread.datasetId, 'finished')
        dsThread.queueLock.release()

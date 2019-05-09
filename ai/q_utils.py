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
    def __init__(self, ai, datasetId, datasetName):
        threading.Thread.__init__(self)
        self.datasetId = datasetId
        # name of the dataset for the given datasetId
        self.name = datasetName         
        self.workQueue = queue.Queue() # queue of experiment payloads
        self.queueLock = threading.Lock()
        self.ai = ai

        self.processingRequest = False # true if process_data() is actively processing a request

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

def startQ(ai, datasetId, datasetName):
    """Get or start a threaded queue for experiments for a 
    particular dataset.  Only one queue is created per dataset.

    :param ai: ai.AI - instance of AI class
    :param datasetId: string - datasetId for which to start a queue

    :returns: DatasetThread
    """
    if(datasetId in ai.dataset_threads):
        thread = ai.dataset_threads[datasetId]
    else:
        thread = DatasetThread(ai, datasetId, datasetName)
        thread.start()
    ai.dataset_threads[datasetId] = thread

    return thread
    
def addExperimentsToQueue(ai, datasetId, experimentPayloads):
    for payload in experimentPayloads:
        addExperimentToQueue(ai, datasetId, payload)

def addExperimentToQueue(ai, datasetId, experimentPayload):
    """Add ml experiment to the queue for a particular dataset

    :param ai: ai.AI - instance of AI class
    :param datasetId: string - datasetId to queue an experiment for
    :param experimentPayload: dict -  payload that describes the ml experiment
    """
    dataset_thread = ai.dataset_threads[datasetId]
    workQueue = dataset_thread.workQueue
    workQueue.put(experimentPayload)

def removeAllExperimentsFromQueue(ai, datasetId):
    datasetThread = ai.dataset_threads[datasetId]    
    workQueue = datasetThread.workQueue

    try:
        while True:
            workQueue.get_nowait()
    except queue.Empty:
        pass


def isQueueEmpty(ai, datasetId):
    dataset_thread = ai.dataset_threads[datasetId]
    return dataset_thread.workQueue.empty() and (dataset_thread.processingRequest == False)


def process_data(dsThread):
    """Loop to monitor and submit all experiments in the datasetThreads workQueue
    Exits only when exitFlag is true.

    Called by DatasetThread.run()  

    :param dsThread: DatasetThread
    """
    logger.debug("process_data("+ str(dsThread) + ") exitFlag:" + str(exitFlag))

    while not exitFlag:
        dsThread.queueLock.acquire()
        dsThread.processingRequest = False

        try:
            # if the queue is empty, a queue.Empty exception will be thrown
            # otherwise, set the processingRequest flag untill the active 
            # request is successfully sent
            data = dsThread.workQueue.get() 
            dsThread.processingRequest = True

            logger.debug("process_data("+ str(dsThread) + ") - transfer_rec")
            dsThread.ai.transfer_rec(data) # blocking
            if(dsThread.workQueue.qsize() % 10 == 0):
                logger.debug(str(dsThread.workQueue.qsize()) + ' Jobs in queue for ' + 
                      dsThread.name)

            dsThread.processingRequest = False

        except queue.Empty:
            pass

        finally:
            dsThread.queueLock.release()
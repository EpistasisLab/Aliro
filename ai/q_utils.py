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

        self.datasetId = datasetId # database id of the dataset
        self.name = datasetName # name of the dataset for the given datasetId      
        self.workQueue = queue.Queue() # queue of experiment payloads
        self.ai = ai # instance of an ai object

        self.processingRequest = False # true if process_data() is actively processing a request
        
        # multi-thread variables
        self._killActiveRequest = False # true if there was a request to kill all active requests.  
        self._karLock = threading.Lock() #lock for thread-safe access to to access to _killActiveRequest

        # Handle thread exceptions 
        # see <https://stackoverflow.com/questions/2829329/catch-a-threads-
        # exception-in-the-caller-thread-in-python>
        self.__threadExceptionBucket = queue.Queue()

    def run(self):
        """This overrides threading.Thread's run method, 
        and is invoked by start()"""
        logger.debug(f"Creating queue for thread {self.name}")

        while not exitFlag:
            try:
                logger.info(f"Starting loop for thread {self.name}")
                process_data(self)
            except:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                logger.error("=========================================================================")
                logger.error("=========================================================================")
                logger.error("=========================================================================")
                logger.error("=========================================================================")
                logger.error("=========================================================================")
                logger.error("Exception caught in thread '" + self.name + "': " + 
                             str(exc_obj))
                logger.error(''.join(traceback.format_exception(exc_type, exc_obj, 
                                                                exc_tb))) 
            #see <https://docs.python.org/3/library/traceback.html#traceback-examples>
                self.__threadExceptionBucket.put(exc_obj)


        logger.info(f"Exiting queue for thread {self.name}")


def startQ(ai, datasetId, datasetName):
    """Get or start a threaded queue for experiments for a 
    particular dataset.  Only one queue is created per dataset.

    :param ai: ai.AI - instance of AI class
    :param datasetId: string - datasetId for which to start a queue

    :returns: DatasetThread
    """
    if(datasetId in ai.dataset_threads):
        dsThread = ai.dataset_threads[datasetId]
    else:
        dsThread = DatasetThread(ai, datasetId, datasetName)
        dsThread.start()
    ai.dataset_threads[datasetId] = dsThread

    return dsThread
    
def addExperimentsToQueue(ai, datasetId, experimentPayloads):
    for payload in experimentPayloads:
        addExperimentToQueue(ai, datasetId, payload)

def addExperimentToQueue(ai, datasetId, experimentPayload):
    """Add ml experiment to the queue for a particular dataset

    :param ai: ai.AI - instance of AI class
    :param datasetId: string - datasetId to queue an experiment for
    :param experimentPayload: dict -  payload that describes the ml experiment
    """
    dsThread = ai.dataset_threads[datasetId]
    workQueue = dsThread.workQueue
    workQueue.put(experimentPayload)

def removeAllExperimentsFromQueue(ai, datasetId):
    dsThread = ai.dataset_threads[datasetId]    
    workQueue = dsThread.workQueue

    with dsThread._karLock:
        dsThread._killActiveRequest = True

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
        try:
            data = dsThread.workQueue.get(timeout=.1) #blocks until timeout

            try:
                dsThread.processingRequest = True
                logger.debug(f"==={dsThread.name} - Initilizing recommendation transfer")

                requestProcessed = False # True if the request was sent or a command to kill the active request was recieved
                while not(requestProcessed or exitFlag):

                    with dsThread._karLock:
                        if (dsThread._killActiveRequest): 
                            logger.debug(f"==={dsThread.name} - Terminating active recommendation transfer")
                            requestProcessed = True 
                            dsThread._killActiveRequest = False
                        else:
                            logger.debug(f"==={dsThread.name} - Successful recommendation transfer") 
                            requestProcessed = dsThread.ai.transfer_rec(data)

                    if not(requestProcessed): 
                        logger.debug(f"==={dsThread.name} - Waiting to resend recommendation")
                        time.sleep(2)


                if(dsThread.workQueue.qsize() % 10 == 0):
                    logger.debug(f"{dsThread.workQueue.qsize()} jobs in queue for {dsThread.name}")

            finally:
                dsThread.processingRequest = False
                

        except queue.Empty:
            pass   

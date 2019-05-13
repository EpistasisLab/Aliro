# Handles requests for the AI system.
import time
import ai.q_utils as q_utils
import logging
from enum import Enum, auto, unique
import ai.q_utils as q_utils

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)



@unique
class TerminalCondition(Enum):
    NUM_RECS = auto()   # generate a static number of recomendations
    TIME = auto()       # generate reccomendations for a set period of time
    CONTINUOUS = auto() # generate recomencations until the ai recommender is turned off by the user


class RequestManager:
    def __init__(self,
                ai,
                defaultTermConditionStr,
                defaultTermParam):
        self.ai = ai
        self.defaultTermParam = defaultTermParam

        if (defaultTermConditionStr == 'n_recs'):
            self.defaultTermCondition = TerminalCondition.NUM_RECS
        elif (defaultTermConditionStr == 'time'):
            self.defaultTermCondition = TerminalCondition.TIME
        elif (defaultTermConditionStr == 'continuous'):
            self.defaultTermCondition = TerminalCondition.CONTINUOUS
        else:
            msg = 'Unable to start RequestManager, unknown terminal condition: "' + str(defaultTermConditionStr) + '"'
            logger.error(msg)
            raise RuntimeError(msg)

        self.aiRequests = {} # dict of datasetId:aiRequest

        logger.info("initilized RequestManager.  defaultTermCondition:{}, defaultTermParam:{}".format(self.defaultTermCondition, self.defaultTermParam))


    def add_request(self, datasetId, datasetName):
        """ Add a new ai request for the given datasetId

        :param datasetId:
        """
        if(datasetId in self.aiRequests):
            req = self.aiRequests[datasetId]
        else:
            req = AiRequest(
                ai=self.ai,
                datasetId=datasetId,
                datasetName=datasetName)
            self.aiRequests[datasetId] = req


        req.new_request(
            termCondition=self.defaultTermCondition,
            termParam=self.defaultTermParam)


    def terminate_request(self, datasetId):
        """ Terminate requests for the given dataset id

        :param datasetId:
        """
        if (datasetId in self.aiRequests):
            req = self.aiRequests[datasetId]
            req.terminate_request()
        else:
            msg = 'Tried to terminate a dataset ai request before it had been initilized.  DatasetId: "' + str(datasetId) + '"'
            logger.info(msg)
            self.ai.labApi.set_ai_status(datasetId, 'finished')
        

    def process_requests(self):
        """ Process all active requests
        """
        for dataId, req in self.aiRequests.items():
            req.process_request()


    def shutdown(self):
        """ Terminate all requests and release all request threads
        """
        
        # release all datasetThreads
        q_utils.exitFlag = 1
        
        for dataId, req in self.aiRequests.items(): 
            req.terminate_request()



@unique
class AiState(Enum):
    INITILIZE = auto()
    WAIT_FOR_QUEUE_EMPTY = auto()
    ADD_RECOMMENDATIONS = auto()
    TERMINATE = auto()
    INACTIVE = auto()


class AiRequest:
    def __init__(self, 
                ai, 
                datasetId, 
                datasetName):

        self.ai = ai
        self.datasetId = datasetId
        self.datasetName = datasetName
        self.datasetThread = q_utils.startQ(
            ai=self.ai, 
            datasetId=datasetId, 
            datasetName=datasetName)

        self.defaultRecBatchSize = 5
        self.state = AiState.INACTIVE

        logger.info("AiRequest initilized ({},{})".format(self.datasetName, self.datasetId))


    def new_request(self, termCondition, termParam):
        logger.info("AiRequest new_request ({},{})".format(self.datasetName, self.datasetId))
        self.termCondition = termCondition
        self.termParam = termParam
        self.startTime = time.time()

        if termCondition == TerminalCondition.NUM_RECS:
            self.recBatchSize = self.termParam
        else:
            self.recBatchSize = self.defaultRecBatchSize

        self.state = AiState.INITILIZE


    def terminate_request(self, setServerAiState = True):
        # get rid of everything in the queue
        # set state to inactive
        ##logger.debug("=======")
        ##logger.debug("=======")
        ##logger.debug("=======")
        logger.info("AiRequest terminate_request ({},{})".format(self.datasetName, self.datasetId))
        logger.debug("queue size: {}".format(self.datasetThread.workQueue.qsize()))
        
        q_utils.removeAllExperimentsFromQueue(ai=self.ai,
                                    datasetId=self.datasetId)

        logger.debug("Removed experiments from queue, isQueueEmpty()={}".format(q_utils.isQueueEmpty(self.ai, self.datasetId)))
        logger.debug("queue size: {}".format(self.datasetThread.workQueue.qsize()))
        ##logger.debug("=======")
        ##logger.debug("=======")
        ##logger.debug("=======")

        if (setServerAiState):
            self.ai.labApi.set_ai_status(self.datasetId, 'finished')

        self.state = AiState.INACTIVE


    def process_request(self):
        if (self.state == AiState.INACTIVE):
            return

        # update state as per termination strategy
        self.update_state()

        if (self.state == AiState.TERMINATE):
            self.terminate_request(setServerAiState=True)

        elif (self.state == AiState.WAIT_FOR_QUEUE_EMPTY):
            return

        elif (self.state == AiState.ADD_RECOMMENDATIONS):
            logger.debug("AiRequest adding recs ({},{})".format(self.datasetName, self.datasetId))
            recs = self.ai.generate_recommendations(self.datasetId, 
                        self.recBatchSize)

            q_utils.addExperimentsToQueue(ai=self.ai, 
                                     datasetId=self.datasetId, 
                                     experimentPayloads=recs)
            self.state = AiState.WAIT_FOR_QUEUE_EMPTY


    def update_state(self):
        if self.state == AiState.INACTIVE:
            msg = 'Tried to run update_state() when state was INACTIVE.  DatasetId: "' + str(datasetId) + '"  DatasetName: "' + str(datasetName) + '"'
            logger.error(msg)
            raise RuntimeError(msg)

        # always start by adding recommendations
        if self.state == AiState.INITILIZE:
            self.state = AiState.ADD_RECOMMENDATIONS
            return


        ###########
        # terminal conditions that only run set number of experiments
        ###########
        if self.termCondition == TerminalCondition.NUM_RECS:
            if (q_utils.isQueueEmpty(self.ai, self.datasetId) == True):
                logger.debug("AiRequest NUM_RECS terminal cond reached ({},{})".format(self.datasetName, self.datasetId))
                self.state=AiState.TERMINATE
                return
            else:
                return

        ###########
        # terminal conditions that continue until a terminal condition met
        #
        #   if the terminal condition is met, exit immediately.
        #
        #   if the terminal condition is not met and the queue is
        #   empty, add experiments.
        #
        #   otherwise, wait and let the queue continue processing
        ###########
        if (self.termCondition == TerminalCondition.TIME and
                time.time() - self.startTime > self.termParam):
            logger.debug("AiRequest TIME terminal cond reached ({},{})".format(self.datasetName, self.datasetId))
            self.state=AiState.TERMINATE
            return

        # add experiments if the queue is empty
        if (q_utils.isQueueEmpty(self.ai, self.datasetId) == True):
            logger.debug("AiRequest refilling queue ({},{})".format(self.datasetName, self.datasetId))
            self.state=AiState.ADD_RECOMMENDATIONS
            return
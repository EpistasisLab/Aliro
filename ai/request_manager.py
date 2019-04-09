# Handles requests for the AI system.
import time
import ai.q_utils as q_utils
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class RequestManager():
    """Handles requests for the AI.

    Responsible for:
        - adding experiments to the queue
        - processing experiments in the queue
        - terminating the queue

    :param ai: the ai agent
    :param term_condition: 'n_recs' (n_recs,time): the type of termination condition
    :param term_value: 5 : the value of the termination condition. if term_condition
        is n_recs, value is 5. if time, value is 600 (seconds)
    """
    def __init__(self, ai, dataset_id, dataset_name,
                 term_condition='n_recs', term_value=None):
        self.active=True
        self.term_condition = term_condition
        if term_value:
            self.term_value = term_value
        elif self.term_condition == 'n_recs':
            self.term_value = 5
        elif self.term_condition == 'time':
            self.term_value = 600
        else:
            raise ValueError('Incorrect term_condition'
                    'specified:',self.term_condition)
        self.id = dataset_id
        self.name = dataset_name
        self.term_state = 'add experiment'
        self.t0 = time.time()
        self.ai = ai
        self.n_recs = ai.n_recs # this is the n_recs made by the recommender each
                             # iteration.
        q_utils.startQ(ai=self.ai, datasetId=dataset_id, datasetName=dataset_name)
        self.queue = self.ai.dataset_threads[dataset_id].workQueue
        logger.debug('term_condition:'+self.term_condition)
        logger.debug('term_value:'+str(self.term_value))

    def update(self):
        """Checks the state and performs actions"""
        if self.term_state == 'add experiment':
            #request an experiment to add to Q
            # or directly get experiment from AI
            logger.debug('adding exp to queue')
            self.update_term_state()
            return self.id
        elif self.term_condition=='n_recs' and self.term_state == 'process queue': 
            # if queue empty, set self.active to false
            logger.debug('processing queue')
            if self.queue.empty():
                logger.info('setting '+
                            self.name+' queue to inactive since q is empty')
                self.active=False
                msg = (str(self.queue.qsize()) + ' Jobs in queue for ' + self.name)
                logger.info(msg)
                
                logger.info('marking AI as finished for'+str(self.id))
                self.ai.labApi.set_ai_status(self.id, 'finished')
                #logger.debug(msg)
            self.update_term_state()
            return None
        elif self.term_state == 'terminate queue':
            logger.debug('term_state:'+self.term_state)
            #logger.debug(msg)
            # kill the Q, set self.active to false
            logger.info('terminating queue')
            self.active=False
            with self.queue.mutex: 
                self.queue.queue.clear()
            logger.info('marking AI as finished for'+str(self.id))
            self.ai.labApi.set_ai_status(self.id, 'finished')
            return None
        else:
            raise ValueError('invalid term_state:'+self.term_state)
        
        self.update_term_state()
        return None

    def update_term_state(self):
        """Check termination conditions and adjust as necessary"""
        if self.term_condition == 'n_recs':
            if self.term_state == 'add experiment':
                self.term_value -= self.n_recs
                logger.debug('term_value:'+str(self.term_value))
                if self.term_value == 0:
                    logger.info('changing term_state to "process_queue"')
                    self.term_state = 'process queue'
        else:   #assume termination condition is time
            runtime = time.time() - self.t0
            logger.debug('current runtime:'+str(runtime))
            logger.debug('self.term_value:'+str(self.term_value))
            if self.term_value < runtime:
                logger.info('times up, setting term_state to terminate')
                self.term_state = 'terminate queue'

    def addExp(self,rec_payload):
        # adds experiment to queue
        q_utils.addExperimentToQueue(ai=self.ai, 
                                     datasetId=self.id, 
                                     experimentPayload=rec_payload)
        self.ai.labApi.set_ai_status(datasetId = self.id, aiStatus = 'queuing')

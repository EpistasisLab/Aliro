import os
from api_utils import get_all_ml_p_from_db

result = get_all_ml_p_from_db(os.environ['FGLAB_URL']+'/api/projects',os.environ['APIKEY'])

print('result: ', result)

from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals
import ai.metalearning.get_metafeatures as mf

package_directory = os.path.dirname(os.path.abspath(__file__))
 
class Dataset_Describe(unittest.TestCase):

	def setUp(self):
        irisPath = os.path.join(package_directory, 'iris.csv')

    def generate_metafeatures_from_filepath():
    	result = mf.generate_metafeatures_from_file(irisPath, 'Name')
    	print result

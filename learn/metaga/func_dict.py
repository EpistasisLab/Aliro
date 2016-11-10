


from sr_deapgp import SymbReg, SymbReg_Best_GP_Individual
from even_parity import EvenParity, EvenParity_Best_GP_Individual
from submit import launch_lowerGP

func_dict={'SymbReg':SymbReg,
            'EvenParty': EvenParity}


"""
fitness_dict={'SymbReg':SymbReg_Best_GP_Individual,
            'EvenParty': EvenParity_Best_GP_Individual}
"""

fitness_dict={'SymbReg': launch_lowerGP,
            'EvenParty': EvenParity_Best_GP_Individual}

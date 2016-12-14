


from sr_deapgp import SymbReg, SymbReg_Best_GP_Individual
from even_parity import EvenParity, EvenParity_Best_GP_Individual
from submit import  SymbReg_FGlab_submit

func_dict={'SymbReg':SymbReg,
            'EvenParty': EvenParity}



fitness_dict={'SymbReg':SymbReg_Best_GP_Individual,
            'EvenParty': EvenParity_Best_GP_Individual}


fitness_dict_FGlab={'SymbReg': SymbReg_FGlab_submit,
            'EvenParty': EvenParity_Best_GP_Individual}

fitness_rule_dict_FGlab={'SymbReg': 'FitnessMin',
            'EvenParty': 'FitnessMax'}

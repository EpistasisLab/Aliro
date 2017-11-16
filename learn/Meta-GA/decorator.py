#    This file is a part of metaGA.
#    This file is the decorator

from functools import wraps


def Mut_Ranges(func):
    """Decorator that wraps functions for mutFlipBit

    Parameters
    ----------
    func: function
        The function being decorated

    Returns
    -------
    wrapped_func: function
        A wrapper function around the func parameter
    """
    @wraps(func)
    def wrapped_func(individual, indpb, args_range):
        """
        Perform a replacement mutation on Argumnet in an individual
        Make sure the mutated in the ranges of arguments
        Parameters
        ----------
        individual: DEAP individual
            A list of arguments
        args_range:
            A list of arguments' ranges
        indpb:
            Independent probability for each attribute to be flipped.
        Returns
        ----------
            Returns the individual with one of the mutations applied to it
        """
        Need_Mutation = True
        while Need_Mutation:
            print(individual)
            individual_new = func(individual, indpb=indpb)
            ind_new_list = list(individual_new)
            Need_Mutation = False
            for arg, arg_rg in zip(ind_new_list, args_range):
                if arg > arg_rg[1] or arg < arg_rg[0]:
                    print('Someting Wrong')
                    print(individual, individual_new)
                    Need_Mutation = True
        print(individual_new)
        return individual_new
    return wrapped_func

#    This file is a part of metaGA.
#
import numpy as np
from sr_deapgp import SymbReg
#from decorator import Mut_Ranges
from deap import base
from deap import creator
from deap import tools
from deap import algorithms

def metaga(func, args_type, args_range, meta_gen = 10 , meta_pop_size = 100):

    def argu_gen(args_type, args_range, spec = False):
        """
        This is a random arguments genrator
        #population_size,generations,crossover_rate,mutation_rate,tournsize for this example

        Parameters
        ----------
            args_type: a list of arguments' types
            args_range: a list of arguments' ranges
            spec: return control

        Return
        ----------
            return *args is spec = False
            return one argument is spec > 0
        """
        if not spec:
            # return a tuple
            args_list = []
            for atype, arange in zip(args_type, args_range):
                if atype == "int":
                    args_list.append(np.random.randint(arange[0], arange[1]+1))
                elif atype == 'float':
                    args_list.append(arange[0]+ np.random.random() * (arange[1]-arange[0]))
                elif atype == "bool":
                    args_list.append(bool(np.random.randint(0, 2)))
            return tuple(args_list)
        else:
            # return one arg
            arg = None
            atype = args_type[spec - 1]
            arange = args_range[spec - 1]
            if atype == "int":
                arg = np.random.randint(arange[0], arange[1]+1)
            elif atype == 'float':
                arg = arange[0]+ np.random.random() * (arange[1]-arange[0])
            elif atype == "bool":
                arg = bool(np.random.randint(0, 2))
            return arg


    ### This step need to FGlab to submit to differnt machines
    def Best_GP_Individual(individual):
        """
        Lower level GP
        As one individual in metaga
        Parameters
        ----------
        individual: DEAP individual
            A list of arguments

        """

        arg = tuple(individual)
        pop, log, hof2, df, dfh = func(*arg)
        return (hof2.keys[0].values[0]),

    def mut_args(individual, indpb, args_type, args_range):
        """
        Perform a replacement mutation on Argumnet in an individual
        Make sure the mutated in the ranges of arguments
        Each argument is independent for mutation
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
        def if_mut(pb):
            if np.random.random() < pb:
                return True
            else:
                return False
        tmp_ind = individual
        for arg_idx in range(len(tmp_ind)):
            if if_mut(indpb):
                tmp_ind[arg_idx] = argu_gen(args_type, args_range, spec = arg_idx + 1)
        return tmp_ind,



    creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMin)

    toolbox = base.Toolbox()

    # need submit this to differnt machines
    # LowerGpIndividual is for generate one individual

    toolbox.register("args_gen", argu_gen, args_type, args_range)
    #toolbox.register("lower_gp", random.randint, 0, 1)

    # Structure initializers
    #                         define 'individual' to be an individual
    #                         consisting of 100 'attr_bool' elements ('genes')

    toolbox.register("individual", tools.initIterate, creator.Individual,
        toolbox.args_gen)

    # define the population to be a list of individuals
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    # the goal ('fitness') function to return the best run's fitness

    #----------
    # Operator registration
    #----------
    # register the goal / fitness function
    toolbox.register("evaluate", Best_GP_Individual)

    # register the crossover operator in order
    toolbox.register("mate", tools.cxTwoPoint)

    # register a mutation operator with a probability to


    toolbox.register("mutate", mut_args, indpb = 0.05, args_type = args_type,  args_range= args_range)

    # operator for selecting individuals for breeding the next
    # generation: each individual of the current generation
    # is replaced by the 'fittest' (best) of three individuals
    # drawn randomly from the current generation.
    toolbox.register("select", tools.selTournament, tournsize=3)

    #----------

    np.random.seed(64)  # random seed in magaga

    # create an initial population of 300 individuals (where
    # each individual is a list of integers)
    pop = toolbox.population(n=meta_pop_size)

    # CXPB  is the probability with which two individuals
    #       are crossed
    #
    # MUTPB is the probability for mutating an individual
    #
    # NGEN  is the number of generations for which the
    #       evolution runs
    CXPB, MUTPB = 0.5, 0.2
    NGEN = meta_gen

    print("Start of MetaGA")
    meta_hof = tools.HallOfFame(1)
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("std", np.std)
    stats.register("min", np.min)
    stats.register("max", np.max)
    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=CXPB, mutpb=MUTPB, ngen=NGEN,
                               stats=stats, halloffame=meta_hof, verbose=True)
    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))



if __name__ == "__main__":
    ## need meta_agument here
    ## meta_gen
    ## meta_pop_size
    # need get arguments type and arguments ranges from FGlab optimization page
    #argu_list = [population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
    args_type = ["int", "int", "float", "float", "int"]
    args_range = [[10, 300], [5,100], [0.0, 1.0], [0.0, 1.0], [2, 5]]

    metaga(SymbReg, args_type, args_range, 10, 20)

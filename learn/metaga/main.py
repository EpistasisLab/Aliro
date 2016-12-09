#    This file is a part of metaGA.
#
import numpy as np
import time
import os
import argparse
from func_dict import fitness_rule_dict_FGlab
from utils_lib.io_utils import Experiment, get_input_file
from .submit_utils import FGlab_submit


from deap import base
from deap import creator
from deap import tools
from deap import algorithms
from multiprocessing import Pool
import urllib3
import pycurl

## folder for tmp file and intermediate file
basedir='/share/devel/Gp/learn/metaga/'
tmpdir=basedir+'tmp/'
http = urllib3.PoolManager()


def metaga(fitness_func, fitness_rule, args_list, args_type, args_range, input_file = None,
            args_mut_type= None, meta_gen = 10 , meta_pop_size = 100,
            cross_rt = 0.5, mut_rt = 0.4, tourn_size = 3,
            random_state = 99, outlog = None):
    """
    need add some details about arguments
    """
    def argu_gen(args_type, args_range, spec = False, args_mut_type = None, old_arg = None):
        """
        This is a random arguments genrator
        #population_size,generations,crossover_rate,mutation_rate,tournsize for this example

        Parameters
        ----------
            args_type: a list of arguments' types
            args_range: a list of arguments' ranges
            spec: return control args_mut_type: mutation control (need work with 'spec') string type random: randomly generate a new argument (default) increase: randomly generate a new larger than old one (need work with old_arg) decrease: randomly generate a new lower than old one (need work with old_arg) old_arg: old argument Return ---------- return *args is spec = False
            return one argument is spec > 0
        """


        if not spec:
            # return a tuple
            args_set = []
            for atype, arange in zip(args_type, args_range):
                tmp_arg = np.random.choice(arange)
                try:
                    tmp_arg = eval('{}({})'.format(atype, tmp_arg))
                except:
                    tmp_arg = str(tmp_arg)
                args_set.append(tmp_arg)
            return tuple(args_set)
        else:
            # return one arg
            tmpidx = spec - 1
            atype = args_type[tmpidx]
            arange = args_range[tmpidx]
            amuttype = args_mut_type[tmpidx]
            if amuttype == "increase":
                arange = [i for i in arange if i < eval('{}({})'.format(atype, old_arg))]
            elif amuttype == 'decrease':
                arange = [i for i in arange if i > eval('{}({})'.format(atype, old_arg))]
            tmp_arg = np.random.choice(arange)
            try:
                tmp_arg = eval('{}({})'.format(atype, tmp_arg))
            except:
                tmp_arg = str(tmp_arg)
            return tmp_arg
    # Ephe_Cont_Name generater
    # to avoid repeat name

    def mut_args(individual, indpb, args_type, args_range, args_mut_type):
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
                tmp_ind[arg_idx] = argu_gen(args_type, args_range,
                                            spec = arg_idx + 1,
                                            args_mut_type = args_mut_type,
                                            old_arg=tmp_ind[arg_idx])
        return tmp_ind,

    def mut_args_one_point(individual, args_type, args_range, args_mut_type):
        """
        Perform a replacement mutation on Argumnet in an individual
        Make sure the mutated in the ranges of arguments
        Only one argument can  mutate
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
        tmp_ind = individual
        arg_mut_idx = np.random.randint(0, len(tmp_ind))
        tmp_ind[arg_mut_idx] = argu_gen(args_type, args_range,
                                        spec = arg_mut_idx+1,
                                        args_mut_type = args_mut_type,
                                        old_arg=tmp_ind[arg_mut_idx])
        return tmp_ind,


    if fitness_rule == 'FitnessMin':
        creator.create("GoodFitness", base.Fitness, weights=(-1.0, ))
    elif fitness_rule == 'FitnessMax':
        creator.create("GoodFitness", base.Fitness, weights=(1.0, ))
    else:
        raise ValueError('invalid input in fitness_rule')
    creator.create("Individual", list, fitness=creator.GoodFitness)

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
    # Need distribute to FGlab machine
    toolbox.register("evaluate", fitness_func, Chosen_ML_algorithms = algorithms, input_file = input_file)

    # register the crossover operator in order
    toolbox.register("mate", tools.cxTwoPoint)

    # register a mutation operator with a probability to


    #toolbox.register("mutate", mut_args, indpb = 0.8, args_type = args_type,  args_range= args_range, args_mut_type= args_mut_type)
    toolbox.register("mutate", mut_args_one_point, args_type = args_type,
                        args_range= args_range, args_mut_type= args_mut_type)

    # operator for selecting individuals for breeding the next
    # generation: each individual of the current generation
    # is replaced by the 'fittest' (best) of three individuals
    # drawn randomly from the current generation.
    toolbox.register("select", tools.selTournament, tournsize=tourn_size)


    #----------

    np.random.seed(random_state)  # random seed in magaga

    # create an initial population of meta_pop_size individuals (where
    # each individual is a list of parameters)
    pop = toolbox.population(n=meta_pop_size)

    # CXPB  is the probability with which two individuals
    #       are crossed
    #
    # MUTPB is the probability for mutating an individual
    #
    # NGEN  is the number of generations for which the
    #       evolution runs
    CXPB, MUTPB = cross_rt, mut_rt
    NGEN = meta_gen

    print("Start of Meta-GA")
        # Begin the evolution
    # Need to more curemazie

    if outlog:
        outf = open(outlog, 'w')
        # header of log table
        outf.write('#gen\tneval\tfitness_avg\tfitness_std\tfitness_max\tfitness_min')
        outf.write('\ttime_usage')
        for arg in args_list:
            outf.write('\tbest_ind_{}'.format(args_list))
        outf.write('\n')


    for gen in range(0, NGEN+1):
        time_start = time.time()
        print("-- Generation %i --" % gen)
        if gen == 0:
            # Evaluate the entire population
            pop, fitnesses = toolbox.evaluate(pop)
            for ind, fit in zip(pop, fitnesses):
                ind.fitness.values = tuple([fit,])
            offspring = pop
            neval = len(offspring)
            print("  Evaluated %i individuals" % neval)
        else:
        # Select the next generation individuals
            offspring = toolbox.select(pop, len(pop))
            # Clone the selected individuals
            offspring = list(map(toolbox.clone, offspring))

            # Apply crossover and mutation on the offspring
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if child1 == child2:
                    continue # skip the twins
                # cross two individuals with probability CXPB
                if np.random.random() < CXPB:
                    toolbox.mate(child1, child2)

                    # fitness values of the children
                    # must be recalculated later
                    del child1.fitness.values
                    del child2.fitness.values

            for mutant in offspring:

                # mutate an individual with probability MUTPB
                if np.random.random() < MUTPB:
                    toolbox.mutate(mutant)
                    del mutant.fitness.values

            # Evaluate the individuals with an invalid fitness
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            ## sumbit a list of ind
            pop, fitnesses = toolbox.evaluate(invalid_ind)

            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = tuple([fit,])
            neval = len(invalid_ind)
            print("  Evaluated %i individuals" % neval)

        # The population is entirely replaced by the offspring
        pop[:] = offspring

        # Gather all the fitnesses in one list and print the stats
        fits = [ind.fitness.values[0] for ind in pop]
        time_used = time.time() - time_start
        # best_ind in each genelation
        best_ind = tools.selBest(pop, 1)[0]
        print("Best individual is %s, %s " % (best_ind, best_ind.fitness.values))
        print("Fitness:")
        fits_arg = np.mean(fits)
        fits_std = np.std(fits)
        fits_max = np.max(fits)
        fits_min = np.min(fits)
        print("  Avg %s" % fits_arg)
        print("  Std %s" % fits_std)
        print("  Max %s" % fits_max)
        print("  Min %s" % fits_min)

        print("Time_usage: %s " % time_used)

        if outlog:
            outf.write('{:d}\t{:d}\t'.format(gen, neval))
            outf.write('{:f}\t{:f}\t{:f}\t{:f}'.format(fits_arg, fits_std, fits_max, fits_min))
            outf.write('\t{:f}'.format(time_used))
            #population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
            for best_arg, atype in zip(best_ind, args_type):
                if atype == "int":
                    outf.write('\t{:d}'.format(int(best_arg)))
                elif atype =="float":
                    outf.write('\t{:f}'.format(float(best_arg)))
                else:
                    outf.write('\t{}'.format(best_arg))
            outf.write('\n')
            # output every meta generation
            outf.close()
            outf = open(outlog, 'a')


    print("-- End of Meta-GA")

    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))



if __name__ == "__main__":

    exp_metaga = Experiment('Meta-GA')
    args, input_file = exp_metaga.get_input()

    # output log
    outlogfile = params['log']
    if outlogfile:
        outlogfile = tmpdir + _id + '/'+ str(outlogfile)

    exp = Experiment(args['algorithms'])
    args_list = exp.get_args_list()
    args_type, args_range = exp.get_args_profile()
    num_args = len(args_list) # beta version is all random mutation
    args_mut_type = ['random'] * num_args
    # get function for metaga
    fitness_func = FGlab_submit
    try:
        fitness_rule = fitness_rule_dict_FGlab[Chosen_ML]
    except KeyError:
        raise ValueError('invalid input in problem')

    print(args_range)
    metaga(fitness_func, fitness_rule, args_list, args_type, input_file = input_file,
            args_range = args_range, args_mut_type = args_mut_type,
            meta_gen = meta_gen, meta_pop_size = meta_pop_size,
            meta_cross_rt = meta_cross_rt, meta_mut_rt = meta_mut_rt,
            meta_tourn_size = meta_tourn_size, random_state = random_state, outlog = outlogfile)

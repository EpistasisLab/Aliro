#    This file is based on a example of DEAP.
#
#    DEAP is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as
#    published by the Free Software Foundation, either version 3 of
#    the License, or (at your option) any later version.


#    example which maximizes the sum of a list of integers
#    each of which can be 0 or 1
import numpy as np
from sr_deapgp import SymbReg
from deap import base
from deap import creator
from deap import tools
from deap import algorithms

def metaga(func, args_type, args_range, meta_gen, meta_pop_size):

    def argu_gen(args_type, args_range):
        """
        random arguments genrator
        population_size,generations,crossover_rate,mutation_rate,tournsize
        return *args
        """
        args_list = []
        for atype, arange in zip(args_type, args_range):
            if atype == "int":
                args_list.append(np.random.randint(arange[0], arange[1]))
            elif atype == 'float':
                args_list.append(arange[0]+ np.random.random() * (arange[1]-arange[0]))
        return tuple(args_list)


    creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMin)

    toolbox = base.Toolbox()

    # need submit this to differnt machines
    # LowerGpIndividual is for generate one individual
    def LowerGpIndividual( args_type, args_range):
        """
        Lower level GP
        As one individual in metaga
        """
        argu = argu_gen(args_type, args_range)
        pop, log, hof, df, dfh = func(*argu)
        print(hof.keys[0].values[0])
        return hof.keys[0].values[0]

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

    def Best_GP_Individual(individual):
        """
        Lower level GP
        As one individual in metaga
        """
        fitness_list = []
        for arg in individual:
            pop, log, hof, df, dfh = func(*arg)
            print(arg,hof.keys[0].values[0])
            fitness_list.append(hof.keys[0].values[0])
        return min(fitness_list),

    #----------
    # Operator registration
    #----------
    # register the goal / fitness function
    toolbox.register("evaluate", Best_GP_Individual)

    # register the crossover operator
    toolbox.register("mate", tools.cxTwoPoint)

    # register a mutation operator with a probability to
    # flip each attribute/gene of 0.05
    toolbox.register("mutate", tools.mutFlipBit, indpb=0.05)

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

    print("Start of evolution")
    hof = tools.HallOfFame(1)
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("std", np.std)
    stats.register("min", np.min)
    stats.register("max", np.max)

    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=NGEN,
                                   stats=stats, halloffame=hof, verbose=True)
    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))

    """# Evaluate the entire population
    fitnesses = list(map(toolbox.evaluate, pop))
    for ind, fit in zip(pop, fitnesses):
        print(fit)
        ind.fitness.values = fit

    print("  Evaluated %i individuals" % len(pop))

    # Begin the evolution
    for g in range(NGEN):
        print("-- Generation %i --" % g)

        # Select the next generation individuals
        offspring = toolbox.select(pop, len(pop))
        # Clone the selected individuals
        offspring = list(map(toolbox.clone, offspring))

        # Apply crossover and mutation on the offspring
        for child1, child2 in zip(offspring[::2], offspring[1::2]):

            # cross two individuals with probability CXPB
            if random.random() < CXPB:
                toolbox.mate(child1, child2)

                # fitness values of the children
                # must be recalculated later
                del child1.fitness.values
                del child2.fitness.values

        for mutant in offspring:

            # mutate an individual with probability MUTPB
            if random.random() < MUTPB:
                toolbox.mutate(mutant)
                del mutant.fitness.values

        # Evaluate the individuals with an invalid fitness
        invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = map(toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit

        print("  Evaluated %i individuals" % len(invalid_ind))

        # The population is entirely replaced by the offspring
        pop[:] = offspring

        # Gather all the fitnesses in one list and print the stats
        fits = [ind.fitness.values[0] for ind in pop]

        length = len(pop)
        mean = sum(fits) / length
        sum2 = sum(x*x for x in fits)
        std = abs(sum2 / length - mean**2)**0.5

        print("  Min %s" % min(fits))
        print("  Max %s" % max(fits))
        print("  Avg %s" % mean)
        print("  Std %s" % std)

    print("-- End of (successful) evolution --")

    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))"""

if __name__ == "__main__":

    # need get from FGlab optimization page
    #argu_list = [population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
    args_type = ["int", "int", "float", "float", "int"]
    args_range = [[10, 500], [5,100], [0.0, 1.0], [0.0, 1.0], [1, 4]]

    metaga(SymbReg, args_type, args_range, 10, 10)

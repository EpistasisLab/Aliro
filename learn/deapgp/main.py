#    This file is based on a example of DEAP.
#
#    DEAP is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as
#    published by the Free Software Foundation, either version 3 of
#    the License, or (at your option) any later version.

import operator
import math
#import random
import json
import argparse
import pycurl
import os
import sys
import numpy
import urllib3
import pandas as pd
from deap import algorithms
from deap import base
from deap import creator
from deap import tools
from deap import gp

basedir='/share/devel/Gp/learn/deapgp/'
tmpdir=basedir+'tmp/'
http = urllib3.PoolManager()

# will eventually do this in the correct way -- install a library/package
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import Experiment


# Define new functions
def protectedDiv(left, right):
    try:
        return left / right
    except ZeroDivisionError:
        return 1

# max 1000 generations and 10000 individual
Ep_List = range((1000+1)*10000)

def SymbReg(population_size,generations,crossover_rate,mutation_rate,tournsize, random_state= 42, Ephe_Cont_Name = 'rand101'):
    numpy.random.seed(random_state)
    pset = gp.PrimitiveSet("MAIN", 1)
    pset.addPrimitive(operator.add, 2)
    pset.addPrimitive(operator.sub, 2)
    pset.addPrimitive(operator.mul, 2)
    pset.addPrimitive(protectedDiv, 2)
    pset.addPrimitive(operator.neg, 1)
    pset.addPrimitive(math.cos, 1)
    pset.addPrimitive(math.sin, 1)
    # generations of different Ephemeral construction name
    pset.addEphemeralConstant(Ephe_Cont_Name, lambda: numpy.random.randint(-1,2))
    pset.renameArguments(ARG0='x')

    creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
    creator.create("Individual", gp.PrimitiveTree, fitness=creator.FitnessMin)

    toolbox = base.Toolbox()
    toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=1, max_=2)
    toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.expr)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("compile", gp.compile, pset=pset)

    def evalSymbReg(individual, points):
        # Transform the tree expression in a callable function
        func = toolbox.compile(expr=individual)
        # Evaluate the mean squared error between the expression
        # and the real function : x**4 + x**3 + x**2 + x
        sqerrors = ((func(x) - x**4 - x**3 - x**2 - x)**2 for x in points)
        return math.fsum(sqerrors) / len(points),

    toolbox.register("evaluate", evalSymbReg, points=[x/10. for x in range(-10,10)])
    toolbox.register("select", tools.selTournament, tournsize=tournsize) # tournsize arguments
    toolbox.register("mate", gp.cxOnePoint)
    toolbox.register("expr_mut", gp.genFull, min_=0, max_=2)
    toolbox.register("mutate", gp.mutUniform, expr=toolbox.expr_mut, pset=pset)

    toolbox.decorate("mate", gp.staticLimit(key=operator.attrgetter("height"), max_value=17))
    toolbox.decorate("mutate", gp.staticLimit(key=operator.attrgetter("height"), max_value=17))


    pop = toolbox.population(n=population_size) # population_size arguments
    hof = tools.HallOfFame(1)

    stats_fit = tools.Statistics(lambda ind: ind.fitness.values)
    stats_size = tools.Statistics(len)
    mstats = tools.MultiStatistics(fitness=stats_fit, size=stats_size)
    mstats.register("avg", numpy.mean)
    mstats.register("std", numpy.std)
    mstats.register("min", numpy.min)
    mstats.register("max", numpy.max)

    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=crossover_rate,
    mutpb=mutation_rate, ngen=generations, stats=mstats, halloffame=hof, verbose=False) # crossover_rate, mutation_rate, generations
    stats_table = []
    statslist = ["avg", "max", "min", "std"]
    statsterm = ["fitness","size"]
    # make header
    stats_table_header = []
    stats_table_header.append('gen')
    stats_table_header.append('nevals')
    for j in range(len(statsterm)):
        for p in range(len(statslist)):
            stats_table_header.append(statsterm[j]+'_'+statslist[p])
    for i in range(generations+1):
        stats_table.append([log[i]['gen'],log[i]['nevals']])
        for j in range(len(statsterm)):
            for p in range(len(statslist)):
                stats_table[i].append(log.chapters[statsterm[j]].select(statslist[p])[i])
    df = pd.DataFrame(stats_table)
    return pop, log, hof, df, stats_table_header

### This step need to FGlab to submit to differnt machines
### submit jobs via FGlab and restore results in db
### for LPC not use for FGlab
def SymbReg_Best_GP_Individual(individual):
    """
    Lower level GP
    As one individual in metaga
    Parameters
    ----------
    individual: DEAP individual
        A list of arguments

    """
    global Ep_List
    arg = tuple(individual)
    pop, log, hof2, df, dfh = SymbReg(*arg, Ephe_Cont_Name='rand_' + str(Ep_List[0]))
    Ep_List = Ep_List[1:] # removed used names
    best_ind = tools.selBest(pop, 1)[0]
    return (best_ind.fitness.values[0]),

if __name__ == "__main__":
    exp = Experiment('deapGP')
    args, input_file = exp.get_input()

    pop, log, hof, df, dfh=SymbReg(population_size=args['population_size'],
    generations=args['generations'],
    crossover_rate=args['crossover_rate'],
    mutation_rate=args['mutation_rate'],
    tournsize=args['tourn_size'],
    random_state=42)

    best_ind = tools.selBest(pop, 1)[0]
    result = {'_scores': {'mean_squared_error':best_ind.fitness.values[0]}}
    # output json_result!!!!!!

    print(best_ind.fitness.values[0])
    json_result = json.dumps(result)
    with open(os.path.join(tmpdir + _id, 'value.json'), 'w') as outfile:
        outfile.write(json_result)
    pic_result = df.to_pickle(tmpdir + _id +  '/value.pickle')
    df.to_csv(tmpdir + _id +  '/fitness_value.csv', index=False ,header=dfh)

exit(0)

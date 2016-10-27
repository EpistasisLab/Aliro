import random
import operator

import numpy

from deap import algorithms
from deap import base
from deap import creator
from deap import tools
from deap import gp

# Initialize Parity problem input and output matrices
PARITY_FANIN_M = 7
PARITY_SIZE_M = 2**PARITY_FANIN_M

inputs = [None] * PARITY_SIZE_M
outputs = [None] * PARITY_SIZE_M

for i in range(PARITY_SIZE_M):
    inputs[i] = [None] * PARITY_FANIN_M
    value = i
    dividor = PARITY_SIZE_M
    parity = 1
    for j in range(PARITY_FANIN_M):
        dividor /= 2
        if value >= dividor:
            inputs[i][j] = 1
            parity = int(not parity)
            value -= dividor
        else:
            inputs[i][j] = 0
    outputs[i] = parity


def EvenParty(population_size,generations,crossover_rate,mutation_rate,tournsize,random_state):
    pset = gp.PrimitiveSet("MAIN", PARITY_FANIN_M, "IN")
    pset.addPrimitive(operator.and_, 2)
    pset.addPrimitive(operator.or_, 2)
    pset.addPrimitive(operator.xor, 2)
    pset.addPrimitive(operator.not_, 1)
    pset.addTerminal(1)
    pset.addTerminal(0)

    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    creator.create("Individual", gp.PrimitiveTree, fitness=creator.FitnessMax)

    toolbox = base.Toolbox()
    toolbox.register("expr", gp.genFull, pset=pset, min_=3, max_=5)
    toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.expr)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("compile", gp.compile, pset=pset)

    def evalParity(individual):
        func = toolbox.compile(expr=individual)
        return sum(func(*in_) == out for in_, out in zip(inputs, outputs)),

    toolbox.register("evaluate", evalParity)
    toolbox.register("select", tools.selTournament, tournsize=tournsize)
    toolbox.register("mate", gp.cxOnePoint)
    toolbox.register("expr_mut", gp.genGrow, min_=0, max_=2)
    toolbox.register("mutate", gp.mutUniform, expr=toolbox.expr_mut, pset=pset)
    # avoid MemoryError in python
    toolbox.decorate("mate", gp.staticLimit(key=operator.attrgetter("height"), max_value=40))
    toolbox.decorate("mutate", gp.staticLimit(key=operator.attrgetter("height"), max_value=40))

    random.seed(random_state)
    pop = toolbox.population(n=population_size)
    hof = tools.HallOfFame(1)
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", numpy.mean)
    stats.register("std", numpy.std)
    stats.register("min", numpy.min)
    stats.register("max", numpy.max)

    algorithms.eaSimple(pop, toolbox, cxpb=crossover_rate,
    mutpb=mutation_rate, ngen=generations, stats=stats, halloffame=hof, verbose=True)

    return pop, stats, hof

if __name__ == "__main__":
    EvenParty(population_size = 100,generations=100,crossover_rate = 0.5,mutation_rate = 0.2,tournsize = 3,random_state = 42)


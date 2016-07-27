package org.epistasis.symod;

import java.util.Random;
import java.util.SortedSet;

import org.epistasis.PriorityList;
import org.epistasis.evolutionary.Evolution;
import org.epistasis.evolutionary.Evolver;
import org.epistasis.evolutionary.Genome;
import org.epistasis.evolutionary.Population;
import org.epistasis.symod.tree.TreeFactory;

/**
 * Implementation of AbstractSearch which performs a genetic programming search.
 */
public class GPSearch extends AbstractSearch {
	/** Evolution object used to manage the GP search. */
	private final Evolution evolution;
	/** List used to keep the best n models based on training score. */
	private PriorityList<AbstractModel> landscape;

	/**
	 * Construct a GPSearch
	 * @param rnd random number generator to use
	 * @param trainSet data set to train on
	 * @param testSet data set to test on
	 * @param fitness fitness function used to evaluate models
	 * @param tf tree factory used to generate initial population
	 * @param selector selector used to select models for evolution
	 * @param term termination criterion
	 * @param evolver evolver used to evolve the population
	 * @param scaler object used to scale scores to a given range
	 * @param popSize size of population
	 * @param pCross probability of crossover
	 * @param pMut probability of mutation
	 * @param landscapeSize number of best training models to keep and test
	 * @param elitist whether to keep in the population the best model seen so far
	 * @param parallel whether to use parallel threads to evaluate models
	 * @param onEndModel runnable to run after a model is evaluated
	 * @param onEnd runnable to run after the search is over
	 */
	public GPSearch(final Random rnd, final AbstractDataset trainSet, final AbstractDataset testSet, final AbstractFitnessFunction fitness,
			final TreeFactory tf, final Evolver.Selector selector, final Evolution.Terminator term, final Evolver evolver, final int popSize,
			final double pCross, final double pMut, final int landscapeSize, final Integer elitist, final boolean parallel,
			final Runnable onEndModel, final Runnable onEnd, final int percentNoise) {
		super(trainSet, testSet, fitness, onEndModel, onEnd);
		final Genome g = new Genome();
		final Genome.DefaultInitializer init = new Genome.DefaultInitializer();
		final Genome.DefaultCrossoverOperator cross = new Genome.DefaultCrossoverOperator();
		final Genome.DefaultMutationOperator mut = new Genome.DefaultMutationOperator();
		final Genome.DefaultEvaluator eval = new Genome.DefaultEvaluator();
		final Population pop = new Population(parallel);
		init.setTreeFactory(tf);
		cross.setRandom(rnd);
		mut.setRandom(rnd);
		mut.setTreeFactory(tf);
		eval.setDataset(trainSet);
		eval.setFitnessFunction(fitness);
		g.setInitializer(init);
		g.setEvaluator(eval);
		pop.setCapacity(popSize);
		pop.setGenome(g);
		pop.setOnEndModel(onEndModel);
		evolver.setRandom(rnd);
		evolver.setPCross(pCross);
		evolver.setPMut(pMut);
		evolver.setCrossover(cross);
		evolver.setMutation(mut);
		evolver.setSelector(selector);
		evolver.setElitist(elitist);
		evolution = new Evolution(rnd, landscapeSize, eval, percentNoise);
		evolution.setPopulation(pop);
		evolution.setEvolver(evolver);
		evolution.setTerminator(term);
		evolution.init();
	}

	/**
	 * Get the Evolution object used to manage the GP search.
	 * @return Evolution object used to manage the GP search
	 */
	public Evolution getEvolution() {
		return evolution;
	}

	/**
	 * Get the best n models based on training score.
	 * @return best n models based on training score
	 */
	@Override
	public SortedSet<AbstractModel> getLandscape() {
		return landscape;
	}

	/**
	 * Perform the GP search.
	 */
	public void run() {
		try {
			evolution.run();
			if (!Thread.currentThread().isInterrupted()) {
				final PriorityList<Genome> bestModels = evolution.getStatistics().getBest();
				landscape = new PriorityList<AbstractModel>(bestModels.getCapacity());
				int addedCount = 0;
				for (final Genome g : bestModels) {
					final AbstractModel m = (g).getModel();
					m.test(getTestingSet(), getFitnessFunction());
					final boolean wasAdded = landscape.add(m);
					if (wasAdded) {
						++addedCount;
					}
				} // end for
			} // end if !Thread.currentThread().isInterrupted()
		} finally {
			onEnd();
		}
	} // end run()
} // end GPSearch

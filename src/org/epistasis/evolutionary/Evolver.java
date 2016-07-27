package org.epistasis.evolutionary;

import java.util.ArrayList;
import java.util.Random;

/**
 * Manage the evolution of one population to the next generation by applying crossover and mutation operators.
 */
public class Evolver {
	/** Crossover operator used by this evolver. */
	protected Genome.CrossoverOperator crossover;
	/** Whether this evolver is elitist. */
	protected Integer elitist;
	/** Mutation operator used by this evolver. */
	protected Genome.MutationOperator mutation;
	/** Crossover probability used by this evolver. */
	protected double pCross;
	/** Mutation probability used by this evolver. */
	protected double pMut;
	/** Random number generator used by this evolver. */
	protected Random random;
	/** Selector used by this evolver. */
	protected Selector selector;

	/**
	 * Step a population forward one generation.
	 * @param population population to evolve
	 */
	public void evolve(final Population population) {
		final ArrayList<Genome> newPop = new ArrayList<Genome>(population.size());
		newPop.addAll(population.subList(0, getElitist()));
		selector.initialize(population);
		final int howManyLeftToCreate = population.size() - newPop.size();
		final int nCross = (int) Math.floor(howManyLeftToCreate * getPCross());
		for (int i = 0; (i < nCross) && !Thread.currentThread().isInterrupted(); i += 2) {
			final Genome firstChild = (Genome) selector.select().clone();
			final Genome secondChild = (Genome) selector.select().clone();
			crossover.cross(firstChild, secondChild);
			if (pMut > 0) {
				if (random.nextDouble() < getPMut()) {
					mutation.mutate(firstChild);
				}
				if (random.nextDouble() < getPMut()) {
					mutation.mutate(secondChild);
				}
			}
			newPop.add(firstChild);
			newPop.add(secondChild);
		} // end crossover loop
		if (Thread.currentThread().isInterrupted()) {
			return;
		}
		while ((newPop.size() < population.size()) && !Thread.currentThread().isInterrupted()) {
			Genome newPerson = selector.select();
			if ((pMut > 0) && (random.nextDouble() < getPMut())) {
				newPerson = (Genome) newPerson.clone();
				mutation.mutate(newPerson);
			}
			newPop.add(newPerson);
		}
		if (Thread.currentThread().isInterrupted()) {
			return;
		}
		population.clear();
		population.addAll(newPop);
	} // end evolve

	/**
	 * Get the crossover operator used by this evolver.
	 * @return crossover operator used by this evolver
	 */
	public Genome.CrossoverOperator getCrossover() {
		return crossover;
	}

	/**
	 * Get whether this evolver uses an elitist strategy.
	 * @return true if this evolver is elitist; false otherwise
	 */
	public Integer getElitist() {
		return elitist;
	}

	/**
	 * Get the mutation operator used by this evolver.
	 * @return mutation operator used by this evolver
	 */
	public Genome.MutationOperator getMutation() {
		return mutation;
	}

	/**
	 * Get the crossover probability used by this evolver.
	 * @return crossover probability used by this evolver
	 * @see #setPCross(double)
	 */
	public double getPCross() {
		return pCross;
	}

	/**
	 * Get the mutation probability used by this evolver.
	 * @return mutation probability used by this evolver
	 * @see #setPMut(double)
	 */
	public double getPMut() {
		return pMut;
	}

	/**
	 * Get the random number generator used by this evolver.
	 * @return random number generator used by this evolver
	 */
	public Random getRandom() {
		return random;
	}

	/**
	 * Get the selector used by this evolver.
	 * @return selector used by this evolver
	 */
	public Selector getSelector() {
		return selector;
	}

	/**
	 * Set the crossover operator to be used by this evolver.
	 * @param crossover crossover operator to be used by this evolver
	 */
	public void setCrossover(final Genome.CrossoverOperator crossover) {
		this.crossover = crossover;
	}

	/**
	 * Set whether this evolver uses an elitist strategy. This means that the best genome in the population in the old generation is always
	 * inserted into the new generation.
	 * @param elitist true if this evolver is to be elitist; false otherwise
	 */
	public void setElitist(final Integer elitist) {
		this.elitist = elitist;
	}

	/**
	 * Set the mutation operator to be used by this evolver.
	 * @param mutation mutation operator to be used by this evolver
	 */
	public void setMutation(final Genome.MutationOperator mutation) {
		this.mutation = mutation;
	}

	/**
	 * Set the crossover probability to be used by this evolver. This should be a value in the interval [0,1]. Setting this to 0 disables
	 * crossover. Typical values are 0.7 to 0.9.
	 * @param pCross crossover probability to be used by this evolver
	 */
	public void setPCross(final double pCross) {
		this.pCross = pCross;
	}

	/**
	 * Set the mutation probability to be used by this evolver. This should be a value in the interval [0,1]. Setting this to 0 disables
	 * mutation. Typical values are 0.001 to 0.01.
	 * @param pMut mutation probability to be used by this evolver
	 */
	public void setPMut(final double pMut) {
		this.pMut = pMut;
	}

	/**
	 * Set the random number generator to be used by this evolver.
	 * @param random random number generator to be used by this evolver
	 */
	public void setRandom(final Random random) {
		this.random = random;
	}

	/**
	 * Set the selector to be used by this evolver.
	 * @param selector selector to be used by this evolver
	 */
	public void setSelector(final Selector selector) {
		this.selector = selector;
	}

	/**
	 * Select a genome from a population. Each selector implements its own selection scheme. This is typically used to select genomes for
	 * crossover or mutation.
	 */
	public interface Selector {
		// /**
		// * Add a genome to consideration.
		// * @param g genome to add
		// */
		// public void add(Genome g);
		/**
		 * Initialize the selector with all the genomes in a population.
		 * @param population population with which to initialize the selector
		 */
		public void initialize(Population population);

		// /**
		// * Remove a genome from consideration.
		// * @param g genome to remove
		// */
		// public void remove(Genome g);
		/**
		 * Select a genome from the selector.
		 * @return selected genome
		 */
		public Genome select();

		/**
		 * Get number of genomes under consideration.
		 * @return number of genomes under consideration
		 */
		public int size();

		/**
		 * Check to see if the selector selects with replacement. This means that genomes, once selected, are removed from consideration.
		 * @return true if selector selects with replacement; false otherwise
		 */
		public boolean usesReplacement();
	}
}

package org.epistasis.evolutionary;

import java.util.ArrayList;
import java.util.List;

import org.epistasis.PriorityList;

/**
 * Various statistics about an evolutionary run.
 */
public class Statistics {
	/** Average display fitness for each generation. */
	private final List<Double> avgDisplayFitness = new ArrayList<Double>();
	/** Average fitness for each generation. */
	private final List<Double> avgFitness = new ArrayList<Double>();
	/** Best genomes seen so far. */
	private final PriorityList<Genome> best;
	/** Best display fitness for each generation. */
	private final List<Double> bestDisplayFitness = new ArrayList<Double>();
	/** Best fitness for each generation. */
	private final List<Double> bestFitness = new ArrayList<Double>();
	/** Current generation. */
	private int generation = 0;
	/** Worst display fitness for each generation. */
	private final List<Double> worstDisplayFitness = new ArrayList<Double>();
	/** Worst fitness for each generation. */
	private final List<Double> worstFitness = new ArrayList<Double>();

	public Statistics(final int landscapeSize) {
		best = new PriorityList<Genome>(landscapeSize);
	}

	/**
	 * Get a list containing the average fitness score for each generation so far.
	 * @param display if true, the display fitness is returned instead of the normal fitness.
	 * @return average fitness score for each generation so far
	 */
	public List<Double> getAverageFitnesses(final boolean display) {
		return display ? avgDisplayFitness : avgFitness;
	}

	/**
	 * Get a list of the n best genomes so far seen.
	 * @return list of the n best genomes so far seen
	 */
	public PriorityList<Genome> getBest() {
		return best;
	}

	/**
	 * Get a list containing the best fitness score for each generation so far.
	 * @param display if true, the display fitness is returned instead of the normal fitness.
	 * @return best fitness score for each generation so far
	 */
	public List<Double> getBestFitnesses(final boolean display) {
		return display ? bestDisplayFitness : bestFitness;
	}

	/**
	 * Get current generation number.
	 * @return current generation number
	 */
	public int getGeneration() {
		return generation;
	}

	/**
	 * Get the number of best genomes to keep.
	 * @return number of best genomes to keep
	 */
	public int getNBest() {
		return best.getCapacity();
	}

	/**
	 * Get a list containing the worst fitness score for each generation so far.
	 * @param display if true, the display fitness is returned instead of the normal fitness.
	 * @return average fitness score for each generation so far
	 */
	public List<Double> getWorstFitnesses(final boolean display) {
		return display ? worstDisplayFitness : worstFitness;
	}

	/**
	 * Initialize a statistics object and gather generation 0 statistics from a population.
	 * @param population population from which to gather generation 0 statistics
	 */
	public void reset(final Population population) {
		best.clear();
		bestFitness.clear();
		avgFitness.clear();
		worstFitness.clear();
		bestDisplayFitness.clear();
		avgDisplayFitness.clear();
		worstDisplayFitness.clear();
		generation = -1;
		update(population);
	}

	/**
	 * Gather statistics from a population for this generation.
	 * @param population population from which to gather statistics
	 */
	private void storeGenerationStatistics(final Population population) {
		if (!Thread.currentThread().isInterrupted()) {
			final Genome genome = population.get(0);
			if (genome == null) {
				throw new RuntimeException("storeGenerationStatistics found population.get(0) to be null");
			}
			final Score score = genome.getScore();
			if (score == null) {
				throw new RuntimeException("storeGenerationStatistics found population.get(0).getScore() to be null");
			}
			final double modelScore = score.getScore();
			bestFitness.add(modelScore);
			worstFitness.add(population.get(population.size() - 1).getScore().getScore());
			bestDisplayFitness.add(population.get(0).getScore().getScore(true));
			worstDisplayFitness.add(population.get(population.size() - 1).getScore().getScore(true));
			double sum = 0;
			double displaySum = 0;
			for (final Genome g : population) {
				sum += g.getScore().getScore();
				displaySum += g.getScore().getScore(true);
			}
			avgFitness.add(new Double(sum / population.size()));
			avgDisplayFitness.add(new Double(displaySum / population.size()));
		}
	}

	/**
	 * Increment the generation counter, and gather statistics from a population for this generation.
	 * @param population population from which to gather statistics
	 */
	public void update(final Population population) {
		++generation;
		final int numberToAdd = Math.min(best.getCapacity(), population.size());
		for (int i = 0; i < numberToAdd; ++i) {
			best.add(population.get(i));
		}
		storeGenerationStatistics(population);
	}
}

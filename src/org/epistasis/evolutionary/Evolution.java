package org.epistasis.evolutionary;

import java.util.Random;

import javax.swing.event.EventListenerList;

import org.epistasis.evolutionary.Genome.DefaultEvaluator;
import org.epistasis.symod.AbstractDataset;

/**
 * Represent the entire state of an evolutionary computation run.
 */
public class Evolution implements Runnable {
	/** Used to move the population from one generation to the next. */
	private Evolver evolver;
	/** Collection of all event listeners listening to this evolution. */
	private final EventListenerList listenerList = new EventListenerList();
	/** The collection of genomes which are being evolved. */
	private Population population;
	/** Object which keeps track of various information about the evolution. */
	private final Statistics statistics;
	/** Callback object used to determine when the evolution is over. */
	private Terminator terminator;
	private final AbstractDataset originalDataset;
	private final AbstractDataset evaluationDataset;
	private final int percentNoise;
	private final Random rnd;

	public Evolution(final Random rnd, final int landscapeSize, final DefaultEvaluator eval, final int percentNoise) {
		statistics = new Statistics(landscapeSize);
		originalDataset = eval.getDataset();
		this.rnd = rnd;
		this.percentNoise = percentNoise;
		if (percentNoise > 0) {
			evaluationDataset = (AbstractDataset) originalDataset.clone();
			eval.setDataset(evaluationDataset);
		} else {
			evaluationDataset = null; // this should never be used if percentNoise is zero
		}
	}

	/**
	 * Add a PopulationListener.
	 */
	public void addPopulationListener(final PopulationListener l) {
		listenerList.add(PopulationListener.class, l);
	}

	/**
	 * Notify all interested listeners that the population has been evaluated.
	 * @param pop population which was evaluated
	 */
	protected void firePopulationEvaluated(final Population pop) {
		final Object[] listeners = listenerList.getListenerList();
		PopulationEvent e = null;
		for (int i = listeners.length - 2; i >= 0; i -= 2) {
			if (listeners[i] == PopulationListener.class) {
				if (e == null) {
					e = new PopulationEvent(this, pop);
				}
				((PopulationListener) listeners[i + 1]).populationEvaluated(e);
			}
		}
	}

	/**
	 * Get the evolver this evolution is using.
	 * @return this evolution's evolver
	 */
	public Evolver getEvolver() {
		return evolver;
	}

	/**
	 * Get the evolution's current population.
	 * @return the evolution's current population
	 */
	public Population getPopulation() {
		return population;
	}

	/**
	 * Get the statistics object for this evolution.
	 * @return statistics object for this evolution
	 */
	public Statistics getStatistics() {
		return statistics;
	}

	/**
	 * Get the evolution's current terminator.
	 * @return the evolution's current terminator
	 */
	public Terminator getTerminator() {
		return terminator;
	}

	/**
	 * Initialize the evolution.
	 */
	public void init() {
		population.initialize();
		population.evaluate();
		firePopulationEvaluated(population);
		statistics.reset(population);
	}

	/**
	 * Remove a PopulationListener that's been listening.
	 */
	public void removePopulationListener(final PopulationListener l) {
		listenerList.remove(PopulationListener.class, l);
	}

	/**
	 * Step the evolution until the termination condition is met.
	 */
	public void run() {
		while (!terminate() && !Thread.currentThread().isInterrupted()) {
			step();
		}
	}

	/**
	 * Set the evolver to use for this evolution.
	 * @param evolver evolver to use for this evolution
	 */
	public void setEvolver(final Evolver evolver) {
		this.evolver = evolver;
	}

	/**
	 * Set the evolution's population.
	 * @param population population to set for this evolution
	 */
	public void setPopulation(final Population population) {
		this.population = population;
	}

	/**
	 * Set the terminator to use for this evolution.
	 * @param terminator terminator to use for this evolution
	 */
	public void setTerminator(final Terminator terminator) {
		this.terminator = terminator;
	}

	/**
	 * Step the evolution forward one generation.
	 */
	public void step() {
		evolver.evolve(population);
		if (percentNoise > 0) {
			// if there is noise then a genomes training score can change when newly evaluated so therefore
			// we must wipe out the previous evaluation's cached score if it exists. Only exception is ones saved by elitist
			for (int genomeIndex = evolver.getElitist(); genomeIndex < population.size(); ++genomeIndex) {
				final Genome g = population.get(genomeIndex);
				if (g.getModel() != null) {
					// a model will only be non-null if this genome was unchanged since the last generation
					// since model evaluations can differ, we must make sure that every genome is unique (since tournament selection can result in
					// multiple copies of the same genome)
					population.set(genomeIndex, (Genome) g.clone());
				}
			} // end for loop through population
			final int numberOfInstances = originalDataset.size();
			for (int instanceIndex = 0; instanceIndex < numberOfInstances; ++instanceIndex) {
				final AbstractDataset.Instance originalInstance = originalDataset.get(instanceIndex);
				final AbstractDataset.Instance evaluationInstance = evaluationDataset.get(instanceIndex);
				final double[] originalValues = originalInstance.getValues();
				final double[] evaluationValues = evaluationInstance.getValues();
				for (int index = 0; index < evaluationValues.length; ++index) {
					if (rnd.nextInt(100) < percentNoise) {
						final double originalValue = originalValues[index];
						int indexIntoOriginalDatasetInstances = rnd.nextInt(numberOfInstances);
						final int startingIndexIntoOriginalDatasetInstances = indexIntoOriginalDatasetInstances;
						double differentValue;
						do {
							final AbstractDataset.Instance randomlyChosedOriginal = originalDataset.get(indexIntoOriginalDatasetInstances);
							differentValue = randomlyChosedOriginal.getValues()[index];
							indexIntoOriginalDatasetInstances = (indexIntoOriginalDatasetInstances + 1) % numberOfInstances;
						} while ((originalValue == differentValue) && (indexIntoOriginalDatasetInstances != startingIndexIntoOriginalDatasetInstances));
						evaluationValues[index] = differentValue;
					} else {
						evaluationValues[index] = originalValues[index];
					}
				} // for each attribute
			} // end Instance loop
		} // end if percentNoise > 0
		population.evaluate();
		firePopulationEvaluated(population);
		statistics.update(population);
	}

	/**
	 * Check to see if the termination condition has been met.
	 * @return true if the termination condition has been met; false otherwise
	 */
	public boolean terminate() {
		return terminator.terminate(this);
	}

	/**
	 * Control the point at which the evolution stops.
	 */
	public static interface Terminator {
		/**
		 * Callback which controls when to stop the evolution.
		 * @param evolution the evolution object in question
		 * @return true if the evolution should be stopped; false otherwise
		 */
		public boolean terminate(Evolution evolution);
	}
}

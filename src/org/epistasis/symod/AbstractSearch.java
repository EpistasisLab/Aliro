package org.epistasis.symod;

import java.util.SortedSet;

/**
 * Base class for search methods.
 */
public abstract class AbstractSearch implements Runnable {
	/** Fitness function with which to train and test models. */
	protected final AbstractFitnessFunction fitness;
	/** Callback to run when search is finished. */
	protected final Runnable onEnd;
	/** Callback to run after a model is evaluated. */
	protected final Runnable onEndModel;
	/** Data set on which to test models. */
	protected final AbstractDataset testSet;
	/** Data set on which to train models. */
	protected final AbstractDataset trainSet;

	/**
	 * Construct an AbstractSearch.
	 * @param trainSet data set on which to train models
	 * @param testSet data set on which to test models
	 * @param fitness fitness function with which to train and test models
	 * @param onEndModel callback to run after a model is evaluated
	 * @param onEnd callback to run when search is finished
	 */
	public AbstractSearch(final AbstractDataset trainSet, final AbstractDataset testSet, final AbstractFitnessFunction fitness,
			final Runnable onEndModel, final Runnable onEnd) {
		this.trainSet = trainSet;
		this.testSet = testSet;
		this.fitness = fitness;
		this.onEndModel = onEndModel;
		this.onEnd = onEnd;
	}

	/**
	 * Get the fitness function.
	 * @return fitness function
	 */
	public AbstractFitnessFunction getFitnessFunction() {
		return fitness;
	}

	/**
	 * Get a list, in descending order, of the n best models by training score, where n is determined by the subclass.
	 * @return list of the n best models by training score
	 */
	public abstract SortedSet<AbstractModel> getLandscape();

	/**
	 * Get the callback to run when search is finished.
	 * @return callback to run when search is finished
	 */
	protected Runnable getOnEnd() {
		return onEnd;
	}

	/**
	 * Get the callback to run after a model is evaluated.
	 * @return callback to run after a model is evaluated
	 */
	protected Runnable getOnEndModel() {
		return onEndModel;
	}

	/**
	 * Get the data set used for testing.
	 * @return data set used for testing
	 */
	public AbstractDataset getTestingSet() {
		return testSet;
	}

	/**
	 * Get the data set used for training.
	 * @return data set used for training
	 */
	public AbstractDataset getTrainingSet() {
		return trainSet;
	}

	/**
	 * Run the callback to run when search is finished, if it exists.
	 */
	protected void onEnd() {
		if (onEnd != null) {
			onEnd.run();
		}
	}

	/**
	 * Run the callback to run after a model is evaluated, if it exists.
	 */
	protected void onEndModel() {
		if (onEndModel != null) {
			onEndModel.run();
		}
	}
}

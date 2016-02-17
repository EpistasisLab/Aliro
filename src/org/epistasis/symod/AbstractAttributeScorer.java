package org.epistasis.symod;

import java.util.AbstractList;

/**
 * Base class for attribute scorers. Attribute scorers are classes which compute a score for each attribute (column) in a data set.
 */
public abstract class AbstractAttributeScorer extends AbstractList<Double> {
	/** Data set to score. */
	private final AbstractDataset data;
	/** Callback to run when the progress is incremented. */
	private Runnable onIncrementProgress;
	/** Computed attribute scores. */
	private double[] scores;

	/**
	 * Construct an AbstractAttributeScorer.
	 * @param data data set to score
	 */
	public AbstractAttributeScorer(final AbstractDataset data) {
		this.data = data;
	}

	/**
	 * Construct an AbstractAttributeScorer.
	 * @param data data set to score
	 * @param onIncrementProgress callback to run when progress is incremented
	 */
	public AbstractAttributeScorer(final AbstractDataset data, final Runnable onIncrementProgress) {
		this.data = data;
		this.onIncrementProgress = onIncrementProgress;
	}

	/**
	 * Compute the scores for each attribute. The scores are cached, so multiple calls to this function only cause the scores to be computed
	 * once.
	 */
	public void compute() {
		if (scores != null) {
			return;
		}
		scores = computeScores();
	}

	/**
	 * Compute the score for each of the attributes in the data set.
	 * @return array of scores, one for each attribute in the data set
	 */
	protected abstract double[] computeScores();

	/**
	 * Get the score for an attribute. This only works if the scores have been computed.
	 * @param index attribute for which to get the score
	 */
	@Override
	public Double get(final int index) {
		return scores[index];
	}

	/**
	 * Get the data set associated with this scorer.
	 * @return data set associated with this scorer
	 */
	public AbstractDataset getData() {
		return data;
	}

	/**
	 * Get the maximum progress value for this scorer.
	 * @return maximum progress value for this scorer
	 */
	public abstract int getMaxProgress();

	/**
	 * Call the increment progress callback if one is defined.
	 */
	protected void incrementProgress() {
		if (onIncrementProgress != null) {
			onIncrementProgress.run();
		}
	}

	/**
	 * Get the number of scores in this scorer. If the scorer has not yet been run, the return value will be zero. Otherwise, it will be the
	 * number of attributes in the data set.
	 * @return number of scores in this scorer
	 */
	@Override
	public int size() {
		return scores == null ? 0 : scores.length;
	}
}

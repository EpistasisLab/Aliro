package org.epistasis.symod;

import org.epistasis.ProducerConsumerThread;

/**
 * Base class used to implement attribute scorers which do not consider attributes in combination with each other. Currently unused as of
 * 10/14/2007.
 */
public abstract class IsolatedAttributeScorer extends AbstractAttributeScorer {
	/** Whether to compute scores in parallel. */
	private final boolean parallel;

	/**
	 * Construct an IsolatedAttributeScorer.
	 * @param data data set to score
	 * @param parallel whether to run the scorer in parallel
	 */
	public IsolatedAttributeScorer(final AbstractDataset data, final boolean parallel) {
		super(data);
		this.parallel = parallel;
	}

	/**
	 * Construct an IsolatedAttributeScorer.
	 * @param data data set to score
	 * @param parallel whether to run the scorer in parallel
	 * @param onIncrementProgress runnable to call when progress is made
	 */
	public IsolatedAttributeScorer(final AbstractDataset data, final boolean parallel, final Runnable onIncrementProgress) {
		super(data, onIncrementProgress);
		this.parallel = parallel;
	}

	/**
	 * Callback to compute the score for a single attribute.
	 * @param index index of attribute to score
	 * @return score for attribute
	 */
	protected abstract double computeScore(int index);

	/**
	 * Compute all attribute scores.
	 * @return array of scores, one for each attribute
	 */
	@Override
	protected double[] computeScores() {
		final double[] scores = new double[getData().getNumAttributes()];
		if (parallel) {
			final ProducerConsumerThread<Integer> thread = new ProducerConsumerThread<Integer>();
			thread.setProducer(new Producer());
			for (int i = 0; i < Runtime.getRuntime().availableProcessors(); ++i) {
				thread.addConsumer(new Consumer(scores));
			}
			thread.run();
		} else {
			for (int i = 0; i < scores.length; ++i) {
				scores[i] = computeScore(i);
				incrementProgress();
			}
		}
		return scores;
	}

	/**
	 * Get the maximum progress value for this scorer.
	 * @return maximum progress value for this scorer
	 */
	@Override
	public int getMaxProgress() {
		return getData().getNumAttributes();
	}

	/**
	 * Consumer object used to process attributes in parallel.
	 */
	private class Consumer extends ProducerConsumerThread.Consumer<Integer> {
		/** Array of scores, one for each attribute. */
		private final double[] scores;

		/**
		 * Construct a Consumer.
		 * @param scores array of scores, one of which will be set for each attribute
		 */
		public Consumer(final double[] scores) {
			this.scores = scores;
		}

		/**
		 * Score an attribute.
		 * @param obj integer index of attribute to score
		 */
		@Override
		public void consume(final Integer obj) {
			final int i = (obj).intValue();
			scores[i] = computeScore(i);
			incrementProgress();
		}
	}

	/**
	 * Producer object used to process attributes in parallel.
	 */
	private class Producer extends ProducerConsumerThread.Producer<Integer> {
		/** Index of attribute to produce next. */
		private int i = 0;

		/**
		 * Produce an attribute index to process.
		 */
		@Override
		public Integer produce() {
			if (i < getData().getNumAttributes()) {
				return i++;
			} else {
				return null;
			}
		}
	}
}

package org.epistasis.symod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

import org.epistasis.ProducerConsumerThread;

/**
 * Base class for Relief style attribute scorers.
 */
public abstract class ReliefFamilyAttributeScorer extends AbstractAttributeScorer {
	/** Cached values of attribute ranges. */
	private double[] attrRange;
	/** Number of nearest neighbors. */
	private int k;
	/** Number of samples. */
	private int m;
	/** Whether to perform the analysis in parallel. */
	private boolean parallel;
	/** Random number generator to use. */
	private Random rnd;
	/** List of instance indices to use as samples. */
	private List<Integer> samples;
	/** Attribute weights. */
	private double[] weights;

	/**
	 * Construct a ReliefFamilyAttributeScorer
	 * @param data data set to score
	 * @param m number of samples to consider
	 * @param k number of nearest neighbors to consider
	 * @param rnd random number generator to use
	 * @param parallel whether to run the analysis in parallel
	 */
	public ReliefFamilyAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel) {
		super(data);
		init(data, m, k, rnd, parallel);
	}

	/**
	 * Construct a ReliefFamilyAttributeScorer
	 * @param data data set to score
	 * @param m number of samples to consider
	 * @param k number of nearest neighbors to consider
	 * @param rnd random number generator to use
	 * @param parallel whether to run the analysis in parallel
	 * @param onIncrementProgress runnable to call when progress is made
	 */
	public ReliefFamilyAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel,
			final Runnable onIncrementProgress) {
		super(data, onIncrementProgress);
		init(data, m, k, rnd, parallel);
	}

	/**
	 * Add a value to a given attribute weight. Synchronized so it can be called from multiple threads.
	 * @param idx index of attribute weight to alter
	 * @param value value to add to the weight
	 */
	protected synchronized void alterWeight(final int idx, final double value) {
		weights[idx] += value;
	}

	/**
	 * Compute and store the value range of each attribute.
	 */
	private void computeAttributeRange() {
		attrRange = new double[weights.length];
		for (int i = 0; i < attrRange.length; ++i) {
			double min = Double.POSITIVE_INFINITY;
			double max = Double.NEGATIVE_INFINITY;
			for (final Object element : getData()) {
				final AbstractDataset.Instance inst = (AbstractDataset.Instance) element;
				final double x = inst.get(i);
				if (x < min) {
					min = x;
				}
				if (x > max) {
					max = x;
				}
			}
			attrRange[i] = max - min;
		}
	}

	/**
	 * Compute all attribute scores.
	 * @return array of scores, one for each attribute
	 */
	@Override
	public double[] computeScores() {
		weights = new double[getData().getNumAttributes() - 1];
		samples = new ArrayList<Integer>(m);
		for (int i = 0; i < m; ++i) {
			samples.add(i);
		}
		if (m != getData().getNumInstances()) {
			Collections.shuffle(samples, rnd);
			samples = samples.subList(0, m);
		}
		computeAttributeRange();
		preProcess();
		final ProducerConsumerThread<Integer> reliefThread = new ProducerConsumerThread<Integer>();
		reliefThread.setProducer(new Producer());
		final int maxConsumer = parallel ? Runtime.getRuntime().availableProcessors() : 1;
		for (int i = 0; i < maxConsumer; ++i) {
			reliefThread.addConsumer(new Consumer());
		}
		reliefThread.run();
		postProcess();
		return weights;
	}

	/**
	 * Get the total distance between two instances.
	 * @param a index of first instance
	 * @param b index of second instance
	 * @return total distance between two instances
	 */
	protected double diff(final int a, final int b) {
		double sum = 0;
		for (int i = 0; i < getData().getNumAttributes() - 1; ++i) {
			sum += diff(i, a, b);
		}
		return sum;
	}

	/**
	 * Get the distance between two instances at a given attribute.
	 * @param index index of attribute to use for distance calculation
	 * @param a index of first instance
	 * @param b index of second instance
	 * @return distance between two instances at the given attribute
	 */
	protected double diff(final int index, final int a, final int b) {
		final double x = ((getData().get(a)).get(index));
		final double y = ((getData().get(b)).get(index));
		return Math.abs(x - y) / attrRange[index];
	}

	/**
	 * Get number of nearest neighbors to use.
	 * @return number of nearest neighbors to use
	 */
	public int getK() {
		return k;
	}

	/**
	 * Get number of samples to use.
	 * @return number of samples to use
	 */
	public int getM() {
		return m;
	}

	/**
	 * Get the maximum progress value for this scorer.
	 * @return maximum progress value for this scorer
	 */
	@Override
	public int getMaxProgress() {
		return m;
	}

	/**
	 * Initialize the scorer.
	 * @param data data set to score
	 * @param m number of samples
	 * @param k number of nearest neighbors
	 * @param rnd random number generator
	 * @param parallel whether to run the scorer in parallel
	 */
	private void init(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel) {
		this.m = ((m > 0) && (m < data.getNumInstances())) ? m : data.getNumInstances();
		this.k = k;
		this.rnd = rnd;
		this.parallel = parallel;
	}

	/**
	 * Callback which can be overridden to perform any necessary post-processing.
	 */
	protected void postProcess() {
	}

	/**
	 * Callback which can be overridden to perform any necessary pre-processing.
	 */
	protected void preProcess() {
	}

	/**
	 * Callback to implement to process an instance.
	 * @param idx index of instance to process
	 */
	protected abstract void processInstance(int idx);

	/**
	 * Set an attribute weight.
	 * @param idx index of attribute weight to set
	 * @param value value to set as the weight
	 */
	protected synchronized void setWeight(final int idx, final double value) {
		weights[idx] = value;
	}

	/**
	 * Consumer used to process instances in parallel.
	 */
	private class Consumer extends ProducerConsumerThread.Consumer<Integer> {
		/**
		 * Process an instance.
		 * @param i index of instance to process
		 */
		@Override
		public void consume(final Integer i) {
			processInstance(i);
			incrementProgress();
		}
	}

	/**
	 * Comparator to compare instances by attribute distance and sort in ascending order.
	 */
	protected class InstanceDistanceComparator implements Comparator<Number> {
		/** Index of attribute to use in distance calculation. */
		private final int idx;

		/**
		 * Construct an InstanceDistanceComparator.
		 * @param idx index of attribute to use in distance calculation
		 */
		public InstanceDistanceComparator(final int idx) {
			this.idx = idx;
		}

		/**
		 * Compare two instance indices by attribute distance.
		 * @param o1 index of first instance
		 * @param o2 index of second instance
		 * @return &lt; 0 if o1 &lt; o2, &gt; 0 if o1 &gt; o2, or 0 otherwise
		 */
		public int compare(final Number o1, final Number o2) {
			final Double a = diff(idx, o1.intValue());
			final Double b = diff(idx, o2.intValue());
			return a.compareTo(b);
		}
	}

	/**
	 * Producer used to process instances in parallel.
	 */
	private class Producer extends ProducerConsumerThread.Producer<Integer> {
		/** Iterator to list of instances to produce. */
		private final Iterator<Integer> i = samples.iterator();

		/**
		 * Produce an instance index.
		 * @return instance index to process
		 */
		@Override
		public Integer produce() {
			if (i.hasNext()) {
				return i.next();
			} else {
				return null;
			}
		}
	}
}

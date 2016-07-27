package org.epistasis.symod.continuous;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.epistasis.Utility;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.ReliefFamilyAttributeScorer;

/**
 * Attribute scorer that implements RReliefF. RReliefF is based on ReliefF, but works on continuous status attributes.
 * @see "Machine Learning Journal (2003) 53:23-69, specifically p28"
 */
public class RReliefFAttributeScorer extends ReliefFamilyAttributeScorer {
	/** Maximum value in status attribute. */
	private double max;
	/** Minimum value in status attribute. */
	private double min;
	/**
	 * Probabilities that attribute values of nearest instances are different.
	 */
	private double nda[];
	/** Probability that statuses of nearest instances are different. */
	private double ndc;
	/**
	 * Probabilities that statuses of nearest instances are different, given different values of attributes.
	 */
	private double ndcda[];

	/**
	 * Construct an RReliefFAttributeScorer.
	 * @param data data set to score
	 * @param m number of samples
	 * @param k number of nearest neighbors
	 * @param rnd random number generator
	 * @param parallel whether to run the analysis in parallel
	 */
	public RReliefFAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel) {
		super(data, m, k, rnd, parallel);
	}

	/**
	 * Construct an RReliefFAttributeScorer.
	 * @param data data set to score
	 * @param m number of samples
	 * @param k number of nearest neighbors
	 * @param rnd random number generator
	 * @param parallel whether to run the analysis in parallel
	 * @param onIncrementProgress runnable which is run when progress is made
	 */
	public RReliefFAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel,
			final Runnable onIncrementProgress) {
		super(data, m, k, rnd, parallel, onIncrementProgress);
	}

	/**
	 * Final processing necessary to complete the RReliefF algorithm.
	 */
	@Override
	protected void postProcess() {
		final double denom = getM() - ndc;
		for (int i = 0; i < nda.length; ++i) {
			setWeight(i, ndcda[i] / ndc - (nda[i] - ndcda[i]) / denom);
		}
	}

	/**
	 * Initial processing necessary for the RReliefF algorithm.
	 */
	@Override
	protected void preProcess() {
		ndc = 0;
		nda = new double[getData().getNumAttributes() - 1];
		ndcda = new double[nda.length];
		min = Double.POSITIVE_INFINITY;
		max = Double.NEGATIVE_INFINITY;
		for (final AbstractDataset.Instance element : getData()) {
			final double x = element.getStatus().doubleValue();
			if (x < min) {
				min = x;
			}
			if (x > max) {
				max = x;
			}
		}
	}

	/**
	 * Process one instance.
	 * @param idx index of instance to process
	 */
	@Override
	protected void processInstance(final int idx) {
		List<Number> neighbors = new ArrayList<Number>(getM());
		for (int i = 0; i < getM(); ++i) {
			if (idx != i) {
				neighbors.add(new Integer(i));
			}
		}
		neighbors = Utility.lowestN(neighbors, getK(), new InstanceDistanceComparator(idx));
		for (int i = 0; i < neighbors.size(); ++i) {
			final int neighbor = neighbors.get(i).intValue();
			final double x = (getData().get(idx).getStatus().doubleValue() - min) / (max - min);
			final double y = (getData().get(neighbor).getStatus().doubleValue() - min) / (max - min);
			final double classDist = Math.abs(x - y);
			final double dc = classDist / getK();
			synchronized (this) {
				ndc += dc;
			}
			for (int j = 0; j < getData().getNumAttributes() - 1; ++j) {
				final double da = diff(j, idx, neighbor) / getK();
				synchronized (nda) {
					nda[j] += da;
				}
				final double dcda = classDist * da;
				synchronized (ndcda) {
					ndcda[j] += dcda;
				}
			}
		}
	}
}

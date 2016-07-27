package org.epistasis.symod.discrete;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;

import org.epistasis.Utility;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.ReliefFamilyAttributeScorer;

/**
 * Attribute scorer that implements ReliefF.
 * @see "Kononenko, I. 1994. Estimating attributes: analysis and extensions of RELIEF. In Proceedings of the European Conference on Machine
 *      Learning on Machine Learning (Catania, Italy). F. Bergadano and L. De Raedt, Eds. Springer-Verlag New York, Secaucus, NJ, 171-182."
 */
public class ReliefFAttributeScorer extends ReliefFamilyAttributeScorer {
	/** Precomputed demoninator for attribute weights. */
	private final int denom;
	/** Lists of instance indices organized by status value. */
	private Map<Number, List<Number>> instByClass;

	/**
	 * Construct a ReliefFAttributeScorer.
	 * @param data data set to score
	 * @param m number of samples
	 * @param k number of nearest neighbors
	 * @param rnd random number generator
	 * @param parallel whether to run the analysis in parallel
	 */
	public ReliefFAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel) {
		super(data, m, k, rnd, parallel);
		denom = getM() * getK();
	}

	/**
	 * Construct a ReliefFAttributeScorer.
	 * @param data data set to score
	 * @param m number of samples
	 * @param k number of nearest neighbors
	 * @param rnd random number generator
	 * @param parallel whether to run the analysis in parallel
	 * @param onIncrementProgress runnable which is run when progress is made
	 */
	public ReliefFAttributeScorer(final AbstractDataset data, final int m, final int k, final Random rnd, final boolean parallel,
			final Runnable onIncrementProgress) {
		super(data, m, k, rnd, parallel, onIncrementProgress);
		denom = getM() * getK();
	}

	/**
	 * Get lists of instance indices organized by status.
	 * @return lists of instance indices organized by status
	 */
	private Map<Number, List<Number>> computeInstByClass() {
		final Map<Number, List<Number>> instByClass = new HashMap<Number, List<Number>>();
		for (int i = 0; i < getData().getNumInstances(); ++i) {
			final AbstractDataset.Instance inst = getData().get(i);
			List<Number> list = instByClass.get(inst.getStatus());
			if (list == null) {
				list = new ArrayList<Number>();
				instByClass.put(inst.getStatus(), list);
			}
			list.add(i);
		}
		return Collections.unmodifiableMap(instByClass);
	}

	/**
	 * Get lists of nearest neighbors for an instance organized by status.
	 * @param idx index of instance
	 * @return lists of nearest neighbors for an instance organized by status
	 */
	private Map<Number, List<Number>> computeNeighborhood(final int idx) {
		final Map<Number, List<Number>> neighborhood = new HashMap<Number, List<Number>>();
		final Comparator<Number> cmp = new InstanceDistanceComparator(idx);
		for (final Map.Entry<Number, List<Number>> entry : instByClass.entrySet()) {
			final Number status = entry.getKey();
			final List<Number> value = entry.getValue();
			final List<Number> list = new ArrayList<Number>(value);
			if (status.equals(getData().get(idx).getStatus())) {
				list.remove(new Integer(idx));
			}
			neighborhood.put(status, Utility.lowestN(list, getK(), cmp));
		}
		return neighborhood;
	}

	/**
	 * Initial processing necessary for the ReliefF algorithm.
	 */
	@Override
	protected void preProcess() {
		instByClass = computeInstByClass();
	}

	/**
	 * Process one instance.
	 * @param idx index of instance to process
	 */
	@Override
	protected void processInstance(final int idx) {
		final Map<Number, List<Number>> neighborhood = computeNeighborhood(idx);
		for (int i = 0; i < getData().getNumAttributes() - 1; ++i) {
			double hitSum = 0;
			double missSum = 0;
			for (final Entry<Number, List<Number>> entry : neighborhood.entrySet()) {
				final Number status = entry.getKey();
				final List<Number> group = entry.getValue();
				double sum = 0;
				for (final Number number : group) {
					sum += diff(i, idx, number.intValue());
				}
				if (status.equals((getData().get(idx)).getStatus())) {
					hitSum = sum;
				} else {
					missSum += sum;
				}
			}
			missSum /= neighborhood.size() - 1;
			alterWeight(i, (missSum - hitSum) / denom);
		}
	}
}

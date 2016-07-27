package org.epistasis.symod.discrete;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.epistasis.Pair;
import org.epistasis.Utility;

/**
 * Base class for classes which are used to produce Discriminants from raw expression values.
 */
public abstract class Discriminator {
	/** List of status values used for this Discriminator. */
	protected final List<String> statuses;

	/**
	 * Compute the medians of the status distributions.
	 * @param condensed status distributions for which to compute medians
	 * @return medians of the status distributions
	 */
	private static double[] computeMedians(final double[][] condensed) {
		final double[] medians = new double[condensed.length];
		for (int i = 0; i < medians.length; ++i) {
			medians[i] = Utility.median(condensed[i]);
		}
		return medians;
	}

	/**
	 * Determine what order status indices should have based on the medians of the distributions of each.
	 * @param medians array of medians of status distributions
	 * @return array of status value indices, in ascending order of median
	 */
	private static int[] computeOrder(final double[] medians) {
		final List<Pair<Integer, Double>> pairs = new ArrayList<Pair<Integer, Double>>(medians.length);
		for (int i = 0; i < medians.length; ++i) {
			pairs.add(new Pair<Integer, Double>(i, medians[i]));
		}
		Collections.sort(pairs, new Pair.SecondComparator<Integer, Double>());
		final int[] order = new int[pairs.size()];
		for (int i = 0; i < order.length; ++i) {
			order[i] = pairs.get(i).getFirst();
		}
		return order;
	}

	/**
	 * Reduce a List<List<Double>> representation of status distributions to a double[][] representation, with each inner array sorted in
	 * ascending order.
	 * @param dist List<List<Double>> representation of status distributions
	 * @return double[][] representation, with each inner array sorted in ascending order
	 */
	private static double[][] condenseDists(final List<List<Double>> dist) {
		final double[][] condensed = new double[dist.size()][];
		for (int i = 0; i < condensed.length; ++i) {
			final List<Double> statusdist = dist.get(i);
			condensed[i] = new double[statusdist.size()];
			for (int j = 0; j < condensed[i].length; ++j) {
				condensed[i][j] = statusdist.get(j);
			}
			Arrays.sort(condensed[i]);
		}
		return condensed;
	}

	public static Discriminant discriminate(final Discriminator disc, final List<List<Double>> dist) {
		final double[][] condensed = Discriminator.condenseDists(dist);
		final double[] medians = Discriminator.computeMedians(condensed);
		final int[] order = Discriminator.computeOrder(medians);
		final double[] boundaries = disc.computeBoundaries(condensed, medians, order);
		return new Discriminant(disc.getStatuses(), condensed, boundaries, order);
	}

	public Discriminator(final List<String> statuses) {
		this.statuses = statuses;
	}

	/**
	 * Callback to implement for deciding where the partition boundaries go.
	 * @param dists array of arrays of expression values, one for each status
	 * @param medians array of medians of each distribution
	 * @param order indices of status values, in ascending order of median
	 * @return array of boundary positions
	 */
	abstract protected double[] computeBoundaries(double[][] dists, double[] medians, int[] order);

	/**
	 * Get list of status values used in this Discriminator.
	 * @return list of status values used in this Discriminator
	 */
	public List<String> getStatuses() {
		return statuses;
	}
}

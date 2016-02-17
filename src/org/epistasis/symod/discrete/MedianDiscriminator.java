package org.epistasis.symod.discrete;

import java.util.List;

import org.epistasis.Utility;

/**
 * Discriminator which places the boundaries at the arithmetic means of adjacent distribution medians.
 */
public class MedianDiscriminator extends Discriminator {
	public MedianDiscriminator(final List<String> statuses) {
		super(statuses);
	}

	/**
	 * Callback to implement for deciding where the partition boundaries go.
	 * @param dist array of arrays of expression values, one for each status
	 * @param medians array of medians of each distribution
	 * @param order indices of status values, in ascending order of median
	 * @return array of boundary positions
	 */
	@Override
	protected double[] computeBoundaries(final double[][] dist, final double[] medians, final int[] order) {
		double[] boundaries = new double[medians.length - 1];
		for (int i = 0; i < boundaries.length; ++i) {
			if (Double.valueOf(medians[order[i]]).equals(medians[order[i + 1]])) {
				// if two adjacent medians are equal, then all must recalculate all boundaries
				// as place between averages
				boundaries = computeBoundariesWithAverages(dist, order);
				break; // EXIT LOOP!
			} else {
				boundaries[i] = (medians[order[i]] + medians[order[i + 1]]) / 2.0f;
			}
		} // end for boundaries
		return boundaries;
	}

	/**
	 * Callback to implement for deciding where the partition boundaries go.
	 * @param dist array of arrays of expression values, one for each status
	 * @param medians array of medians of each distribution
	 * @param order indices of status values, in ascending order of median
	 * @return array of boundary positions
	 */
	protected double[] computeBoundariesWithAverages(final double[][] dist, final int[] order) {
		final double[] averages = new double[dist.length];
		for (int i = 0; i < dist.length; ++i) {
			averages[i] = Utility.average(dist[i]);
		}
		final double[] boundaries = new double[averages.length - 1];
		for (int i = 0; i < boundaries.length; ++i) {
			boundaries[i] = (averages[order[i]] + averages[order[i + 1]]) / 2.0f;
		}
		return boundaries;
	}
}

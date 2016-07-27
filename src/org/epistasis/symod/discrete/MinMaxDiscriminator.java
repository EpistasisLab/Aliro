package org.epistasis.symod.discrete;

import java.util.List;

/**
 * Discriminator which places the boundaries at the arithmetic means of adjacent extrema of distributions with adjacent medians.
 */
public class MinMaxDiscriminator extends Discriminator {
	public MinMaxDiscriminator(final List<String> statuses) {
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
		final double[] boundaries = new double[medians.length - 1];
		int firstLevelIndex = -1;
		int secondLevelIndex = -1;
		double[] evaluationResultsForFirstClass;
		double[] evaluationResultsForSecondClass;
		double lowerBound = -1;
		double upperBound = -1;
		for (int levelsIndex = 0; levelsIndex < boundaries.length; ++levelsIndex) {
			try {
				firstLevelIndex = order[levelsIndex];
				evaluationResultsForFirstClass = dist[firstLevelIndex];
				// now get maximum value computed by tree that mapped to firstLevelindex
				if (evaluationResultsForFirstClass.length == 0) {
					upperBound = 0;
				} else {
					// the lower bound of the boundary is highest value in the first level
					upperBound = evaluationResultsForFirstClass[evaluationResultsForFirstClass.length - 1];
				}
				secondLevelIndex = order[levelsIndex + 1];
				evaluationResultsForSecondClass = dist[secondLevelIndex];
				if (evaluationResultsForSecondClass.length == 0) {
					lowerBound = 0;
				} else {
					// the lower bound of the boundary is lowest value in the second level
					lowerBound = evaluationResultsForSecondClass[0];
				}
				boundaries[levelsIndex] = (lowerBound + upperBound) / 2.0f;
			} catch (final Exception ex) {
				throw new RuntimeException("Caught exception '" + ex.toString() + "' numLevels: " + levelsIndex + " int firstLevelIndex: "
						+ firstLevelIndex + " int secondLevelIndex: " + secondLevelIndex + " lowerBound: " + lowerBound + " upperBound: " + upperBound);
			}
		}
		return boundaries;
	}
}

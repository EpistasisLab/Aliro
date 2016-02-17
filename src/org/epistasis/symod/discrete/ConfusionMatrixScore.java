package org.epistasis.symod.discrete;

import java.util.List;

import org.epistasis.ConfusionMatrix;
import org.epistasis.evolutionary.Score;

/**
 * Implementation of Score using a ConfusionMatrix.
 */
public class ConfusionMatrixScore extends ConfusionMatrix<String> implements Score {
	public ConfusionMatrixScore(final Discriminant disc) {
		super(disc.getStatuses());
		final double[][] dist = disc.getDistributions();
		final int[] order = disc.getDistributionOrder();
		// confirm that the order is correct by checking predictions
		// first class predictions
		for (int statusIndex = 0; statusIndex < dist.length; ++statusIndex) {
			final int expectedStatus = order[statusIndex];
			final double[] scoresPredictingStatus = dist[expectedStatus];
			for (int predictionIndex = 0; predictionIndex < scoresPredictingStatus.length; ++predictionIndex) {
				final int predictionWithCurrentOrder = disc.getPrediction(scoresPredictingStatus[predictionIndex]);
				add(expectedStatus, predictionWithCurrentOrder);
			} // end for
		} // end outer for
		getBalancedAccuracy(); // force it to calculate balanced accuracy since it will be calculated soon in any case
		// and is cached and it is helpful for debugging to be able to see it
	}

	/**
	 * Construct a ConfusionMatrixScore.
	 * @param statuses list of statuses for the ConfusionMatrix
	 */
	public ConfusionMatrixScore(final List<String> statuses) {
		super(statuses);
	}

	/**
	 * Compare two scores to sort in descending numerical order. (Higher scores are better so they should sort earlier.)
	 * @param a first score
	 * @param b second score
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
	 */
	public int compareScores(final double a, final double b) {
		return -Double.compare(a, b);
	}

	/**
	 * Compare this score to another ConfusionMatrixScore, according to {@link #compareScores(double, double)}.
	 * @param obj other score
	 * @return &lt; 0 if this &lt; obj, &gt; 0 if this &gt; obj, or 0 otherwise
	 */
	public int compareTo(final Score cmr) {
		if (this == cmr) {
			return 0;
		}
		return compareScores(getScore(), cmr.getScore());
	}

	/**
	 * Get a string representation of the ConfusionMatrix.
	 * @see ConfusionMatrix#toString()
	 * @return string representation of the ConfusionMatrix
	 */
	public String getConfusionMatrixString() {
		return super.toString();
	}

	/**
	 * Get a scalar value representing this score. Returns balanced accuracy.
	 * @return scalar value representing this score
	 */
	public double getScore() {
		return getBalancedAccuracy();
	}

	/**
	 * Get the score displayed via the program's interface. This will always be equal to the value returned by {@link #getScore()}.
	 * @param display ignored
	 * @return score displayed via the program's interface
	 */
	public double getScore(final boolean display) {
		return getScore();
	}

	/**
	 * Get string representation of the scalar value of this score.
	 * @return string representation of the scalar value of this score
	 */
	@Override
	public String toString() {
		return Double.toString(getScore());
	}
}

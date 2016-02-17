package org.epistasis.symod.continuous;

import org.epistasis.evolutionary.Score;

/**
 * A simple implementation of the Score interface which is backed by a double value.
 */
public class DoubleScore implements Score {
	/** Value of this score object. */
	private final double result;

	/**
	 * Construct a DoubleScore.
	 * @param result value to store as the score
	 */
	public DoubleScore(final double result) {
		this.result = result;
	}

	/**
	 * Compare two double values by user-specified criteria. "Better" scores should be sorted first.
	 * @param a first double value
	 * @param b second double value
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, 0 otherwise
	 */
	public int compareScores(final double a, final double b) {
		return Double.compare(a, b);
	}

	/**
	 * Compare this score to another in ascending order.
	 * @param obj other score
	 * @return &lt; 0 if this &lt; obj, &gt; 0 if this &gt; obj, 0 otherwise
	 */
	public int compareTo(final Score dr) {
		if (this == dr) {
			return 0;
		}
		return compareScores(getScore(), dr.getScore());
	}

	/**
	 * Get the double value represented by this score.
	 * @return double value represented by this score
	 */
	public double getScore() {
		return result;
	}

	/**
	 * Get the double value represented by this score.
	 * @param display ignored
	 * @return double value represented by this score
	 */
	public double getScore(final boolean display) {
		return getScore();
	}

	/**
	 * Get a string representation of the double value represented by this score.
	 * @return string representation of score value
	 */
	@Override
	public String toString() {
		return Double.toString(result);
	}
}

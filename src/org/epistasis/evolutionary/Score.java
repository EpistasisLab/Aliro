package org.epistasis.evolutionary;

import java.text.DecimalFormat;
import java.text.NumberFormat;

/**
 * Implementing objects represent the result of evaluating a genome.
 */
public interface Score extends Comparable<Score> {
	/** NumberFormat to be used for converting scores to strings. */
	public static final NumberFormat nf = new DecimalFormat("0.0000");

	/**
	 * Compare two double values by user-specified criteria. "Better" scores should be sorted first.
	 * @param a first double value
	 * @param b second double value
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, 0 otherwise
	 */
	public int compareScores(double a, double b);

	/**
	 * Get the score used by the evolutionary algorithms.
	 * @return score used by the evolutionary algorithms
	 */
	public double getScore();

	/**
	 * Get the score displayed via the program's interface. This may be different if the scores are being z-transformed, but the untransformed
	 * scores should be displayed, for example.
	 * @param display true to get the display score, false to return the same as {@link Score#getScore()}
	 * @return score displayed via the program's interface
	 */
	public double getScore(boolean display);
}

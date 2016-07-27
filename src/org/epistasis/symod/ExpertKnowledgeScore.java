package org.epistasis.symod;

import org.epistasis.evolutionary.Score;

/**
 * Implementation of score which supports the linear combination expert knowledge fitness function.
 */
public class ExpertKnowledgeScore implements Score {
	/** Linear weight for base score. */
	private final double alpha;
	/** Mean of population's base scores. */
	private double baseMean = 0;
	/** Base score from base fitness function. */
	private final Score baseScore;
	/** Standard deviation of population's base scores. */
	private double baseStdDev = 1;
	/** Linear weight for expert knowledge score. */
	private final double beta;
	/** Expert knowledge score. */
	private final double score;

	/**
	 * Construct an ExpertKnowledgeScore.
	 * @param baseScore actual score from the underlying fitness function
	 * @param score expert knowledge score
	 * @param alpha linear weight for base score
	 * @param beta linear weight for expert knowledge score
	 */
	public ExpertKnowledgeScore(final Score baseScore, final double score, final double alpha, final double beta) {
		this.baseScore = baseScore;
		this.score = score;
		this.alpha = alpha;
		this.beta = beta;
	}

	/**
	 * Compare two double values by the base score criteria. "Better" scores should be sorted first.
	 * @param a first double value
	 * @param b second double value
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, 0 otherwise
	 */
	public int compareScores(final double a, final double b) {
		return baseScore.compareScores(a, b);
	}

	public int compareTo(final Score ekr) {
		if (this == ekr) {
			return 0;
		}
		return compareScores(getScore(), ekr.getScore());
	}

	public double getScore() {
		if (Double.isInfinite(score) || Double.isNaN(score)) {
			return alpha * baseScore.getScore();
		}
		return alpha * ((baseScore.getScore() - baseMean) / baseStdDev) + beta * score;
	}

	/**
	 * Get the score displayed via the program's interface.
	 * @return score displayed via the program's interface
	 */
	public double getScore(final boolean display) {
		return display ? baseScore.getScore(true) : getScore();
	}

	/**
	 * Set the distribution parameters for the population's base scores.
	 * @param mean arithmetic mean of base scores
	 * @param stddev standard deviation of base scores
	 */
	public void setBaseDist(final double mean, final double stddev) {
		baseMean = mean;
		baseStdDev = stddev;
	}
}

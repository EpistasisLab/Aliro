package org.epistasis.symod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.epistasis.Pair;

/**
 * Selects subsets of attributes based on scores assigned by {@link AbstractAttributeScorer}.
 */
public class AttributeRanker {
	/** List used to store a list of attribute indices in a certain order. */
	private List<Integer> attributes;
	/** Scorer used to assign a score to each attribute in the data set. */
	private AbstractAttributeScorer scorer;
	/** List of pairs of attribute names and the associated scores. */
	private List<Pair<String, Double>> scores;

	/**
	 * Get the data set whose attributes are being ranked.
	 * @return data set whose attributes are being ranked
	 */
	public AbstractDataset getData() {
		return scorer == null ? null : scorer.getData();
	}

	/**
	 * Get the scorer used to rank the attributes.
	 * @return scorer used to rank the attributes
	 */
	public AbstractAttributeScorer getScorer() {
		return scorer;
	}

	/**
	 * Get a list of pairs of attribute names and associated scores sorted by score. Whether the sort is ascending or descending or not
	 * depends on the parameter passed to {@link #rank(boolean)}, which must be called prior to calling this function.
	 * @return pairs of attribute names and associated scores sorted by score
	 */
	public List<Pair<String, Double>> getSortedScores() {
		return scores;
	}

	/**
	 * Compute the score for each attribute and sort the attributes in order of score.
	 * @param ascending whether to sort the attributes in ascending or descending order
	 * @return pairs of attribute names and associated scores sorted by score
	 */
	public List<Pair<String, Double>> rank(final boolean ascending) {
		scorer.compute();
		Collections.sort(attributes, new RankOrder(scorer, ascending));
		scores = new ArrayList<Pair<String, Double>>(attributes.size());
		for (final Integer attr : attributes) {
			scores.add(new Pair<String, Double>(getData().getLabels().get(attr).toString(), scorer.get(attr)));
		}
		return scores;
	}

	/**
	 * Compute the attributes' scores with {@link #rank(boolean)}, then sort them and return an array of indices to the first n attributes.
	 * @param n number of attributes to select
	 * @param ascending whether to sort the attributes in ascending or descending order
	 * @return array of indices to selected attributes
	 */
	public int[] selectN(final int n, final boolean ascending) {
		if (scorer == null) {
			throw new IllegalStateException("No Scorer");
		}
		if (getData() == null) {
			throw new IllegalStateException("No Dataset");
		}
		rank(ascending);
		final int[] attr = new int[n];
		for (int i = 0; i < attr.length; ++i) {
			attr[i] = (attributes.get(i)).intValue();
		}
		return attr;
	}

	/**
	 * Compute the attributes' scores with {@link #rank(boolean)}, then sort them and return an array of indices to the first n% attributes.
	 * @param pct percent of attributes to select (in the interval [0,1])
	 * @param ascending whether to sort the attributes in ascending or descending order
	 * @return array of indices to selected attributes
	 */
	public int[] selectPct(final double pct, final boolean ascending) {
		return selectN((int) Math.ceil(pct * (attributes == null ? 0 : attributes.size())), ascending);
	}

	/**
	 * Compute the attributes' scores with {@link #rank(boolean)}, then sort them and return an array of indices to the attributes passing a
	 * threshold cutoff.
	 * @param threshold cutoff value
	 * @param above true to return attributes above the cutoff, false to return attributes below the cutoff
	 * @param closed true to return attributes equal to the cutoff, false not to
	 * @return array of indices to selected attributes
	 */
	public int[] selectThreshold(final double threshold, final boolean above, final boolean closed) {
		if (scorer == null) {
			throw new IllegalStateException("No Scorer");
		}
		if (getData() == null) {
			throw new IllegalStateException("No Dataset");
		}
		rank(!above);
		final List<Integer> selected = new ArrayList<Integer>();
		for (final Integer attr : attributes) {
			final double value = scorer.get(attr);
			if (!((above && (value > threshold)) || ((!above) && (value < threshold)) || (closed && (value == threshold)))) {
				break;
			}
			selected.add(attr);
		}
		final int[] attr = new int[selected.size()];
		for (int i = 0; i < attr.length; ++i) {
			attr[i] = selected.get(i);
		}
		return attr;
	}

	/**
	 * Set the scorer used to score the attributes to be ranked. This is also the source of the data set which contains the attributes to be
	 * ranked.
	 * @param scorer scorer used to score the attributes to be ranked
	 */
	public void setScorer(final AbstractAttributeScorer scorer) {
		this.scorer = scorer;
		if (scorer == null) {
			attributes = null;
		} else {
			attributes = new ArrayList<Integer>(scorer.getData().getNumAttributes() - 1);
			for (int i = 0; i < scorer.getData().getNumAttributes() - 1; ++i) {
				attributes.add(i);
			}
		}
	}

	/**
	 * Establishes an ordering of integers based on a set of scores. The integers are treated as indexes into the set of scores, and are
	 * sorted in either ascending or descending order of score.
	 */
	private static class RankOrder implements Comparator<Integer> {
		/** Flag which indicates whether to sort ascending or descending. */
		private final boolean ascending;
		/** Scores to use for ordering. */
		private final List<Double> scores;

		/**
		 * Construct a RankOrder.
		 * @param scores set of scores to use for ordering
		 * @param ascending true to sort ascending, false for descending
		 */
		public RankOrder(final List<Double> scores, final boolean ascending) {
			this.scores = scores;
			this.ascending = ascending;
		}

		/**
		 * Perform a comparison.
		 * @param o1 first integer to compare
		 * @param o2 second integer to compare
		 * @return &lt; 0 if o1 &lt; o1, &gt; 0 if o1 &gt; o2, or 0 otherwise
		 */
		public int compare(final Integer o1, final Integer o2) {
			final Double a = scores.get(o1);
			final Double b = scores.get(o2);
			final int retVal = a.compareTo(b);
			return ascending ? retVal : -retVal;
		}
	}
}

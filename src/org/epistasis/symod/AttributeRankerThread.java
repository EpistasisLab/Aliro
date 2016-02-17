package org.epistasis.symod;

import java.util.Arrays;

/**
 * Thread used to run an {@link org.epistasis.symod.AttributeRanker} in the background.
 */
// should perhaps be made a runnable, not a thread?
public class AttributeRankerThread extends Thread {
	/** Whether to sort the attributes ascending or descending by score. */
	private final boolean ascending;
	/**
	 * For threshold selection, whether to include values equal to the threshold.
	 */
	private boolean closed;
	/** Selected subset of attributes. */
	private int[] combo;
	/** Selection mode. */
	private final Selection mode;
	/** Callback to run when ranking is done. */
	private final Runnable onEnd;
	/** Ranker with which to rank and select the attributes. */
	private final AttributeRanker ranker = new AttributeRanker();
	/** Threshold value for theshold selection. */
	private final Double value;

	/**
	 * Construct an AttributeRankerThread to rank attributes and select a subset based on a threshold value.
	 * @param scorer scorer to use for ranking
	 * @param threshold threshold cutoff value
	 * @param above true to return values above the threshold, false to select values below the threshold
	 * @param closed include values equal to the threshold value
	 * @param onEnd callback to run when ranking is done
	 * @see AttributeRanker#selectThreshold(double, boolean, boolean)
	 */
	public AttributeRankerThread(final AbstractAttributeScorer scorer, final double threshold, final boolean above, final boolean closed,
			final Runnable onEnd) {
		super("AttributeRankerThread");
		ranker.setScorer(scorer);
		value = new Double(threshold);
		mode = Selection.Threshold;
		ascending = !above;
		this.closed = closed;
		this.onEnd = onEnd;
	}

	/**
	 * Construct an AttributeRankerThread to rank attributes and select the best n percent as a subset.
	 * @param scorer scorer to use for ranking
	 * @param pct percent of attributes to select (in the inteval [0,1])
	 * @param ascending true to sort attributes ascending by score, false to sort descending
	 * @param onEnd callback to run when ranking is done
	 * @see AttributeRanker#selectPct(double, boolean)
	 */
	public AttributeRankerThread(final AbstractAttributeScorer scorer, final double pct, final boolean ascending, final Runnable onEnd) {
		super("AttributeRankerThread");
		ranker.setScorer(scorer);
		value = new Double(pct);
		mode = Selection.Pct;
		this.ascending = ascending;
		this.onEnd = onEnd;
	}

	/**
	 * Construct an AttributeRankerThread to rank attributes and select the best n attributes as a subset.
	 * @param scorer scorer to use for ranking
	 * @param n number of attributes to select
	 * @param ascending true to sort attributes ascending by score, false to sort descending
	 * @param onEnd callback to run when ranking is done
	 * @see AttributeRanker#selectN(int, boolean)
	 */
	public AttributeRankerThread(final AbstractAttributeScorer scorer, final int n, final boolean ascending, final Runnable onEnd) {
		super("AttributeRankerThread");
		ranker.setScorer(scorer);
		value = new Double(n);
		mode = Selection.N;
		this.ascending = ascending;
		this.onEnd = onEnd;
	}

	/**
	 * Get the combination of attributes selected.
	 * @return combination of attributes selected
	 */
	public int[] getCombo() {
		return combo;
	}

	/**
	 * Get the ranker used to rank attributes.
	 * @return ranker used to rank attributes
	 */
	public AttributeRanker getRanker() {
		return ranker;
	}

	/**
	 * Perform the ranking and selecting of subsets.
	 */
	@Override
	public void run() {
		switch (mode) {
			case N:
				combo = ranker.selectN(value.intValue(), ascending);
				break;
			case Pct:
				combo = ranker.selectPct(value.doubleValue(), ascending);
				break;
			case Threshold:
				combo = ranker.selectThreshold(value.doubleValue(), !ascending, closed);
				break;
		}
		Arrays.sort(combo);
		if (onEnd != null) {
			onEnd.run();
		}
	}

	/**
	 * Selection mode.
	 */
	private static enum Selection {
		/** Select N attributes. */
		N,
		/** Select a given percent of attributes. */
		Pct,
		/** Select attributes passing a threshold cutoff. */
		Threshold
	}
}

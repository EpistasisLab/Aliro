package org.epistasis;

import java.util.Comparator;

/**
 * A pair of values. The JDK really should have one of these.
 * @param <F> type of the first element
 * @param <S> type of the second element
 */
public class Pair<F, S> {
	/** The first element. */
	private final F first;
	/** The second element. */
	private final S second;

	/**
	 * Constructs a Pair, given two elements.
	 * @param first the first element
	 * @param second the second element
	 */
	public Pair(final F first, final S second) {
		this.first = first;
		this.second = second;
	}

	/**
	 * Returns the first element.
	 * @return the first element
	 */
	public F getFirst() {
		return first;
	}

	/**
	 * Returns the second element.
	 * @return the second element
	 */
	public S getSecond() {
		return second;
	}

	/**
	 * Comparator that looks only at the first element of a Pair.
	 * @param <F> type of the first element
	 * @param <S> type of the second element
	 */
	public static class FirstComparator<F, S> implements Comparator<Pair<F, S>> {
		/** User-specified comparator, if any. */
		private Comparator<F> cmp;

		/**
		 * Constructs a FirstComparator. F must implement Comparable<F>.
		 */
		public FirstComparator() {
		}

		/**
		 * Constructs a FirstComparator with a user-specified comparison.
		 * @param cmp Comparator to use when comparing first elements
		 */
		public FirstComparator(final Comparator<F> cmp) {
			this.cmp = cmp;
		}

		/**
		 * Performs the comparison, using user-specified comparator, if any.
		 * @param a first of two pairs to compare
		 * @param b second of two pairs to compare
		 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
		 */
		@SuppressWarnings("unchecked")
		public int compare(final Pair<F, S> a, final Pair<F, S> b) {
			if (cmp == null) {
				return ((Comparable<F>) a.first).compareTo(b.first);
			} else {
				return cmp.compare(a.first, b.first);
			}
		}
	}

	/**
	 * Comparator that looks only at the second element of a Pair.
	 * @param <F> type of the first element
	 * @param <S> type of the second element
	 */
	public static class SecondComparator<F, S> implements Comparator<Pair<F, S>> {
		/** User-specified comparator, if any. */
		private Comparator<S> cmp;

		/**
		 * Constructs a SecondComparator. S must implement Comparable<S>.
		 */
		public SecondComparator() {
		}

		/**
		 * Constructs a SecondComparator with a user-specified comparison.
		 * @param cmp Comparator to use when comparing first elements
		 */
		public SecondComparator(final Comparator<S> cmp) {
			this.cmp = cmp;
		}

		/**
		 * Performs the comparison, using user-specified comparator, if any.
		 * @param a first of two pairs to compare
		 * @param b second of two pairs to compare
		 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
		 */
		@SuppressWarnings("unchecked")
		public int compare(final Pair<F, S> a, final Pair<F, S> b) {
			if (cmp == null) {
				return ((Comparable<S>) a.second).compareTo(b.second);
			} else {
				return cmp.compare(a.second, b.second);
			}
		}
	} // end SecondComparator

	/**
	 * Comparator that looks only at the second element of a Pair.
	 * @param <F> type of the first element
	 * @param <S> type of the second element
	 */
	public static class SecondThenFirstComparator<F, S> implements Comparator<Pair<F, S>> {
		/** User-specified comparator, if any. */
		private Comparator<S> cmp;

		/**
		 * Constructs a SecondComparator. S must implement Comparable<S>.
		 */
		public SecondThenFirstComparator() {
		}

		/**
		 * Constructs a SecondComparator with a user-specified comparison.
		 * @param cmp Comparator to use when comparing first elements
		 */
		public SecondThenFirstComparator(final Comparator<S> cmp) {
			this.cmp = cmp;
		}

		/**
		 * Performs the comparison, using user-specified comparator, if any.
		 * @param a first of two pairs to compare
		 * @param b second of two pairs to compare
		 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
		 */
		@SuppressWarnings("unchecked")
		public int compare(final Pair<F, S> a, final Pair<F, S> b) {
			int returnVal = 0;
			if (a == b) {
				if (cmp == null) {
					returnVal = ((Comparable<S>) a.second).compareTo(b.second);
				} else {
					returnVal = cmp.compare(a.second, b.second);
				}
				if (returnVal == 0) {
					returnVal = ((Comparable<F>) a.first).compareTo(b.first);
				}
			}
			return returnVal;
		} // end compare
	} // end SecondThenFirstComparator
}

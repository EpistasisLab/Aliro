package org.epistasis;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Meta-comparator that executes its child comparators in order until one comparison returns not equal.
 * @param <T> type of object to compare
 */
public class ChainComparator<T> implements Comparator<T> {
	/** List of child comparators. */
	private final List<Comparator<T>> cmps;

	/**
	 * Construct a ChainComparator with a given list of child comparators.
	 * @param cmps list of child comparators
	 */
	public ChainComparator(List<Comparator<T>> cmps) {
		// ensure cmps isn't null
		if (cmps == null) {
			cmps = Collections.emptyList();
		}
		// store copy of the list of child comparators in cmps
		this.cmps = new ArrayList<Comparator<T>>(cmps.size());
		this.cmps.addAll(cmps);
	}

	/**
	 * Compare two objects of type T by successively executing the list of child comparators.
	 * @param a first object to compare
	 * @param b second object to compare
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
	 */
	public int compare(final T a, final T b) {
		// for all comparators in cmps...
		for (final Comparator<T> cmp : cmps) {
			// make the comparison
			final int c = cmp.compare(a, b);
			// if the comparison isn't equal, return its result
			if (c != 0) {
				return c;
			}
		}
		// all comparators returned equal, so return equal
		return 0;
	}

	/**
	 * Determine whether a comparators is equal to this one. Equality of comparators is defined as the two comparators would compare two
	 * objects the same way.
	 * @param c the comparator to compare to this one
	 * @return true if the given comparator is equal to this one
	 */
	@SuppressWarnings("unchecked")
	@Override
	public boolean equals(final Object c) {
		// check for identity
		if (this == c) {
			return true;
		}
		// make sure the input parameter is the proper type
		if (!(c instanceof ChainComparator)) {
			return false;
		}
		// cast the input parameter to the proper type
		final ChainComparator<T> cmp = (ChainComparator<T>) c;
		// the comparators are equal if their child comparators are equal
		return cmp.cmps.equals(cmps);
	}
}

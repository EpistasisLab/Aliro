package org.epistasis;

import java.util.Comparator;

/**
 * Comparator which first converts its arguments to strings and then compares them lexicographically.
 * @param <T> type of objects to compare
 */
public class ToStringComparator<T> implements Comparator<T> {
	/**
	 * Perform the comparison.
	 * @param a first object to compare
	 * @param b second object to compare
	 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
	 */
	public int compare(final T a, final T b) {
		if (a == b) {
			return 0;
		}
		if (a == null) {
			return -1;
		}
		if (b == null) {
			return 1;
		}
		return a.toString().compareTo(b.toString());
	}
}

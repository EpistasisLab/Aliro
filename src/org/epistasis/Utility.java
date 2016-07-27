package org.epistasis;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

/**
 * Miscellaneous mathematical and utility functions.
 */
public final class Utility {
	/** Quick access to system line separator */
	public static final String NEWLINE = System.getProperty("line.separator");

	public static double average(final double[] values) {
		double returnVal = 0;
		if (values.length > 0) {
			double sum = 0;
			for (final double value : values) {
				sum += value;
			}
			returnVal = sum / values.length;
		}
		return returnVal;
	}

	/**
	 * Create a string which is a repetition of a single character a given number of times.
	 * @param c character to repeat
	 * @param count number of times to repeat
	 * @return string of repeated characters
	 */
	public static String chrdup(final char c, final int count) {
		if (count < 0) {
			return "";
		}
		final char[] a = new char[count];
		Arrays.fill(a, c);
		return String.valueOf(a);
	}

	/**
	 * Compute the number of combinations possible when choosing r from n.
	 * @param n The total number of items
	 * @param r The number of items to choose
	 * @return Number of possible combinations
	 */
	public static BigInteger combinations(final BigInteger n, BigInteger r) {
		if (r.compareTo(n.shiftRight(1)) < 0) {
			r = n.subtract(r);
		}
		return Utility.permutations(n, r).divide(Utility.factorial(r));
	}

	/**
	 * Compute the number of combinations possible when choosing r from n.
	 * @param n The total number of items
	 * @param r The number of items to choose
	 * @return Number of possible combinations
	 */
	public static long combinations(final long n, long r) {
		if (r > n / 2) {
			r = n - r;
		}
		return Utility.product(BigInteger.valueOf(n - r + 1), BigInteger.valueOf(n)).divide(Utility.factorial(BigInteger.valueOf(r)))
				.longValue();
	}

	/**
	 * Compute the factorial of a long integer.
	 * @param n Number of which to compute the factorial
	 * @return Factorial of the parameter
	 */
	public static BigInteger factorial(final BigInteger n) {
		return Utility.product(BigInteger.valueOf(2), n);
	}

	/**
	 * Compute the factorial of a long integer.
	 * @param n Number of which to compute the factorial
	 * @return Factorial of the parameter
	 */
	public static long factorial(final long n) {
		return Utility.product(2, n);
	}

	/**
	 * Find the n lowest elements of a list of T's. T must implement Comparable&lt;T&gt;.
	 * @param <T> type of element
	 * @param list list of elements from which to find the n lowest
	 * @param n number of lowest elements to find
	 * @return n lowest n elements from list
	 */
	public static <T> List<T> lowestN(final List<T> list, final int n) {
		return Utility.lowestN(list, n, null);
	}

	/**
	 * Find the n lowest elements of a list of T's, using a user-specified Comparator.
	 * @param <T> type of element
	 * @param list list of elements from which to find the n lowest
	 * @param n number of lowest elements to find
	 * @param c user-specified Comparator
	 * @return n lowest n elements from list
	 */
	@SuppressWarnings("unchecked")
	public static <T> List<T> lowestN(final List<T> list, final int n, final Comparator<T> c) {
		if (list.size() <= n) {
			return new ArrayList<T>(list);
		}
		final List<T> lowest = new ArrayList<T>(n);
		final int[] indices = new int[n];
		int maxindex = 0;
		int i = 0;
		for (final Iterator<T> iter = list.iterator(); iter.hasNext(); ++i) {
			final T o = iter.next();
			if (lowest.size() < n) {
				indices[maxindex] = i;
				lowest.add(o);
				if (lowest.size() == n) {
					maxindex = Utility.maxIndex(lowest, c);
				} else {
					maxindex++;
				}
				continue;
			}
			final T max = lowest.get(maxindex);
			if (c == null) {
				if (((Comparable<T>) o).compareTo(max) < 0) {
					indices[maxindex] = i;
					lowest.set(maxindex, o);
					maxindex = Utility.maxIndex(lowest, c);
				}
			} else {
				if (c.compare(o, max) < 0) {
					indices[maxindex] = i;
					lowest.set(maxindex, o);
					maxindex = Utility.maxIndex(lowest, c);
				}
			}
		}
		return lowest;
	}

	/**
	 * Find the index of the maximum element of a list of T's. T must implement Comparable&lt;T&gt;.
	 * @param <T> type of list element
	 * @param list list of elements
	 * @return index of maximum element of list
	 */
	public static <T> int maxIndex(final List<T> list) {
		return Utility.maxIndex(list, null);
	}

	/**
	 * Find the index of the maximum element of a list of T's, using a user-specified comparator.
	 * @param <T> type of list element
	 * @param list list of elements
	 * @param c user-specified comparator
	 * @return index of maximum element of list
	 */
	@SuppressWarnings("unchecked")
	public static <T> int maxIndex(final List<T> list, final Comparator<T> c) {
		int maxIndex = -1;
		T maxObj = null;
		int i = 0;
		for (final Iterator<T> iter = list.iterator(); iter.hasNext(); ++i) {
			final T o = iter.next();
			if (maxObj == null) {
				maxIndex = i;
				maxObj = o;
				continue;
			}
			if (c == null) {
				if (((Comparable<T>) o).compareTo(maxObj) > 0) {
					maxIndex = i;
					maxObj = o;
				}
			} else {
				if (c.compare(o, maxObj) > 0) {
					maxIndex = i;
					maxObj = o;
				}
			}
		}
		return maxIndex;
	}

	/**
	 * Compute the median of a sorted array of doubles.
	 * @param sorted sorted array of doubles for which to take the median
	 * @return median of sorted array of doubles
	 */
	public static double median(final double[] sorted) {
		return Utility.quantile(sorted, 2, 1);
	}

	/**
	 * Compute the median of a sorted array of floats.
	 * @param sorted sorted array of floats for which to take the median
	 * @return median of sorted array of floats
	 */
	public static float median(final float[] sorted) {
		return Utility.quantile(sorted, 2, 1);
	}

	/**
	 * Ensure a string is a minimum length by padding it with spaces on the left.
	 * @param s string to pad
	 * @param len minimum length for string
	 * @return padded string
	 */
	public static String padLeft(final String s, final int len) {
		final StringBuffer b = new StringBuffer(len);
		b.append(Utility.chrdup(' ', len - s.length()));
		b.append(s);
		return b.toString();
	}

	/**
	 * Ensure a string is a minimum length by padding it with spaces on the right.
	 * @param s string to pad
	 * @param len minimum length for string
	 * @return padded string
	 */
	public static String padRight(final String s, final int len) {
		final StringBuffer b = new StringBuffer(len);
		b.append(s);
		b.append(Utility.chrdup(' ', len - s.length()));
		return b.toString();
	}

	/**
	 * Compute the number of permutations possible when choosing r from n.
	 * @param n The total number of items
	 * @param r The number of items to choose
	 * @return Number of possible permutations
	 */
	public static BigInteger permutations(final BigInteger n, final BigInteger r) {
		return Utility.product(n.subtract(r).add(BigInteger.ONE), n);
	}

	/**
	 * Compute the number of permutations possible when choosing r from n.
	 * @param n The total number of items
	 * @param r The number of items to choose
	 * @return Number of possible permutations
	 */
	public static long permutations(final long n, final long r) {
		return Utility.product(n - r + 1, n);
	}

	/**
	 * Compute the product of all integers in the range [min,max].
	 * @param min First number to include in product
	 * @param max Last number to include in product
	 * @return Product of all integers in range.
	 */
	public static BigInteger product(final BigInteger min, final BigInteger max) {
		BigInteger ret = BigInteger.ONE;
		for (BigInteger i = min; i.compareTo(max) <= 0; i = i.add(BigInteger.ONE)) {
			ret = ret.multiply(i);
		}
		return ret;
	}

	/**
	 * Compute the product of all integers in the range [min,max].
	 * @param min First number to include in product
	 * @param max Last number to include in product
	 * @return Product of all integers in range.
	 */
	public static long product(final long min, final long max) {
		long ret = 1;
		for (long i = min; i <= max; ++i) {
			ret *= i;
		}
		return ret;
	}

	/**
	 * Compute a quantile on a sorted array. If the quantile falls between two values in the array, a weighted average is used to estimate a
	 * value.
	 * @param sorted A sorted array of values for which to compute quantiles.
	 * @param k What kind of quantile to compute. 2 for median, 3 for tertiles, etc.
	 * @param i Which quantile to compute. 0 for the minimum value, 1 for the first quantile, ..., k for the maximum value.
	 * @return i-th k-tile of the input values.
	 */
	public static double quantile(final double[] sorted, final int k, final int i) {
		if (sorted.length == 0) {
			return Double.NaN;
		} else if (sorted.length == 1) {
			return sorted[0];
		}
		final int numer = (sorted.length - 1) * i;
		if (numer % k == 0) {
			return sorted[numer / k];
		}
		double ktile = (double) numer / (double) k;
		final int index = (int) Math.floor(ktile);
		ktile -= index;
		return (1.0 - ktile) * sorted[index] + ktile * sorted[index + 1];
	}

	/**
	 * Compute a quantile on a sorted array. If the quantile falls between two values in the array, a weighted average is used to estimate a
	 * value.
	 * @param sorted A sorted array of values for which to compute quantiles.
	 * @param k What kind of quantile to compute. 2 for median, 3 for tertiles, etc.
	 * @param i Which quantile to compute. 0 for the minimum value, 1 for the first quantile, ..., k for the maximum value.
	 * @return i-th k-tile of the input values.
	 */
	public static float quantile(final float[] sorted, final int k, final int i) {
		if (sorted.length == 0) {
			return Float.NaN;
		} else if (sorted.length == 1) {
			return sorted[0];
		}
		final int numer = (sorted.length - 1) * i;
		if (numer % k == 0) {
			return sorted[numer / k];
		}
		float ktile = (float) numer / (float) k;
		final int index = (int) Math.floor(ktile);
		ktile -= index;
		return (1.0f - ktile) * sorted[index] + ktile * sorted[index + 1];
	}

	/**
	 * Ensure a real number is in the interval [begin,end) by adding or subtracting a multiple of (end - begin).
	 * @param x value to modify
	 * @param begin beginning of interval
	 * @param end end of interval
	 * @return x, modified to fall inside the target interval
	 */
	public static double wrap(double x, final double begin, final double end) {
		final double size = end - begin;
		if (size <= 0) {
			throw new IllegalArgumentException();
		}
		if (x < begin) {
			final long factor = (long) Math.ceil((begin - x) / size);
			x += factor * size;
		} else if (x > end) {
			final long factor = (long) Math.ceil((x - end) / size);
			x -= factor * size;
		}
		if (x == end) {
			x = begin;
		}
		return x;
	}

	/**
	 * Ensure an integer is in the interval [begin,end) by adding or subtracting a multiple of (end - begin).
	 * @param x value to modify
	 * @param begin beginning of interval
	 * @param end end of interval
	 * @return x, modified to fall inside the target interval
	 */
	public static int wrap(int x, final int begin, final int end) {
		final int size = end - begin;
		if (size <= 0) {
			throw new IllegalArgumentException();
		}
		if (x < begin) {
			final long factor = (long) Math.ceil((double) (begin - x) / size);
			x += factor * size;
		} else if (x > end) {
			final long factor = (long) Math.ceil((double) (x - end) / size);
			x -= factor * size;
		}
		if (x == end) {
			x = begin;
		}
		return x;
	}

	/**
	 * This class is not to be instantiated.
	 */
	private Utility() {
	}
}

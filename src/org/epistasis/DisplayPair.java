package org.epistasis;
/**
 * Subclass of Pair which forwards toString() to that of the first element.
 * @param <F> type of first element
 * @param <S> type of second element
 */
public class DisplayPair<F, S> extends Pair<F, S> {
	/**
	 * Construct a DisplayPair
	 * @param f first element
	 * @param s second element
	 */
	public DisplayPair(final F f, final S s) {
		super(f, s);
	}

	/**
	 * Forward to first element's toString().
	 * @return string representation of first element
	 */
	@Override
	public String toString() {
		return getFirst().toString();
	}
}

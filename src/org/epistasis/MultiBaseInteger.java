package org.epistasis;
public class MultiBaseInteger {
	private final int[] dims;
	private final int[] digits;

	public MultiBaseInteger(final int[] dims) {
		this.dims = dims.clone();
		digits = new int[dims.length];
	}

	public int get(final int i) {
		return digits[i];
	}

	public boolean increment() {
		++digits[digits.length - 1];
		for (int i = digits.length - 1; (i > 0) && (digits[i] >= dims[i]); --i) {
			digits[i] = 0;
			++digits[i - 1];
		}
		if (digits[0] >= dims[0]) {
			digits[0] = 0;
			return false;
		}
		return true;
	}

	public int size() {
		return digits.length;
	}

	public long value() {
		long x = 0;
		long place = 1;
		for (int i = digits.length - 1; i >= 0; --i) {
			x += digits[i] * place;
			place *= dims[i];
		}
		return x;
	}
}

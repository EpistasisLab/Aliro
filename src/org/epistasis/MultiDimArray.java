package org.epistasis;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Multi-dimensional array of T
 * @param <T> type of object in array
 */
public class MultiDimArray<T> {
	/** Elements of the array. */
	private final List<T> array;
	/** Dimensions of the array. */
	private final List<Integer> dims;

	/**
	 * Construct a MultiDimArray.
	 * @param dims list of dimensions for array
	 */
	public MultiDimArray(final List<Integer> dims) {
		this.dims = new ArrayList<Integer>(dims.size());
		this.dims.addAll(dims);
		int size = 1;
		for (final int dim : dims) {
			size *= dim;
		}
		array = new ArrayList<T>(size);
		array.addAll(Collections.nCopies(size, (T) null));
	}

	/**
	 * Convert a linear index into a multi-dimensional index.
	 * @param index linear index
	 * @return list of indices, one for each dimension
	 */
	public List<Integer> decode(int index) {
		final List<Integer> idx = new ArrayList<Integer>(dims.size());
		idx.addAll(Collections.nCopies(dims.size(), 0));
		for (int i = dims.size(); i > 0; --i) {
			final int j = i - 1;
			final int dj = dims.get(j);
			idx.set(j, index % dj);
			index /= dj;
		}
		return idx;
	}

	/**
	 * Get the size of a dimension of the array.
	 * @param i index of the dimension
	 * @return size of the dimension
	 */
	public int dim(final int i) {
		return dims.get(i);
	}

	/**
	 * Get the number of dimensions in the array.
	 * @return number of dimensions in the array
	 */
	public int dims() {
		return dims.size();
	}

	/**
	 * Convert a multi-dimensional index into a linear index.
	 * @param idx list of indices, one for each dimension
	 * @return linear index
	 */
	public int encode(final List<Integer> idx) {
		int index = 0;
		for (int i = 0; i < dims.size(); ++i) {
			if (idx.get(i) >= dims.get(i)) {
				throw new ArrayIndexOutOfBoundsException("Index " + i + ", value = " + idx.get(i) + ", out of range.  Max " + "value = "
						+ (dims.get(i) - 1) + ".");
			}
			index += idx.get(i);
			if (i + 1 < dims.size()) {
				index *= dims.get(i + 1);
			}
		}
		return index;
	}

	/**
	 * Get an element of the array using a linear index. The array is stored in row-major order.
	 * @param index linear index of the element
	 * @return value of the specified element
	 */
	public T get(final int index) {
		return array.get(index);
	}

	/**
	 * Get an element of the array using a multi-dimensional index.
	 * @param idx list of indices, one for each dimension
	 * @return value of the specified element
	 */
	public T get(final List<Integer> idx) {
		return array.get(encode(idx));
	}

	/**
	 * Set an element of the array using a linear index. The array is stored in row-major order.
	 * @param index linear index of the element
	 * @param value value to set at the specified element
	 * @return previous value of the specified element
	 */
	public T set(final int index, final T value) {
		return array.set(index, value);
	}

	/**
	 * Set an element of the array using a multi-dimensional index.
	 * @param idx list of indices, one for each dimension
	 * @param value value to set at the specified element
	 * @return previous value of the specified element
	 */
	public T set(final List<Integer> idx, final T value) {
		return array.set(encode(idx), value);
	}

	/**
	 * Get the number of elements in the array. This is the product of all the dimensions.
	 * @return number of elements in the array
	 */
	public int size() {
		return array.size();
	}
}

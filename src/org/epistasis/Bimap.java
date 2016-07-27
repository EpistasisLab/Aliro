package org.epistasis;

import java.util.AbstractList;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Bidirectional map. Stores unique elements and allows lookup either by index (to get the element) or by element (to get the index).
 * @param <T> element type to store
 */
public class Bimap<T> extends AbstractList<T> {
	/** Handles index -> element lookup */
	private final List<T> list = new ArrayList<T>();
	/** Handles element -> index lookup */
	private final Map<T, Integer> map = new HashMap<T, Integer>();

	/**
	 * Add an element to the bimap at the specified index. This is used by all other add functions which are inherited.
	 * @param index index at which to add the element
	 * @param element element to add
	 * @throws java.lang.IllegalArgumentException if the element already exists in the bimap
	 */
	@Override
	public void add(final int index, final T element) {
		// ensure uniqueness of element
		if (map.containsKey(element)) {
			throw new IllegalArgumentException("Key already in bimap.");
		}
		// add element to list
		list.add(index, element);
		// update index info for elements after insertion point
		for (int i = index; i < size(); ++i) {
			map.put(list.get(i), i);
		}
	}

	/**
	 * Existence check for a given element. Overridden to use the map instead of a linear seach.
	 * @param obj element to check for
	 * @return true if element exists in the bimap
	 */
	@Override
	public boolean contains(final Object obj) {
		return map.containsKey(obj);
	}

	/**
	 * Index -> element lookup.
	 * @param index index to look up
	 * @return element at index
	 */
	@Override
	public T get(final int index) {
		return list.get(index);
	}

	/**
	 * Element -> index lookup. Overridden to use the map instead of a linear search.
	 * @param obj element to look up
	 * @return index of element
	 */
	@Override
	public int indexOf(final Object obj) {
		final Integer idx = map.get(obj);
		return idx == null ? -1 : idx;
	}

	/**
	 * Call indexOf() because the list is unique.
	 */
	@Override
	public int lastIndexOf(final Object obj) {
		return indexOf(obj);
	}

	/**
	 * Remove an element from the bimap at a given index.
	 * @param index index of element to remove
	 * @return removed element
	 */
	@Override
	public T remove(final int index) {
		// remove element from both lookup members
		final T ret = list.remove(index);
		map.remove(ret);
		// update indices for elements after removal point
		for (int i = index; i < size(); ++i) {
			map.put(list.get(i), i);
		}
		// return removed element
		return ret;
	}

	/**
	 * Set the element at a given index.
	 * @param index index of element to set
	 * @param element new element for index
	 * @throws java.lang.IllegalArgumentException if the element already exists in the bimap
	 */
	@Override
	public T set(final int index, final T element) {
		// ensure uniqueness of element
		if (map.containsKey(element)) {
			throw new IllegalArgumentException("Key already in bimap.");
		}
		// set the element
		final T ret = list.set(index, element);
		// update key for given index with new element
		map.put(element, map.remove(ret));
		// return old element at index
		return ret;
	}

	/**
	 * Get the number of elements in the bimap.
	 * @return the number of elements in the bimap
	 */
	@Override
	public int size() {
		return list.size();
	}
}

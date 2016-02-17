package org.epistasis.symod;

import java.util.EventObject;

/**
 * Event object fired when the data set is changed.
 */
public class DatasetChangeEvent extends EventObject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Dataset reference. */
	private final AbstractDataset data;
	/** Whether the Dataset is filtered. */
	private final boolean filtered;

	/**
	 * Construct a DatasetChangeEvent.
	 * @param source Object which fired the event
	 * @param data new Dataset reference
	 * @param filtered whether the Dataset is filtered from a previous Dataset
	 */
	public DatasetChangeEvent(final Object source, final AbstractDataset data, final boolean filtered) {
		super(source);
		this.data = data;
		this.filtered = filtered;
	}

	/**
	 * Get the Dataset reference.
	 * @return Dataset reference
	 */
	public AbstractDataset getData() {
		return data;
	}

	/**
	 * Get whether the Dataset is filtered.
	 * @return whether the Dataset is filtered
	 */
	public boolean isFiltered() {
		return filtered;
	}
}

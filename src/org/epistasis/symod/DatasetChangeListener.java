package org.epistasis.symod;

import java.util.EventListener;

/**
 * Interface to implement to receive notification of Dataset changes.
 */
public interface DatasetChangeListener extends EventListener {
	/**
	 * Virtual callback which is called when the Dataset changes
	 * @param e DatasetChangeEvent event object
	 */
	public void datasetChange(DatasetChangeEvent e);
}

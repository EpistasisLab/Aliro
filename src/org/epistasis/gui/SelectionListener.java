package org.epistasis.gui;

import java.util.EventListener;

/**
 * Interface for a class to implement in order for it to receive notification of SelectionEvents.
 */
public interface SelectionListener extends EventListener {
	/**
	 * Handle a SelectionEvent.
	 * @param e event object to handle
	 */
	public void selectionChanged(SelectionEvent e);
}

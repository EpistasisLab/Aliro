package org.epistasis.evolutionary;

import java.util.EventListener;

/**
 * Interface to implement to listen for PopulationEvents.
 */
public interface PopulationListener extends EventListener {
	/**
	 * Called when a source being listened to fires a PopulationEvent.
	 * @param e event object which was fired
	 */
	public void populationEvaluated(PopulationEvent e);
}

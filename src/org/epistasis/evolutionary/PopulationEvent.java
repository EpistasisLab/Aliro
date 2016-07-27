package org.epistasis.evolutionary;

import java.util.EventObject;

/**
 * Event object to represent an event which happened with respect to a population.
 */
public class PopulationEvent extends EventObject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Associated population. */
	private final Population pop;

	/**
	 * Construct a population event.
	 * @param source object that fired the event
	 * @param pop population associated with the event
	 */
	public PopulationEvent(final Object source, final Population pop) {
		super(source);
		this.pop = pop;
	}

	/**
	 * Get the population associated with this event.
	 * @return population associated with this event
	 */
	public Population getPopulation() {
		return pop;
	}
}

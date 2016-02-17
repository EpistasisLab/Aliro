package org.epistasis.evolutionary;
/**
 * Terminate an evolution when it reaches a maximum generation.
 */
public class MaxGenTerminator implements Evolution.Terminator {
	/** Maximum generation for an evolution. */
	private final int maxGen;

	/**
	 * Construct a MaxGenTerminator with a given maximum generation.
	 * @param maxGen maximum generation for an evolution
	 */
	public MaxGenTerminator(final int maxGen) {
		this.maxGen = maxGen;
	}

	/**
	 * Check if an evolution has met the termination condition.
	 */
	public boolean terminate(final Evolution evolution) {
		return evolution.getStatistics().getGeneration() >= maxGen;
	}
}

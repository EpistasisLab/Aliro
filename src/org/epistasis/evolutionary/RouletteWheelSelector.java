package org.epistasis.evolutionary;

import java.util.Random;

import org.epistasis.RouletteWheel;

/**
 * Selector which selects genomes probabilistically, weighted by scaled score. Scaled scores must be all positive or all negative for this
 * to work.
 */
public class RouletteWheelSelector implements Evolver.Selector {
	/** Random number generator used by this selector. */
	private final Random random;
	/** Roulette wheel used by this selector. */
	private final RouletteWheel<Genome> wheel = new RouletteWheel<Genome>();

	/**
	 * Construct a RouletteWheelSelector.
	 * @param random random number generator to use
	 * @param replacement true if this selector should use replacement; false otherwise
	 */
	public RouletteWheelSelector(final Random random) {
		this.random = random;
	}

	/**
	 * Add a genome to consideration.
	 * @param g genome to add
	 */
	public void add(final Genome g) {
		wheel.add(g, g.getScore().getScore());
	}

	/**
	 * Initialize the selector with all the genomes in a population.
	 * @param population population with which to initialize the selector
	 */
	public void initialize(final Population population) {
		wheel.reset();
		for (final Genome g : population) {
			wheel.add(g, g.getScore().getScore());
		}
	}

	/**
	 * Select a genome from the selector.
	 * @return selected genome
	 */
	public Genome select() {
		if (wheel.isEmpty()) {
			return null;
		}
		final Genome g = wheel.spin(random);
		if (g == null) {
			throw new Error("Selected null genome");
		}
		return g;
	}

	public int size() {
		return wheel.size();
	}

	public boolean usesReplacement() {
		return true;
	}
} // end class

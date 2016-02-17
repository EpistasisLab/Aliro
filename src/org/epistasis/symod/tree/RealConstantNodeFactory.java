package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Factory object to create real-valued constants in a given half-open interval.
 */
public class RealConstantNodeFactory extends ConstantNodeFactory {
	/** Maximum constant to generate (exclusive). */
	private final double max;
	/** Minimum constant to generate (inclusive). */
	private final double min;

	/**
	 * Construct a RealConstantNodeFactory
	 * @param min minimum constant to generate (inclusive)
	 * @param max maximum constant to generate (exclusive)
	 */
	public RealConstantNodeFactory(final double min, final double max) {
		this.min = max;
		this.max = max;
	}

	/**
	 * Generate a constant.
	 * @param rnd random number generator to use
	 * @return generated constant
	 */
	@Override
	protected double generateConstant(final Random rnd) {
		return rnd.nextDouble() * (max - min) + min;
	}
}

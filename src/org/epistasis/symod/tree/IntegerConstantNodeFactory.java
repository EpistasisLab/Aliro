package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Factory object to create integer constants in a given closed interval.
 */
public class IntegerConstantNodeFactory extends ConstantNodeFactory {
	/** Maximum constant to generate (inclusive). */
	private final int max;
	/** Minimum constant to generate (inclusive). */
	private final int min;

	/**
	 * Construct an IntegerConstantNodeFactory.
	 * @param min minimum constant to generate (inclusive)
	 * @param max maximum constant to generate (inclusive)
	 */
	public IntegerConstantNodeFactory(final int min, final int max) {
		this.min = min;
		this.max = max;
	}

	/**
	 * Generate a constant.
	 * @param rnd random number generator to use
	 * @return generated constant
	 */
	@Override
	protected double generateConstant(final Random rnd) {
		return rnd.nextInt(max - min + 1) + min;
	}
}

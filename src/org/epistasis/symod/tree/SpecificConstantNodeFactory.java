package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Factory obj ect to create real-valued constants from an array of preselected choices.
 */
public class SpecificConstantNodeFactory extends ConstantNodeFactory {
	/** Preselected constants to choose from. */
	private final double[] consts;

	/**
	 * Construct a SpecificConstantNodeFactory
	 * @param consts preselected constants
	 */
	public SpecificConstantNodeFactory(final double[] consts) {
		assert (consts != null) && (consts.length > 0);
		this.consts = consts.clone();
	}

	/**
	 * Generate a constant.
	 * @param rnd random number generator to use
	 * @return generated constant
	 */
	@Override
	protected double generateConstant(final Random rnd) {
		assert rnd != null;
		if (consts.length == 1) {
			return consts[0];
		}
		return consts[rnd.nextInt(consts.length)];
	}
}

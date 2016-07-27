package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Factory object to create real-valued constants in a given interval with a given step size. If the step size is zero, then the value is
 * selected uniformly from the half-open interval [min,max). If max = min + n * step for some positive integer n, then the selection is
 * taken from the closed interval [min,max]. If max != min + n * step for some positive integer n, then the selection is taken from the
 * closed interval [min,min + m * step] where m is the largest positive integer satisfying max > min + m * step.
 */
public class StepConstantNodeFactory extends ConstantNodeFactory {
	/** ConstantNodeFactory used to generate constants. */
	private ConstantNodeFactory base;
	/** Minimum constant to generate (inclusive). */
	private final double min;
	/** Step size for generated constants. */
	private final double step;

	public StepConstantNodeFactory(final double min, final double max, final double step) {
		this.min = min;
		this.step = step;
		if (step == 0) {
			base = new RealConstantNodeFactory(min, max);
		} else {
			base = new IntegerConstantNodeFactory(0, (int) Math.floor((max - min) / step));
		}
	}

	/**
	 * Generate a constant.
	 * @param rnd random number generator to use
	 * @return generated constant
	 */
	@Override
	protected double generateConstant(final Random rnd) {
		if (step == 0) {
			return base.generateConstant(rnd);
		} else {
			return base.generateConstant(rnd) * step + min;
		}
	}
}

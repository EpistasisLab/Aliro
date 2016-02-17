package org.epistasis.symod.tree;
/**
 * Binary function node that returns the greater of two values.
 */
public class MaxNode extends BinaryFuncNode {
	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		return Math.max(a, b);
	}
}

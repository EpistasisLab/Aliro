package org.epistasis.symod.tree;
/**
 * Ceil function node. This function rounds a floating-point value away from zero.
 */
public class CeilNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.ceil(a);
	}
}

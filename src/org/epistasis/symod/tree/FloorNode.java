package org.epistasis.symod.tree;
/**
 * Floor function node. This function rounds a floating-point value toward zero.
 */
public class FloorNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.floor(a);
	}
}

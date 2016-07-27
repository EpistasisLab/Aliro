package org.epistasis.symod.tree;
/**
 * Sine function node.
 */
public class SinNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.sin(a);
	}
}

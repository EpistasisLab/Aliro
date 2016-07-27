package org.epistasis.symod.tree;
/**
 * Arc sine function node.
 */
public class ASinNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.asin(a);
	}
}

package org.epistasis.symod.tree;
/**
 * Absolute value function node.
 */
public class AbsNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.abs(a);
	}
}

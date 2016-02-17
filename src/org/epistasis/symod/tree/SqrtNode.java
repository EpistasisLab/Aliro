package org.epistasis.symod.tree;
/**
 * Square root function node.
 */
public class SqrtNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.sqrt(a);
	}
}

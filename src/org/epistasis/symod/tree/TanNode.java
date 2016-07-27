package org.epistasis.symod.tree;
/**
 * Tangent function node.
 */
public class TanNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.tan(a);
	}
}

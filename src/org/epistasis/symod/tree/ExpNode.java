package org.epistasis.symod.tree;
/**
 * Exp function node.
 * @see java.lang.Math#exp(double)
 */
public class ExpNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.exp(a);
	}
}

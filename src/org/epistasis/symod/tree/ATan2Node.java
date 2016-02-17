package org.epistasis.symod.tree;
/**
 * Arc tangent 2 function node.
 * @see java.lang.Math#atan2(double, double)
 */
public class ATan2Node extends BinaryFuncNode {
	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		return Math.atan2(a, b);
	}
}

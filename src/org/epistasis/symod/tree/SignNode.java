package org.epistasis.symod.tree;
/**
 * Sign function node. Returns -1 if the argument is &lt; 0, 1 if the argument &gt; 0, or 0 otherwise. This function node complements the
 * Abs function node, as Sign(x) * Abs(x) = x.
 */
public class SignNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return (a == 0) ? 0 : ((a > 0) ? 1 : -1);
	}
}

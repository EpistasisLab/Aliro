package org.epistasis.symod.tree;
/**
 * Natural log function node.
 */
public class LogNode extends UnaryFuncNode {
	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a) {
		return Math.log(a);
	}
}

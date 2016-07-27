package org.epistasis.symod.tree;

/**
 * Addition operator node.
 */
public class PlusNode extends BinaryOpNode {
	/** Operator symbol of this node. */
	public static final String symbol = "+";

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Get the operator symbol of this node.
	 * 
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return PlusNode.symbol;
	}

	/**
	 * Compute this node's function on input values.
	 * 
	 * @param a
	 *            first input value
	 * @param b
	 *            second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		return a + b;
	}
}

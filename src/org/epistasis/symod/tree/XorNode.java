package org.epistasis.symod.tree;
/**
 * Logical XOR operator node. Nonzero values are considered to be true. Zero values are considered to be false. Logical return values are
 * 1.0 for true and 0.0 for false.
 */
public class XorNode extends BinaryOpNode {
	/** Operator symbol of this node. */
	private static final String symbol = "XOR";

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		final boolean x = a != 0;
		final boolean y = b != 0;
		return (x && !y) || (y && !x) ? 1 : 0;
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return XorNode.symbol;
	}
}

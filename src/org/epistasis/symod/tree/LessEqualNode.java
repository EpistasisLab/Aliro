package org.epistasis.symod.tree;
/**
 * Less-than or equal comparison operator node. Return values are 1.0 for true and 0.0 for false.
 */
public class LessEqualNode extends BinaryOpNode {
	/** Operator symbol of this node. */
	private static final String symbol = "<=";

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		return a <= b ? 1 : 0;
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return LessEqualNode.symbol;
	}
}

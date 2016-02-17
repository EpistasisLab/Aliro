package org.epistasis.symod.tree;
/**
 * Division operator node.
 */
public class DivideNode extends BinaryOpNode {
	/** Operator symbol of this node. */
	private static final String symbol = "/";

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		return a / b;
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return DivideNode.symbol;
	}
}

package org.epistasis.symod.tree;

import java.util.List;

/**
 * Logical OR operator node. Nonzero values are considered to be true. Zero values are considered to be false. Logical return values are 1.0
 * for true and 0.0 for false.
 */
public class OrNode extends ShortCircuitBinaryOpNode {
	/** Operator symbol of this node. */
	private static final String symbol = "OR";

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Compute this node's function on input values.
	 * @param children list of child nodes
	 * @param variables array of variable values
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final List<Node> children, final double[] variables) {
		for (final Node n : children) {
			if (n.evaluate(variables) != 0) {
				return 1;
			}
		}
		return 0;
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return OrNode.symbol;
	}
}

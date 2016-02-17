package org.epistasis.symod.tree;

import java.math.BigInteger;

import org.epistasis.Utility;

/**
 * Function node that computes the number of combinations possible by taking r elements from a set of n objects in any order. The first
 * argument is the size of the set. The second argument is the number to choose.
 */
public class NCRNode extends BinaryOpNode {
	/** Name of this node. */
	private static final String name = "Combinations";
	/** Operator symbol of this node. */
	private static final String symbol = "nCr";

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
		final long n = (long) Math.floor(Math.max(0, a));
		final long r = (long) Math.floor(Math.max(0, b));
		if (r > n) {
			return 0;
		}
		return Utility.combinations(BigInteger.valueOf(n), BigInteger.valueOf(r)).doubleValue();
	}

	/**
	 * Get the name of this node.
	 * @return name of this node
	 */
	@Override
	public String getName() {
		return NCRNode.name;
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	@Override
	public String getOpSymbol() {
		return NCRNode.symbol;
	}
}

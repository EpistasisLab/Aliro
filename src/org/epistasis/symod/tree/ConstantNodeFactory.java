package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Base class for factory objects which create constant nodes.
 */
public abstract class ConstantNodeFactory implements Comparable<ConstantNodeFactory> {
	public int compareTo(final ConstantNodeFactory o) {
		final int comparisonResult = hashCode() - o.hashCode();
		return comparisonResult;
	}

	/**
	 * Create a constant node.
	 * @param rnd random number generator to use
	 * @return created constant node
	 */
	public Node createNode(final Random rnd) {
		return new ConstantNode(generateConstant(rnd));
	}

	/**
	 * Generate a constant.
	 * @param rnd random number generator to use
	 * @return generated constant
	 */
	protected abstract double generateConstant(Random rnd);
}

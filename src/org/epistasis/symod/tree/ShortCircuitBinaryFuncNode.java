package org.epistasis.symod.tree;

import java.util.List;

/**
 * Base class for function nodes which don't always evaluate all arguments.
 */
public abstract class ShortCircuitBinaryFuncNode extends FunctionNode {
	/** Number of child nodes this node expects. */
	private static final int nChildren = 2;

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final double[] variables) {
		final double x = evaluate(getChildren(), variables);
		return (Double.isNaN(x) || Double.isInfinite(x)) ? 0 : x;
	}

	/**
	 * Compute this node's function on input values.
	 * @param children list of child nodes
	 * @param variables array of variable values
	 * @return result of computation
	 */
	protected abstract double evaluate(List<Node> children, double[] variables);

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return ShortCircuitBinaryFuncNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return ShortCircuitBinaryFuncNode.nChildren;
	}
}

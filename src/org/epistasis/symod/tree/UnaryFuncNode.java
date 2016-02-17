package org.epistasis.symod.tree;
/**
 * Base class for function nodes which take one input value.
 */
public abstract class UnaryFuncNode extends FunctionNode {
	/** Number of child nodes this node expects. */
	private static final int nChildren = 1;

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Compute this node's function on an input value.
	 * @param a input value
	 * @return result of computation
	 */
	protected abstract double evaluate(double a);

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final double[] variables) {
		final double x = evaluate(getChild(0).evaluate(variables));
		return (Double.isNaN(x) || Double.isInfinite(x)) ? 0 : x;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return UnaryFuncNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return UnaryFuncNode.nChildren;
	}
}

package org.epistasis.symod.tree;
/**
 * Base class for function nodes which take two input values.
 */
public abstract class BinaryFuncNode extends FunctionNode {
	/** Number of child nodes this node expects. */
	private static final int nChildren = 2;

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	protected abstract double evaluate(double a, double b);

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final double[] variables) {
		final double x = evaluate(getChild(0).evaluate(variables), getChild(1).evaluate(variables));
		return (Double.isNaN(x) || Double.isInfinite(x)) ? 0 : x;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return BinaryFuncNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return BinaryFuncNode.nChildren;
	}
}

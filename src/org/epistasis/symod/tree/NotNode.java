package org.epistasis.symod.tree;
/**
 * Logical NOT operator node. Nonzero values are considered to be true. Zero values are considered to be false. Logical return values are
 * 1.0 for true and 0.0 for false.
 */
public class NotNode extends FunctionNode {
	/** Number of child nodes this node expects. */
	private static final int nChildren = 1;

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final double[] variables) {
		return getChild(0).evaluate(variables) == 0 ? 1 : 0;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return NotNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return NotNode.nChildren;
	}
}

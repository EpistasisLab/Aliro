package org.epistasis.symod.tree;
/**
 * If operator node. If the first argument evaluates to nonzero, the value of the second argument is returned. Otherwise, the value of the
 * third argument is returned.
 */
public class IfNode extends FunctionNode {
	/** Number of child nodes this node expects. */
	private static final int nChildren = 3;

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	@Override
	public double evaluate(final double[] variables) {
		return getChild(0).evaluate(variables) != 0 ? getChild(1).evaluate(variables) : getChild(2).evaluate(variables);
	}

	/**
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	@Override
	public String getInfixExpression() {
		String infixExpression;
		if (children.size() >= getMinChildren()) {
			infixExpression = "(IF " + getChild(0).getInfixExpression() + " THEN " + getChild(1).getInfixExpression() + " ELSE "
					+ getChild(2).getInfixExpression() + ")";
		} else {
			infixExpression = "(IF)";
		}
		return infixExpression;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return IfNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return IfNode.nChildren;
	}
}

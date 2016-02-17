package org.epistasis.symod.tree;
/**
 * Base class for operator nodes which take two input values.
 */
public abstract class BinaryOpNode extends FunctionNode {
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
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	@Override
	public String getInfixExpression() {
		String infixExpression;
		if (children.size() >= getMinChildren()) {
			infixExpression = "(" + getChild(0).getInfixExpression() + ' ' + getOpSymbol() + ' ' + getChild(1).getInfixExpression() + ")";
		} else {
			infixExpression = "(" + getOpSymbol() + ")";
		}
		return infixExpression;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return BinaryOpNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return BinaryOpNode.nChildren;
	}

	/**
	 * Get the label to display for this node in graphical contexts.
	 * @return label to display for this node in graphical contexts
	 */
	@Override
	public String getNodeLabel() {
		return getOpSymbol();
	}

	/**
	 * Get the operator symbol of this node.
	 * @return operator symbol of this node
	 */
	public abstract String getOpSymbol();

	/**
	 * Get S-expression (lisp) -formatted string representation of the subtree rooted at this node.
	 * @return S-expression -formatted string
	 */
	@Override
	public String getSExpression() {
		String sExpression;
		if (children.size() >= getMinChildren()) {
			sExpression = "(" + getOpSymbol() + ' ' + getChild(0).getSExpression() + ' ' + getChild(1).getSExpression() + ")";
		} else {
			sExpression = "(" + getOpSymbol() + ")";
		}
		return sExpression;
	}
}

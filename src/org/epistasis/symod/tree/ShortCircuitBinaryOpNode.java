package org.epistasis.symod.tree;

import java.util.List;

/**
 * Base class for operator nodes which don't always evaluate all arguments.
 */
public abstract class ShortCircuitBinaryOpNode extends FunctionNode {
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
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	@Override
	public String getInfixExpression() {
		String infixExpression;
		if (getChildren().size() >= getMinChildren()) {
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
		return ShortCircuitBinaryOpNode.nChildren;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return ShortCircuitBinaryOpNode.nChildren;
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
		if (getChildren().size() >= getMinChildren()) {
			sExpression = "(" + getOpSymbol() + ' ' + getChild(0).getSExpression() + ' ' + getChild(1).getSExpression() + ")";
		} else {
			sExpression = "(" + getOpSymbol() + ")";
		}
		return sExpression;
	}
}

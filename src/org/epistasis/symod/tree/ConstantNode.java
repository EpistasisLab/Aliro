package org.epistasis.symod.tree;

import java.text.DecimalFormat;
import java.text.NumberFormat;

import org.epistasis.Utility;

/**
 * Constant value leaf node.
 */
public class ConstantNode extends Node {
	/** Name of this node. */
	private static final String name = "Constant";
	/** Number format to use to convert the value to a string. */
	private static final NumberFormat nf = new DecimalFormat("0.####");
	/** String representation of the constant value. */
	private final String label;
	/** Value for this ConstantNode. */
	private final double value;

	/**
	 * Construct a constant node.
	 * @param value value of the constant node
	 */
	public ConstantNode(final double value) {
		this.value = value;
		if ((long) value == value) {
			label = Long.toString((long) value);
		} else {
			label = ConstantNode.nf.format(value);
		}
	}

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Create a clone of this ConstantNode and return it.
	 * @return clone of this ConstantNode
	 * @see Node#clone()
	 */
	@Override
	public Object clone() {
		return this; // no need to duplicate since this object is immutable
	}

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array. As this is a leaf node with a constant value, the
	 * result of this function is always the same and does not depend on input values.
	 * @param variables input values (ignored)
	 * @return constant value of this node
	 */
	@Override
	public double evaluate(final double[] variables) {
		return value;
	}

	/**
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	@Override
	public String getInfixExpression() {
		return label;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	@Override
	public int getMaxChildren() {
		return 0;
	}

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	@Override
	public int getMinChildren() {
		return 0;
	}

	/**
	 * Get the name of this node.
	 * @return name of this node
	 */
	@Override
	public String getName() {
		return ConstantNode.name;
	}

	/**
	 * Get the label to display for this node in graphical contexts.
	 * @return label to display for this node in graphical contexts
	 */
	@Override
	public String getNodeLabel() {
		return label;
	}

	/**
	 * Get S-expression (lisp) -formatted string representation of the subtree rooted at this node.
	 * @return S-expression -formatted string
	 */
	@Override
	public String getSExpression() {
		return label;
	}

	/**
	 * Get XML representation of this node. This is called recursively from the root node of a tree to generate an XML representation of the
	 * entire tree.
	 * @param indent pad the string on the left with indent * 4 spaces
	 * @return XML representation of this node
	 */
	@Override
	public String getXML(final int indent) {
		final StringBuffer b = new StringBuffer();
		b.append(Utility.chrdup(' ', indent * 4));
		b.append("<Constant value=\"");
		b.append(value);
		b.append("\"/>");
		b.append(Utility.NEWLINE);
		return b.toString();
	}
}

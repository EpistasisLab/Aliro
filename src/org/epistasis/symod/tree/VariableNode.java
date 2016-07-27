package org.epistasis.symod.tree;

import java.util.List;

import org.epistasis.Utility;

/**
 * Variable value leaf node.
 */
public class VariableNode extends Node {
	/** Variable index for this VariableNode. */
	private final int idx;
	/** Name of the variable for this VariableNode. */
	private final String name;
	/** null if this is a continuous attribute, otherwise a sorted list of all possible values for attribute */
	private final List<Object> discreteValues;

	/**
	 * Construct a variable node.
	 * @param idx index of the variables array to reference
	 * @param name name of the variable
	 */
	public VariableNode(final int idx, final String name, final List<Object> discreteValues) {
		this.name = name;
		this.idx = idx;
		this.discreteValues = discreteValues;
	}

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	/**
	 * Create a clone of this VariableNode and return it.
	 * @return clone of this VariableNode
	 * @see Node#clone()
	 */
	@Override
	public Object clone() {
		return this; // no need to duplicate since this object is immutable
	}

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array. As this is a leaf the result does not depend on
	 * child nodes. The value returned will be the element of the array with the variable index for this VariableNode.
	 * @param variables input values
	 * @return value of this variable
	 */
	@Override
	public double evaluate(final double[] variables) {
		return variables[idx];
	}

	public List<Object> getDiscreteValues() {
		return discreteValues;
	}

	/**
	 * Get the variable index for this VariableNode.
	 * @return variable index for this VariableNode
	 */
	public int getIndex() {
		return idx;
	}

	/**
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	@Override
	public String getInfixExpression() {
		return name;
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
		return name;
	}

	/**
	 * Get S-expression (lisp) -formatted string representation of the subtree rooted at this node.
	 * @return S-expression -formatted string
	 */
	@Override
	public String getSExpression() {
		return name;
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
		b.append("<Variable name=\"");
		b.append(name);
		b.append("\" index=\"");
		b.append(idx);
		b.append("\"/>");
		b.append(Utility.NEWLINE);
		return b.toString();
	}
}

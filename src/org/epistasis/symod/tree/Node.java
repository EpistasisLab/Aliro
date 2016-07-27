package org.epistasis.symod.tree;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

import org.epistasis.Utility;

/**
 * Base class for nodes in an expression tree.
 */
public abstract class Node implements Cloneable, Comparable<Node> {
	public static final List<Node> EMPTY_CHILD_LIST = Collections.emptyList();
	/**
	 * Swap a child of one node with a child of another node. This is used to implement crossover for GP evolution of expression trees.
	 * @param p1 first parent node
	 * @param c1 index of child of first parent node
	 * @param p2 second parent node
	 * @param c2 index of child of second parent node
	 */
	// public static Node crossover(final Node p1, final int c1, final Node p2, final int c2) {
	// return p2.setChild(c2, p1.setChild(c1, p2.getChild(c2)));
	// }
	/** Child nodes of this node. */
	protected List<Node> children = Node.EMPTY_CHILD_LIST;
	/** Parent node of this node. */
	protected FunctionNode parent = null;
	/**
	 * Get infix-formatted string representation of the subtree rooted at this node.
	 * @return infix-formatted string
	 */
	private String cachedPostfixExpression = null;

	public Node() {
	}

	public Node(final Random rnd) {
	}

	/**
	 * Add a child node to this node.
	 * @param index index at which to add the child node
	 * @param element child node to add
	 */
	// public void addChild(final int index, final Node element) {
	// final Node n = element;
	// n.parent = (FunctionNode) this;
	// children.add(index, n);
	// }
	public void addChild(final Node element) {
		if (children == Node.EMPTY_CHILD_LIST) {
			children = new ArrayList<Node>(getMinChildren());
		}
		final Node n = element;
		n.parent = (FunctionNode) this;
		children.add(n);
	}

	public boolean childrenOrderMatters() {
		return true;
	}

	/**
	 * Make a deep copy of the subtree rooted at this node and return it.
	 * @return deep copy of the subtree rooted at this node
	 */
	@Override
	public Object clone() {
		try {
			final Node n = (Node) super.clone();
			n.parent = null;
			// n.cachedPostfixExpression = null;
			if (children == Node.EMPTY_CHILD_LIST) {
				n.children = Node.EMPTY_CHILD_LIST;
			} else {
				// DO NOT call addChild or setChild here since that can have side effects (e.g. in AttributeNode where it calculatesPossibleMatches)
				n.children = new ArrayList<Node>(children.size());
				for (final Node child : children) {
					n.children.add((Node) child.clone());
				}
			}
			return n;
		} catch (final CloneNotSupportedException e) {
			return null;
		}
	}

	public int compareTo(final Node o) {
		final int comparisonResult = getPostfixExpression().compareTo(o.getPostfixExpression());
		return comparisonResult;
	}

	/**
	 * Evaluate the subtree rooted at this node for the input values in the variables array.
	 * @param variables input values for subtree
	 * @return value of subtree for input values
	 */
	public abstract double evaluate(double[] variables);

	/**
	 * Get a child node.
	 * @param index index of child node to get
	 * @return child node at specified index
	 */
	public Node getChild(final int index) {
		return children.get(index);
	}

	public List<Node> getChildren() {
		return children;
	}

	/**
	 * Get the depth of this particular node in its overall tree. A depth of zero indicates that this node has no parent.
	 * @return depth of the subtree rooted at this node
	 */
	public int getDepth() {
		int depth = 0;
		for (Node node = parent; node != null; node = node.parent) {
			++depth;
		}
		return depth;
	}

	/**
	 * Get height of the subtree rooted at this node. A height of zero indicates that this node has no children.
	 * @return depth of the subtree rooted at this node
	 */
	public int getHeight() {
		int height = 0;
		for (Node node = this; node.children.size() > 0; node = node.getChild(0)) {
			++height;
		}
		return height;
	}

	public String getInfixExpression() {
		String returnVal = null;
		if (children.size() == 0) {
			returnVal = getName();
		} else {
			// return getName() + '(' + (getChild(0)).getInfixExpression() + ',' + (getChild(1)).getInfixExpression() + ')';
			final StringBuilder sb = new StringBuilder(getName());
			sb.append(" (");
			if (!childrenOrderMatters() && (children.size() > 1)) {
				// sort the children so that comparisons can be made more easily
				Collections.sort(children, new Comparator<Node>() {
					public int compare(final Node o1, final Node o2) {
						return o1.toString().compareTo(o2.toString());
					}
				});
			}
			if (children.size() > 0) {
				for (int index = 0; index < children.size(); ++index) {
					if (index > 0) {
						sb.append(',');
					}
					sb.append(getChild(index).getInfixExpression());
				}
			}
			sb.append(')');
			returnVal = sb.toString();
		}
		return returnVal;
	}

	/**
	 * Get maximum number of child nodes this node expects.
	 * @return maximum number of child nodes this node expects
	 */
	public abstract int getMaxChildren();

	/**
	 * Get minimum number of child nodes this node expects.
	 * @return minimum number of child nodes this node expects
	 */
	public abstract int getMinChildren();

	/**
	 * Get the name of this node.
	 * @return name of this node
	 */
	public String getName() {
		String name = getClass().getSimpleName();
		if (name.endsWith("Node")) {
			name = name.substring(0, name.length() - "Node".length());
		}
		return name;
	}

	/**
	 * Get the label to display for this node in graphical contexts.
	 * @return label to display for this node in graphical contexts
	 */
	/**
	 * Get the label to display for this node in graphical contexts.
	 * @return label to display for this node in graphical contexts
	 */
	public String getNodeLabel() {
		return getName();
	}

	/**
	 * Get the parent of this node.
	 * @return parent of this node
	 */
	public FunctionNode getParent() {
		return parent;
	}

	public final String getPostfixExpression() {
		String returnVal = null;
		if (children.size() == 0) {
			returnVal = getName();
		} else {
			if (cachedPostfixExpression == null) {
				// return getName() + '(' + (getChild(0)).getInfixExpression() + ',' + (getChild(1)).getInfixExpression() + ')';
				final StringBuilder sb = new StringBuilder(getName());
				sb.append(" (");
				if (!childrenOrderMatters() && (children.size() > 1)) {
					// sort the children so that comparisons can be made more easily
					Collections.sort(children);
				}
				for (int index = 0; index < children.size(); ++index) {
					if (index > 0) {
						sb.append(',');
					}
					sb.append(getChild(index).getPostfixExpression());
				}
				sb.append(')');
				cachedPostfixExpression = sb.toString();
			} // end if need to generate String
			returnVal = cachedPostfixExpression;
		} // end if has children
		return returnVal;
	}

	/**
	 * Get S-expression (lisp) -formatted string representation of the subtree rooted at this node.
	 * @return S-expression -formatted string
	 */
	public String getSExpression() {
		final StringBuilder sb = new StringBuilder("(");
		sb.append(getName());
		for (int index = 0; index < children.size(); ++index) {
			sb.append(' ');
			sb.append(getChild(index).getSExpression());
		}
		sb.append(")");
		return sb.toString();
	}

	/**
	 * recursively calculate the total number of nodes this tree contains
	 */
	public int getTreeSize() {
		int size = 1; // contains at least this node
		for (final Node child : children) {
			size += child.getTreeSize();
		}
		return size;
	}

	/**
	 * Get XML representation of this node. This is called recursively from the root node of a tree to generate an XML representation of the
	 * entire tree.
	 * @return XML representation of this node
	 */
	public String getXML() {
		return getXML(0);
	}

	/**
	 * Get XML representation of this node. This is called recursively from the root node of a tree to generate an XML representation of the
	 * entire tree.
	 * @param indent pad the string on the left with indent * 4 spaces
	 * @return XML representation of this node
	 */
	public String getXML(final int indent) {
		final StringBuffer b = new StringBuffer();
		b.append(Utility.chrdup(' ', indent * 4));
		b.append('<');
		b.append(getName());
		b.append('>');
		b.append(Utility.NEWLINE);
		for (final Object element : children) {
			final Node n = (Node) element;
			b.append(n.getXML(indent + 1));
		}
		b.append(Utility.chrdup(' ', indent * 4));
		b.append("</");
		b.append(getName());
		b.append('>');
		b.append(Utility.NEWLINE);
		return b.toString();
	}

	public boolean isLegalChild(final Node childNode) {
		return true;
	}

	/**
	 * Remove a child node.
	 * @param index index of child node to remove
	 * @return removed node
	 */
	public Node removeChild(final int index) {
		final Node ret = children.remove(index);
		ret.parent = null;
		cachedPostfixExpression = null;
		return ret;
	}

	/**
	 * Replace a child node with another node.
	 * @param index index of child node to replace
	 * @param newChild node with which to replace the child node
	 * @return replaced node
	 */
	public Node setChild(final int index, final Node newChild) {
		Node returnNode = null;
		if (newChild != null) {
			newChild.parent = (FunctionNode) this;
			cachedPostfixExpression = null;
			returnNode = children.set(index, newChild);
			returnNode.parent = null;
		}
		return returnNode;
	}

	/**
	 * Use rules to mathematically simplify a deep copy of the expression represented by the subtree rooted at this node.
	 * @return simplified deep copy of the expression represented by the subtree rooted at this node
	 */
	// public Node simplify() {
	// Node returnNode = this;
	// boolean needsSimplification = !(this instanceof ConstantNode) && !(this instanceof VariableNode);
	// if (needsSimplification) {
	// // TODO override for subclasses to further simplify
	// needsSimplification = true;
	// for (final Node n : children) {
	// if (!(n instanceof ConstantNode)) {
	// needsSimplification = false;
	// break;
	// }
	// } // end loop through children
	// }
	// if (needsSimplification) {
	// returnNode = new ConstantNode(evaluate(null));
	// }
	// // // make deep copy
	// returnNode = (Node) returnNode.clone();
	// return returnNode;
	// }
	@Override
	public String toString() {
		return getInfixExpression();
	}
} // end node class

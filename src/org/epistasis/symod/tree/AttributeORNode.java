package org.epistasis.symod.tree;

import java.util.Random;

/**
 * Absolute value function node.
 */
public class AttributeORNode extends AttributeNode {
	public AttributeORNode(final Random rnd, final Object unusedParameter) {
		super(rnd, unusedParameter);
	}

	@Override
	public double evaluate(final double[] variables) {
		boolean orMatchResult = false;
		for (final Node child : children) {
			if (possibleMatches.contains(child.evaluate(variables))) {
				orMatchResult = true;
				break;
			}
		} // end for children
		// if ((System.currentTimeMillis() % 5) == 0) {
		// System.out.println(this.getXML() + "= " + orMatchResult);
		// }
		return orMatchResult ? 1.0 : 0.0;
	}

	@Override
	public int getMaxChildren() {
		return 3;
	}

	@Override
	public int getMinChildren() {
		return 1;
	}

	@Override
	public String getName() {
		final StringBuilder sb = new StringBuilder();
		if (children.size() == 1) {
			sb.append("EQ");
		} else {
			sb.append("SOME");
		}
		sb.append("(");
		for (int index = 0; index < possibleMatches.size(); ++index) {
			if (index > 0) {
				sb.append(" OR ");
			}
			sb.append(possibleMatches.get(index));
		} // end for
		sb.append(")");
		return sb.toString();
	}
} // end class

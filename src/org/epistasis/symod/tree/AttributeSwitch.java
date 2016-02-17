package org.epistasis.symod.tree;

import java.util.Arrays;
import java.util.Random;

/**
 * Absolute value function node.
 */
public class AttributeSwitch extends FunctionNode {
	private final VariableNode variableNode;

	public AttributeSwitch(final Random rnd, final Object variableNodeObject) {
		if (variableNodeObject instanceof VariableNode) {
			variableNode = (VariableNode) variableNodeObject;
		} else {
			throw new IllegalArgumentException(
					"AttributeSwitch must be passed a Variable Node but was passed " + variableNodeObject == null ? "null" : (variableNodeObject
							.getClass().getSimpleName()
							+ " with value " + variableNodeObject.toString()));
		}
	}

	@Override
	public void addChild(final Node newChild) {
		super.addChild(newChild);
	}

	@Override
	public double evaluate(final double[] variables) {
		final double switchValue = variableNode.evaluate(variables);
		final int childIndex = variableNode.getDiscreteValues().indexOf(switchValue);
		final Node childNode = children.get(childIndex);
		final double resultValue = childNode.evaluate(variables);
		if (false) {
			System.out.println("Switch: " + variableNode + ": " + switchValue + " which is index " + childIndex + " " + childNode
					+ " so result: " + resultValue + " for variables: " + Arrays.toString(variables));
		}
		return resultValue;
	}

	@Override
	public int getMaxChildren() {
		return variableNode.getDiscreteValues().size();
	}

	@Override
	public int getMinChildren() {
		return getMaxChildren();
	}

	@Override
	public String getName() {
		final StringBuilder sb = new StringBuilder();
		sb.append("SWITCH (");
		sb.append(variableNode.toString());
		// sb.append(" ");
		// sb.append(variableNode.getDiscreteValues().toString());
		sb.append(")");
		return sb.toString();
	}
} // end class

package org.epistasis.symod.tree;

import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;

public class MDRMask extends FunctionNode {
	public final static String NAME_PREFIX = "MDR:";
	private final static Pattern legalMask = Pattern.compile("^[01]{9}$");
	private static final int nChildren = 2;
	private final String maskString;
	private final int[] mask;

	private static Integer getChildDiscreteValue(final Node child, int index) {
		Integer returnVal = null;
		if (child instanceof VariableNode) {
			final VariableNode variableNode = (VariableNode) child;
			final List<Object> discreteValues = variableNode.getDiscreteValues();
			if (discreteValues != null) {
				if (index < 0) {
					index = discreteValues.size() - Math.abs(index);
				}
				if ((index >= 0) && (index < discreteValues.size())) {
					final Object discreteValue = discreteValues.get(index);
					if (discreteValue instanceof Number) {
						returnVal = ((Number) discreteValue).intValue();
					}
				}
			}
		}
		return returnVal;
	}

	public MDRMask(final Random rnd, final Object specifiedMask) {
		this((specifiedMask != null) ? specifiedMask.toString() : String.format("%9s", Integer.toString(rnd.nextInt(512), 2)).replace(' ', '0'));
	}

	public MDRMask(final String pMaskString) {
		if (!MDRMask.legalMask.matcher(pMaskString).matches()) {
			throw new IllegalArgumentException(this.getClass().getSimpleName() + " requires a 9 character binary string as input - not '"
					+ pMaskString + "'.");
		}
		mask = new int[pMaskString.length()];
		for (int charIndex = 0; charIndex < mask.length; ++charIndex) {
			mask[charIndex] = Integer.parseInt(pMaskString.substring(charIndex, charIndex + 1));
		}
		maskString = pMaskString.replaceAll("(.{3})(.{3})(.{3})", "$1-$2-$3");
	}

	@Override
	public boolean equals(final Object o) {
		final boolean isEqual = super.equals(o);
		return isEqual;
	}

	@Override
	public double evaluate(final double[] variables) {
		int attribute1Value = new Double(getChild(0).evaluate(variables)).intValue();
		final Integer minAttribute1 = MDRMask.getChildDiscreteValue(getChild(0), 0);
		if ((minAttribute1 != null) && (minAttribute1 > 0)) {
			attribute1Value -= minAttribute1;
		}
		int attribute2Value = new Double(getChild(1).evaluate(variables)).intValue();
		final Integer minAttribute2 = MDRMask.getChildDiscreteValue(getChild(1), 0);
		if ((minAttribute2 != null) && (minAttribute2 > 0)) {
			attribute2Value -= minAttribute2;
		}
		if (((attribute1Value < 0) || (attribute1Value > 2)) || ((attribute2Value < 0) || (attribute2Value > 2))) {
			throw new IllegalArgumentException(
					this.getClass().getSimpleName()
							+ " can only be used with datasets that have attribute values of either 0,1, or 2 (representing genotypes AA Aa aa). The attribute values found are: "
							+ attribute1Value + " and " + attribute2Value);
		}
		final int indexIntoMask = (attribute1Value * 3) + attribute2Value;
		final int returnValue = mask[indexIntoMask];
		return returnValue;
	}

	@Override
	public int getMaxChildren() {
		return MDRMask.nChildren;
	}

	@Override
	public int getMinChildren() {
		return MDRMask.nChildren;
	};

	@Override
	public String getName() {
		return MDRMask.NAME_PREFIX + maskString;
	}

	@Override
	public boolean isLegalChild(final Node childNode) {
		boolean isLegal = false;
		// a child is legal if it has a range of numbers 2 apart
		final Integer minAttribute = MDRMask.getChildDiscreteValue(childNode, 0);
		final Integer maxAttribute = MDRMask.getChildDiscreteValue(childNode, -1);
		isLegal = (minAttribute != null) && (maxAttribute != null) && ((maxAttribute - minAttribute) == 2);
		return isLegal;
	} // return isLegalChild

	@Override
	public boolean restrictedToAttributeConnectedTerminalNode() {
		return true;
	}

	@Override
	public Node setChild(final int index, final Node element) {
		final Node replacedNode = null;
		if (element instanceof VariableNode) {
			super.setChild(index, element);
		}
		return replacedNode;
	}
}

package org.epistasis.symod.tree;

import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
import java.util.Random;

import org.epistasis.symod.Configuration;

public abstract class AttributeNode extends FunctionNode {
	private final static int numberOfBits = Configuration.dftMaxdiscreteattributelevels;
	protected final BitSet bitSet = new BitSet(AttributeNode.numberOfBits);
	protected List<Object> possibleMatches = new ArrayList<Object>();
	protected int randomIndexIntoPossibleMatches;

	public AttributeNode(final Random rnd, final Object unusedParameter) {
		randomIndexIntoPossibleMatches = rnd.nextInt(Integer.MAX_VALUE);
		for (int bitIndex = 0; bitIndex < AttributeNode.numberOfBits; ++bitIndex) {
			bitSet.set(bitIndex, rnd.nextBoolean());
		}
	}

	@Override
	public void addChild(final Node newChild) {
		super.addChild(newChild);
		calculatePossibleMatches();
	}

	private void calculatePossibleMatches() {
		possibleMatches.clear();
		final VariableNode variableNode = (VariableNode) getChild(0);
		final List<Object> discreteValues = variableNode.getDiscreteValues();
		for (int index = 0; index < discreteValues.size(); ++index) {
			if (bitSet.get(index)) {
				possibleMatches.add(discreteValues.get(index));
			}
		} // end for discreteValues
		// there is no point in a mask that has no legal values
		// so insert one if needed
		if (possibleMatches.size() == 0) {
			possibleMatches.add(discreteValues.get(randomIndexIntoPossibleMatches % discreteValues.size()));
		} else if (possibleMatches.size() == discreteValues.size()) {
			// similarly, a mask which matches any value is useless so
			// delete a possible match if necessary
			possibleMatches.remove(randomIndexIntoPossibleMatches % possibleMatches.size());
		}
	} // end calculatePossibleMatches

	@Override
	public boolean childrenOrderMatters() {
		return false;
	}

	@Override
	public Object clone() {
		final AttributeNode newNode = (AttributeNode) super.clone();
		// since this is an exact copy, the possible matches are the same as well
		newNode.possibleMatches = new ArrayList<Object>(possibleMatches);
		return newNode;
	}

	@Override
	public boolean isLegalChild(final Node childNode) {
		boolean isLegal = false;
		List<Object> currentDiscreteValues = null;
		if (children.size() > 0) {
			// get the discreteValues list of a current child
			currentDiscreteValues = ((VariableNode) children.get(0)).getDiscreteValues();
		}
		if (childNode instanceof VariableNode) {
			final VariableNode variableNode = (VariableNode) childNode;
			final List<Object> discreteValues = variableNode.getDiscreteValues();
			if ((discreteValues != null) && (discreteValues.size() > 1)) {
				if ((currentDiscreteValues == null) || currentDiscreteValues.equals(discreteValues)) {
					isLegal = true;
					// lastly check to see if the variableNode is already one fo the children.
					for (final Node child : children) {
						if (child.equals(childNode)) {
							isLegal = false;
							break;
						}
					}
				}
			}
		}
		return isLegal;
	} // return isLegalChild

	@Override
	public boolean restrictedToAttributeConnectedTerminalNode() {
		return true;
	}

	@Override
	public Node setChild(final int index, final Node newChild) {
		Node replacedNode;
		final Node existingChild = children.get(index);
		if (newChild.equals(existingChild)) {
			replacedNode = null; // nothing was replaced
		} else {
			replacedNode = super.setChild(index, newChild);
			calculatePossibleMatches();
		}
		return replacedNode;
	}
}

package org.epistasis.symod.tree;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Random;

import org.epistasis.Pair;
import org.epistasis.RouletteWheel;
import org.epistasis.symod.ExpertKnowledge;

/**
 * Factory object to generate random trees which match a set of parameters.
 */
public class TreeFactory {
	public static final int MAX_TREE_NODE_MATCH_ATTEMPTS = 100;
	/**
	 * Default probability of a leaf node being a variable instead of a
	 * constant.
	 */
	public static double DEFAULT_VAR_FREQ = 0.9;
	/** Constant factories to select among when generating constant leaf nodes. */
	private final RouletteWheel<ConstantNodeFactory> constants = new RouletteWheel<ConstantNodeFactory>();
	/** Depth of tree to generate. */
	private final int depth;
	/** Function node classes to select from when generating internal nodes. */
	private final List<Pair<Class<? extends FunctionNode>, Object>> functions = new ArrayList<Pair<Class<? extends FunctionNode>, Object>>();
	/**
	 * Variable node classes to select from when generating attribute leaf
	 * nodes.
	 */
	private final RouletteWheel<VariableNode> variables = new RouletteWheel<VariableNode>();
	/** Random number generator to use. */
	private final Random rnd;
	/** Probability of a leaf node being a variable instead of a constant. */
	private double varFreq = TreeFactory.DEFAULT_VAR_FREQ;
	private final double probabilityOfLeaf;

	/**
	 * Construct a TreeFactory
	 * 
	 * @param maxDepth
	 *            depth of trees to create (number of levels not counting the
	 *            root)
	 * @param rnd
	 *            random number generator to use
	 */
	public TreeFactory(final int maxDepth, final Random rnd, final double probabilityOfLeaf) {
		depth = maxDepth;
		this.rnd = rnd;
		this.probabilityOfLeaf = probabilityOfLeaf;
	}

	/**
	 * Add a ConstantNodeFactory to the TreeFactory's internal roulette wheel.
	 * When a constant node is required, the TreeFactory spins the roulette
	 * wheel to select a ConstantNodeFactory to use, then generates a constant
	 * node from that factory. This function sets the weight to 1.0.
	 * 
	 * @param cnf
	 *            ConstantNodeFactory to add
	 */
	public void addConstantNodeFactory(final ConstantNodeFactory cnf) {
		addConstantNodeFactory(cnf, 1);
	}

	/**
	 * Add a ConstantNodeFactory to the TreeFactory's internal roulette wheel.
	 * When a constant node is required, the TreeFactory spins the roulette
	 * wheel to select a ConstantNodeFactory to use, then generates a constant
	 * node from that factory.
	 * 
	 * @param cnf
	 *            ConstantNodeFactory to add
	 * @param weight
	 *            weight for this ConstantNodeFactory on the roulette wheel
	 */
	public void addConstantNodeFactory(final ConstantNodeFactory cnf, final double weight) {
		constants.add(cnf, weight);
	}

	/**
	 * Add a Class object for a subclass of FunctionNode to the TreeFactory's
	 * interal roulette wheel. When a function node is required, the TreeFactory
	 * spins the roulette wheel to select a Class to instantiate. This function
	 * sets the weight to 1.0.
	 * 
	 * @param nodeType
	 *            Class object to add
	 */
	public void addFunctionNodeType(final Class<? extends FunctionNode> functionNodeType) {
		addFunctionNodeType(functionNodeType, null);
	}

	public void addFunctionNodeType(final Class<? extends FunctionNode> functionNodeType, final Object constructorArgument) {
		functions.add(new Pair<Class<? extends FunctionNode>, Object>(functionNodeType, constructorArgument));
	}

	public void addFunctionNodeTypes(final EnumSet<FunctionGroup> functionGroups, final String maskFile) throws FileNotFoundException,
			IOException {
		if (functionGroups.contains(FunctionGroup.Arithmetic)) {
			addFunctionNodeType(PlusNode.class);
			addFunctionNodeType(MinusNode.class);
			addFunctionNodeType(TimesNode.class);
			addFunctionNodeType(DivideNode.class);
			addFunctionNodeType(PowNode.class);
			addFunctionNodeType(ModulusNode.class);
			addFunctionNodeType(PlusModulusTwoNode.class);
		}
		if (functionGroups.contains(FunctionGroup.Relational)) {
			addFunctionNodeType(LessNode.class);
			addFunctionNodeType(LessEqualNode.class);
			addFunctionNodeType(GreaterNode.class);
			addFunctionNodeType(GreaterEqualNode.class);
			addFunctionNodeType(EqualNode.class);
			addFunctionNodeType(NotEqualNode.class);
		}
		if (functionGroups.contains(FunctionGroup.Logical)) {
			addFunctionNodeType(AndNode.class);
			addFunctionNodeType(OrNode.class);
			addFunctionNodeType(XorNode.class);
			addFunctionNodeType(NotNode.class);
			addFunctionNodeType(IfNode.class);
		}
		if (functionGroups.contains(FunctionGroup.Trigonometric)) {
			addFunctionNodeType(ACosNode.class);
			addFunctionNodeType(ASinNode.class);
			addFunctionNodeType(ATanNode.class);
			addFunctionNodeType(ATan2Node.class);
			addFunctionNodeType(CosNode.class);
			addFunctionNodeType(SinNode.class);
			addFunctionNodeType(TanNode.class);
		}
		if (functionGroups.contains(FunctionGroup.Miscellaneous)) {
			addFunctionNodeType(AbsNode.class);
			addFunctionNodeType(CeilNode.class);
			addFunctionNodeType(ExpNode.class);
			addFunctionNodeType(FloorNode.class);
			addFunctionNodeType(LogNode.class);
			addFunctionNodeType(MaxNode.class);
			addFunctionNodeType(MinNode.class);
			addFunctionNodeType(NCRNode.class);
			addFunctionNodeType(NPRNode.class);
			addFunctionNodeType(PickLeftNode.class);
			addFunctionNodeType(PickRightNode.class);
			addFunctionNodeType(SignNode.class);
			addFunctionNodeType(SqrtNode.class);
		}
		if (functionGroups.contains(FunctionGroup.Experimental)) {
			addFunctionNodeType(AttributeORNode.class);
			addFunctionNodeType(AttributeANDNode.class);
			addFunctionNodeType(AttributeSwitch.class);
			addFunctionNodeType(MDRMask.class);
		}
	}

	/**
	 * Reset the TreeFactory to the state it had when it was first constructed.
	 */
	public void clear() {
		constants.reset();
		functions.clear();
		varFreq = 0.5f;
	}

	/**
	 * Create a random tree of depth specified on the factory's constructor.
	 * 
	 * @return generated tree
	 */
	public Node createTree() {
		Node tree = createTree(depth, Integer.MAX_VALUE, null);
		if (tree == null) {
			tree = InvalidTree.SINGLETON;
		}
		return tree;
	}

	/**
	 * Create a random tree of given maximum width and of depth specified on the
	 * factory's constructor.
	 * 
	 * @param maxWidth
	 *            maximum width of tree to generate
	 * @return generated tree
	 * @see #createTree(int, int)
	 */
	public Node createTree(final int maxWidth) {
		return createTree(depth, maxWidth, null);
	}

	/**
	 * Create a random tree of given depth and maximum width. Maximum width is a
	 * soft limit on the number of children a given node will have. If the
	 * maximum width is less than the minimum for a given node, the limit will
	 * be exceeded so that the minimum for the node will be satisfied. This
	 * function is recursive.
	 * 
	 * @param depth
	 *            depth of tree to generate
	 * @param maxWidth
	 *            maximum width of tree to generate
	 * @return generated tree
	 */
	public Node createTree(final int depth, final int maxWidth, final FunctionNode parent) {
		Node node = null;
		try {
			final boolean makeFunctionNode = (depth > 0) && (rnd.nextDouble() >= probabilityOfLeaf);
			if (makeFunctionNode) {
				FunctionNode functionNode = null;
				int treeAttemptCount = 0;
				boolean isLegalChild = false;
				do {
					// get a function from the wheel and instantiate it
					boolean isLegalFunction = true;
					do {
						final int functionIndex = rnd.nextInt(functions.size());
						final Pair<Class<? extends FunctionNode>, Object> nodeClassPair = functions.get(functionIndex);
						final Class<? extends FunctionNode> nodeClass = nodeClassPair.getFirst();
						// System.out.println("Function index: " + functionIndex
						// + "/" + functions.size() + " which is nodeClass: "
						// + nodeClass.getSimpleName());
						try {
							functionNode = nodeClass.newInstance();
						} catch (final InstantiationException ex) {
							final Constructor<? extends FunctionNode> constructor = nodeClass.getConstructor(new Class[] { Random.class,
									Object.class });
							Object secondParameter = nodeClassPair.getSecond();
							if (nodeClass.equals(AttributeSwitch.class)) {
								VariableNode variableNode;
								do {
									variableNode = variables.spin(rnd);
								} while ((variableNode.getDiscreteValues() == null) || (variableNode.getDiscreteValues().size() <= 1));
								secondParameter = variableNode;
							}
							functionNode = constructor.newInstance(rnd, secondParameter);
						}
						isLegalFunction = (functionNode != null)
								&& ((depth == 1) || !functionNode.restrictedToAttributeConnectedTerminalNode());
						++treeAttemptCount;
					} while (!isLegalFunction && (treeAttemptCount < TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS));
					if ((functionNode != null) && isLegalFunction) {
						int nChildren;
						// select number of children to generate
						if (functionNode.getMinChildren() >= maxWidth) {
							nChildren = functionNode.getMinChildren();
						} else {
							nChildren = rnd
									.nextInt((Math.min(functionNode.getMaxChildren(), maxWidth) - functionNode.getMinChildren()) + 1)
									+ functionNode.getMinChildren();
						}
						// recursively generate subtrees, one for each child
						Node childNode;
						isLegalChild = true;
						for (int i = nChildren; i != 0; --i) {
							int childAttemptCount = 0;
							do {
								childNode = createTree(depth - 1, maxWidth, functionNode);
								isLegalChild = (childNode != null) && functionNode.isLegalChild(childNode);
								++childAttemptCount;
								if (!isLegalChild) {
									if (childAttemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
										final String message = "Subtree could not be built after " + childAttemptCount + " tries. Depth: "
												+ depth + ". Parent node: " + ((parent == null) ? "null" : parent.toString())
												+ ". Function node: " + functionNode.toString() + ".";
										if (true) {
											System.err.println(message);
											break;
										} else {
											throw new RuntimeException(message);
										}
									} // end if too many attempts
								} // end if !legalChild
							} while (!isLegalChild);
							if (isLegalChild) {
								functionNode.addChild(childNode);
							}
						} // end for children loop
							// if (!isLegalChild) {
							// if (treeAttemptCount >=
							// TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
							// final String message =
							// "Tree could not be built after " +
							// treeAttemptCount + " tries. Depth: " + depth +
							// ". Parent node: "
							// + ((parent == null) ? "null" : parent.toString())
							// + ". Function node: " + functionNode.toString() +
							// ".";
							// if (true) {
							// System.err.println(message);
							// break;
							// } else {
							// throw new RuntimeException(message);
							// }
							// } // end if too many attempts
							// } // end if !legalChild
					} // end if successfully created a function node
				} while (!isLegalChild && (treeAttemptCount < TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS));
				if (isLegalChild) {
					node = functionNode;
				}
				if (treeAttemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
					final String message = "Tree could not be built after " + treeAttemptCount + " tries. Depth: " + depth
							+ ". Parent node: " + ((parent == null) ? "null" : parent.toString()) + ". Function node: "
							+ ((functionNode == null) ? "null" : functionNode.toString()) + ".";
					if (true) {
						System.err.println(message);
					} else {
						throw new RuntimeException(message);
					}
				} // end if too many unsuccessful attempts
			} else { // generate a leaf node
				// if there are no variables, or a weighted coin flip selected a
				// constant node, generate a constant node
				if (!parent.restrictedToAttributeConnectedTerminalNode() && (variables.isEmpty() || (rnd.nextDouble() >= varFreq))) {
					// select a node factory
					final ConstantNodeFactory cnf = constants.spin(rnd);
					// generate the node
					node = cnf.createNode(rnd);
				} else {
					node = variables.spin(rnd);
					// System.out.println("Variable: " + node.toString());
				}
			} // end if a leaf
				// return the tree
		} catch (final Exception ex) {
			ex.printStackTrace();
		}
		return node;
	}

	/**
	 * Set the variables to be used for generating variable leaf nodes.
	 * 
	 * @param labels
	 *            names of the variables to use
	 * @param expert
	 *            expert knowledge information for the variables (may be null)
	 * @param varFreq
	 *            when generating a leaf node, the probability that it will be a
	 *            variable
	 */
	public void setVariables(final List<String> labels, final ExpertKnowledge expert, final double varFreq,
			final List<List<Object>> attributeDiscreteValues) {
		variables.reset();
		this.varFreq = varFreq;
		if (expert != null) {
			final List<ExpertKnowledge.Attribute> attributes = new ArrayList<ExpertKnowledge.Attribute>(expert);
			Collections.sort(attributes, new ExpertKnowledge.Attribute.ScoreComparator());
			for (int rankIndex = 0; rankIndex < attributes.size(); ++rankIndex) {
				final ExpertKnowledge.Attribute attribute = attributes.get(rankIndex);
				final String attributeName = attribute.getName();
				// dataset may be filtered so must search to see if this
				// expertKnowledge attribute is in the current data
				final int indexIntoDataset = labels.indexOf(attributeName);
				if (indexIntoDataset != -1) {
					final int weight = labels.size() - variables.size() - 1;
					final VariableNode variableNode = new VariableNode(variables.size(), labels.get(indexIntoDataset),
							attributeDiscreteValues.get(indexIntoDataset));
					// System.out.println("Variable: " + variableNode +
					// " has expertRank: " + (rankIndex + 1) + " and weight: " +
					// weight);
					variables.add(variableNode, weight);
				}
			} // end for
		} else {
			for (int index = 0; index < (labels.size() - 1); ++index) {
				final VariableNode variableNode = new VariableNode(index, labels.get(index), attributeDiscreteValues.get(index));
				variables.add(variableNode, 1.0);
			}
		}
	}

	/**
	 * Set the variables to be used for generating variable leaf nodes. When
	 * generating leaf nodes, the probability of generating a variable will be
	 * 90%.
	 * 
	 * @param labels
	 *            names of the variables to use
	 * @param expert
	 *            expert knowledge information for the variables (may be null)
	 */
	public void setVariables(final List<String> labels, final ExpertKnowledge expert, final List<List<Object>> attributeDiscreteValues) {
		setVariables(labels, expert, TreeFactory.DEFAULT_VAR_FREQ, attributeDiscreteValues);
	}

	public enum FunctionGroup {
		Arithmetic, Relational, Logical, Trigonometric, Miscellaneous, Experimental;
	}
}

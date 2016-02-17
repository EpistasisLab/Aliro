package org.epistasis.symod;

import java.io.File;
import java.io.FileReader;
import java.util.Random;

import org.epistasis.PriorityList;
import org.epistasis.RouletteWheel;
import org.epistasis.symod.continuous.SSEFitness;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.FitnessFunction;
import org.epistasis.symod.discrete.MedianDiscriminator;
import org.epistasis.symod.tree.FileMaskNode;
import org.epistasis.symod.tree.FunctionNode;
import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.TreeFactory;
import org.epistasis.symod.tree.VariableNode;

public class UnbalancedProbabilisticMain extends ProbabilisticMainBase {
	private static Node createTree(final Random rnd, final double pLeaf, int maxDepth, final FunctionNode parent) {
		Node n = null;
		if (parent == null) {
			n = ProbabilisticMainBase.name2node(ProbabilisticMainBase.roots.spin(rnd));
		} else {
			final String parentName = parent.getName();
			RouletteWheel<String> wheel;
			if (parentName == null) {
				throw new IllegalArgumentException("parent.getName() returned null!");
			}
			boolean makeFunctionNode = (maxDepth > 0) && (rnd.nextDouble() >= pLeaf);
			if (makeFunctionNode) {
				wheel = ProbabilisticMainBase.func2func.get(parentName);
				if (wheel == null) {
					// if there is no function available to connect to then must make a leaf
					maxDepth = 0;
					makeFunctionNode = false;
				} else {
					do {
						n = ProbabilisticMainBase.name2node(wheel.spin(rnd));
					} while ((maxDepth > 1) && ((FunctionNode) n).restrictedToAttributeConnectedTerminalNode());
				}
			} // end if makeFunctionNode
			if (!makeFunctionNode) {
				wheel = ProbabilisticMainBase.func2leaf.get(parentName);
				if (wheel == null) {
					// leave n set to null since no valid node can be created
				} else {
					final boolean requiresAttribute = parent.restrictedToAttributeConnectedTerminalNode();
					do {
						n = ProbabilisticMainBase.name2node(wheel.spin(rnd));
					} while (requiresAttribute && !(n instanceof VariableNode));
				}
			}
		} // end if has a parent node
		// if the parent node cannot be used (perhaps all function arguments were
		// removed by thresholding?)
		// then this needs to return null so the parent node can be replaced
		int attemptCount = 0;
		if (n != null) {
			do {
				if (n == null) {
					n = ProbabilisticMainBase.name2node(ProbabilisticMainBase.roots.spin(rnd));
				}
				if (n.getMinChildren() > 0) {
					Node subTree = null;
					for (int i = 0; i < n.getMinChildren(); ++i) {
						subTree = UnbalancedProbabilisticMain.createTree(rnd, pLeaf, maxDepth - 1, (FunctionNode) n);
						if (subTree == null) {
							break;
						} else {
							n.addChild(subTree);
						}
					} // end for
					++attemptCount;
					if (subTree == null) {
						if (attemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
							throw new RuntimeException("Tree could not be built after " + attemptCount + " tries. Depth: " + maxDepth + ". Parent node: "
									+ ((parent == null) ? "null" : parent.toString()) + ". New node: " + ((n == null) ? "null" : n.toString())
									+ ". (Perhaps the frequency table is too sparse?");
						}
						n = null;
					}
				} // end if new node needs children
			} while (n == null);
		} // end recursive section if main part got a valid node
		return n;
	}// end createTree()

	// args
	// 0 - dataset
	// 1 - freqList
	// 2 - pLeaf
	// 3 - depth
	// 4 - nRuns
	// 5 - seed
	// 6 - landscape size
	// 7 - FileMaskNode file (optional)
	public static void main(final String[] args) {
		try {
			final String datasetFile = args[0];
			final String freqList = args[1];
			final double pLeaf = Double.parseDouble(args[2]);
			final int maxDepth = Integer.parseInt(args[3]);
			final long nRuns = Long.parseLong(args[4]);
			long seed = Long.parseLong(args[5]);
			if (seed == -1) {
				seed = System.currentTimeMillis();
			}
			final Random r = new Random(seed);
			AbstractFitnessFunction ff = null;
			ProbabilisticMainBase.data = AbstractDataset.create(new File(datasetFile), Configuration.dftMaxdiscreteattributelevels);
			if (ProbabilisticMainBase.data instanceof org.epistasis.symod.discrete.Dataset) {
				final Discriminator disc = new MedianDiscriminator(((org.epistasis.symod.discrete.Dataset) ProbabilisticMainBase.data)
						.getStatuses());
				ff = new FitnessFunction(disc);
			} else { // if (ProbabilisticMainBase.data instanceof org.epistasis.symod.continuous.Dataset) {
				ff = new SSEFitness();
			}
			final PriorityList<AbstractModel> best = new PriorityList<AbstractModel>(Integer.parseInt(args[6]));
			if (args.length > 7) {
				FileMaskNode.readKey(new FileReader(args[7]));
			}
			ProbabilisticMainBase.readFreqList(freqList);
			for (long i = 0; i < nRuns; ++i) {
				final Node tree = UnbalancedProbabilisticMain.createTree(r, pLeaf, maxDepth, null);
				AbstractModel m = null;
				if (ProbabilisticMainBase.data instanceof org.epistasis.symod.discrete.Dataset) {
					m = new org.epistasis.symod.discrete.Model(tree);
				} else { // if (ProbabilisticMainBase.data instanceof org.epistasis.symod.continuous.Dataset) {
					m = new org.epistasis.symod.continuous.Model(tree);
				}
				m.train(ProbabilisticMainBase.data, ff);
				best.add(m);
			}
			System.out.println("<FineGrainedSearchResults treeType=unbalanced maxDepth=" + maxDepth + " numberRuns=" + nRuns + " randomSeed="
					+ seed + " >");
			for (final AbstractModel m : best) {
				System.out.print("    <Model training=\"");
				System.out.print(m.getTrainingScore().getScore());
				System.out.println("\">");
				System.out.print(m.getTree().getXML(2));
				System.out.println("    </Model>");
			}
			System.out.println("</SDAProb>");
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}

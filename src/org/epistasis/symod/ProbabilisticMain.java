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

public class ProbabilisticMain extends ProbabilisticMainBase {
	private static Node createTree(final Random r, final int depth, final FunctionNode parent) {
		Node n = null;
		if (parent == null) {
			n = ProbabilisticMainBase.name2node(ProbabilisticMainBase.roots.spin(r));
		} else {
			final String parentName = parent.getName();
			RouletteWheel<String> wheel;
			if (parentName == null) {
				throw new IllegalArgumentException("parent.getName() returned null!");
			}
			if (depth > 0) {
				wheel = ProbabilisticMainBase.func2func.get(parentName);
				if (wheel == null) {
					// leave n set to null since no valid node can be created
				} else {
					do {
						n = ProbabilisticMainBase.name2node(wheel.spin(r));
					} while ((depth > 1) && ((FunctionNode) n).restrictedToAttributeConnectedTerminalNode());
				}
			} else {
				wheel = ProbabilisticMainBase.func2leaf.get(parentName);
				if (wheel == null) {
					// leave n set to null since no valid node can be created
				} else {
					final boolean requiresAttribute = parent.restrictedToAttributeConnectedTerminalNode();
					do {
						n = ProbabilisticMainBase.name2node(wheel.spin(r));
					} while (requiresAttribute && !(n instanceof VariableNode));
				}
			} // else depth == 0
		} // end if has a parent node
		// if the parent node cannot be used (perhaps all function arguments were
		// removed by thresholding?)
		// then this needs to return null so the parent node can be replaced
		int attemptCount = 0;
		if (n != null) {
			do {
				if (n == null) {
					n = ProbabilisticMainBase.name2node(ProbabilisticMainBase.roots.spin(r));
				}
				Node subTree = null;
				for (int i = 0; i < n.getMinChildren(); ++i) {
					subTree = ProbabilisticMain.createTree(r, depth - 1, (FunctionNode) n);
					if (subTree == null) {
						break;
					} else {
						n.addChild(subTree);
					}
				} // end for
				++attemptCount;
				if (subTree == null) {
					if (attemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
						throw new RuntimeException("Tree could not be built after " + attemptCount + " tries. Depth: " + depth + ". Parent node: "
								+ ((parent == null) ? "null" : parent.toString()) + ". New node: " + ((n == null) ? "null" : n.toString())
								+ ". (Perhaps the frequency table is too sparse?");
					}
					n = null;
				} // end if subTree is null
			} while (n == null);
		} // end recursive section if main part got a valid node
		return n;
	} // end createTree()

	// args
	// 0 - dataset
	// 1 - freqList
	// 2 - depth
	// 3 - nRuns
	// 4 - seed
	// 5 - landscape size
	// 6 - FileMaskNode file (optional)
	public static void main(final String[] args) {
		try {
			final String datasetFile = args[0];
			final String freqList = args[1];
			final int depth = Integer.parseInt(args[2]);
			final long nRuns = Long.parseLong(args[3]);
			long seed = Long.parseLong(args[4]);
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
			} else if (ProbabilisticMainBase.data instanceof org.epistasis.symod.continuous.Dataset) {
				ff = new SSEFitness();
			}
			final PriorityList<AbstractModel> best = new PriorityList<AbstractModel>(Integer.parseInt(args[5]));
			if (args.length > 6) {
				FileMaskNode.readKey(new FileReader(args[6]));
			}
			ProbabilisticMainBase.readFreqList(freqList);
			for (long i = 0; i < nRuns; ++i) {
				final Node tree = ProbabilisticMain.createTree(r, depth, null);
				AbstractModel m = null;
				if (ProbabilisticMainBase.data instanceof org.epistasis.symod.discrete.Dataset) {
					m = new org.epistasis.symod.discrete.Model(tree);
				} else { // if (ProbabilisticMainBase.data instanceof org.epistasis.symod.continuous.Dataset) {
					m = new org.epistasis.symod.continuous.Model(tree);
				}
				m.train(ProbabilisticMainBase.data, ff);
				best.add(m);
			}
			System.out.println("<FineGrainedSearchResults treeType=balanced depth=" + depth + " numberRuns=" + nRuns + " randomSeed=" + seed
					+ ">");
			for (final AbstractModel m : best) {
				System.out.print("    <Model training=\"");
				System.out.print(m.getTrainingScore().getScore());
				System.out.println("\">");
				System.out.print(m.getTree().getXML(2));
				System.out.println("    </Model>");
			}
			System.out.println("</FineGrainedSearchReseults>");
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}

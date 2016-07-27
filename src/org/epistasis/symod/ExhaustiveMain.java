package org.epistasis.symod;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.epistasis.PriorityList;
import org.epistasis.symod.continuous.SSEFitness;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.FitnessFunction;
import org.epistasis.symod.discrete.MedianDiscriminator;
import org.epistasis.symod.tree.EqualNode;
import org.epistasis.symod.tree.ExhaustiveFullTreeFactory;
import org.epistasis.symod.tree.FunctionNode;
import org.epistasis.symod.tree.GreaterEqualNode;
import org.epistasis.symod.tree.GreaterNode;
import org.epistasis.symod.tree.LessEqualNode;
import org.epistasis.symod.tree.LessNode;
import org.epistasis.symod.tree.MaxNode;
import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.NotEqualNode;
import org.epistasis.symod.tree.PickLeftNode;

public class ExhaustiveMain {
	// args
	//
	// 0 - dataset
	public static void main(final String[] args) {
		try {
			AbstractFitnessFunction ff = null;
			final AbstractDataset data = AbstractDataset.create(new File(args[0]), Configuration.dftMaxdiscreteattributelevels);
			if (data instanceof org.epistasis.symod.discrete.Dataset) {
				final Discriminator disc = new MedianDiscriminator(((org.epistasis.symod.discrete.Dataset) data).getStatuses());
				ff = new FitnessFunction(disc);
			} else if (data instanceof org.epistasis.symod.continuous.Dataset) {
				ff = new SSEFitness();
			}
			final String[] labels = data.getLabels().toArray(new String[0]);
			final List<Class<? extends FunctionNode>> funcs = new ArrayList<Class<? extends FunctionNode>>();
			// don't know how this incomplete list of functions was chosen
			funcs.add(EqualNode.class);
			funcs.add(GreaterNode.class);
			funcs.add(NotEqualNode.class);
			funcs.add(LessNode.class);
			funcs.add(LessEqualNode.class);
			funcs.add(GreaterEqualNode.class);
			funcs.add(MaxNode.class);
			funcs.add(PickLeftNode.class);
			final double[] consts = new double[0];
			final int[] vars = new int[] { 0, 1, 2, 6 };
			final ExhaustiveFullTreeFactory eftf = new ExhaustiveFullTreeFactory(3, funcs, consts, vars, labels, data
					.getAttributeDiscreteValues());
			final PriorityList<AbstractModel> landscape = new PriorityList<AbstractModel>(100);
			Node tree;
			while ((tree = eftf.getNext()) != null) {
				AbstractModel m = null;
				if (data instanceof org.epistasis.symod.discrete.Dataset) {
					m = new org.epistasis.symod.discrete.Model(tree);
				} else { // if (data instanceof org.epistasis.symod.continuous.Dataset) {
					m = new org.epistasis.symod.continuous.Model(tree);
				}
				m.train(data, ff);
				landscape.add(m);
			}
			System.out.println("<SDAExhaustive>");
			for (final AbstractModel m : landscape) {
				System.out.print("    <Model training=\"");
				System.out.print(m.getTrainingScore().getScore());
				System.out.println("\">");
				System.out.print(m.getTree().getXML(2));
				System.out.println("    </Model>");
			}
			System.out.println("</SDAExhaustive>");
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}

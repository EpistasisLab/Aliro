package org.epistasis.symod.discrete;

import java.util.ArrayList;
import java.util.List;

import org.epistasis.evolutionary.Score;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.AbstractFitnessFunction;
import org.epistasis.symod.AbstractModel;
import org.epistasis.symod.tree.Node;

/**
 * Fitness function for data sets with discrete status attributes. Implements the SDA algorithm.
 */
public class FitnessFunction extends AbstractFitnessFunction {
	/** Discriminator to use for SDA. */
	private final Discriminator disc;

	/**
	 * Construct a FitnessFunction
	 * @param disc Discriminator to use for SDA
	 */
	public FitnessFunction(final Discriminator disc) {
		this.disc = disc;
	}

	/**
	 * Create a deep copy of this FitnessFunction.
	 * @return deep copy
	 */
	@Override
	public Object clone() {
		final FitnessFunction f = (FitnessFunction) super.clone();
		return f;
	}

	/**
	 * Create a model object suitable for this fitness function.
	 * @return model object suitable for this fitness function
	 */
	@Override
	public AbstractModel createModel(final Node tree) {
		return new Model(tree);
	}

	/**
	 * Test a given model with a given data set using this fitness function.
	 * @param model model to test
	 * @param data data set for test
	 * @return testing score
	 */
	@Override
	public Score test(final AbstractModel model, final AbstractDataset data) {
		final Dataset d = (Dataset) data;
		final Model m = (Model) model;
		final Discriminant discriminant = m.getDiscriminant();
		final Node simplifiedTree = m.getTree();
		final ConfusionMatrixScore testing = new ConfusionMatrixScore(d.getStatuses());
		for (final AbstractDataset.Instance inst : data) {
			final double treeEvaluationResult = simplifiedTree.evaluate(inst.getValues());
			final int statusPrediction = discriminant.getPrediction(treeEvaluationResult);
			final int actualStatus = inst.getStatus().intValue();
			testing.add(actualStatus, statusPrediction);
		}
		// System.out.println("test ConfusionMatrix:\n" + testing + "\nfor tree\n" + m.getTree().getXML(2));
		return testing;
	}

	/**
	 * Train a given model with a given data set using this fitness function.
	 * @param model model to train
	 * @param data data set for train
	 * @return training score
	 */
	@Override
	public Score train(final AbstractModel model, final AbstractDataset data) {
		final Model m = (Model) model;
		// because this can be used by multiple threads we cannot modify the only copy of disc.
		// therefore we keep track of our own list of prediction for each status
		final List<List<Double>> dist = new ArrayList<List<Double>>();
		for (int i = 0; i < disc.getStatuses().size(); ++i) {
			dist.add(new ArrayList<Double>());
		}
		final Node tree = m.getTree();
		for (final AbstractDataset.Instance inst : data) {
			final double treeEvaluationResult = tree.evaluate(inst.getValues());
			final int actualStatus = inst.getStatus().intValue();
			dist.get(actualStatus).add(treeEvaluationResult);
		}
		final Discriminant discriminant = Discriminator.discriminate(disc, dist);
		m.setDiscriminant(discriminant);
		final ConfusionMatrixScore training = discriminant.getTrainingConfusionMatrix();
		// System.out.println("train ConfusionMatrix:\n" + training + "\nfor tree\n" + m.getTree().getXML(2));
		return training;
	}
}

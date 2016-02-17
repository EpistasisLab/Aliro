package org.epistasis.symod;

import org.epistasis.evolutionary.Score;
import org.epistasis.symod.tree.Node;

/**
 * Fitness function which linearly combines another fitness function with expert knowledge scores.
 */
public class ExpertKnowledgeFitness extends AbstractFitnessFunction {
	/** Coefficient for base fitness score. */
	private final double alpha;
	/** Fitness function to combine with expert knowledge scores. */
	private AbstractFitnessFunction baseFitness;
	/** Coefficient for expert knowledge score. */
	private final double beta;
	/** Expert knowledge to combine with base fitness. */
	private final ExpertKnowledge expert;
	/** Whether to z-transform expert knowledge scores. */
	private final boolean zxform;

	/**
	 * Construct an ExpertKnowledgeFitness.
	 * @param baseFitness fitness function with which to combine expert knowledge
	 * @param expert expert knowledge to use in combination
	 * @param alpha coefficient for the base fitness score
	 * @param beta coefficient for the expert knowledge scores
	 * @param zxform whether to z-transform the expert knowledge scores
	 */
	public ExpertKnowledgeFitness(final AbstractFitnessFunction baseFitness, final ExpertKnowledge expert, final double alpha,
			final double beta, final boolean zxform) {
		this.baseFitness = baseFitness;
		this.expert = expert;
		this.alpha = alpha;
		this.beta = beta;
		this.zxform = zxform;
	}

	/**
	 * Create a deep copy of this fitness function and return it.
	 * @return deep copy of this fitness function
	 */
	@Override
	public Object clone() {
		final ExpertKnowledgeFitness f = (ExpertKnowledgeFitness) super.clone();
		f.baseFitness = (AbstractFitnessFunction) baseFitness.clone();
		return f;
	}

	/**
	 * Create an instance of a subclass of AbstractModel, based on a tree of nodes, which is appropriate for the fitness function.
	 * @param tree expression tree to use for model
	 * @return created model
	 */
	@Override
	public AbstractModel createModel(final Node tree) {
		return baseFitness.createModel(tree);
	}

	/**
	 * Test a model using a given data set.
	 * @param model model to test
	 * @param data data with which to test model
	 * @return testing score
	 */
	@Override
	public Score test(final AbstractModel model, final AbstractDataset data) {
		return new ExpertKnowledgeScore(baseFitness.test(model, data), expert.getTreeScore(model.getTree(), zxform), alpha, beta);
	}

	/**
	 * Train a model using a given data set.
	 * @param model model to train
	 * @param data data with which to train model
	 * @return training score
	 */
	@Override
	public Score train(final AbstractModel model, final AbstractDataset data) {
		return new ExpertKnowledgeScore(baseFitness.train(model, data), expert.getTreeScore(model.getTree(), zxform), alpha, beta);
	}
}

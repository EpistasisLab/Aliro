package org.epistasis.symod;

import org.epistasis.evolutionary.Score;
import org.epistasis.symod.tree.Node;

/**
 * Base class for fitness functions.
 */
public abstract class AbstractFitnessFunction implements Cloneable {
	/**
	 * Create a deep copy of this fitness function and return it.
	 * @return deep copy of this fitness function
	 */
	@Override
	public Object clone() {
		try {
			final AbstractFitnessFunction f = (AbstractFitnessFunction) super.clone();
			return f;
		} catch (final CloneNotSupportedException e) {
			return null;
		}
	}

	/**
	 * Create an instance of a subclass of AbstractModel, based on a tree of nodes, which is appropriate for the fitness function.
	 * @param tree expression tree to use for model
	 * @return created model
	 */
	public abstract AbstractModel createModel(Node tree);

	/**
	 * Test a model using a given data set.
	 * @param model model to test
	 * @param data data with which to test model
	 * @return testing score
	 */
	public abstract Score test(AbstractModel model, AbstractDataset data);

	/**
	 * Train a model using a given data set.
	 * @param model model to train
	 * @param data data with which to train model
	 * @return training score
	 */
	public abstract Score train(AbstractModel model, AbstractDataset data);
}

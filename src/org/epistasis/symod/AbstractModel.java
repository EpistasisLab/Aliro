package org.epistasis.symod;

import org.epistasis.evolutionary.Score;
import org.epistasis.symod.tree.Node;

/**
 * Base class for models.
 */
public abstract class AbstractModel implements Comparable<AbstractModel> {
	// /** Comparator to compare two models in reverse order by testing score, then training score. */
	// @SuppressWarnings("unchecked")
	// public static final Comparator<AbstractModel> cmpRevTestTrain = new ChainComparator<AbstractModel>(Arrays.asList(
	// AbstractModel.cmpTraining, AbstractModel.cmpTesting, AbstractModel.cmpAbstractModel));
	// /** Simplified version of the expression tree used for evaluation. */
	// private Node simplifiedTree;
	/** Testing score. */
	private Score testingScore;
	/** Training score. */
	private Score trainingScore;
	/** Full expression tree. */
	private final Node tree;

	protected static int compareScores(final Score a, final Score b) {
		if ((a == null) && (b == null)) {
			return 0;
		} else if (a == null) {
			return -1;
		} else if (b == null) {
			return 1;
		} else {
			return a.compareTo(b);
		}
	}

	/**
	 * Construct an AbstractModel representing an expression tree.
	 * @param tree expression tree to represent
	 */
	public AbstractModel(final Node tree) {
		this.tree = tree;
	}

	/**
	 * Compare this model to another model by testing score, then by training score.
	 * @param obj other model to compare
	 * @return &lt; 0 if this &lt; obj, &gt; 0 if this &gt; obj, or 0 otherwise
	 */
	public int compareTo(final AbstractModel obj) {
		// this used to compare in the order testing-training-model
		// but if 'noise' is being used the identical model can have a different
		// score in different evaluations. Because we want identical models to be
		// returned as equal we must compare models first.
		int modelComparisonValue = 0;
		if (this != obj) {
			if (obj == null) {
				modelComparisonValue = -1;
			} else { // objects being compared are not null
				// if model has been tested, use testing scores
				modelComparisonValue = AbstractModel.compareScores(testingScore, obj.testingScore);
				if (modelComparisonValue == 0) {
					// otherwise use the training scores
					modelComparisonValue = AbstractModel.compareScores(trainingScore, obj.trainingScore);
				}
				// next should do a semantic equals (are the trees functionally identical?)
				// if simplified tree rearranged trees to be in a canonical order then
				// comparing a string representation of the trees would be function comparison
				if (modelComparisonValue == 0) {
					final String treeStringA = getTree().getPostfixExpression();
					final String treeStringB = obj.getTree().getPostfixExpression();
					modelComparisonValue = treeStringA.compareTo(treeStringB);
				}
			} // end both objects are not null
		} // end if not the same object
		return modelComparisonValue;
	} // end compareTo

	@Override
	public boolean equals(final Object obj) {
		boolean returnVal = this == obj;
		if (!returnVal) {
			if (obj instanceof AbstractModel) {
				returnVal = compareTo((AbstractModel) obj) == 0;
			}
		}
		return returnVal;
	}

	public Score getScore() {
		Score returnScore = null;
		if (testingScore != null) {
			returnScore = testingScore;
		} else if (trainingScore != null) {
			returnScore = trainingScore;
		}
		return returnScore;
	}

	/**
	 * Get testing score.
	 * @return testing score
	 */
	public Score getTestingScore() {
		return testingScore;
	}

	/**
	 * Get training score.
	 * @return training score
	 */
	public Score getTrainingScore() {
		return trainingScore;
	}

	/**
	 * Get the expression tree represented by this model.
	 * @return expression tree represented by this model
	 */
	public Node getTree() {
		return tree;
	}

	/**
	 * Test this model with the given data set and fitness function. This is a wrapper function around
	 * {@link AbstractFitnessFunction#test(AbstractModel, AbstractDataset)}, but it stores the resulting score in the model.
	 * @param data data set on which to test model
	 * @param fitness fitness function with which to test model
	 * @return testing score
	 */
	public Score test(final AbstractDataset data, final AbstractFitnessFunction fitness) {
		testingScore = fitness.test(this, data);
		return testingScore;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) + " [testingScore: " + testingScore + " trainingScore "
				+ trainingScore + " tree: " + tree.getInfixExpression() + "]";
	}

	/**
	 * Train this model with the given data set and fitness function. This is a wrapper function around
	 * {@link AbstractFitnessFunction#train(AbstractModel, AbstractDataset)}, but it stores the resulting score in the model.
	 * @param data data set on which to train model
	 * @param fitness fitness function with which to train model
	 * @return training score
	 */
	public Score train(final AbstractDataset data, final AbstractFitnessFunction fitness) {
		final Score newTrainingScore = fitness.train(this, data);
		if (false) {
			System.out.println("new trainingScore: " + newTrainingScore + " set for model " + toString() + " with data " + data.hashCode()
					+ " and fitness " + fitness.hashCode());
		}
		if ((trainingScore != null) && (Double.compare(trainingScore.getScore(), newTrainingScore.getScore()) != 0)) {
			System.out.println(toString() + " ***New training score changed: newScore: " + newTrainingScore);
			trainingScore = fitness.train(this, data);
		}
		trainingScore = newTrainingScore;
		return trainingScore;
	}
}

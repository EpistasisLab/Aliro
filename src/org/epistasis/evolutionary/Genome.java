package org.epistasis.evolutionary;

import java.util.Comparator;
import java.util.Random;

import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.AbstractFitnessFunction;
import org.epistasis.symod.AbstractModel;
import org.epistasis.symod.tree.FunctionNode;
import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.TreeFactory;

/**
 * Representation of a solution for an evolutionary computation problem.
 */
public class Genome implements Cloneable, Comparable<Genome> {
	/** Model used to evaluate the score for this genome. */
	private AbstractModel model;
	/** Tree representation for this genome. */
	private Node tree;
	/** Initializer to use for this genome. */
	private Evaluator evaluator;
	/** Initializer to use for this genome. */
	private Initializer initializer;

	/**
	 * Make a deep copy of this object and return it.
	 * @return a deep copy of this object
	 */
	@Override
	public Object clone() {
		try {
			final Genome g = (Genome) super.clone();
			g.initializer = initializer;
			g.evaluator = (Evaluator) evaluator.clone();
			g.setModel(null);
			if (tree != null) {
				g.tree = (Node) tree.clone();
			}
			return g;
		} catch (final CloneNotSupportedException e) {
			return null;
		}
	}

	/**
	 * Compare this genome to another, using this genome's evaluator.
	 * @param obj the other genome
	 * @return &lt 0 if this &lt; obj, &gt; 0 if this &gt; obj, 0 otherwise
	 */
	public int compareTo(final Genome obj) {
		return evaluator.compare(this, obj);
	}

	/**
	 * Call the evaluator for this genome.
	 * @return scaled score
	 */
	public Score evaluate() {
		return evaluate(evaluator);
	}

	/**
	 * Call an arbitrary evaluator on this genome.
	 * @param evaluator evaluator to use
	 * @return scaled score
	 */
	public Score evaluate(final Evaluator evaluator) {
		evaluator.evaluate(this);
		return model.getScore();
	}

	/**
	 * Get the evaluator used by this genome.
	 * @return evaluator used by this genome
	 */
	public Evaluator getEvaluator() {
		return evaluator;
	}

	/**
	 * Get the initializer used by this genome.
	 * @return initializer used by this genome
	 */
	public Initializer getInitializer() {
		return initializer;
	}

	/**
	 * Get the model used to evaluate the score for this genome.
	 * @return model used to evaluate the score for this genome
	 */
	public AbstractModel getModel() {
		return model;
	}

	/**
	 * Get the scaled score for this genome.
	 * @return scaled score
	 */
	public Score getScore() {
		Score returnScore = null;
		// return score;
		if (model == null) {
			throw new RuntimeException("Genome getScore called when no model has been created!");
		} else {
			returnScore = model.getScore();
		}
		return returnScore;
	}

	/**
	 * Get the tree representation for this genome.
	 * @return tree representation for this genome
	 */
	public Node getTree() {
		return tree;
	}

	/**
	 * Call the initializer for this genome.
	 */
	public void initialize() {
		initializer.initialize(this);
	}

	/**
	 * Set the evaluator to be used by this genome.
	 * @param evaluator evaluator to be used by this genome
	 */
	public void setEvaluator(final Evaluator evaluator) {
		this.evaluator = evaluator;
	}

	/**
	 * Set the initializer to be used by this genome.
	 * @param initializer initializer to be used by this genome
	 */
	public void setInitializer(final Initializer initializer) {
		this.initializer = initializer;
	}

	public void setModel(final AbstractModel model) {
		this.model = model;
	}

	@Override
	public String toString() {
		// return getClass().getSimpleName() + ": " + tree.toString();
		return getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) + " : "
				+ ((model != null) ? model.toString() : tree.toString());
	}

	/**
	 * Crossover operator for genomes.
	 */
	public static interface CrossoverOperator {
		/**
		 * Recombine two parent genomes into two child genomes. The parent genomes are not preserved.
		 * @param a a parent genome
		 * @param b a parent genome
		 */
		public void cross(Genome a, Genome b);
	}

	/**
	 * Specific implementation of a crossover operator for SymodGenome's.
	 */
	public static class DefaultCrossoverOperator implements Genome.CrossoverOperator {
		/** Random number generator to use for this crossover operator. */
		private Random random;

		/**
		 * Cross two SymodGenome's in place.
		 * @param a first genome
		 * @param b second genome
		 */
		public void cross(final Genome genome1, final Genome genome2) {
			int attemptCount = 0;
			boolean isLegalChild;
			Node subTree1;
			Node subTree2;
			int firstTreeChildIndex;
			Node firstTreeChild;
			int secondTreeChildIndex;
			Node secondTreeChild;
			do {
				subTree1 = genome1.tree;
				subTree2 = genome2.tree;
				final int depth = random.nextInt(subTree1.getHeight());
				while (subTree1.getDepth() > depth) {
					subTree1 = subTree1.getChild(random.nextInt(subTree1.getChildren().size()));
				}
				while (subTree2.getDepth() > depth) {
					subTree2 = subTree2.getChild(random.nextInt(subTree2.getChildren().size()));
				}
				firstTreeChildIndex = random.nextInt(subTree1.getChildren().size());
				firstTreeChild = subTree1.getChild(firstTreeChildIndex);
				secondTreeChildIndex = random.nextInt(subTree2.getChildren().size());
				secondTreeChild = subTree2.getChild(secondTreeChildIndex);
				++attemptCount;
				isLegalChild = subTree1.isLegalChild(secondTreeChild) && subTree2.isLegalChild(firstTreeChild);
				if (!isLegalChild) {
					if (attemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
						final String message = "Trees could not be crossed over after " + attemptCount + " tries. Depth: " + depth
								+ ". Trying to swap subTrees between: " + genome1.toString() + " and " + genome2.toString() + ".";
						if (true) {
							// System.err.println(message);
							return;
						} else {
							throw new RuntimeException(message);
						}
					}
				} // end if !legalChild
			} while (!isLegalChild);
			// now that we know this is legal swap the children to accomplish crossover
			subTree1.setChild(firstTreeChildIndex, secondTreeChild);
			subTree2.setChild(secondTreeChildIndex, firstTreeChild);
			genome1.setModel(null);
			genome2.setModel(null);
		}

		/**
		 * Get random number generator used for this crossover operator.
		 * @return random number generator
		 */
		public Random getRandom() {
			return random;
		}

		/**
		 * Set random number generator to be used for this crossover operator.
		 * @param random random number generator
		 */
		public void setRandom(final Random random) {
			this.random = random;
		}
	} // end private static class CrossoverOperator

	/**
	 * Specific implementation of an Evaluator for SymodGenome's.
	 */
	public static class DefaultEvaluator implements Genome.Evaluator {
		/** Data set used to evaluate models. */
		private AbstractDataset dataset;
		/** Fitness function used to evaluate models. */
		private AbstractFitnessFunction fitness;
		/** Runnable to be run after a model is evaluated. */
		private Runnable onEndModel;

		/**
		 * Create a deep copy of this Evaluator.
		 * @return deep copy of this Evaluator
		 */
		@Override
		public Object clone() {
			try {
				final DefaultEvaluator ev = (DefaultEvaluator) super.clone();
				ev.fitness = (AbstractFitnessFunction) fitness.clone();
				ev.dataset = dataset;
				ev.onEndModel = onEndModel;
				return ev;
			} catch (final CloneNotSupportedException e) {
				return null;
			}
		}

		/**
		 * Compare two SymodGenome's in ascending order of score.
		 * @param a first genome
		 * @param b second genome
		 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
		 */
		public int compare(final Genome sga, final Genome sgb) {
			int returnVal = 0;
			if (sga != sgb) {
				if ((sga == null) || (sgb == null)) {
					if (sga == null) {
						if (sgb != null) {
							returnVal = 1;
						}
						// else both are null so leave returnVal == 0
					} else { // sgb is null
						returnVal = -1;
					}
				} else { // both sga and sgb are not null
					if ((sga.model == null) || (sgb.model == null)) {
						if (sga.model == null) {
							if (sgb.model != null) {
								returnVal = 1;
							}
							// else both are null so leave returnVal == 0
						} else { // sgb.model is null
							returnVal = -1;
						}
					} else { // they both have models
						returnVal = sga.model.compareTo(sgb.model);
					} // end if both have models
					// if nothing else differentiates the Genomes use the hashCode
					// if (returnVal == 0) {
					// returnVal = new Integer(sga.hashCode()).compareTo(sgb.hashCode());
					// }
				} // end if both sga and sgb are not null
			} // end if sga != sgb
			return returnVal;
		} // end compare

		/**
		 * Compute the score of a given SymodGenome.
		 * @param g genome to score
		 * @return score for genome
		 */
		public Score evaluate(final Genome g) {
			// if the model already exists, do not re-calculate the score
			// the model is always set to null if the tree is modified or if noise is on
			if (g.model == null) {
				g.setModel(fitness.createModel(g.tree));
				g.model.train(dataset, fitness);
			}
			final Score score = g.model.getTrainingScore();
			if (onEndModel != null) {
				onEndModel.run();
			}
			return score;
		}

		/**
		 * Get data set used to evaluate models.
		 * @return data set used to evaluate models
		 */
		public AbstractDataset getDataset() {
			return dataset;
		}

		/**
		 * Get fitness function used to evaluate models.
		 * @return fitness function used to evaluate models
		 */
		public AbstractFitnessFunction getFitnessFunction() {
			return fitness;
		}

		/**
		 * Get runnable which is run after a model is evaluated.
		 * @return runnable which is run after a model is evaluated
		 */
		public Runnable getOnEndModel() {
			return onEndModel;
		}

		/**
		 * Set data set to be used to evaluate models.
		 * @param dataset data set to be used to evaluate models
		 */
		public void setDataset(final AbstractDataset dataset) {
			this.dataset = dataset;
		}

		/**
		 * Set fitness function to be used to evaluate models.
		 * @param fitness fitness function to be used to evaluate models
		 */
		public void setFitnessFunction(final AbstractFitnessFunction fitness) {
			this.fitness = fitness;
		}

		/**
		 * Set runnable to be run after a model is evaluated.
		 * @param onEndModel runnable to be run after a model is evaluated
		 */
		public void setOnEndModel(final Runnable onEndModel) {
			this.onEndModel = onEndModel;
		}
	}

	/**
	 * Specific implementation of an Initializer for SymodGenome's.
	 */
	public static class DefaultInitializer implements Genome.Initializer {
		/** Tree factory used to generate random trees. */
		private TreeFactory tf;

		/**
		 * Get tree factory used to generate random trees.
		 * @return tree factory used to generate random trees
		 */
		public TreeFactory getTreeFactory() {
			return tf;
		}

		/**
		 * Initialize a SymodGenome.
		 * @param g SymodGenome to initialize
		 */
		public void initialize(final Genome g) {
			g.tree = tf.createTree();
		}

		/**
		 * Set tree factory to be used to generate random trees.
		 * @param tf tree factory to be used to generate random trees
		 */
		public void setTreeFactory(final TreeFactory tf) {
			this.tf = tf;
		}
	}

	/**
	 * Specific implementation of a MutationOperator for SymodGenome's.
	 */
	public static class DefaultMutationOperator implements Genome.MutationOperator {
		/** Random number generator used to mutate SymodGenome's. */
		private Random random;
		/** Set tree factory used to generate subtrees. */
		private TreeFactory tf;

		/**
		 * Get random number generator used to mutate SymodGenome's.
		 * @return random number generator used to mutate SymodGenome's
		 */
		public Random getRandom() {
			return random;
		}

		/**
		 * Get tree factory used to generate subtrees with which to replace subtrees in SymodGenome's.
		 * @return tree factory used to generate subtrees
		 */
		public TreeFactory getTreeFactory() {
			return tf;
		}

		/**
		 * Mutate a SymodGenome in place.
		 * @param g SymodGenome to mutate
		 */
		public void mutate(final Genome g) {
			Node node = g.tree;
			final int depth = random.nextInt(node.getHeight());
			while (node.getDepth() > depth) {
				node = node.getChild(random.nextInt(node.getChildren().size()));
			}
			int attemptCount = 0;
			final int childIndexToReplace = random.nextInt(node.getChildren().size());
			Node mutatedChildNode;
			boolean isLegalChild;
			do {
				mutatedChildNode = tf.createTree(node.getHeight() - 1, Integer.MAX_VALUE, (FunctionNode) node);
				++attemptCount;
				isLegalChild = (mutatedChildNode != null) && node.isLegalChild(mutatedChildNode);
				if (!isLegalChild) {
					if (attemptCount >= TreeFactory.MAX_TREE_NODE_MATCH_ATTEMPTS) {
						break;
						// throw new RuntimeException("Tree could not be mutated after " + attemptCount + " tries. Depth: " + depth
						// + ". Trying to replace child at index: " + childIndexToReplace + " of this subtree: " + node.toString() + ".");
					}
				} // end if !legalChild
			} while (!isLegalChild);
			if (isLegalChild) {
				node.setChild(childIndexToReplace, mutatedChildNode);
				g.setModel(null);
			}
		}

		/**
		 * Set random number generator to be used to mutate SymodGenome's.
		 * @param random random number generator to be used to mutate SymodGenome's
		 */
		public void setRandom(final Random random) {
			this.random = random;
		}

		/**
		 * Set tree factory to be used to generate subtrees with which to replace subtrees in SymodGenome's.
		 * @param tf tree factory to be used to generate subtrees
		 */
		public void setTreeFactory(final TreeFactory tf) {
			this.tf = tf;
		}
	}

	/**
	 * Evaluator for genomes.
	 */
	public static interface Evaluator extends Comparator<Genome>, Cloneable {
		/**
		 * Create a clone of this evaluator. This is included in the interface to ensure that this method will be public.
		 * @return cloned evaluator
		 */
		public Object clone();

		/**
		 * Determine a score for the "quality" of a genome, based on arbitrary criteria.
		 * @param g genome to evaluate
		 * @return Score object representing the quality of the genome
		 */
		public Score evaluate(Genome g);
	}

	/**
	 * Initializer for genomes.
	 */
	public static interface Initializer {
		/**
		 * Initialize a genome. This is typically done in a random way, but other methods, such as expert knowledge, could be used.
		 * @param g genome to initialize
		 */
		public void initialize(Genome g);
	}

	/**
	 * Mutation operator for genomes.
	 */
	public static interface MutationOperator {
		/**
		 * Alter a single genome in some way. The initial genome is not preserved.
		 * @param g genome to alter
		 */
		public void mutate(Genome g);
	}
}

package org.epistasis.symod;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.SortedSet;

import org.epistasis.PriorityList;
import org.epistasis.ProducerConsumerThread;
import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.TreeFactory;

/**
 * Implementation of AbstractSearch which performs a random search.
 */
public class RandomSearch extends AbstractSearch {
	/** List used to keep the best n models based on training score. */
	private final PriorityList<AbstractModel> landscape;
	/** Whether the search should be run in parallel. */
	private final boolean parallel;
	/** Producer-consumer thread used to run the search in parallel. */
	private final ProducerConsumerThread<Node> pcthread = new ProducerConsumerThread<Node>();
	/** Number of random models to analyze. */
	private final int size;
	/** Tree factory used to generate random models. */
	private final TreeFactory tf;

	/**
	 * Construct a random search
	 * @param rnd random number generator to use
	 * @param trainSet data set to train on
	 * @param testSet data set to test on
	 * @param fitness fitness function used to evaluate models
	 * @param tf tree factory used to generate random trees
	 * @param size number of random trees to generate
	 * @param landscapeSize number of best training models to keep and test
	 * @param parallel whether to run search in parallel
	 * @param onEndModel runnable to run after a model is evaluated
	 * @param onEnd runnable to run after the search is over
	 */
	public RandomSearch(final Random rnd, final AbstractDataset trainSet, final AbstractDataset testSet,
			final AbstractFitnessFunction fitness, final TreeFactory tf, final int size, final int landscapeSize, final boolean parallel,
			final Runnable onEndModel, final Runnable onEnd) {
		super(trainSet, testSet, fitness, onEndModel, onEnd);
		this.size = size;
		this.tf = tf;
		this.parallel = parallel;
		landscape = new PriorityList<AbstractModel>(landscapeSize);
	}

	/**
	 * Get the best n models based on training score.
	 * @return best n models based on training score
	 */
	@Override
	public SortedSet<AbstractModel> getLandscape() {
		return landscape;
	}

	/**
	 * Get tree factory used to generate random trees.
	 * @return tree factory used to generate random trees
	 */
	public TreeFactory getTreeFactory() {
		return tf;
	}

	/**
	 * Perform the random search.
	 */
	public void run() {
		int nProc = 1;
		pcthread.setProducer(new Producer());
		if (parallel) {
			nProc = Runtime.getRuntime().availableProcessors();
		}
		final List<PriorityList<AbstractModel>> landscapes = new ArrayList<PriorityList<AbstractModel>>(nProc);
		for (int i = 0; i < nProc; ++i) {
			final PriorityList<AbstractModel> localLandscape = new PriorityList<AbstractModel>(landscape.getCapacity());
			landscapes.add(localLandscape);
			pcthread.addConsumer(new Consumer(localLandscape, (AbstractFitnessFunction) getFitnessFunction().clone()));
		}
		pcthread.run();
		for (final PriorityList<AbstractModel> l : landscapes) {
			landscape.addAll(l);
		}
		for (final AbstractModel m : getLandscape()) {
			m.test(getTestingSet(), getFitnessFunction());
		}
		onEnd();
	}

	/**
	 * Consumer used to process models in parallel.
	 */
	private class Consumer extends ProducerConsumerThread.Consumer<Node> {
		/** Fitness function to use to evaluate models. */
		private final AbstractFitnessFunction fitness;
		/** List used to hold best n models based on training score. */
		private final PriorityList<AbstractModel> landscape;

		/**
		 * Construct a Consumer.
		 * @param landscape list to use to store n best models based on training score
		 * @param fitness fitness function with which to evaluate models
		 */
		public Consumer(final PriorityList<AbstractModel> landscape, final AbstractFitnessFunction fitness) {
			this.landscape = landscape;
			this.fitness = fitness;
		}

		/**
		 * Process a tree by creating a model from it and training the model.
		 * @param n head node of tree
		 */
		@Override
		public void consume(final Node n) {
			final AbstractModel m = fitness.createModel(n);
			m.train(getTrainingSet(), fitness);
			landscape.add(m);
			onEndModel();
		}
	}

	/**
	 * Producer used to process models in parallel.
	 */
	private class Producer extends ProducerConsumerThread.Producer<Node> {
		/** Number of random trees so far produced. */
		private int produced = 0;

		/**
		 * Produce a random tree.
		 * @return head node of random tree
		 */
		@Override
		public Node produce() {
			if (produced >= size) {
				return null;
			}
			++produced;
			return tf.createTree();
		}
	}
}

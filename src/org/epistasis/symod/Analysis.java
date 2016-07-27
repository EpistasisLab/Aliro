package org.epistasis.symod;

import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.SortedSet;
import java.util.TreeMap;

import org.epistasis.evolutionary.Evolution;
import org.epistasis.evolutionary.Evolver;
import org.epistasis.evolutionary.MaxGenTerminator;
import org.epistasis.evolutionary.Score;
import org.epistasis.evolutionary.Statistics;
import org.epistasis.evolutionary.TournamentSelector;
import org.epistasis.symod.continuous.SSEFitness;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.FitnessFunction;
import org.epistasis.symod.discrete.MedianDiscriminator;
import org.epistasis.symod.tree.FunctionNode;
import org.epistasis.symod.tree.SpecificConstantNodeFactory;
import org.epistasis.symod.tree.StepConstantNodeFactory;
import org.epistasis.symod.tree.TreeFactory;

/**
 * Facade class for running a SyMod analysis (see Design Patterns p185).
 */
public class Analysis implements Runnable {
	/** Object to hold all configuration parameters for this analysis. */
	private final Configuration config;
	/** Callback to run when all analyses are finished. */
	private Runnable onEnd;
	/** Callback to run when a single analysis is finished. */
	private Runnable onEndDepth;
	/** Callback to run after a model is evaluated. */
	private Runnable onEndModel;
	/** List of results from individual analyses which have been run. */
	private final List<Result> runs = new ArrayList<Result>();

	public Analysis(final Configuration config) {
		super();
		this.config = (Configuration) config.clone();
	}

	/**
	 * Get the value of the expression tree from a model on each instance in a continuous data set, organized by status. The return value is a
	 * List of Point2D, where each x coordinate is the actual status of an instance, and the y coordinate is the expression tree value on that
	 * instance.
	 * @param m model for which to get the distribution
	 * @return value of the expression tree from a model on each instance in a continuous data set, organized by status
	 */
	private List<Point2D> getContinuousModelDistribution(final AbstractModel m) {
		final List<Point2D> distro = new ArrayList<Point2D>(config.getData()
				.getNumInstances());
		for (final AbstractDataset.Instance inst : config.getData()) {
			final double status = inst.getStatus().doubleValue();
			distro.add(new Point2D.Double(status, m.getTree().evaluate(
					inst.getValues())));
		}
		return Collections.unmodifiableList(distro);
	}

	/**
	 * Get the value of the expression tree from a model on each instance in a discrete data set, organized by status. The return value is a
	 * Map with the key value being a status value, and the value being a List of Double which contains all of the expression tree values on
	 * instances in the data set with the given status value.
	 * @param m model for which to get the distribution
	 * @return value of the expression tree from a model on each instance in a discrete data set, organized by status
	 */
	private Map<String, List<Double>> getDiscreteModelDistribution(
			final AbstractModel m) {
		final Map<String, List<Double>> distros = new TreeMap<String, List<Double>>();
		for (final AbstractDataset.Instance inst : config.getData()) {
			final String status = ((org.epistasis.symod.discrete.Dataset.Instance) inst)
					.getStatusString();
			List<Double> distro = distros.get(status);
			if (distro == null) {
				distro = new ArrayList<Double>();
				distros.put(status, distro);
			}
			distro.add(new Double(m.getTree().evaluate(inst.getValues())));
		}
		for (final Map.Entry<String, List<Double>> entry : distros.entrySet()) {
			Collections.sort(entry.getValue());
		}
		return Collections.unmodifiableMap(distros);
	}

	/**
	 * Get the value of the expression tree from a model on each instance in a data set, organized by status. The type of the return value
	 * depends on whether the data is continuous or discrete.
	 * @param m model for which to get the distribution
	 * @return value of the expression tree from a model on each instance in a data set, organized by status
	 * @see #getDiscreteModelDistribution(AbstractModel)
	 * @see #getContinuousModelDistribution(AbstractModel)
	 */
	private Collection<? extends Object> getModelDistribution(
			final AbstractModel m) {
		switch (config.getDataMode()) {
			case DISCRETE:
				return getDiscreteModelDistribution(m).entrySet();
			case CONTINUOUS:
				return getContinuousModelDistribution(m);
			default:
				return null;
		}
	}

	/**
	 * Get a list of Result objects, one for each tree depth in the analysis.
	 * @return list of Result objects
	 */
	public List<Result> getResults() {
		return runs;
	}

	/**
	 * Run the analysis.
	 */
	public void run() {
		try {
			runs.clear();
			long randomSeed = config.getRandomSeed();
			if (randomSeed == -1) {
				randomSeed = System.currentTimeMillis();
				System.out.println("Randomly generated random number generator seed: "
						+ randomSeed);
			}
			final Random rnd = new Random(randomSeed);/*
																								 * { private static final long serialVersionUID = 1L;
																								 * @Override protected int next(final int bits) { final int randomValue = super.next(bits);
																								 * System.out.println("Random.next(" + bits + ") called from " +
																								 * Thread.currentThread().getStackTrace()[4].toString() + " returning: " + randomValue);
																								 * return randomValue; } };
																								 */
			TreeFactory tf = null;
			final AbstractDataset[] part = config.getData().partition(rnd);
			Discriminator disc = null;
			AbstractFitnessFunction ff = null;
			Evolver.Selector selector = null;
			Evolution.Terminator term = null;
			double statusmean = Double.NaN;
			// set up fitness function
			switch (config.getDataMode()) {
				case CONTINUOUS:
					ff = new SSEFitness();
					if (config.isConstSummaryStats()) {
						statusmean = ((org.epistasis.symod.continuous.Dataset) config
								.getData()).getStatusMean();
					}
					break;
				case DISCRETE:
					disc = new MedianDiscriminator(
							((org.epistasis.symod.discrete.Dataset) config.getData())
									.getStatuses());
					ff = new FitnessFunction(disc);
					break;
				case NONE:
					throw new IllegalArgumentException(
							"Data mode is 'NONE' which means dataset has not been loaded and it should be impossible to run an analysis.");
			}
			// wrap expert knowledge fitness around fitness function if
			// specified
			if (config.isEKFitness()) {
				ff = new ExpertKnowledgeFitness(
						ff,
						config.getExpertKnowledge(),
						config.getEKFitnessAlpha(),
						(config.getDataMode() == Configuration.DataMode.CONTINUOUS ? -1 : 1)
								* config.getEKFitnessBeta(), config.isEKFitnessZTransform());
			}
			// run each tree depth as its own analysis
			for (int depth = config.getDepthMin(); (depth <= config.getDepthMax())
					&& !Thread.currentThread().isInterrupted(); ++depth) {
				// set up tree factory
				rnd.setSeed(randomSeed);
				tf = new TreeFactory(depth, rnd, 0.0);
				tf.addConstantNodeFactory(new StepConstantNodeFactory(config
						.getConstMin(), config.getConstMax(), config.getConstStep()));
				if ((config.getDataMode() == Configuration.DataMode.CONTINUOUS)
						&& config.isConstSummaryStats()) {
					tf.addConstantNodeFactory(new SpecificConstantNodeFactory(
							new double[] { statusmean }));
				}
				for (final Class<? extends FunctionNode> function : config
						.getFunctionSet()) {
					tf.addFunctionNodeType(function);
				}
				tf.setVariables(config.getData().getLabels(), config
						.isEKInitialization() ? config.getExpertKnowledge() : null,
						1.0 - config.getConstProb(), config.getData()
								.getAttributeDiscreteValues());
				AbstractSearch search = null;
				Statistics statistics = null;
				// set up search
				switch (config.getSearchType()) {
					case RANDOM:
						search = new RandomSearch(rnd, part[0], part[1], ff, tf, config
								.getRandNEval(), config.getLandscapeSize(),
								config.isParallel(), onEndModel, null);
						break;
					case GP:
						selector = new TournamentSelector(config.getGPTournamentSize(), rnd);
						term = new MaxGenTerminator(config.getGPGenerations());
						search = new GPSearch(rnd, part[0], part[1], ff, tf, selector,
								term, config.isEKSelection() ? new ExpertKnowledgeEvolver(
										config.getExpertKnowledge(), config.getEKSelectionTopN(),
										false) : new Evolver(), config.getGPPopSize(), config
										.getGPPCross(), config.getGPPMut(), config
										.getLandscapeSize(), config.getGPElitist(), config
										.isParallel(), onEndModel, null, config
										.getGPPercentageNoise());
						if (config.isEKFitness() && config.isEKFitnessZTransform()) {
							((GPSearch) search).getEvolution().addPopulationListener(
									new ExpertKnowledgePopulationZTransformer());
						}
						statistics = ((GPSearch) search).getEvolution().getStatistics();
						break;
					case NONE:
						throw new IllegalArgumentException(
								"Search type is 'NONE' which means dataset has not been loaded and it should be impossible to run an analysis.");
				}
				// run search and store result
				if (search != null) {
					try {
						search.run();
						if (!Thread.currentThread().isInterrupted()) {
							final SortedSet<AbstractModel> landscape = search.getLandscape();
							final AbstractModel m = landscape.first();
							@SuppressWarnings("null")
							final Score testScore = ff.test(m, part[2]);
							runs.add(new Result(landscape, testScore,
									getModelDistribution(m), statistics));
						}
					} finally {
						if (onEndDepth != null) {
							onEndDepth.run();
						}
					}
				} // end if search !null
			}// end depth loop
		} catch (final Exception ex) {
			ex.printStackTrace();
		} finally {
			if (onEnd != null) {
				onEnd.run();
			}
		} // end finally
	} // end run()

	/**
	 * Set callback to run when all analyses are finished.
	 * @param onEnd callback to run when all analyses are finished
	 */
	public void setOnEnd(final Runnable onEnd) {
		this.onEnd = onEnd;
	}

	/**
	 * Set callback to run when a single analysis is finished.
	 * @param onEndDepth callback to run when a single analysis is finished
	 */
	public void setOnEndDepth(final Runnable onEndDepth) {
		this.onEndDepth = onEndDepth;
	}

	/**
	 * Set callback to run after a model is evaluated.
	 * @param onEndModel callback to run after a model is evaluated
	 */
	public void setOnEndModel(final Runnable onEndModel) {
		this.onEndModel = onEndModel;
	}

	/**
	 * Encapsulated results for a single run of a search method at a given tree depth.
	 */
	public static class Result {
		/**
		 * Value of the expression tree from the best model on each instance in the data.
		 * @see #getDistribution()
		 */
		private final Collection<? extends Object> distribution;
		/** GP run statistics for this analysis. May be null. */
		private final Statistics gpstats;
		/**
		 * Best n models from this analysis, in descending order by training score.
		 */
		private final Collection<AbstractModel> landscape;
		/** Score resulting from testing the best model on the validation set. */
		private final Score validation;

		/**
		 * Construct a result.
		 * @param landscape best n models by training score
		 * @param validation validation score of best model in landscape
		 * @param distribution value of the expression tree from the best model on each instance in the data
		 * @param gpstats statistics object with information about the gp run (may be null)
		 */
		public Result(final Collection<AbstractModel> landscape,
				final Score validation,
				final Collection<? extends Object> distribution,
				final Statistics gpstats) {
			this.landscape = landscape;
			this.validation = validation;
			this.distribution = distribution;
			this.gpstats = gpstats;
		}

		/**
		 * Get the value of the expression tree from the best model on each instance in the data, organized by status. For discrete analyses,
		 * the return value will be a Map&lt;String,List&lt;Double&gt;&gt;, where the key is a status label and the value is the list of
		 * expression values for that class. For continuous analyses, the return value will be a List&lt;Point2D&gt; with the status value as
		 * the x coordinate and the expression value as the y coordinate.
		 * @return value of the expression tree from the best model on each instance in the data, organized by status
		 * @see Analysis#getContinuousModelDistribution(AbstractModel)
		 * @see Analysis#getDiscreteModelDistribution(AbstractModel)
		 */
		public Collection<? extends Object> getDistribution() {
			return distribution;
		}

		/**
		 * Get the GP run statistics for this analysis. May be null if the analysis was not a GP search.
		 * @return GP run statistics for this analysis
		 */
		public Statistics getGPStatistics() {
			return gpstats;
		}

		/**
		 * Get a list of the n best models in descending order by training score.
		 * @return list of the n best models in descending order by training score.
		 */
		public Collection<AbstractModel> getLandscape() {
			return landscape;
		}

		/**
		 * Get the score resulting from testing the best model on the validation set.
		 * @return validation score
		 */
		public Score getValidation() {
			return validation;
		}
	}
}

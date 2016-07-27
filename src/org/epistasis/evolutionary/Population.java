package org.epistasis.evolutionary;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;

import org.epistasis.ProducerConsumerThread;

/**
 * A collection of genomes to be used with evolutionary computation.
 */
public class Population extends ArrayList<Genome> {
	private int gridWidth;
	private int gridHeight;
	private static final long serialVersionUID = 1L;
	/** Default population initializer. */
	public static Initializer DEFAULT_INITIALIZER = new DefaultInitializer();
	/** Maximum number of genomes for this population. */
	private int capacity = 0;
	/** Model genome for this population. */
	private Genome modelGenome;
	/** Initializer for this population. */
	private Initializer initializer = Population.DEFAULT_INITIALIZER;
	/** Callback to call after evaluating a genome. */
	private Runnable onEndModel;
	/** Parallel flag. */
	private boolean parallel;

	/**
	 * Construct a population. The parallel flag is set.
	 * @see #setParallel(boolean)
	 */
	public Population() {
		parallel = true;
	}

	/**
	 * Construct a population with a given parallel flag.
	 * @param parallel parallel flag
	 * @see #setParallel(boolean)
	 */
	public Population(final boolean parallel) {
		this.parallel = parallel;
	}

	/**
	 * Add a genome to the population at the specified index.
	 * @param index index at which to add the genome
	 * @param genome genome to add
	 */
	@Override
	public void add(final int index, final Genome genome) {
		if (size() >= capacity) {
			throw new IllegalArgumentException();
		}
		super.add(index, genome);
	}

	/**
	 * Get the number of genomes this population can hold.
	 * @return number of genomes this population can hold
	 */
	public int capacity() {
		return capacity;
	}

	/**
	 * Evaluate the population.
	 * @see #setParallel(boolean)
	 */
	public void evaluate() {
		// System.out.println("Evaluate called.");
		final int nProc = parallel ? Runtime.getRuntime().availableProcessors() : 1;
		if (nProc > 1) {
			final ProducerConsumerThread<Genome> pct = new ProducerConsumerThread<Genome>();
			pct.setProducer(new Producer(iterator()));
			for (int i = 0; i < nProc; ++i) {
				pct.addConsumer(new Consumer());
			}
			pct.run();
		} else {
			for (final Iterator<Genome> i = iterator(); i.hasNext() && !Thread.currentThread().isInterrupted();) {
				i.next().evaluate();
				if (onEndModel != null) {
					onEndModel.run();
				}
			}
		}
		if (Thread.currentThread().isInterrupted()) {
			return;
		}
		Collections.sort(this); // must sort because we keep track of the worst
	}

	public Genome getFromGridPosition(final int column, final int row) {
		final int columnIndex = (column - 1) % gridWidth;
		final int rowIndex = (row - 1) % gridHeight;
		final int arrayIndex = (columnIndex * gridWidth) + rowIndex;
		return get(arrayIndex);
	}

	/**
	 * Get the model genome for this population.
	 * @return model genome for this population
	 */
	public Genome getGenome() {
		return modelGenome;
	}

	/**
	 * Get the initializer used by this population.
	 * @return initializer used by this population
	 */
	public Initializer getInitializer() {
		return initializer;
	}

	public Genome[] getMooreNeighbors(final int column, final int row) {
		final Genome[] neighbors = new Genome[8];
		neighbors[0] = getFromGridPosition(column - 1, row - 1); // upper left
		neighbors[1] = getFromGridPosition(column - 0, row - 1); // upper middle
		neighbors[2] = getFromGridPosition(column + 1, row - 1); // upper right
		// THE CELL IS AT POSITION column, row
		neighbors[3] = getFromGridPosition(column, row - 1); // middle left
		neighbors[4] = getFromGridPosition(column, row + 1); // middle right
		neighbors[5] = getFromGridPosition(column - 1, row + 1); // lower left
		neighbors[6] = getFromGridPosition(column - 0, row + 1); // lower middle
		neighbors[7] = getFromGridPosition(column + 1, row + 1); // lower right
		return neighbors;
	}

	/**
	 * Get the callback to call after each model this population evaluates.
	 * @return callback to call after each model this population evaluates
	 */
	public Runnable getOnEndModel() {
		return onEndModel;
	}

	/**
	 * Call this population's initializer.
	 */
	public void initialize() {
		initializer.initialize(this);
	}

	/**
	 * Get the parallel flag for this population.
	 * @return parallel flag for this population
	 */
	public boolean isParallel() {
		return parallel;
	}

	/**
	 * Set the number of genomes this population can hold.
	 * @param capacity number of genomes this population can hold
	 */
	public void setCapacity(final int capacity) {
		if (capacity == this.capacity) {
			return;
		}
		this.capacity = capacity;
		if (capacity < size()) {
			subList(capacity, size()).clear();
			trimToSize();
		} else {
			ensureCapacity(capacity);
		}
	}

	/**
	 * Set the model genome to use for this population.
	 * @param genome model genome to use for this population
	 */
	public void setGenome(final Genome genome) {
		modelGenome = genome;
	}

	public void setGridDimensions(final int gridWidth, final int gridHeight) {
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		setCapacity(gridWidth * gridHeight);
	}

	/**
	 * Set the initializer to be used by this population.
	 * @param initializer initializer to be used by this population
	 */
	public void setInitializer(final Initializer initializer) {
		this.initializer = initializer;
	}

	/**
	 * Set the callback to call after each model this population evaluates.
	 * @param onEndModel callback to call after each model this population evaluates
	 */
	public void setOnEndModel(final Runnable onEndModel) {
		this.onEndModel = onEndModel;
	}

	/**
	 * Set the parallel flag to use for this population. If the parallel flag is set, and there is more than one processor available to the
	 * virtual machine, then when the population is evaluated, one thread for each processor is started to evaluate genomes in parallel.
	 * @param parallel flag to use for this population
	 */
	public void setParallel(final boolean parallel) {
		this.parallel = parallel;
	}

	/**
	 * Consumer which evaluates genomes from a parallel producer-consumer.
	 */
	private class Consumer extends ProducerConsumerThread.Consumer<Genome> {
		/**
		 * Evaluate a genome.
		 * @param g genome to evaluate
		 */
		@Override
		public void consume(final Genome g) {
			g.evaluate();
			if (onEndModel != null) {
				onEndModel.run();
			}
		}
	}

	/**
	 * Default implementation of a population initializer. This initializer simply fills the population with clones of the model genome, then
	 * iterates over them, calling each one's initializer.
	 */
	public static class DefaultInitializer implements Initializer {
		/**
		 * Initialize a population.
		 * @param population population to initialize
		 */
		public void initialize(final Population population) {
			while (population.size() < population.capacity) {
				final Genome newGenome = (Genome) population.modelGenome.clone();
				newGenome.initialize();
				population.add(newGenome);
			}
		}
	}

	/**
	 * Initialize a population.
	 */
	public static interface Initializer {
		/**
		 * Initialize a population.
		 * @param population population to initialize
		 */
		public void initialize(Population population);
	}

	/**
	 * Producer which produces genomes for a parallel producer-consumer.
	 */
	private static class Producer extends ProducerConsumerThread.Producer<Genome> {
		/** Iterator to genomes to produce. */
		private final Iterator<Genome> iter;

		/**
		 * Construct a producer with a specified iterator to genomes
		 * @param iter iterator to genomes to produce
		 */
		public Producer(final Iterator<Genome> iter) {
			this.iter = iter;
		}

		/**
		 * Produce a genome.
		 * @return produced genome
		 */
		@Override
		public Genome produce() {
			Genome genome;
			if (iter.hasNext()) {
				genome = iter.next();
				// System.out.println(Thread.currentThread().toString() + " produced: " + genome.toString());
			} else {
				genome = null;
			}
			return genome;
		}
	}
}

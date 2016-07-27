package org.epistasis.evolutionary;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * Selector which selects n genomes using and then selects the best of them.
 */
public class TournamentSelector implements Evolver.Selector {
	/** Genomes under consideration. */
	private final List<Genome> genomes;
	/** Genomes which will compete to be selected. */
	private final SortedSet<Genome> contestants;
	/** Number of genomes to select for the tournament. */
	private final int tournamentSize;
	/** Random number generator used by this selector. */
	private final Random random;

	/**
	 * Construct a tournament selector.
	 * @param tournamentSize size of tournaments
	 * @param selector base selector to use
	 */
	public TournamentSelector(final int tournamentSize, final Random random) {
		this.random = random;
		this.tournamentSize = tournamentSize;
		contestants = new TreeSet<Genome>();
		genomes = new ArrayList<Genome>();
	}

	/**
	 * Initialize the genomes with all the genomes in a population.
	 * @param population population with which to initialize the genomes
	 */
	public void initialize(final Population population) {
		genomes.clear();
		genomes.addAll(population);
	}

	/**
	 * Select a genome from the genomes.
	 * @return selected genome
	 */
	public Genome select() {
		final int size = genomes.size();
		if (size <= 0) {
			return null;
		}
		for (int i = 0; (i < tournamentSize) && (i < size); ++i) {
			final int randomIndex = random.nextInt(genomes.size());
			contestants.add(genomes.remove(randomIndex));
		}
		final Genome g = Collections.min(contestants);
		// need to re-add contestants into the pool
		for (final Genome g2 : contestants) {
			genomes.add(g2);
		}
		contestants.clear();
		return g;
	}

	/**
	 * Get number of genomes under consideration.
	 * @return number of genomes under consideration
	 */
	public int size() {
		return genomes.size();
	}

	// TournamentSelection only makes sense with replacement
	public boolean usesReplacement() {
		return true;
	}
}

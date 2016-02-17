package org.epistasis.evolutionary;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Selector which selects genomes in order from best to worst, without replacement.
 */
public class RankOrderSelector implements Evolver.Selector {
	/** Genomes under consideration. */
	private List<Genome> genomes;

	// /**
	// * Add a genome to consideration.
	// * @param g genome to add
	// */
	// public void add(final Genome g) {
	// int pos = Collections.binarySearch(genomes, g);
	// if (pos < 0) {
	// pos = -pos - 1;
	// }
	// genomes.add(pos, g);
	// }
	/**
	 * Initialize the selector with all the genomes in a population.
	 * @param population population with which to initialize the selector
	 */
	public void initialize(final Population population) {
		genomes = new ArrayList<Genome>(population);
		Collections.sort(genomes);
	}

	/**
	 * Remove a genome from consideration.
	 * @param g genome to remove
	 */
	public void remove(final Genome g) {
		genomes.remove(g);
	}

	/**
	 * Select a genome from the selector.
	 * @return selected genome
	 */
	public Genome select() {
		if (genomes.isEmpty()) {
			return null;
		}
		return genomes.remove(0);
	}

	/**
	 * Get number of genomes under consideration.
	 * @return number of genomes under consideration
	 */
	public int size() {
		return genomes.size();
	}

	/**
	 * Check to see if the selector selects with replacement. This means that genomes, once selected, are removed from consideration.
	 * @return false; this selector does not use replacement
	 */
	public boolean usesReplacement() {
		return false;
	}
}

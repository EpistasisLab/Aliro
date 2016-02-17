package org.epistasis.symod;

import java.util.ArrayList;
import java.util.Collections;

import org.epistasis.Pair;
import org.epistasis.PriorityList;
import org.epistasis.evolutionary.Evolver;
import org.epistasis.evolutionary.Genome;
import org.epistasis.evolutionary.Population;

/**
 * Evolver used to implement expert knowledge-based selection.
 */
public class ExpertKnowledgeEvolver extends Evolver {
	/** Expert knowledge scores. */
	private final ExpertKnowledge expert;
	/** Percent of best models to use in expert knowledge selection. */
	private final int numTopExpertTreesToCrossover;
	/** Whether to z-transform the expert knowledge scores. */
	private final boolean zxform;

	/**
	 * Construct an ExpertKnowledgeEvolver.
	 * @param expert expert knowledge scores to use
	 * @param numTopExpertTreesToCrossover percent of best models to use
	 * @param zxform whether to z-transform expert knowledge scores
	 */
	public ExpertKnowledgeEvolver(final ExpertKnowledge expert, final int numTopExpertTreesToCrossover, final boolean zxform) {
		this.expert = expert;
		this.numTopExpertTreesToCrossover = numTopExpertTreesToCrossover;
		this.zxform = zxform;
	}

	@Override
	public void evolve(final Population population) {
		final ArrayList<Genome> newPop = new ArrayList<Genome>(population.size());
		newPop.addAll(population.subList(0, getElitist()));
		selector.initialize(population);
		// after handling the elitism, do all crossovers of topN expert knowledge trees
		PriorityList<Pair<Genome, Double>> scores = new PriorityList<Pair<Genome, Double>>(numTopExpertTreesToCrossover, Collections
				.reverseOrder(new Pair.SecondThenFirstComparator<Genome, Double>()));
		for (final Genome g : population) {
			final Genome sg = g;
			scores.add(new Pair<Genome, Double>(g, expert.getTreeScore(sg.getTree(), zxform)));
		}
		final ArrayList<Genome> best = new ArrayList<Genome>(numTopExpertTreesToCrossover);
		for (final Pair<Genome, Double> pair : scores) {
			final Genome nextBestGenome = pair.getFirst();
			best.add(nextBestGenome);
		}
		scores = null;
		// make all combinations of the TopN expert knowledge containing trees
		for (int i = 0; (i < best.size() - 1) && (newPop.size() < population.size() - 1); ++i) {
			for (int j = i + 1; j < best.size(); ++j) {
				final Genome firstChild = (Genome) best.get(i).clone();
				final Genome secondChild = (Genome) best.get(j).clone();
				crossover.cross(firstChild, secondChild);
				if (pMut > 0) {
					if (random.nextDouble() < getPMut()) {
						mutation.mutate(firstChild);
					}
					if (random.nextDouble() < getPMut()) {
						mutation.mutate(secondChild);
					}
				}
				newPop.add(firstChild);
				newPop.add(secondChild);
			} // end crossover loop
			if (Thread.currentThread().isInterrupted()) {
				return;
			}
		}
		final int howManyLeftToCreate = population.size() - newPop.size();
		final int nCross = (int) Math.floor(howManyLeftToCreate * getPCross());
		for (int i = 0; (i < nCross) && !Thread.currentThread().isInterrupted(); i += 2) {
			final Genome firstChild = (Genome) selector.select().clone();
			final Genome secondChild = (Genome) selector.select().clone();
			crossover.cross(firstChild, secondChild);
			if (pMut > 0) {
				if (random.nextDouble() < getPMut()) {
					mutation.mutate(firstChild);
				}
				if (random.nextDouble() < getPMut()) {
					mutation.mutate(secondChild);
				}
			}
			newPop.add(firstChild);
			newPop.add(secondChild);
		} // end crossover loop
		if (Thread.currentThread().isInterrupted()) {
			return;
		}
		while ((newPop.size() < population.size()) && !Thread.currentThread().isInterrupted()) {
			Genome newPerson = selector.select();
			if ((getPMut() > 0) && (random.nextDouble() < getPMut())) {
				newPerson = (Genome) newPerson.clone();
				mutation.mutate(newPerson);
			}
			newPop.add(newPerson);
		}
		if (Thread.currentThread().isInterrupted()) {
			return;
		}
		population.clear();
		population.addAll(newPop);
	} // end evolve
} // end class

package org.epistasis.symod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.epistasis.evolutionary.Genome;
import org.epistasis.evolutionary.Population;
import org.epistasis.evolutionary.PopulationEvent;
import org.epistasis.evolutionary.PopulationListener;
import org.epistasis.evolutionary.Score;

/**
 * Population listener which, on population change, computes the mean and standard deviation of the scores in the population and sets the
 * appropriate fields in the score objects.
 */
public class ExpertKnowledgePopulationZTransformer implements PopulationListener {
	/**
	 * Callback which is called when the a registered population changes.
	 */
	public void populationEvaluated(final PopulationEvent e) {
		final Population pop = e.getPopulation();
		final List<ExpertKnowledgeScore> scores = new ArrayList<ExpertKnowledgeScore>(pop.size());
		double sum = 0;
		for (final Genome g : pop) {
			final Score s = g.getScore();
			if (s instanceof ExpertKnowledgeScore) {
				sum += s.getScore(true);
				scores.add((ExpertKnowledgeScore) s);
			} else {
				throw new RuntimeException(
						"ExpertKnowledgePopulationZTransformer called on a popluation that does not use scores of type 'ExpertKnowledgeScore'. Instead they are of type '"
								+ s.getClass().getSimpleName() + "'.");
			}
		}
		final double mean = sum / scores.size();
		sum = 0;
		for (final Score s : scores) {
			final double diff = s.getScore(true) - mean;
			sum += diff * diff;
		}
		final double stddev = Math.sqrt(sum / scores.size());
		for (final ExpertKnowledgeScore score : scores) {
			score.setBaseDist(mean, stddev);
		}
		Collections.sort(pop);
	}
}

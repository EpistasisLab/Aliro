package org.epistasis.symod.discrete;

import java.util.Arrays;
import java.util.List;

import org.epistasis.Utility;

/**
 * Partitioning of the real number line used to convert a continuous score into a discrete status prediction.
 */
public class Discriminant {
	/** Values which divide one partition from another. */
	private final double[] boundaries;
	/** Array of arrays of scores, one for each status. */
	private final double[][] dist;
	/** Indices of status values in the correct order for the partitions. */
	private final int[] order;
	/** List of status values used in this Discriminant. */
	private final List<String> statuses;
	private final ConfusionMatrixScore trainingConfusionMatrixScore;

	/**
	 * Construct a Discriminant.
	 * @param statuses list of statuses available for prediction
	 * @param dist array of arrays of scores, one for each status
	 * @param boundaries values which divide one partition from another
	 * @param order indices of statuses in the correct order for the partitions
	 */
	public Discriminant(final List<String> statuses, final double[][] dist, final double[] boundaries, final int[] order) {
		this.statuses = statuses;
		this.dist = dist;
		this.boundaries = boundaries;
		this.order = order;
		ConfusionMatrixScore confusionMatrixScore = new ConfusionMatrixScore(this);
		if (confusionMatrixScore.getBalancedAccuracy() < 0.5) {
			// the prediction accuracy was less than half so we should reverse the statuses
			for (int orderIndex = 0; orderIndex < (order.length / 2); ++orderIndex) {
				final int tempValue = order[orderIndex];
				order[orderIndex] = order[order.length - orderIndex - 1];
				order[order.length - orderIndex - 1] = tempValue;
			} // end for orderIndex
			confusionMatrixScore = new ConfusionMatrixScore(this);
		} // end if need to reverse order
		trainingConfusionMatrixScore = confusionMatrixScore;
	}// end constructor

	/**
	 * Get values which divide one partition from another.
	 * @return values which divide one partition from another
	 */
	public double[] getBoundaries() {
		return boundaries;
	}

	/**
	 * Get indices of statuses in the correct order for the partitions.
	 * @return indices of statuses in the correct order for the partitions
	 */
	public int[] getDistributionOrder() {
		return order;
	}

	/**
	 * Get array of arrays of scores, one for each status.
	 * @return array of arrays of scores, one for each status
	 */
	public double[][] getDistributions() {
		return dist;
	}

	/**
	 * Given a value on the real number line, determine to which status' partition it belongs.
	 * @param score real value
	 * @return index of appropriate status value
	 */
	public int getPrediction(final double score) {
		final int pos = Arrays.binarySearch(boundaries, score);
		return pos < 0 ? order[-(pos) - 1] : order[pos];
	}

	/**
	 * Given a value on the real number line, determine to which status' partition it belongs.
	 * @param score real value
	 * @return appropriate status value
	 */
	public String getPredictionStr(final double score) {
		return statuses.get(getPrediction(score));
	}

	/**
	 * Get list of status values used in this Discriminant.
	 * @return list of status values used in this Discriminant
	 */
	public List<String> getStatuses() {
		return statuses;
	}

	public ConfusionMatrixScore getTrainingConfusionMatrix() {
		return trainingConfusionMatrixScore;
	}

	/**
	 * Get a string representation of this Discriminant. It consists of a line for each partition, indicating which status value and what
	 * interval applies.
	 * @return string representation of this Discriminant
	 */
	@Override
	public String toString() {
		final String[] limits = new String[order.length + 1];
		int width = 0;
		// \u221e is the unicode character for infinity
		limits[0] = "-\u221e";
		limits[order.length] = "\u221e";
		for (int i = 0; i < boundaries.length; ++i) {
			limits[i + 1] = Double.toString(boundaries[i]);
			if (limits[i + 1].length() > width) {
				width = limits[i + 1].length();
			}
		}
		final StringBuffer b = new StringBuffer();
		for (int i = 0; i < order.length; ++i) {
			b.append(Utility.padLeft(limits[i], width));
			b.append(" < x ");
			b.append(i == order.length - 1 ? '<' : '\u2264');
			b.append(' ');
			b.append(Utility.padLeft(limits[i + 1], width));
			b.append(" : ");
			b.append(statuses.get(order[i]));
			b.append(Utility.NEWLINE);
		}
		return b.toString();
	}
}

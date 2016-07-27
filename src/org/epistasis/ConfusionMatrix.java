package org.epistasis;

import java.util.List;

/**
 * Result of a supervised classifier in matrix form. Each cell represents the number of samples for each combination of actual and predicted
 * status. Summary scores can be computed from this information. (The word 'status' was used instead of 'class' for obvious reasons.)
 * @param <S> type of status variables
 */
public class ConfusionMatrix<S> {
	/** Cache variable for accuracy score. */
	private Double accuracy = null;
	/** Cache variable for balanced accuracy score. */
	private Double balancedAccuracy = null;
	/** Counts of actual status vs predicted status. */
	private final int[][] matrix;
	/** List of statuses for matrix. */
	private final List<S> statuses;

	/**
	 * Construct a ConfusionMatrix with the given list of statuses.
	 * @param statuses list of statuses for this confusion matrix
	 */
	public ConfusionMatrix(final List<S> statuses) {
		this.statuses = statuses;
		matrix = new int[statuses.size()][statuses.size()];
	}

	/**
	 * Increment the count of samples with actual and predicted status specified by index.
	 * @param actual index of actual status for sample
	 * @param predicted index of predicted status for sample
	 */
	public void add(final int actual, final int predicted) {
		++matrix[actual][predicted];
		accuracy = balancedAccuracy = null;
	}

	/**
	 * Increment the count of samples with actual and predicted status specified by value.
	 * @param actual value of actual status for sample
	 * @param predicted value of predicted status for sample
	 * @throws java.lang.IndexOutOfBoundsException if actual or predicted is not in the status list
	 */
	public void add(final S actual, final S predicted) {
		final int iActual = statuses.indexOf(actual);
		if (iActual < 0) {
			throw new IndexOutOfBoundsException("Unknown status '" + actual.toString() + "'.");
		}
		final int iPredicted = statuses.indexOf(predicted);
		if (iPredicted < 0) {
			throw new IndexOutOfBoundsException("Unknown status '" + predicted.toString() + "'.");
		}
		add(iActual, iPredicted);
	}

	/**
	 * Get the count of samples with actual and predicted status specified by index.
	 * @param actual index of actual status for sample
	 * @param predicted index of predicted status for sample
	 * @return count of samples with given statuses
	 */
	public int get(final int actual, final int predicted) {
		return matrix[actual][predicted];
	}

	/**
	 * Get the count of samples with actual and predicted status specified by value.
	 * @param actual value of actual status for sample
	 * @param predicted value of predicted status for sample
	 * @return count of samples with given statuses
	 * @throws java.lang.IndexOutOfBoundsException if actual or predicted is not in the status list
	 */
	public int get(final S actual, final S predicted) {
		final int iActual = statuses.indexOf(actual);
		if (iActual < 0) {
			throw new IndexOutOfBoundsException("Unknown class '" + actual + "'.");
		}
		final int iPredicted = statuses.indexOf(predicted);
		if (iPredicted < 0) {
			throw new IndexOutOfBoundsException("Unknown class '" + predicted + "'.");
		}
		return matrix[iActual][iPredicted];
	}

	/**
	 * Compute the accuracy score for this confusion matrix. Accuracy is defined as c/n, where c is the number of samples correctly
	 * classified, and n is the total number of samples. This function caches the result, so that subsequent calls don't need to re-evaluate
	 * it unless the matrix changes.
	 * @return accuracy score for this confusion matrix
	 */
	public double getAccuracy() {
		if (accuracy == null) {
			int correct = 0;
			int total = 0;
			// loop over all matrix elements
			for (int i = 0; i < matrix.length; ++i) {
				for (int j = 0; j < matrix[i].length; ++j) {
					// elements on the diagonal are correctly classified
					if (i == j) {
						correct += matrix[i][j];
					}
					total += matrix[i][j];
				}
			}
			accuracy = (double) correct / (double) total;
		}
		return accuracy;
	}

	/**
	 * Compute the balanced accuracy score for this confusion matrix. Balanced accuracy is defined as the arithmetic mean of c_i/n_i, where
	 * c_i is the number of samples correctly classified for status i, and n_i is the total number of samples for status i. This is equivalent
	 * to accuracy when the number of samples for each status is equal, but avoids the bias that unequal sample sizes can induce in accuracy.
	 * This function caches the result, so that subsequent calls don't need to re-evaluate it unless the matrix changes.
	 * @return accuracy score for this confusion matrix
	 */
	public double getBalancedAccuracy() {
		if (balancedAccuracy == null) {
			double sum = 0; // used to compute average
			// loop over matrix rows (a row represents the predictions for
			// a given actual status)
			for (int i = 0; i < matrix.length; ++i) {
				final int[] row = matrix[i];
				int total = 0;
				int correct = 0;
				// loop over predictions
				for (int j = 0; j < row.length; ++j) {
					// elements on the diagonal are correctly classified
					if (i == j) {
						correct += row[j];
					}
					total += row[j];
				}
				sum += (double) correct / (double) total;
			}
			// store average for all statuses
			balancedAccuracy = sum / matrix.length;
		}
		return balancedAccuracy;
	}

	/**
	 * Return a multi-line string representation of the confusion matrix. This is primarily intended for debugging purposes.
	 * @return string representation of confusion matrix
	 */
	@Override
	public String toString() {
		final StringBuffer b = new StringBuffer();
		final int width[] = new int[matrix.length];
		int labelwidth = 0;
		for (final int[] row : matrix) {
			for (int j = 0; j < row.length; ++j) {
				final int len = (int) Math.ceil(Math.log10(row[j]));
				if (len > width[j]) {
					width[j] = len;
				}
			}
		}
		for (int i = 0; i < matrix.length; ++i) {
			final int len = ((String) statuses.get(i)).length();
			if (len > width[i]) {
				width[i] = len;
			}
			if (len > labelwidth) {
				labelwidth = len;
			}
		}
		b.append(Utility.chrdup(' ', labelwidth + 2));
		for (int i = 0; i < matrix.length; ++i) {
			b.append(' ');
			b.append(Utility.padRight((String) statuses.get(i), width[i]));
		}
		b.append(Utility.NEWLINE);
		b.append(Utility.chrdup(' ', labelwidth + 2));
		for (int i = 0; i < matrix.length; ++i) {
			b.append(' ');
			b.append(Utility.chrdup('-', width[i]));
		}
		b.append(Utility.NEWLINE);
		for (int i = 0; i < matrix.length; ++i) {
			b.append(Utility.padRight((String) statuses.get(i), labelwidth));
			b.append(" | ");
			final int[] row = matrix[i];
			for (int j = 0; j < matrix.length; ++j) {
				if (j != 0) {
					b.append(' ');
				}
				b.append(Utility.padLeft(Integer.toString(row[j]), width[j]));
			}
			b.append(Utility.NEWLINE);
		}
		return b.toString();
	}
}

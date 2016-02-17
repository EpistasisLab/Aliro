package org.epistasis.symod;

import java.io.IOException;
import java.io.LineNumberReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.AbstractList;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.VariableNode;

/**
 * A set of scores, one for each attribute of a data set, which can be used to influence the evolution of solutions.
 */
public class ExpertKnowledge extends AbstractList<ExpertKnowledge.Attribute> {
	/** Delimiter used for parsing input data. */
	private static final Pattern delim = Pattern.compile("\\s+");
	/** List of attribute objects which hold expert knowledge scores. */
	private final List<Attribute> list = new ArrayList<Attribute>();
	/** Cached mean of the expert knowledge scores. */
	private double mean = 0;
	/** Cached standard deviation of the expert knowledge scores. */
	private double stddev = 1;

	/**
	 * Get the index-th Attribute in the list.
	 * @return index-th Attribute in the list
	 */
	@Override
	public Attribute get(final int index) {
		return list.get(index);
	}

	/**
	 * Get the expert knowledge score, optionally z-transformed, for an attribute.
	 * @param index data set index of attribute for which to get the score
	 * @param zxform whether to z-transform the score
	 * @return score for selected attribute
	 */
	public double getScore(final int index, final boolean zxform) {
		final Attribute a = new Attribute(index, null, 0);
		final int loc = Collections.binarySearch(list, a);
		// binary search returns < 0 if not found
		if (loc < 0) {
			return Double.NEGATIVE_INFINITY;
		}
		double score = (list.get(loc)).getScore();
		if (zxform) {
			score -= mean;
			score /= stddev;
		}
		return score;
	}

	/**
	 * Get the highest expert knowledge score of any variable node in a tree, optionally z-transformed.
	 * @param tree head node of tree for which to get the score
	 * @param zxform whether to z-transform the score
	 * @return expert knowledge score for tree
	 */
	public double getTreeScore(final Node tree, final boolean zxform) {
		double maxscore = 0;
		if (tree instanceof VariableNode) {
			final VariableNode n = (VariableNode) tree;
			maxscore = getScore(n.getIndex(), zxform);
		} else {
			maxscore = Double.NEGATIVE_INFINITY;
		}
		for (final Node n : tree.getChildren()) {
			final double score = getTreeScore(n, zxform);
			if (maxscore < score) {
				maxscore = score;
			}
		}
		return maxscore;
	}

	/**
	 * Read the expert knowledge file from a stream. It is read from two whitespace-separated columns. The first column is the attribute name,
	 * and the second is the expert knowledge score. A list of labels from the data set is provided, and any attributes not in that list of
	 * labels are ignored.
	 * @param r reader from which to read
	 * @param labels list of attribute labels for which to read scores
	 */
	public void read(final Reader r, final List<String> labels) throws IOException {
		final LineNumberReader lnr = new LineNumberReader(r);
		String line;
		double sum = 0;
		while ((line = lnr.readLine()) != null) {
			final String[] fields = ExpertKnowledge.delim.split(line);
			if (fields.length != 2) {
				throw new IOException("Expected 2 columns, found " + fields.length + '.');
			}
			final String name = fields[0];
			final int index = labels.indexOf(name);
			double score = 0;
			if (index < 0) {
				continue;
			}
			try {
				score = Double.parseDouble(fields[1]);
			} catch (final NumberFormatException e) {
				throw new IOException("Column 2 value '" + fields[1] + "'not numeric.");
			}
			sum += score;
			list.add(new Attribute(index, name, score));
		}
		mean = sum / list.size();
		sum = 0;
		for (final Attribute attr : list) {
			final double diff = attr.getScore() - mean;
			sum += diff * diff;
		}
		stddev = Math.sqrt(sum / list.size());
		Collections.sort(list);
	}

	/**
	 * Get the number of Attributes in the list.
	 * @return number of Attributes in the list
	 */
	@Override
	public int size() {
		return list.size();
	}

	/**
	 * Write the expert knowledge file to a stream. It is written into two tab-separated columns. The first column is the attribute name, and
	 * the second is the expert knowledge score.
	 * @param w writer to which to write
	 */
	public void write(final Writer w) {
		final PrintWriter p = new PrintWriter(w);
		for (final Attribute a : list) {
			p.print(a.getName());
			p.print('\t');
			p.println(a.getScore());
		}
	}

	/**
	 * ExpertKnowledge's internal representation of a data attribute.
	 */
	public static class Attribute implements Comparable<Attribute> {
		/** Column index for this Attribute in the data set. */
		private final int index;
		/** Name of this Attribute in the data set. */
		private final String name;
		/** Expert knowledge for this Attribute. */
		private final double score;

		/**
		 * Construct an Attribute.
		 * @param index numerical index of position in data set
		 * @param name attribute name
		 * @param score expert knowledge score for this attribute
		 */
		public Attribute(final int index, final String name, final double score) {
			this.index = index;
			this.name = name;
			this.score = score;
		}

		/**
		 * Comparison operator to sort Attributes in ascending order by index.
		 * @param a other Attribute to compare
		 * @return &lt; 0 if this &lt; a, &gt; 0 if this &gt; a, or 0 otherwise
		 */
		public int compareTo(final Attribute a) {
			if (a == this) {
				return 0;
			}
			final int[] idx = { getIndex(), a.getIndex() };
			if (idx[0] > idx[1]) {
				return -1;
			}
			if (idx[0] < idx[1]) {
				return 1;
			}
			return 0;
		}

		/**
		 * Get this Attribute's index.
		 * @return this Attribute's index
		 */
		public int getIndex() {
			return index;
		}

		/**
		 * Get this Attribute's name.
		 * @return this Attribute's name
		 */
		public String getName() {
			return name;
		}

		/**
		 * Get this Attribute's score.
		 * @return this Attribute's score
		 */
		public double getScore() {
			return score;
		}

		/**
		 * Comparison operator to order attributes in ascending order by score.
		 */
		public static class ScoreComparator implements Comparator<Attribute> {
			/**
			 * Compare two attributes.
			 * @param a first attribute
			 * @param b second attribute
			 * @return &lt; 0 if a &lt; b, &gt; 0 if a &gt; b, or 0 otherwise
			 */
			public int compare(final Attribute a, final Attribute b) {
				return Double.compare(b.getScore(), a.getScore());
			}
		}
	}
}

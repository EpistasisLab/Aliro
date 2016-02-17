package org.epistasis.symod;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.Writer;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.AbstractList;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Pattern;

import org.epistasis.Bimap;

/**
 * Base class to represent a data set.
 */
public abstract class AbstractDataset extends AbstractList<AbstractDataset.Instance> implements Cloneable {
	/** Column delimiter to use when reading data. */
	private static Pattern delim = Pattern.compile("[\\s+,]");
	/** Rows in the data set. */
	private List<Instance> instances;
	/** Column labels. Usually implemented as {@link org.epistasis.Bimap}. */
	private List<String> labels;
	private List<List<Object>> attributeDiscreteValues;

	/**
	 * Load a data set from a file. The object returned from this function will either be {@link org.epistasis.symod.discrete.Dataset}
	 * (discrete) or {@link org.epistasis.symod.continuous.Dataset} (continuous), depending on its contents.
	 * @param f file to load
	 * @return loaded data set object
	 * @throws IOException
	 */
	public static AbstractDataset create(final File f, final int maxDiscreteAttributeLevels) throws IOException {
		AbstractDataset d = new org.epistasis.symod.continuous.Dataset();
		try {
			d.read(new FileReader(f), maxDiscreteAttributeLevels);
			if (org.epistasis.symod.discrete.Dataset.canBeDiscrete(d)) {
				return org.epistasis.symod.discrete.Dataset.convert(d);
			} else {
				return d;
			}
		} catch (final NumberFormatException e) {
			d = new org.epistasis.symod.discrete.Dataset();
			d.read(new FileReader(f), maxDiscreteAttributeLevels);
			return d;
		}
	}

	/**
	 * Construct an empty AbstractDataset.
	 */
	public AbstractDataset() {
		instances = Collections.emptyList();
		labels = Collections.emptyList();
		attributeDiscreteValues = Collections.emptyList();
	}

	/**
	 * Construct an AbstractDataset with a given list of Instances and column labels.
	 * @param instances Instances that comprise this data set
	 * @param labels column labels
	 */
	protected AbstractDataset(final List<Instance> instances, final List<String> labels, final List<List<Object>> attributeDiscreteValues) {
		this.instances = instances;
		this.labels = labels;
		this.attributeDiscreteValues = attributeDiscreteValues;
	}

	/**
	 * Remove all data from this data set.
	 */
	@Override
	public void clear() {
		instances = new ArrayList<Instance>();
		labels = new Bimap<String>();
		attributeDiscreteValues = Collections.emptyList();
	}

	/**
	 * Make a deep copy of the subtree rooted at this node and return it.
	 * @return deep copy of the subtree rooted at this node
	 */
	@Override
	public Object clone() {
		AbstractDataset clone = null;
		try {
			clone = (AbstractDataset) super.clone();
			clone.labels = labels;
			clone.attributeDiscreteValues = attributeDiscreteValues;
			clone.instances = new ArrayList<Instance>(instances.size());
			for (final Instance instance : instances) {
				clone.instances.add((Instance) instance.clone());
			}
		} catch (final CloneNotSupportedException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		}
		return clone;
	}

	/**
	 * Create an Instance from a set of values and a status value.
	 * @param values column values for the Instance
	 * @param status status value for the Instance
	 * @return new Instance
	 */
	protected abstract Instance createInstance(double[] values, String status);

	/**
	 * Create a data set based on this data set, but only including certain columns.
	 * @param attr indices of columns to keep
	 * @return new data set
	 */
	public AbstractDataset filter(final int[] attr) {
		AbstractDataset filtered = null;
		try {
			filtered = getClass().newInstance();
		} catch (final Exception ex) {
			ex.printStackTrace();
			return null;
		}
		filtered.labels = new Bimap<String>();
		filtered.instances = new ArrayList<Instance>(instances.size());
		filtered.attributeDiscreteValues = new ArrayList<List<Object>>(attr.length);
		for (final int element : attr) {
			filtered.labels.add(labels.get(element));
			filtered.attributeDiscreteValues.add(attributeDiscreteValues.get(element));
		}
		filtered.labels.add(labels.get(labels.size() - 1));
		for (final Instance inst : instances) {
			filtered.instances.add(inst.filter(attr));
		}
		return filtered;
	}

	/**
	 * Get a row.
	 * @param index index of row to get
	 * @return specified row
	 */
	@Override
	public Instance get(final int index) {
		return instances.get(index);
	}

	/**
	 * Get a data value.
	 * @param row row index of data value
	 * @param col column index of data value
	 * @return specified data value
	 */
	public double get(final int row, final int col) {
		return get(row).get(col);
	}

	/**
	 * Get a list of discrete values for each attribute. If attributes have too many to be considered discrete then the list will be null for
	 * that column.
	 * @return all column labels
	 */
	public List<List<Object>> getAttributeDiscreteValues() {
		return attributeDiscreteValues;
	}

	/**
	 * Does this column have a limited set of possible values
	 * @param col index of column
	 * @return List of values
	 */
	public List<Object> getAttributeDiscreteValues(final int col) {
		final List<Object> discreteAttributes = attributeDiscreteValues.get(col);
		return discreteAttributes;
	}

	/**
	 * Get a column label.
	 * @param col index of column
	 * @return column label
	 */
	public String getColumnLabel(final int col) {
		return labels.get(col);
	}

	/**
	 * Get a list of all column labels.
	 * @return all column labels
	 */
	public List<String> getLabels() {
		return labels;
	}

	/**
	 * Get the number of attributes (columns). This doesn't include the status column.
	 * @return number of attributes
	 */
	public int getNumAttributes() {
		return labels.size();
	}

	/**
	 * Get the number of instances (rows). This doesn't include the column labels.
	 * @return number of instances
	 */
	public int getNumInstances() {
		return instances.size();
	}

	/**
	 * Does this column have a limited set of possible values
	 * @param col index of column
	 * @return true if few values
	 */
	public boolean isDiscreteAttribute(final int col) {
		final List<Object> discreteAttributes = getAttributeDiscreteValues(col);
		final boolean isDiscreteAttribute = (discreteAttributes != null) && !discreteAttributes.isEmpty();
		return isDiscreteAttribute;
	}

	/**
	 * Randomly partition this data set into three smaller data sets by dividing this data set's instances among them. The data sets created
	 * this way are as close as possible to equal in size.
	 * @param r random number generator to use
	 * @return array of partitioned data sets
	 */
	public abstract AbstractDataset[] partition(Random r);

	/**
	 * Read data into this data set. The format is whitespace-delimited columns with a header row for column labels. Previous data contained
	 * in this data set is lost when this method is called.
	 * @param r source of data
	 * @throws IOException
	 */
	public void read(final Reader r, final int maxDiscreteAttributeLevels) throws IOException {
		final LineNumberReader lnr = new LineNumberReader(r);
		String line;
		clear();
		try {
			line = lnr.readLine();
			String[] fields = AbstractDataset.delim.split(line);
			final ArrayList<SortedSet<Object>> tempAttributeDiscreteValues = new ArrayList<SortedSet<Object>>(fields.length - 1);
			for (int i = 0; i < fields.length; ++i) {
				if (labels.contains(fields[i])) {
					throw new IllegalArgumentException("Duplicate label '" + fields[i] + "' at columns " + (i + 1) + " and "
							+ (labels.indexOf(fields[i]) + 1) + ".");
				}
				labels.add(fields[i]);
				tempAttributeDiscreteValues.add(new TreeSet<Object>());
			}
			final int statusColumnIndex = labels.size() - 1;
			while ((line = lnr.readLine()) != null) {
				fields = AbstractDataset.delim.split(line);
				if (fields.length != labels.size()) {
					throw new IllegalArgumentException("Expected " + labels.size() + "columns, got " + fields.length + ".");
				}
				final double[] values = new double[fields.length - 1];
				for (int i = 0; i < fields.length; ++i) {
					try {
						final SortedSet<Object> discreteValues = tempAttributeDiscreteValues.get(i);
						if (discreteValues != null) {
							if (i < statusColumnIndex) {
								discreteValues.add(Double.parseDouble(fields[i]));
							} else {
								discreteValues.add(fields[i]);
							}
							if (discreteValues.size() > maxDiscreteAttributeLevels) {
								// if there are too many different values for this attribute to be considered discrete
								// flag that by setting the Set to null
								tempAttributeDiscreteValues.set(i, null);
							}
						} // end if tracking values for this apparently discrete attribute
						if (i < statusColumnIndex) {
							values[i] = Double.parseDouble(fields[i]);
						}
					} catch (final NumberFormatException e) {
						throw new IllegalArgumentException("Invalid numeric value '" + fields[i] + "' at column " + (i + 1) + ".");
					}
				} // for values
				instances.add(createInstance(values, fields[statusColumnIndex]));
			} // end while lines
			// now need to review list of discrete elements and consolidate them since there is a
			// good chance that many columns will have the identical set of discrete elements (think genotypes 0,1, or 2)
			final Set<List<Object>> setOfDiscreteLists = new HashSet<List<Object>>();
			for (final SortedSet<Object> discreteValuesSet : tempAttributeDiscreteValues) {
				if (discreteValuesSet != null) {
					setOfDiscreteLists.add(new ArrayList<Object>(discreteValuesSet));
				}
			}
			final List<List<Object>> listOfDiscreteLists = new ArrayList<List<Object>>(setOfDiscreteLists);
			attributeDiscreteValues = new ArrayList<List<Object>>(tempAttributeDiscreteValues.size());
			for (int sortedSetIndex = 0; sortedSetIndex < tempAttributeDiscreteValues.size(); ++sortedSetIndex) {
				final Set<Object> discreteValuesSet = tempAttributeDiscreteValues.get(sortedSetIndex);
				if (discreteValuesSet == null) {
					attributeDiscreteValues.add(null);
				} else {
					final int indexToSingletonDiscreteValueset = listOfDiscreteLists.indexOf(new ArrayList<Object>(discreteValuesSet));
					if (indexToSingletonDiscreteValueset < 0) {
						throw new RuntimeException("Error in code building discrete values because set for column index " + sortedSetIndex + " '"
								+ discreteValuesSet.toArray().toString() + "' was not found in consolidated set of sets!");
					}
					attributeDiscreteValues.add(listOfDiscreteLists.get(indexToSingletonDiscreteValueset));
				} // end if discrete values exist for this attribute
			} // end sortedSet for loop
		} catch (final NumberFormatException e) {
			throw e;
		} catch (final Exception e) {
			throw new IOException(Integer.toString(lnr.getLineNumber()) + ':' + e.getMessage());
		}
	}

	/**
	 * Get the number of rows.
	 * @return number of rows
	 */
	@Override
	public int size() {
		return getNumInstances();
	}

	/**
	 * Write data to a Writer.
	 * @param w Writer to which to write
	 */
	public void write(final Writer w) {
		final PrintWriter p = new PrintWriter(w);
		for (int i = 0; i < labels.size(); ++i) {
			if (i != 0) {
				p.print('\t');
			}
			p.print(labels.get(i));
		}
		p.println();
		for (final Instance inst : instances) {
			p.println(inst);
		}
		p.flush();
	}

	/**
	 * Base class to represent a row in a data set.
	 */
	public static abstract class Instance implements Cloneable {
		/** Format to use when converting Instances to Strings. */
		public static final NumberFormat nf;
		static {
			nf = new DecimalFormat();
			Instance.nf.setMinimumIntegerDigits(1);
			Instance.nf.setMinimumFractionDigits(0);
			Instance.nf.setMaximumFractionDigits(7);
		}
		/** Status value. */
		private Number status;
		/** Data values. */
		private double[] values;

		/**
		 * Construct an Instance.
		 * @param values values to use as the elements
		 * @param status 'status' or 'class' value
		 */
		public Instance(final double[] values, final Number status) {
			this.values = values;
			this.status = status;
		}

		@Override
		protected Object clone() throws CloneNotSupportedException {
			final Instance clone = (Instance) super.clone();
			clone.values = new double[values.length];
			for (int index = 0; index < values.length; ++index) {
				clone.values[index] = values[index];
			}
			clone.status = status;
			return clone;
		}

		/**
		 * Create an Instance based on this one, but only including certain columns.
		 * @param attr indices of columns to keep
		 * @return new Instance
		 */
		public abstract Instance filter(int[] attr);

		/**
		 * Get a column's value.
		 * @param index index of column to get
		 * @return value at specified column
		 */
		public double get(final int index) {
			return values[index];
		}

		/**
		 * Get specified columns' values. Helper function for implementers of {@link #filter(int[])}.
		 * @param attr indices of columns to keep
		 * @return values of kept columns
		 */
		protected double[] getFilteredValues(final int[] attr) {
			final double[] values = new double[attr.length];
			for (int i = 0; i < values.length; ++i) {
				values[i] = get(attr[i]);
			}
			return values;
		}

		/**
		 * Get status value.
		 * @return status value
		 */
		public Number getStatus() {
			return status;
		}

		/**
		 * Get status string representation.
		 * @return status string representation
		 */
		public String getStatusString() {
			return status.toString();
		}

		/**
		 * Get all columns' values.
		 * @return all column's values
		 */
		public double[] getValues() {
			return values;
		}

		/**
		 * Set status value.
		 * @param status status value
		 */
		public void setStatus(final Number status) {
			this.status = status;
		}

		/**
		 * Get the number of data values.
		 * @return number of data values
		 */
		public int size() {
			return values.length;
		}

		/**
		 * Create a string representation of this Instance.
		 * @return string representation of this Instance
		 */
		@Override
		public String toString() {
			final StringBuffer b = new StringBuffer();
			final double[] values = getValues();
			for (final double element : values) {
				b.append(element);
				b.append('\t');
			}
			b.append(status);
			return b.toString();
		}
	}
}

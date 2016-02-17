package org.epistasis.symod.continuous;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

import org.epistasis.symod.AbstractDataset;

/**
 * Data set implementation for a continuous status attribute.
 */
public class Dataset extends AbstractDataset {
	/**
	 * Check whether a data set can be converted to a continuous-status data set.
	 * @param data data set to check
	 * @return whether data set can be converted to a continuous-status data set
	 */
	public static boolean canBeContinuous(final AbstractDataset data) {
		if (data instanceof Dataset) {
			return true;
		}
		if (data instanceof org.epistasis.symod.discrete.Dataset) {
			try {
				final List<String> statuses = ((org.epistasis.symod.discrete.Dataset) data).getStatuses();
				for (final String status : statuses) {
					Double.parseDouble(status);
				}
			} catch (final NumberFormatException e) {
				return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * Convert a data set to a continuous-status data set.
	 * @param data data set to convert
	 * @return converted data set, or null if it wasn't possible
	 */
	public static Dataset convert(final AbstractDataset data) {
		Dataset returnDataset = null;
		if (Dataset.canBeContinuous(data)) {
			if (data instanceof Dataset) {
				returnDataset = (Dataset) data;
			} else if (data instanceof org.epistasis.symod.discrete.Dataset) {
				final ArrayList<AbstractDataset.Instance> instances = new ArrayList<AbstractDataset.Instance>(data.size());
				final List<String> statuses = ((org.epistasis.symod.discrete.Dataset) data).getStatuses();
				final List<String> labels = data.getLabels();
				for (final org.epistasis.symod.AbstractDataset.Instance instance : data) {
					final org.epistasis.symod.discrete.Dataset.Instance inst = (org.epistasis.symod.discrete.Dataset.Instance) instance;
					instances.add(new Instance(inst.getValues(), Double.parseDouble(statuses.get(inst.getIntStatus()).toString())));
				}
				returnDataset = new Dataset(instances, labels, data.getAttributeDiscreteValues());
				data.clear();
			}
		}
		return returnDataset;
	}

	/**
	 * Construct a Dataset.
	 */
	public Dataset() {
		super();
	}

	/**
	 * Construct a Dataset from a list of instances and a list of attribute labels.
	 * @param instances list of instances
	 * @param labels list of attribute labels
	 */
	protected Dataset(final List<AbstractDataset.Instance> instances, final List<String> labels,
			final List<List<Object>> attributeDiscreteValues) {
		super(instances, labels, attributeDiscreteValues);
	}

	/**
	 * Create an Instance from a set of values and a status value.
	 * @param values column values for the Instance
	 * @param status status value for the Instance
	 * @return new Instance
	 */
	@Override
	protected AbstractDataset.Instance createInstance(final double[] values, final String status) {
		return new Instance(values, Double.parseDouble(status));
	}

	/**
	 * Get the status value for an instance
	 * @param row index of instance
	 * @return status value for given instance
	 */
	public double getRowStatus(final int row) {
		final Instance inst = (Instance) get(row);
		return inst.getDoubleStatus();
	}

	/**
	 * Get the mean value of the status attribute.
	 * @return mean value of the status attribute
	 */
	public double getStatusMean() {
		double sum = 0;
		for (final Object element : this) {
			final Instance inst = (Instance) element;
			sum += inst.getDoubleStatus();
		}
		return sum / size();
	}

	/**
	 * Partition the data set into three roughly equal chunks, dividing by row.
	 * @return array of data sets
	 */
	@Override
	public AbstractDataset[] partition(final Random r) {
		final Dataset[] partitions = new Dataset[3];
		final List<AbstractDataset.Instance> instList = new ArrayList<AbstractDataset.Instance>(this);
		final List<List<AbstractDataset.Instance>> lists = new ArrayList<List<AbstractDataset.Instance>>(partitions.length);
		for (int i = partitions.length; i != 0; --i) {
			lists.add(new ArrayList<AbstractDataset.Instance>());
		}
		if (r != null) {
			Collections.shuffle(instList, r);
		}
		int j = 0;
		for (final Iterator<AbstractDataset.Instance> i = instList.iterator(); i.hasNext(); ++j) {
			lists.get(j % partitions.length).add(i.next());
		}
		for (int i = 0; i < partitions.length; ++i) {
			partitions[i] = new Dataset(lists.get(i), getLabels(), getAttributeDiscreteValues());
		}
		return partitions;
	}

	/**
	 * Data set instance implementation for a continuous status attribute.
	 */
	public static class Instance extends AbstractDataset.Instance {
		/**
		 * Construct an Instance.
		 * @param values attribute values for this instance
		 * @param status status value for this instance
		 */
		public Instance(final double[] values, final double status) {
			super(values, new Double(status));
		}

		/**
		 * Create an instance based on this one with a subset of attributes.
		 * @param attr array of attribute indices to keep
		 * @return filtered instance
		 */
		@Override
		public AbstractDataset.Instance filter(final int[] attr) {
			return new Instance(getFilteredValues(attr), getDoubleStatus());
		}

		/**
		 * Get status for this instance as a double value.
		 * @return status for this instance as a double value
		 */
		public double getDoubleStatus() {
			return getStatus().doubleValue();
		}

		/**
		 * Get string representation of this instance. This consists of all values including the status value, joined by tabs.
		 * @return string representation of this instance
		 */
		@Override
		public String toString() {
			final StringBuffer b = new StringBuffer();
			final double[] values = getValues();
			for (final double element : values) {
				b.append(org.epistasis.symod.AbstractDataset.Instance.nf.format(element));
				b.append('\t');
			}
			b.append(org.epistasis.symod.AbstractDataset.Instance.nf.format(getDoubleStatus()));
			return b.toString();
		}
	}
}

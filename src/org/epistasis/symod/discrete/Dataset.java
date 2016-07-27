package org.epistasis.symod.discrete;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.epistasis.Bimap;
import org.epistasis.symod.AbstractDataset;

/**
 * Data set implementation for a discrete status attribute.
 */
public class Dataset extends AbstractDataset {
	/** List of status values in this data set. */
	private List<String> statuses;

	/**
	 * Check whether a data set can be converted to a discrete-status data set.
	 * @param data data set to check
	 * @return whether data set can be converted to a discrete-status data set
	 */
	public static boolean canBeDiscrete(final AbstractDataset data) {
		if (data instanceof Dataset) {
			return true;
		}
		final Map<String, Integer> statuses = new HashMap<String, Integer>();
		for (final AbstractDataset.Instance inst : data) {
			final String status = inst.getStatus().toString();
			Integer count = statuses.get(status);
			if (count == null) {
				count = 0;
			} else {
				count = new Integer(count + 1);
			}
			statuses.put(status, count);
		}
		for (final int i : statuses.values()) {
			if (i < 3) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Convert a data set to a discrete-status data set.
	 * @param data data set to convert
	 * @return converted data set, or null if it wasn't possible
	 */
	public static Dataset convert(final AbstractDataset data) {
		Dataset returnDataset = null;
		if (data instanceof Dataset) {
			returnDataset = (Dataset) data;
		} else if (data instanceof org.epistasis.symod.continuous.Dataset) {
			final Bimap<String> statuses = new Bimap<String>();
			final ArrayList<AbstractDataset.Instance> instances = new ArrayList<AbstractDataset.Instance>(data.size());
			final List<String> labels = data.getLabels();
			for (final AbstractDataset.Instance inst : data) {
				final String strStatus = AbstractDataset.Instance.nf.format(inst.getStatus().doubleValue());
				if (!statuses.contains(strStatus)) {
					statuses.add(strStatus);
				}
				instances.add(new Instance(inst.getValues(), statuses.indexOf(strStatus), statuses));
			}
			returnDataset = new Dataset(instances, labels, data.getAttributeDiscreteValues(), statuses);
			data.clear();
		}
		return returnDataset;
	}

	/**
	 * Construct a Dataset.
	 */
	public Dataset() {
		super();
		statuses = Collections.emptyList();
	}

	/**
	 * Construct a Dataset from a list of instances, a list of attribute labels, and a list of status values.
	 * @param instances list of instances
	 * @param labels list of attribute labels
	 * @param statuses list of status values
	 */
	protected Dataset(final List<AbstractDataset.Instance> instances, final List<String> labels,
			final List<List<Object>> attributeDiscreteValues, final List<String> statuses) {
		super(instances, labels, attributeDiscreteValues);
		this.statuses = statuses;
	}

	/**
	 * Remove all data from this data set.
	 */
	@Override
	public void clear() {
		super.clear();
		statuses = new Bimap<String>();
	}

	/**
	 * Create an Instance from a set of values and a status value.
	 * @param values column values for the Instance
	 * @param status status value for the Instance
	 * @return new Instance
	 */
	@Override
	protected AbstractDataset.Instance createInstance(final double[] values, final String status) {
		if (statuses.isEmpty()) {
			statuses = new Bimap<String>();
		}
		if (!statuses.contains(status)) {
			statuses.add(status);
		}
		final int iStatus = statuses.indexOf(status);
		return new Instance(values, iStatus, statuses);
	}

	/**
	 * Create a data set based on this data set, but only including certain columns.
	 * @param attr indices of columns to keep
	 * @return new data set
	 */
	@Override
	public AbstractDataset filter(final int[] attr) {
		final Dataset d = (Dataset) super.filter(attr);
		d.statuses = statuses;
		return d;
	}

	/**
	 * Get the status value for a given instance.
	 * @param row index of instance
	 * @return status value for given instance
	 */
	public String getRowStatus(final int row) {
		final Instance inst = (Instance) get(row);
		return statuses.get(inst.getIntStatus());
	}

	/**
	 * Get list of status values in this Dataset.
	 * @return list of status values in this Dataset
	 */
	public List<String> getStatuses() {
		return statuses;
	}

	/**
	 * Partition the data set into three roughly equal chunks, dividing by row. Attempts to maintain status ratios as much as possible.
	 * @return array of data sets
	 */
	@Override
	public AbstractDataset[] partition(final Random r) {
		final Dataset[] partitions = new Dataset[3];
		final List<List<AbstractDataset.Instance>> lists = new ArrayList<List<AbstractDataset.Instance>>(partitions.length);
		final List<List<AbstractDataset.Instance>> byStatus = new ArrayList<List<AbstractDataset.Instance>>(statuses.size());
		for (int i = 0; i < partitions.length; ++i) {
			lists.add(new ArrayList<AbstractDataset.Instance>());
		}
		for (int i = 0; i < statuses.size(); ++i) {
			byStatus.add(new ArrayList<AbstractDataset.Instance>());
		}
		for (int i = 0; i < size(); ++i) {
			final Instance inst = (Instance) get(i);
			byStatus.get(inst.getIntStatus()).add(inst);
		}
		if (r != null) {
			for (int i = 0; i < byStatus.size(); ++i) {
				Collections.shuffle(byStatus.get(i), r);
			}
		}
		for (int i = 0, k = 0; i < byStatus.size(); ++i) {
			for (final AbstractDataset.Instance j : byStatus.get(i)) {
				lists.get(k % lists.size()).add(j);
				++k;
			}
		}
		for (int i = 0; i < partitions.length; ++i) {
			partitions[i] = new Dataset(lists.get(i), getLabels(), getAttributeDiscreteValues(), statuses);
		}
		return partitions;
	}

	/**
	 * Data set instance implementation for a discrete status attribute.
	 */
	public static class Instance extends AbstractDataset.Instance {
		/** List of status values for this data set. */
		private final List<String> statuses;

		/**
		 * Construct an Instance.
		 * @param values attribute values for this instance
		 * @param status index into list of statuses for this instance's status
		 * @param statuses list of status values in the data set
		 */
		public Instance(final double[] values, final int status, final List<String> statuses) {
			super(values, status);
			this.statuses = statuses;
		}

		/**
		 * Create an instance based on this one with a subset of attributes.
		 * @param attr array of attribute indices to keep
		 * @return filtered instance
		 */
		@Override
		public AbstractDataset.Instance filter(final int[] attr) {
			return new Instance(getFilteredValues(attr), getIntStatus(), statuses);
		}

		/**
		 * Get status index for this instance as an int value.
		 * @return status index for this instance as an int value
		 */
		public int getIntStatus() {
			return getStatus().intValue();
		}

		/**
		 * Get string value of the status for this instance.
		 * @return string value of the status for this instance
		 */
		@Override
		public String getStatusString() {
			return statuses.get(getIntStatus()).toString();
		}

		/**
		 * Get string representation of this instance. This consists of all values including the status value, joined by tabs.
		 * @return string representation of this instance
		 */
		@Override
		public String toString() {
			final StringBuffer b = new StringBuffer();
			for (final double element : getValues()) {
				b.append(org.epistasis.symod.AbstractDataset.Instance.nf.format(element));
				b.append('\t');
			}
			b.append(getStatusString());
			return b.toString();
		}
	}
}

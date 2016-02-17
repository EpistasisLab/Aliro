package org.epistasis.symod.discrete;

import org.epistasis.symod.AbstractModel;
import org.epistasis.symod.tree.Node;

/**
 * Specific implementation of AbstractModel for data sets with discrete status attributes.
 */
public class Model extends AbstractModel {
	/** Discriminant for this Model. */
	private Discriminant disc;

	/**
	 * Construct a Model.
	 * @param tree head node of tree to use for this Model
	 */
	public Model(final Node tree) {
		super(tree);
	}

	/**
	 * Get the Discriminant for this Model.
	 * @return Discriminant for this Model
	 */
	public Discriminant getDiscriminant() {
		return disc;
	}

	/**
	 * Set the Discriminant to use for this Model.
	 * @param disc Discriminant to use for this Model
	 */
	public void setDiscriminant(final Discriminant disc) {
		this.disc = disc;
	}
}

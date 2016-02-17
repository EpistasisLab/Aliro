package org.epistasis.symod.continuous;

import org.epistasis.symod.AbstractModel;
import org.epistasis.symod.tree.Node;

/**
 * Specific implementation of AbstractModel for data sets with continuous status attributes.
 */
public class Model extends AbstractModel {
	/**
	 * Construct a Model.
	 * @param tree head node of tree to use for this Model
	 */
	public Model(final Node tree) {
		super(tree);
	}
}

package org.epistasis.symod.tree;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.epistasis.MultiDimArray;
import org.epistasis.Utility;

/**
 * Cartesian product node. This node first converts its arguments to integers by rounding them toward zero. It then adds or subtracts 3 to
 * each value until it is in the interval [0,2]. The resulting values are viewed as a 2-dimensional index into a 3x3 matrix, and the node
 * returns this index converted into a linear index using row-major order.
 */
public class CartesianProductNode extends BinaryFuncNode {
	/** Dimensions for 2d array. */
	private static final List<Integer> dims = Arrays.asList(3, 3);

	/**
	 * Compute this node's function on input values.
	 * @param a first input value
	 * @param b second input value
	 * @return result of computation
	 */
	@Override
	protected double evaluate(final double a, final double b) {
		final MultiDimArray<Integer> array = new MultiDimArray<Integer>(CartesianProductNode.dims);
		final List<Integer> idx = new ArrayList<Integer>(2);
		idx.add(Utility.wrap((int) Math.floor(Math.abs(a)), 0, CartesianProductNode.dims.get(0)));
		idx.add(Utility.wrap((int) Math.floor(Math.abs(b)), 0, CartesianProductNode.dims.get(0)));
		return array.encode(idx);
	}
}

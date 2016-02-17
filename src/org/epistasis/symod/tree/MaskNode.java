package org.epistasis.symod.tree;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.epistasis.MultiDimArray;
import org.epistasis.Utility;

/*
 * written as guess for what the purpose is by Peter Andrews
 */
public class MaskNode extends FunctionNode {
	private static final List<Integer> dims = new ArrayList<Integer>(Arrays.asList(3, 3));
	private static final int nChildren = 3;

	@Override
	public double evaluate(final double[] variables) {
		final MultiDimArray<Integer> array = new MultiDimArray<Integer>(MaskNode.dims);
		final List<Integer> idx = new ArrayList<Integer>(MaskNode.dims.size());
		// convert first two parameters into values 0,1 or 2 (pseudo-genotypes)
		for (int i = 0; i < MaskNode.dims.size(); ++i) {
			idx.add(Utility.wrap((int) Math.floor(Math.abs((getChild(i)).evaluate(variables))), 0, MaskNode.dims.get(i)));
		}
		// convert third parameter into a number 0-511 which we can use as a fixed mask
		int mask = Utility.wrap((int) Math.floor(Math.abs((getChild(MaskNode.dims.size())).evaluate(variables))), 0, (1 << array.size()));
		System.out.println("mask: " + mask);
		// use mask index to build mask
		for (int i = array.size() - 1; i >= 0; --i) {
			array.set(i, mask & 0x01);
			mask >>= 1;
		}
		return array.get(idx);
	}

	@Override
	public int getMaxChildren() {
		return MaskNode.nChildren;
	}

	@Override
	public int getMinChildren() {
		return MaskNode.nChildren;
	}
}

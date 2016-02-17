package org.epistasis.symod.tree;

import java.io.IOException;
import java.io.LineNumberReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.epistasis.MultiDimArray;
import org.epistasis.Utility;

public class FileMaskNode extends FunctionNode {
	private static final List<Integer> dims = new ArrayList<Integer>(Arrays.asList(3, 3));
	private static final int nChildren = 3;
	private static List<Integer[]> key = new ArrayList<Integer[]>();

	public static void readKey(final Reader r) throws IOException {
		final LineNumberReader lnr = new LineNumberReader(r);
		String line;
		int size = 1;
		for (int i = 0; i < FileMaskNode.dims.size(); ++i) {
			size *= FileMaskNode.dims.get(i);
		}
		while ((line = lnr.readLine()) != null) {
			final String[] fields = line.split("\\s+");
			if (fields.length != size) {
				throw new IOException(Integer.toString(lnr.getLineNumber()) + ":Expected " + Integer.toString(size) + " values, got "
						+ Integer.toString(fields.length) + ".");
			}
			final Integer[] values = new Integer[fields.length];
			for (int i = 0; i < fields.length; ++i) {
				try {
					values[i] = Integer.parseInt(fields[i]);
				} catch (final NumberFormatException ex) {
					throw new IOException(Integer.toString(lnr.getLineNumber()) + ":String '" + fields[i] + "' at column " + Integer.toString(i + 1)
							+ " is not a valid integer.");
				}
			}
			FileMaskNode.key.add(values);
		}
	}

	@Override
	public double evaluate(final double[] variables) {
		final MultiDimArray<Integer> array = new MultiDimArray<Integer>(FileMaskNode.dims);
		final List<Integer> idx = new ArrayList<Integer>(FileMaskNode.dims.size());
		for (int i = 0; i < FileMaskNode.dims.size(); ++i) {
			idx.add(Utility.wrap((int) Math.floor(Math.abs((getChild(i)).evaluate(variables))), 0, FileMaskNode.dims.get(i)));
		}
		final int mask = Utility.wrap((int) Math.floor(Math.abs((getChild(FileMaskNode.dims.size())).evaluate(variables))), 0,
				(FileMaskNode.key.size()));
		final Integer[] keyrow = FileMaskNode.key.get(mask);
		for (int i = 0; i < array.size(); ++i) {
			array.set(i, keyrow[i]);
		}
		return array.get(idx);
	}

	@Override
	public int getMaxChildren() {
		return FileMaskNode.nChildren;
	}

	@Override
	public int getMinChildren() {
		return FileMaskNode.nChildren;
	}
}

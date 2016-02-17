package org.epistasis.symod.tree;

import java.util.ArrayList;
import java.util.List;

import org.epistasis.MultiBaseInteger;

public class ExhaustiveFullTreeFactory {
	private final MultiBaseInteger mbi;
	private final List<Class<? extends FunctionNode>> functions;
	private final double[] constants;
	private final int[] variables;
	private final String[] labels;
	private final List<List<Object>> attributeDiscreteValues;
	private boolean hasNext = true;

	public ExhaustiveFullTreeFactory(final int depth, final List<Class<? extends FunctionNode>> functions, final double[] constants,
			final int[] variables, final String[] labels, final List<List<Object>> attributeDiscreteValues) {
		final int[] dims = new int[(1 << (depth + 1)) - 1];
		final int n = (1 << depth) - 1;
		for (int i = 0; i < n; ++i) {
			dims[i] = functions.size();
		}
		final int nLeaves = constants.length + variables.length;
		for (int i = n; i < dims.length; ++i) {
			dims[i] = nLeaves;
		}
		mbi = new MultiBaseInteger(dims);
		this.functions = new ArrayList<Class<? extends FunctionNode>>(functions);
		this.constants = constants.clone();
		this.variables = variables.clone();
		this.labels = labels;
		this.attributeDiscreteValues = attributeDiscreteValues;
	}

	public Node getNext() throws InstantiationException, IllegalAccessException {
		if (!hasNext) {
			return null;
		}
		final Node[] nodes = new Node[mbi.size()];
		final int nInternal = nodes.length >> 1;
		for (int i = 0; i < mbi.size(); ++i) {
			if (i < nInternal) {
				final Class<? extends FunctionNode> func = functions.get(mbi.get(i));
				nodes[i] = func.newInstance();
			} else {
				int j = mbi.get(i);
				if (j < constants.length) {
					nodes[i] = new ConstantNode(constants[j]);
				} else {
					j -= constants.length;
					nodes[i] = new VariableNode(variables[j], labels[variables[j]], attributeDiscreteValues.get(variables[j]));
				}
			}
		}
		for (int i = 0; i < nInternal; ++i) {
			final int right = 2 * (i + 1);
			final int left = right - 1;
			nodes[i].addChild(nodes[left]);
			nodes[i].addChild(nodes[right]);
		}
		hasNext = mbi.increment();
		return nodes[0];
	}
}

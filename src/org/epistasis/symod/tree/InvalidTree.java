package org.epistasis.symod.tree;
public class InvalidTree extends FunctionNode {
	public static final Node SINGLETON = new InvalidTree();
	static {
		InvalidTree.SINGLETON.addChild(new ConstantNode(1.0));
	}

	private InvalidTree() {
		// prevent instantiation
	}

	@Override
	public double evaluate(final double[] variables) {
		return -1.0;
	}

	@Override
	public int getMaxChildren() {
		return 1;
	}

	@Override
	public int getMinChildren() {
		return 0;
	}
}

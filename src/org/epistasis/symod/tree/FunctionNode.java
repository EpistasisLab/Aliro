package org.epistasis.symod.tree;
/**
 * Grouping base class for function nodes.
 */
public abstract class FunctionNode extends Node {
	public boolean restrictedToAttributeConnectedTerminalNode() {
		return false;
	}
}

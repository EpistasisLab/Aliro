package org.epistasis.symod;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Map;
import java.util.TreeMap;

import org.epistasis.RouletteWheel;
import org.epistasis.symod.tree.ConstantNode;
import org.epistasis.symod.tree.MDRMask;
import org.epistasis.symod.tree.Node;
import org.epistasis.symod.tree.VariableNode;

public class ProbabilisticMainBase {
	protected static RouletteWheel<String> roots = new RouletteWheel<String>();
	protected static Map<String, RouletteWheel<String>> func2func = new TreeMap<String, RouletteWheel<String>>();
	protected static Map<String, RouletteWheel<String>> func2leaf = new TreeMap<String, RouletteWheel<String>>();
	protected static AbstractDataset data;

	protected static boolean isFunc(final String name) {
		return name.startsWith(MDRMask.NAME_PREFIX) || name.equals("Equal") || name.equals("NotEqual") || name.equals("Less")
				|| name.equals("LessEqual") || name.equals("Greater") || name.equals("GreaterEqual") || name.equals("Max") || name.equals("Min")
				|| name.equals("Plus") || name.equals("Minus") || name.equals("Times") || name.equals("Divide") || name.startsWith("Mask")
				|| name.equals("Or") || name.equals("Abs") || name.equals("ACos") || name.equals("And") || name.equals("ASin")
				|| name.equals("ATan2") || name.equals("ATan") || name.equals("CartesianProduct") || name.equals("Ceil")
				|| name.equals("Connector") || name.equals("Cos") || name.equals("Exp") || name.equals("Floor") || name.equals("If")
				|| name.equals("Log") || name.equals("Combinations") || name.equals("Permutations") || name.equals("Not")
				|| name.equals("PickFirst") || name.equals("Pow") || name.equals("Sign") || name.equals("Sin") || name.equals("Sqrt")
				|| name.equals("Tan") || name.equals("Xor");
	}

	protected static Node name2node(final String name) {
		Node node = null;
		try {
			if (ProbabilisticMainBase.isFunc(name)) {
				final String classname = "org.epistasis.symod.tree.";
				if (name.startsWith(MDRMask.NAME_PREFIX)) {
					final String maskString = name.substring(MDRMask.NAME_PREFIX.length());
					node = new MDRMask(maskString);
				} else if (name.equals("Combinations")) {
					node = (Node) Class.forName(classname + name + "NCRNode").newInstance();
				} else if (name.equals("Permutations")) {
					node = (Node) Class.forName(classname + name + "NPRNode").newInstance();
				} else {
					node = (Node) Class.forName(classname + name + "Node").newInstance();
				}
			} else {
				final int index = ProbabilisticMainBase.data.getLabels().indexOf(name);
				if (index >= 0) {
					node = new VariableNode(index, name, ProbabilisticMainBase.data.getAttributeDiscreteValues(index));
				} else {
					final double value = Double.parseDouble(name);
					node = new ConstantNode(value);
				}
			} // end if variable
		} catch (final Exception ex) {
			System.err.println(ProbabilisticMain.class.getName() + ".name2Node(" + name + ") caught an exception: " + ex.toString());
		}
		return node;
	}

	protected static void readFreqList(final String freqList) {
		try {
			final BufferedReader r = new BufferedReader(new FileReader(freqList));
			String line;
			while ((line = r.readLine()) != null) {
				final String[] fields = line.split(",");
				if (fields.length == 2) {
					final String leafOrFunction = fields[0];
					if (ProbabilisticMainBase.isFunc(leafOrFunction)) {
						final int count = Integer.parseInt(fields[1]);
						ProbabilisticMainBase.roots.add(leafOrFunction, count);
					}
					// else we don't create roulette for attributes and constants
				} else if (fields.length == 3) {
					final String functionName = fields[0];
					final String leafOrFunction = fields[1];
					final int count = Integer.parseInt(fields[2]);
					final boolean isFunc = ProbabilisticMainBase.isFunc(leafOrFunction);
					final Map<String, RouletteWheel<String>> map = isFunc ? ProbabilisticMainBase.func2func : ProbabilisticMainBase.func2leaf;
					RouletteWheel<String> wheel = map.get(functionName);
					if (wheel == null) {
						wheel = new RouletteWheel<String>();
						map.put(functionName, wheel);
					}
					wheel.add(leafOrFunction, count);
				}
			}
		} catch (final IOException e) {
			e.printStackTrace();
			System.exit(1);
		}
	}
}

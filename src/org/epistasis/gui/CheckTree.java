package org.epistasis.gui;

import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

import javax.swing.Icon;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTree;
import javax.swing.UIManager;
import javax.swing.plaf.ColorUIResource;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.MutableTreeNode;
import javax.swing.tree.TreeCellRenderer;
import javax.swing.tree.TreePath;
import javax.swing.tree.TreeSelectionModel;

/**
 * Tree control which adds a checkbox to each tree entry. Checkboxes in parent nodes which have both checked and unchecked children are
 * checked but greyed to indicate partial selection.
 */
public class CheckTree extends JTree {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Icon to display for a collapsed interior node. */
	private Icon icoClosed = UIManager.getIcon("Tree.closedIcon");
	/** Icon to display for a leaf node. */
	private Icon icoLeaf = UIManager.getIcon("Tree.leafIcon");
	/** Icon to display for an expanded interior node. */
	private Icon icoOpen = UIManager.getIcon("Tree.openIcon");

	/**
	 * Construct a CheckTree.
	 */
	public CheckTree() {
		super(new CheckNode());
		setCellRenderer(new CheckRenderer());
		addMouseListener(new NodeSelectionListener());
		getSelectionModel().setSelectionMode(TreeSelectionModel.SINGLE_TREE_SELECTION);
	}

	/**
	 * Get the icon to display for a collapsed interior node.
	 * @return icon to display for a collapsed interior node
	 */
	public Icon getClosedIcon() {
		return icoClosed;
	}

	/**
	 * Get the icon to display for a leaf node.
	 * @return icon to display for a leaf node
	 */
	public Icon getLeafIcon() {
		return icoLeaf;
	}

	/**
	 * Get the icon to display for an expanded interior node.
	 * @return icon to display for an expanded interior node
	 */
	public Icon getOpenIcon() {
		return icoOpen;
	}

	/**
	 * Set the icon to display for a collapsed interior node.
	 * @param icoClosed icon to display for a collapsed interior node
	 */
	public void setClosedIcon(final Icon icoClosed) {
		this.icoClosed = icoClosed;
	}

	/**
	 * Set the icon to display for a leaf node.
	 * @param icoLeaf icon to display for a leaf node
	 */
	public void setLeafIcon(final Icon icoLeaf) {
		this.icoLeaf = icoLeaf;
	}

	/**
	 * Set the icon to display for an expanded interior node.
	 * @param icoOpen icon to display for an expanded interior node
	 */
	public void setOpenIcon(final Icon icoOpen) {
		this.icoOpen = icoOpen;
	}

	/**
	 * Node for a CheckTree.
	 */
	public static class CheckNode extends DefaultMutableTreeNode {
		/**
		 * 
		 */
		private static final long serialVersionUID = 1L;
		/** Checked state of this node. */
		private Selection selected;

		/**
		 * Construct a CheckNode.
		 */
		public CheckNode() {
			this(null);
		}

		/**
		 * Construct a CheckNode with a user-defined Object pointer.
		 * @param userObject user-defined Object pointer
		 */
		public CheckNode(final Object userObject) {
			this(userObject, true, false);
		}

		/**
		 * Construct a CheckNode with a user-defined Object pointer and other parameters.
		 * @param userObject user-defined Object pointer
		 * @param allowsChildren whether this CheckNode can have child nodes
		 * @param selected whether this CheckNode starts its life checked
		 */
		public CheckNode(final Object userObject, final boolean allowsChildren, final boolean selected) {
			super(userObject, allowsChildren);
			this.selected = selected ? Selection.SELECTED : Selection.UNSELECTED;
		}

		/**
		 * Add a child node to this CheckNode.
		 * @param n child node to add
		 */
		@Override
		public void add(final MutableTreeNode n) {
			if (!(n instanceof CheckNode)) {
				throw new IllegalArgumentException("CheckNodes may only contain other CheckNodes.");
			}
			super.add(n);
		}

		/**
		 * Get node's checked state.
		 * @return node's checked state
		 */
		public Selection getSelectedExt() {
			return selected;
		}

		/**
		 * Get whether this node is checked.
		 * @return whether this node is checked
		 */
		public boolean isSelected() {
			return selected != Selection.UNSELECTED;
		}

		/**
		 * Set whether this node is checked.
		 * @param selected whether this node is checked
		 */
		public void setSelected(final boolean selected) {
			setSelectedExt(selected ? Selection.SELECTED : Selection.UNSELECTED);
		}

		/**
		 * Set checked state of this node. Updates parent or child nodes as appropriate.
		 * @param selected checked state of this node
		 */
		public void setSelectedExt(final Selection selected) {
			this.selected = selected;
			for (CheckNode parent = (CheckNode) getParent(); parent != null; parent = ((CheckNode) parent.getParent())) {
				final int[] counts = new int[3];
				for (final Object node : parent.children) {
					++counts[((CheckNode) node).getSelectedExt().ordinal()];
				}
				if ((counts[Selection.PARTIALLY_SELECTED.ordinal()] == 0) && (counts[Selection.UNSELECTED.ordinal()] == 0)) {
					parent.selected = Selection.SELECTED;
				} else if ((counts[Selection.PARTIALLY_SELECTED.ordinal()] == 0) && (counts[Selection.SELECTED.ordinal()] == 0)) {
					parent.selected = Selection.UNSELECTED;
				} else {
					parent.selected = Selection.PARTIALLY_SELECTED;
				}
			}
			if (children != null) {
				for (final Object node : children) {
					((CheckNode) node).setSelected(selected != Selection.UNSELECTED);
				}
			}
		}
	}

	/**
	 * Renderer object used to draw individual CheckNodes.
	 */
	private class CheckRenderer extends JPanel implements TreeCellRenderer {
		/**
		 * 
		 */
		private static final long serialVersionUID = 1L;
		/** Checkbox used for rendering checkboxes on nodes. */
		private JCheckBox check;
		/** Label used for rendering node labels. */
		private TreeLabel label;

		/**
		 * Construct a CheckRenderer.
		 */
		public CheckRenderer() {
			setLayout(null);
			add(check = new JCheckBox());
			add(label = new TreeLabel());
			check.setOpaque(false);
			label.setOpaque(false);
			setOpaque(false);
			label.setForeground(UIManager.getColor("Tree.textForeground"));
		}

		/**
		 * Causes this container to lay out its components. Most programs should not call this method directly, but should invoke the validate
		 * method instead.
		 */
		@Override
		public void doLayout() {
			final Dimension d_check = check.getPreferredSize();
			final Dimension d_label = label.getPreferredSize();
			int y_check = 0;
			int y_label = 0;
			if (d_check.height < d_label.height) {
				y_check = (d_label.height - d_check.height) / 2;
			} else {
				y_label = (d_check.height - d_label.height) / 2;
			}
			check.setLocation(0, y_check);
			check.setBounds(0, y_check, d_check.width, d_check.height);
			label.setLocation(d_check.width, y_label);
			label.setBounds(d_check.width, y_label, d_label.width, d_label.height);
		}

		/**
		 * Returns the preferred size of this container.
		 */
		@Override
		public Dimension getPreferredSize() {
			final Dimension d_check = check.getPreferredSize();
			final Dimension d_label = label.getPreferredSize();
			return new Dimension(d_check.width + d_label.width, (d_check.height < d_label.height ? d_label.height : d_check.height));
		}

		/**
		 * Configures the renderer based on the passed in components. The value is set from messaging the tree with convertValueToText, which
		 * ultimately invokes toString on value. The foreground color is set based on the selection and the icon is set based on on leaf and
		 * expanded.
		 * @param tree component being rendered
		 * @param value CheckNode for which to configure the renderer
		 * @param selected whether the node is selected (highlighted)
		 * @param expanded whether the node is expanded
		 * @param leaf whether the node is a leaf
		 * @param row row number of the node in the tree
		 * @param hasFocus whether the node has the input focus
		 */
		public Component getTreeCellRendererComponent(final JTree tree, final Object value, final boolean selected, final boolean expanded,
				final boolean leaf, final int row, final boolean hasFocus) {
			final CheckNode node = (CheckNode) value;
			final String stringValue = tree.convertValueToText(value, selected, expanded, leaf, row, hasFocus);
			setEnabled(tree.isEnabled());
			check.setEnabled(node.getSelectedExt() != Selection.PARTIALLY_SELECTED);
			check.setSelected(node.getSelectedExt() != Selection.UNSELECTED);
			label.setFont(tree.getFont());
			label.setText(stringValue);
			label.setSelected(selected);
			label.setFocus(hasFocus);
			if (leaf) {
				label.setIcon(icoLeaf);
			} else if (expanded) {
				label.setIcon(icoOpen);
			} else {
				label.setIcon(icoClosed);
			}
			return this;
		}

		/**
		 * Sets the background color of this component.
		 * @param color the color to become this component's color; if this parameter is null, then this component will inherit the background
		 *          color of its parent
		 */
		@Override
		public void setBackground(Color color) {
			if (color instanceof ColorUIResource) {
				color = null;
			}
			super.setBackground(color);
		}
	}

	/**
	 * Listener to handle mouse input for a CheckTree.
	 */
	private class NodeSelectionListener extends MouseAdapter {
		/**
		 * Invoked when the mouse has clicked on a component.
		 * @param e event object containing event details
		 */
		@Override
		public void mouseClicked(final MouseEvent e) {
			final int row = getRowForLocation(e.getX(), e.getY());
			final TreePath path = getPathForRow(row);
			if (path != null) {
				final CheckNode node = (CheckNode) path.getLastPathComponent();
				switch (node.getSelectedExt()) {
					case UNSELECTED:
					case PARTIALLY_SELECTED:
						node.setSelected(true);
						break;
					case SELECTED:
						node.setSelected(false);
						break;
				}
				((DefaultTreeModel) getModel()).nodeChanged(node);
				repaint();
			}
		}
	}

	/** Enumeration of possible checked states. */
	public static enum Selection {
		PARTIALLY_SELECTED, SELECTED, UNSELECTED,
	}

	/**
	 * Special label which can paint itself as selected, focused, both, or neither.
	 */
	private static class TreeLabel extends JLabel {
		/**
		 * 
		 */
		private static final long serialVersionUID = 1L;
		/** Whether this label has the input focus. */
		private boolean focused = false;
		/** Whether this label is selected. */
		private boolean selected = false;

		/**
		 * Returns the preferred size of this container.
		 */
		@Override
		public Dimension getPreferredSize() {
			Dimension retDimension = super.getPreferredSize();
			if (retDimension != null) {
				retDimension = new Dimension(retDimension.width + 3, retDimension.height);
			}
			return retDimension;
		}

		/**
		 * Get whether the label has the input focus.
		 * @return whether the label has the input focus
		 */
		@Override
		public boolean hasFocus() {
			return focused;
		}

		/**
		 * Get whether the label is selected.
		 * @return whether the label is selected
		 */
		public boolean isSelected() {
			return selected;
		}

		/**
		 * Invoked by Swing to draw components. Applications should not invoke paint directly, but should instead use the repaint method to
		 * schedule the component for redrawing.
		 * @param g the Graphics context in which to paint
		 */
		@Override
		public void paint(final Graphics g) {
			String str;
			if ((str = getText()) != null) {
				if (0 < str.length()) {
					if (selected) {
						g.setColor(UIManager.getColor("Tree.selectionBackground"));
					} else {
						g.setColor(UIManager.getColor("Tree.textBackground"));
					}
					final Dimension d = getPreferredSize();
					int imageOffset = 0;
					final Icon currentI = getIcon();
					if (currentI != null) {
						imageOffset = currentI.getIconWidth() + Math.max(0, getIconTextGap() - 1);
					}
					g.fillRect(imageOffset, 0, d.width - 1 - imageOffset, d.height);
					if (focused) {
						g.setColor(UIManager.getColor("Tree.selectionBorderColor"));
						g.drawRect(imageOffset, 0, d.width - 1 - imageOffset, d.height - 1);
					}
				}
			}
			super.paint(g);
		}

		/**
		 * Sets the background color of this component.
		 * @param color the color to become this component's color; if this parameter is null, then this component will inherit the background
		 *          color of its parent
		 */
		@Override
		public void setBackground(Color color) {
			if (color instanceof ColorUIResource) {
				color = null;
			}
			super.setBackground(color);
		}

		/**
		 * Set whether this label has the input focus.
		 * @param hasFocus whether this label has the input focus
		 */
		public void setFocus(final boolean hasFocus) {
			focused = hasFocus;
		}

		/**
		 * Set whether this label is selected.
		 * @param selected whether this label is selected
		 */
		public void setSelected(final boolean selected) {
			this.selected = selected;
		}
	}
}

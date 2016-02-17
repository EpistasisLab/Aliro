package org.epistasis.gui;

import java.awt.Component;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JTabbedPane;

import org.epistasis.Pair;

/**
 * Tabbed pane which can show or remove tabs while keeping them in the same relative order.
 */
public class OrderedTabbedPane extends JTabbedPane {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** List of tabs and their names. */
	private final List<Pair<String, Component>> order = new ArrayList<Pair<String, Component>>();

	/**
	 * Add a tab to the pane. Tab will initially be visible.
	 * @param c tab to add
	 * @param name name of tab
	 */
	public void addOrderedTab(final Component c, final String name) {
		addOrderedTab(c, name, true);
	}

	/**
	 * Add a tab to the pane, optionally visible.
	 * @param c tab to add
	 * @param name name of tab
	 * @param visible whether tab should be initially visible
	 */
	public void addOrderedTab(final Component c, final String name, final boolean visible) {
		removeOrderedTab(c);
		order.add(new Pair<String, Component>(name, c));
		if (visible) {
			add(c, name);
		}
	}

	/**
	 * Get whether a specific tab is currently displayed in the list of tabs in the pane.
	 * @param c tab to query
	 * @return whether tab is currently displayed in the list
	 */
	public boolean isOrderedTabVisible(final Component c) {
		final Component[] comps = getComponents();
		for (final Component element : comps) {
			if (element == c) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Remove a tab from the pane completely.
	 * @param c tab to remove
	 */
	public void removeOrderedTab(final Component c) {
		for (final Pair<String, Component> p : order) {
			if (c == p.getSecond()) {
				remove(c);
				order.remove(p);
				break;
			}
		}
	}

	/**
	 * Set whether a given tab should be displayed or hidden.
	 * @param c tab to alter
	 * @param visible whether tab should be displayed
	 */
	public void setOrderedTabVisible(final Component c, final boolean visible) {
		if (isOrderedTabVisible(c) == visible) {
			return;
		}
		if (visible) {
			int index = 0;
			String name = "";
			for (final Pair<String, Component> p : order) {
				if (p.getSecond() == c) {
					name = p.getFirst();
					break;
				}
				if (isOrderedTabVisible(p.getSecond())) {
					++index;
				}
			}
			add(c, name, index);
		} else {
			remove(c);
		}
	}
}

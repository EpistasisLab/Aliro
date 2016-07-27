package org.epistasis.gui;

import javax.swing.table.DefaultTableModel;

/**
 * Table model that removes the ability to edit cells.
 */
public class ReadOnlyTableModel extends DefaultTableModel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Overriden function that simply disallows all cell editing.
	 * @param row ignored
	 * @param col ignored
	 * @return false
	 */
	@Override
	public boolean isCellEditable(final int row, final int col) {
		return false;
	}
}

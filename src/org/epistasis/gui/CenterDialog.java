package org.epistasis.gui;

import java.awt.Dimension;
import java.awt.Frame;
import java.awt.Insets;
import java.awt.Rectangle;

import javax.swing.JDialog;

/**
 * Base class for Dialogs that centers them over the parent frame and also adjusts the size to account for window decorations.
 */
public class CenterDialog extends JDialog {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Construct a <code>CenterDialog</code> for a parent frame.
	 * @param owner Parent frame
	 */
	public CenterDialog(final Frame owner) {
		super(owner);
	}

	/**
	 * Override of addNotify, because this is the best place to check the window decorations. The Dialog is also centered here.
	 */
	@Override
	public void addNotify() {
		// call superclass function
		super.addNotify();
		// get the size of the window decorations
		final Insets insets = getInsets();
		// adjust size to account for decorations
		final Dimension size = new Dimension(getWidth() + insets.left + insets.right, getHeight() + insets.top + insets.bottom);
		// get the size and location of the parent frame
		final Rectangle owner = getOwner().getBounds();
		// center the dialog over the parent frame
		this.setBounds((owner.width - size.width) / 2 + owner.x, (owner.height - size.height) / 2 + owner.y, size.width, size.height);
	}
}

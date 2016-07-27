package org.epistasis.gui;

import java.awt.Dimension;
import java.awt.GraphicsConfiguration;
import java.awt.HeadlessException;
import java.awt.Insets;
import java.awt.Rectangle;

import javax.swing.JFrame;

/**
 * Base class for Frames that centers them in the screen and adjusts their size to account for window decorations
 */
public class CenterFrame extends JFrame {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor.
	 * @throws HeadlessException
	 */
	public CenterFrame() throws HeadlessException {
		super();
	}

	/**
	 * Construct a CenterFrame for a given GraphicsConfiguration.
	 * @param gc GraphicsConfiguration for this frame
	 * @throws HeadlessException
	 */
	public CenterFrame(final GraphicsConfiguration gc) throws HeadlessException {
		super(gc);
	}

	/**
	 * Overridden because this is the best place to deal with the window decorations.
	 */
	@Override
	public void addNotify() {
		super.addNotify();
		// Resize the window to account for window decorations
		final Insets insets = getInsets();
		setSize(getWidth() + insets.left + insets.right, getHeight() + insets.top + insets.bottom);
	}

	/**
	 * Center the frame over a given rectangle on the screen
	 * @param bounds Rectangle over which to center the frame
	 */
	protected void center(final Rectangle bounds) {
		// get the frame's current size
		final Dimension frameSize = getSize();
		// calculate center position and set it on the frame
		if (frameSize.height > bounds.height) {
			frameSize.height = bounds.height;
		}
		if (frameSize.width > bounds.width) {
			frameSize.width = bounds.width;
		}
		setLocation(bounds.x + (bounds.width - frameSize.width) / 2, bounds.y + (bounds.height - frameSize.height) / 2);
	}
}

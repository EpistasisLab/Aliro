package org.epistasis.gui;

import java.awt.Color;
import java.awt.Font;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import javax.swing.border.Border;
import javax.swing.border.TitledBorder;

/**
 * Extension of JPanel which draws a titled border around its perimeter.
 */
public class TitledPanel extends JPanel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Border object used to draw the titled border for this panel. */
	private final TitledBorder tboTitle = new TitledBorder("");

	/**
	 * Construct a TitledPanel.
	 */
	public TitledPanel() {
		try {
			jbInit();
		} catch (final Exception ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * Get this panel's title.
	 * @return this panel's title
	 */
	public String getTitle() {
		return tboTitle.getTitle();
	}

	/**
	 * Get the border of the panel's TitledBorder.
	 * @return border of the panel's TitledBorder
	 * @see TitledBorder#getBorder()
	 */
	public Border getTitleBorder() {
		return tboTitle.getBorder();
	}

	/**
	 * Get the title color of the panel's TitledBorder.
	 * @return title color of the panel's TitledBorder
	 * @see TitledBorder#getTitleColor()
	 */
	public Color getTitleColor() {
		return tboTitle.getTitleColor();
	}

	/**
	 * Get the title font of the panel's TitledBorder.
	 * @return title font of the panel's TitledBorder
	 * @see TitledBorder#getTitleFont()
	 */
	public Font getTitleFont() {
		return tboTitle.getTitleFont();
	}

	/**
	 * Get the title justification of the panel's TitledBorder.
	 * @return title justification of the panel's TitledBorder
	 * @see TitledBorder#getTitleJustification()
	 */
	public int getTitleJustification() {
		return tboTitle.getTitleJustification();
	}

	/**
	 * Get the title position of the panel's TitledBorder.
	 * @return title position of the panel's TitledBorder
	 * @see TitledBorder#getTitlePosition()
	 */
	public int getTitlePosition() {
		return tboTitle.getTitlePosition();
	}

	/**
	 * JBuilder nastiness.
	 */
	private void jbInit() throws Exception {
		setBorder(tboTitle);
		tboTitle.setBorder(BorderFactory.createEtchedBorder());
	}

	/**
	 * Set this panel's title.
	 * @param title new title
	 */
	public void setTitle(final String title) {
		tboTitle.setTitle(title);
	}

	/**
	 * Set the border of the panel's TitledBorder.
	 * @param border border of the panel's TitledBorder
	 * @see TitledBorder#setBorder(Border)
	 */
	public void setTitleBorder(final Border border) {
		tboTitle.setBorder(border);
	}

	/**
	 * Set the title color of the panel's TitledBorder.
	 * @param color title color of the panel's TitledBorder
	 * @see TitledBorder#setTitleColor(Color)
	 */
	public void setTitleColor(final Color color) {
		tboTitle.setTitleColor(color);
	}

	/**
	 * Set the title font of the panel's TitledBorder.
	 * @param font title font of the panel's TitledBorder
	 * @see TitledBorder#setTitleFont(Font)
	 */
	public void setTitleFont(final Font font) {
		tboTitle.setTitleFont(font);
	}

	/**
	 * Set the title justification of the panel's TitledBorder.
	 * @param titleJustification title justifiction of the panel's TitledBorder
	 * @see TitledBorder#setTitleJustification(int)
	 */
	public void setTitleJustification(final int titleJustification) {
		tboTitle.setTitleJustification(titleJustification);
	}

	/**
	 * Set the title position of the panel's TitledBorder.
	 * @param titlePosition title position of the panel's TitledBorder
	 * @see TitledBorder#setTitlePosition(int)
	 */
	public void setTitlePosition(final int titlePosition) {
		tboTitle.setTitlePosition(titlePosition);
	}
}

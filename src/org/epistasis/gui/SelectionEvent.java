package org.epistasis.gui;

import java.awt.geom.Rectangle2D;
import java.util.EventObject;

/**
 * Event object fired when a SelectableComponent's selection rectangle chages.
 */
public class SelectionEvent extends EventObject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Source object's selection rectangle. */
	private final Rectangle2D selection;
	/** Source object's zoom viewport. */
	private final Rectangle2D viewport;

	/**
	 * Construct a SelectionEvent.
	 * @param source object which fired the event
	 * @param viewport object's zoom viewport when the event is fired
	 * @param selection object's selection rectangle when the event is fired
	 */
	public SelectionEvent(final SelectableComponent source, final Rectangle2D viewport, final Rectangle2D selection) {
		super(source);
		this.viewport = viewport;
		this.selection = selection;
	}

	/**
	 * Get the source object's selection rectangle at the time the event is fired.
	 * @return source object's selection rectangle
	 */
	public Rectangle2D getSelection() {
		return selection;
	}

	/**
	 * Get the source object's zoom viewport at the time the event is fired.
	 * @return source object's zoom viewport
	 */
	public Rectangle2D getViewport() {
		return viewport;
	}
}

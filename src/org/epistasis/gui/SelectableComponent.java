package org.epistasis.gui;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.geom.Area;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;

import javax.swing.JComponent;
import javax.swing.UIManager;

/**
 * Component base class which allows a region to be selected with the mouse.
 */
public class SelectableComponent extends JComponent implements MouseListener, MouseMotionListener, KeyListener {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Window coordinates where a mouse drag stopped. */
	private Point2D dragEnd = null;
	/** Window coordinates where a mouse drag started. */
	private Point2D dragStart = null;
	/** Currently selected rectangle. */
	private Rectangle2D selected = null;
	/** Color used to draw the selection rectangle. */
	private Color selectionColor = UIManager.getLookAndFeelDefaults().getColor("TextField.selectionBackground");
	/** Whether selection is enabled. */
	private boolean selectionEnabled = true;
	/** Selection mode. */
	private Selection selectionMode = Selection.XY;

	/**
	 * Construct a SelectableComponent.
	 */
	public SelectableComponent() {
		try {
			jbInit();
		} catch (final Exception ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * Add a listener for selection events.
	 * @param l listener to add
	 */
	public void addSelectionListener(final SelectionListener l) {
		listenerList.add(SelectionListener.class, l);
	}

	/**
	 * If a selection is currently in progress, cancel it.
	 */
	protected void cancelSelection() {
		if (selected == null) {
			return;
		}
		final Graphics2D g = (Graphics2D) getGraphics();
		g.setXORMode(getBackground());
		g.setColor(selectionColor);
		g.fill(selected);
		g.setColor(getForeground());
		g.setPaintMode();
		dragStart = dragEnd = null;
		selected = null;
	}

	/**
	 * Notify all interested listeners that the selection has changed.
	 * @param e event object representing selection change
	 */
	protected void fireSelectionEvent(final SelectionEvent e) {
		final Object[] listeners = listenerList.getListenerList();
		for (int i = listeners.length - 2; i >= 0; i -= 2) {
			if (listeners[i] == SelectionListener.class) {
				((SelectionListener) listeners[i + 1]).selectionChanged(e);
			}
		}
	}

	/**
	 * Convert the actual selection rectangle to a rectangle which conforms to the selection mode.
	 * @param rect rectangle to convert
	 * @param selectable total selectable rectangle
	 * @return reference to rect
	 */
	private Rectangle2D fixRectForSelectMode(final Rectangle2D rect, final Rectangle2D selectable) {
		switch (selectionMode) {
			case X:
				rect.setRect(rect.getMinX(), selectable.getMinY(), rect.getWidth(), selectable.getHeight());
				break;
			case Y:
				rect.setRect(selectable.getMinX(), rect.getMinY(), selectable.getWidth(), rect.getHeight());
				break;
			default:
				throw new RuntimeException("Unhandled value in case statement selectionMode: " + selectionMode);
		}
		return rect;
	}

	/**
	 * Get the selectable region in window coordinates. THis can be overridden to provide special behavior.
	 * @return selectable region
	 */
	public Rectangle2D getSelectable() {
		return getBounds();
	}

	/**
	 * Get color which is used to draw the selection rectangle.
	 * @return color which is used to draw the selection rectangle
	 */
	public Color getSelectionColor() {
		return selectionColor;
	}

	/**
	 * Get selection mode.
	 * @return selection mode
	 */
	public Selection getSelectionMode() {
		return selectionMode;
	}

	/**
	 * Get zoom viewport in window coordinates. Intended to be overridden.
	 * @return zoom viewport in window coordinates
	 */
	public Rectangle2D getViewport() {
		return getSelectable();
	}

	/**
	 * Get whether the selection feature is enabled.
	 * @return whether the selection feature is enabled
	 */
	public boolean isSelectionEnabled() {
		return selectionEnabled;
	}

	/**
	 * JBuilder nastiness.
	 */
	private void jbInit() throws Exception {
		setFocusable(true);
		addMouseListener(this);
		addMouseMotionListener(this);
		addKeyListener(this);
		setBackground(UIManager.getColor("window"));
	}

	/**
	 * Stub needed to implement KeyListener interface.
	 * @param e ignored
	 */
	public void keyPressed(final KeyEvent e) {
	}

	/**
	 * Stub needed to implement KeyListener interface.
	 * @param e ignored
	 */
	public void keyReleased(final KeyEvent e) {
	}

	/**
	 * Called when a key is typed while the component is focused. Used to cancel selection when the escape key is pressed.
	 * @param e information about the keypress event
	 */
	public void keyTyped(final KeyEvent e) {
		if (!selectionEnabled) {
			return;
		}
		if ((dragStart != null) && (e.getKeyChar() == KeyEvent.VK_ESCAPE)) {
			cancelSelection();
		}
	}

	/**
	 * Called when the mouse is clicked on the component. Used to implement drag selection.
	 * @param e information about the mouse event
	 */
	public void mouseClicked(final MouseEvent e) {
		if (!selectionEnabled) {
			return;
		}
		if ((dragStart != null) && (e.getButton() == MouseEvent.BUTTON3)) {
			dragEnd = e.getPoint();
			cancelSelection();
		}
	}

	/**
	 * Called when the mouse is dragged in the component. Used to implement drag selection.
	 * @param e information about the mouse event
	 */
	public void mouseDragged(final MouseEvent e) {
		if (!selectionEnabled) {
			return;
		}
		if (dragStart != null) {
			Rectangle2D before = null;
			final Rectangle2D after = new Rectangle();
			final Rectangle2D selectable = getSelectable();
			if (dragEnd != null) {
				before = new Rectangle();
				before.setFrameFromDiagonal(dragStart, dragEnd);
				Rectangle2D.intersect(before, selectable, before);
				fixRectForSelectMode(before, selectable);
			}
			dragEnd = e.getPoint();
			after.setFrameFromDiagonal(dragStart, dragEnd);
			Rectangle2D.intersect(after, selectable, after);
			fixRectForSelectMode(after, selectable);
			selectionChanged(before, after, false);
		}
	}

	/**
	 * Stub needed to implement MouseListener interface.
	 * @param e ignored
	 */
	public void mouseEntered(final MouseEvent e) {
	}

	/**
	 * Stub needed to implement MouseListener interface.
	 * @param e ignored
	 */
	public void mouseExited(final MouseEvent e) {
	}

	/**
	 * Stub needed to implement MouseListener interface.
	 * @param e ignored
	 */
	public void mouseMoved(final MouseEvent e) {
	}

	/**
	 * Called when a mouse button is pressed in the component. Used to implement drag selection.
	 * @param e information about the mouse event
	 */
	public void mousePressed(final MouseEvent e) {
		if (!selectionEnabled) {
			return;
		}
		if ((dragStart == null) && (e.getButton() == MouseEvent.BUTTON1)) {
			dragStart = e.getPoint();
			requestFocusInWindow(true);
		}
	}

	/**
	 * Called when a mouse button is released in the component. Used to implement drag selection.
	 * @param e information about the mouse event
	 */
	public void mouseReleased(final MouseEvent e) {
		if (!selectionEnabled) {
			return;
		}
		if ((dragStart != null) && (e.getButton() == MouseEvent.BUTTON1)) {
			Rectangle2D before = null;
			final Rectangle2D after = new Rectangle();
			Rectangle2D selectable = getSelectable();
			if (dragEnd != null) {
				before = new Rectangle();
				before.setFrameFromDiagonal(dragStart, dragEnd);
				Rectangle2D.intersect(before, selectable, before);
				fixRectForSelectMode(before, selectable);
			}
			dragEnd = e.getPoint();
			after.setFrameFromDiagonal(dragStart, dragEnd);
			Rectangle2D.intersect(after, selectable, after);
			fixRectForSelectMode(after, selectable);
			selectionChanged(before, after, true);
			dragStart = dragEnd = null;
			selectable = null;
		}
	}

	/**
	 * Invoked by Swing to draw components. Applications should not invoke paint directly, but should instead use the repaint method to
	 * schedule the component for redrawing.
	 * @param g the Graphics context in which to paint
	 */
	@Override
	public void paint(final Graphics g) {
		g.clearRect(getInsets().left, getInsets().top, getWidth() - getInsets().left - getInsets().right, getHeight() - getInsets().top
				- getInsets().bottom);
	}

	/**
	 * Unsubscribe an object from receiving notification of selection events.
	 * @param l object to unsubscribe
	 */
	public void removeSelectionListener(final SelectionListener l) {
		listenerList.remove(SelectionListener.class, l);
	}

	/**
	 * Draws the selection rectangle selection changes and fires an event if the selection is complete.
	 * @param before selection rectangle before event; may be null
	 * @param after selection rectangle after event; may be null
	 * @param done whether the selection is complete
	 */
	protected void selectionChanged(final Rectangle2D before, final Rectangle2D after, final boolean done) {
		final Graphics2D g = (Graphics2D) getGraphics();
		g.setXORMode(getBackground());
		g.setColor(selectionColor);
		if ((before != null) && (after != null) && (after.getWidth() > 0) && (after.getHeight() > 0) && done) {
			g.fill(before);
			fireSelectionEvent(new SelectionEvent(this, getViewport(), selected));
		} else if (before != null) {
			final Area areaFill = new Area(before);
			areaFill.exclusiveOr(new Area(after));
			g.fill(areaFill);
		} else {
			g.fill(after);
		}
		selected = after;
		g.setColor(getForeground());
		g.setPaintMode();
	}

	/**
	 * Set the color used to draw the selection rectangle.
	 * @param selectionColor color used to draw the selection rectangle
	 */
	public void setSelectionColor(final Color selectionColor) {
		this.selectionColor = selectionColor;
	}

	/**
	 * Set whether selection is enabled.
	 * @param enabled whether selection is enabled
	 */
	public void setSelectionEnabled(final boolean enabled) {
		selectionEnabled = enabled;
	}

	/**
	 * Set the selection mode.
	 * @param selectionMode selection mode
	 */
	public void setSelectionMode(final Selection selectionMode) {
		this.selectionMode = selectionMode;
	}

	/**
	 * Selection mode enumeration.
	 */
	public static enum Selection {
		/** Select a range on the X axis, with full selection on the Y axis. */
		X,
		/** Select ranges on both the X and Y axes. */
		XY,
		/** Select a range on the Y axis, with full selection on the X axis. */
		Y;
	}
}

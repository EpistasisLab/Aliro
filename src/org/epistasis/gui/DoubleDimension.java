package org.epistasis.gui;

import java.awt.geom.Dimension2D;

/**
 * Implementation of Dimension2D backed by double values instead of ints.
 */
public class DoubleDimension extends Dimension2D {
	/** Height represented by this dimension. */
	public double height;
	/** Width represented by this dimension. */
	public double width;

	/**
	 * Construct a DoubleDimension.
	 */
	public DoubleDimension() {
		width = height = 0.0;
	}

	/**
	 * Construct a DoubleDimension from a given Dimension2D.
	 * @param d Dimension2D to copy
	 */
	public DoubleDimension(final Dimension2D d) {
		setSize(d);
	}

	/**
	 * Construct a DoubleDimension from specified values
	 * @param width width of dimension
	 * @param height height of dimension
	 */
	public DoubleDimension(final double width, final double height) {
		setSize(width, height);
	}

	/**
	 * Get height represented by this dimension.
	 * @return height represented by this dimension
	 */
	@Override
	public double getHeight() {
		return height;
	}

	/**
	 * Get width represented by this dimension.
	 * @return width represented by this dimension
	 */
	@Override
	public double getWidth() {
		return width;
	}

	/**
	 * Set the parameters of this dimension.
	 * @param width width to be represented by this dimension
	 * @param height height to be represented by this dimension
	 */
	@Override
	public void setSize(final double width, final double height) {
		this.width = width;
		this.height = height;
	}
}

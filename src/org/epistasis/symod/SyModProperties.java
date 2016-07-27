/*
 * EvaProperties.java Created on February 17, 2006, 5:15 PM To change this template, choose Tools | Template Manager and open the template
 * in the editor.
 */
package org.epistasis.symod;

import java.beans.PropertyChangeListener;
import java.util.Properties;

import org.epistasis.WrappedProperties;

/**
 * @author pandrews
 */
public abstract class SyModProperties {
	private static WrappedProperties props;
	private static String propertyFilePath = "SyMod.properties";
	/*
	 * First try to load EVA.properties from same folder as the executable or jar. Second, get it as a resource file, presumably packed within
	 * the EVA
	 */
	static {
		try {
			SyModProperties.props = new WrappedProperties(SyModProperties.propertyFilePath);
		} catch (final Exception ex) {
			System.err.println("SyModProperties static initializer caught exception: " + ex);
			System.exit(1);
		}
	}

	public static void addListener(final PropertyChangeListener listener) {
		SyModProperties.props.addListener(listener);
	}

	public static void addListener(final String propertyName, final PropertyChangeListener listener) {
		SyModProperties.props.addListener(propertyName, listener);
	}

	public static boolean containsKey(final String propertyName) {
		return SyModProperties.props.containsKey(propertyName);
	}

	public static void fireInitialPropertyChangeValue(final String key) {
		SyModProperties.props.fireInitialPropertyChangeValue(key);
	}

	public static String get(final String propertyName) {
		return SyModProperties.props.get(propertyName);
	}

	public static boolean getBoolean(final String propertyName) {
		return SyModProperties.props.getBoolean(propertyName);
	}

	public static float getFloat(final String propertyName) {
		return SyModProperties.props.getFloat(propertyName);
	}

	public static int getInt(final String propertyName) {
		return SyModProperties.props.getInt(propertyName);
	}

	public static int[] getInts(final String propertyName) {
		return SyModProperties.props.getInts(propertyName);
	}

	public static Properties getProperties() {
		return SyModProperties.props.getProperties();
	}

	public static String[] getStrings(final String propertyName) {
		return SyModProperties.props.getStrings(propertyName);
	}

	public static void removeListener(final PropertyChangeListener listener) {
		SyModProperties.props.removeListener(listener);
	}

	public static void set(final String propertyName, final String newValue) {
		SyModProperties.props.set(propertyName, newValue);
	}

	public static void setBoolean(final String propertyName, final boolean newValue) {
		SyModProperties.props.setBoolean(propertyName, newValue);
	}

	public static void setFloat(final String propertyName, final float newValue) {
		SyModProperties.props.setFloat(propertyName, newValue);
	}

	public static void setInt(final String propertyName, final int newValue) {
		SyModProperties.props.setInt(propertyName, newValue);
	}

	public static void setInts(final String propertyName, final int[] integers) {
		SyModProperties.props.setInts(propertyName, integers);
	}

	public float[] getFloats(final String propertyName) {
		return SyModProperties.props.getFloats(propertyName);
	}
}

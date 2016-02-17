/*
 * WrappedProperties.java Created on January 8, 2007, 4:38 PM To change this template, choose Tools | Template Manager and open the template
 * in the editor.
 */
package org.epistasis;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.IOException;
import java.util.Properties;

/**
 * @author pandrews
 */
public class WrappedProperties {
	private final PropertyChangeSupport changeSupport;
	private final Properties props;

	/** Creates a new instance of WrappedProperties */
	public WrappedProperties(final String propertyFilePath) throws IOException {
		props = MiscUtilities.loadPropertiesFile(propertyFilePath);
		changeSupport = new PropertyChangeSupport(this);
	}

	public void addListener(final PropertyChangeListener listener) {
		changeSupport.addPropertyChangeListener(listener);
	}

	/*
	 * Add a listener but also send a propertyChange with the current value
	 */
	public void addListener(final String propertyName, final PropertyChangeListener listener) {
		changeSupport.addPropertyChangeListener(propertyName, listener);
	}

	public boolean containsKey(final String propertyName) {
		return props.containsKey(propertyName);
	}

	public void fireInitialPropertyChangeValue(final String key) {
		changeSupport.firePropertyChange(key, "", props.getProperty(key));
	}

	public String get(final String propertyName) {
		String propertyValue = props.getProperty(propertyName);
		if (propertyValue == null) {
			if (propertyName.startsWith("_")) {
				propertyValue = "";
			} else {
				throw new IllegalArgumentException("WrappedProperties was asked to retrieve non-existent key: " + propertyName);
			}
		}
		return propertyValue;
	}

	public boolean getBoolean(final String propertyName) {
		final boolean propertyValue = Boolean.parseBoolean(get(propertyName));
		return propertyValue;
	}

	public float getFloat(final String propertyName) {
		final float propertyValue = Float.parseFloat(get(propertyName));
		return propertyValue;
	}

	public float[] getFloats(final String propertyName) {
		final String[] propertyValues = getStrings(propertyName);
		final float[] propertyFloats = new float[propertyValues.length];
		for (int index = 0; index < propertyFloats.length; ++index) {
			propertyFloats[index] = Float.parseFloat(propertyValues[index]);
		}
		return propertyFloats;
	}

	public int getInt(final String propertyName) {
		final int propertyValue = Integer.parseInt(get(propertyName));
		return propertyValue;
	}

	public int[] getInts(final String propertyName) {
		final String[] propertyValues = getStrings(propertyName);
		final int[] propertyInts = new int[propertyValues.length];
		for (int index = 0; index < propertyInts.length; ++index) {
			propertyInts[index] = Integer.parseInt(propertyValues[index]);
		}
		return propertyInts;
	}

	public Properties getProperties() {
		return props;
	}

	public String[] getStrings(final String propertyName) {
		final String propertyValue = get(propertyName);
		final String[] propertyValues = propertyValue.split(":");
		return propertyValues;
	}

	public void removeListener(final PropertyChangeListener listener) {
		changeSupport.removePropertyChangeListener(listener);
	}

	public void set(final String key, final String propertyValue) {
		Object oldValue = props.setProperty(key, propertyValue);
		if (oldValue == null) {
			oldValue = "";
		}
		changeSupport.firePropertyChange(key, oldValue, propertyValue);
	}

	public void setBoolean(final String propertyName, final boolean newValue) {
		set(propertyName, Boolean.toString(newValue));
	}

	public void setFloat(final String propertyName, final float newValue) {
		set(propertyName, Float.toString(newValue));
	}

	public void setInt(final String propertyName, final int newValue) {
		set(propertyName, Integer.toString(newValue));
	}

	public void setInts(final String propertyName, final int[] integers) {
		String propertyValue;
		if ((integers != null) && (integers.length > 0)) {
			final StringBuilder sb = new StringBuilder();
			for (final int integer : integers) {
				sb.append(integer + ":");
			}
			propertyValue = sb.toString().substring(0, sb.length() - 1);
		} else {
			propertyValue = "";
		}
		set(propertyName, propertyValue);
	}
}

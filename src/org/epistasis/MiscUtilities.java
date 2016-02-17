package org.epistasis;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.logging.Level;

import javax.swing.SwingUtilities;

import org.epistasis.symod.GPMain;

public abstract class MiscUtilities {
	public static void executeRunnableInSwing(final Runnable runnable) {
		if (SwingUtilities.isEventDispatchThread()) {
			runnable.run();
		} else {
			try {
				SwingUtilities.invokeAndWait(new Runnable() {
					public void run() {
						runnable.run();
					}
				});
			} catch (final InterruptedException ex) {
				GPMain.devLog.log(Level.WARNING, "executeRunnableInSwing caught InterruptedException", ex);
			} catch (final InvocationTargetException ex) {
				GPMain.devLog.log(Level.WARNING, "executeRunnableInSwing caught InvocationTargetException", ex);
			}
		} // end else not already in swing event dispatch thread
	} // end executeRunnableInSwing

	/**
	 * Returns the stack traces of all current Threads
	 */
	public static String getAllStackTraces() {
		try {
			final Map<Thread, StackTraceElement[]> map = Thread.getAllStackTraces();
			final List<Map.Entry<Thread, StackTraceElement[]>> sorted = new ArrayList<Map.Entry<Thread, StackTraceElement[]>>(map.entrySet());
			Collections.sort(sorted, new Comparator<Map.Entry<Thread, StackTraceElement[]>>() {
				public int compare(final Map.Entry<Thread, StackTraceElement[]> a, final Map.Entry<Thread, StackTraceElement[]> b) {
					return a.getKey().getName().compareTo(b.getKey().getName());
				}
			});
			final StringBuffer buffer = new StringBuffer();
			for (final Map.Entry<Thread, StackTraceElement[]> entry : sorted) {
				final Thread key = entry.getKey();
				final StackTraceElement[] value = entry.getValue();
				buffer.append(key.getName()).append("\n");
				for (final StackTraceElement element : value) {
					buffer.append("    ").append(element).append("\n");
				}
				buffer.append("\n");
			}
			// Remove the last '\n'
			if (buffer.length() > 0) {
				buffer.setLength(buffer.length() - 1);
			}
			return buffer.toString();
		} catch (final Exception err) {
			final StringWriter sw = new StringWriter();
			final PrintWriter pw = new PrintWriter(sw);
			pw.println("An error occured during getting the StackTraces of all active Threads");
			err.printStackTrace(pw);
			pw.flush();
			return sw.toString();
		}
	} // end getAllStackTraces

	private static String getLocalDirName(final Class<MiscUtilities> classOfInterest) {
		String localDirName;
		// Use that name to get a URL to the directory we are executing in
		final java.net.URL myURL = classOfInterest.getResource(classOfInterest.getSimpleName() + ".class"); // Open a URL to the our .class file
		// Clean up the URL and make a String with absolute pathname
		localDirName = myURL.getPath(); // Strip path to URL object out
		final int jarMarkerIndex = localDirName.lastIndexOf(".jar!/");
		if (jarMarkerIndex != -1) {
			localDirName = localDirName.substring(0, jarMarkerIndex); // clean off
			// everything
			// from '.jar!/'
			// on
		} else {
			// kludge to get correct directory in development
			final int buildDirIndex = localDirName.lastIndexOf("/build/");
			if (buildDirIndex != -1) {
				localDirName = localDirName.substring(0, buildDirIndex + "/build/".length());
			}
		}
		if (localDirName.startsWith("file:")) {
			localDirName = localDirName.substring(5); // knock off 'file:'
		}
		localDirName = localDirName.replaceAll("%20", " "); // change %20 chars to
		// spaces
		localDirName = localDirName.substring(0, localDirName.lastIndexOf("/")); // clean
		// off
		// the
		// filename
		return localDirName;
	}

	public static <T> T getResultFromSwing(final Callable<T> callable) throws Exception {
		T resultObject = null;
		if (SwingUtilities.isEventDispatchThread()) {
			resultObject = callable.call();
		} else {
			final FutureTask<T> future = new FutureTask<T>(callable);
			SwingUtilities.invokeLater(future);
			resultObject = future.get();
		}
		return resultObject;
	}

	public static Properties loadPropertiesFile(final String propertyFilePath) throws IOException {
		final Properties props = new Properties();
		final String localDirName = MiscUtilities.getLocalDirName(MiscUtilities.class);
		final String fullPathToFile = localDirName + '/' + propertyFilePath;
		InputStream propFileStream = null;
		try {
			propFileStream = new FileInputStream(fullPathToFile);
			GPMain.devLog.log(Level.FINE, "read properties file from: " + fullPathToFile);
		} catch (final FileNotFoundException ex) {
			GPMain.devLog.log(Level.FINE, "loose mdr.properties file not found: " + ex);
			propFileStream = MiscUtilities.class.getClassLoader().getResourceAsStream(propertyFilePath);
			GPMain.devLog.log(Level.FINE, "read properties file as a resource: " + propertyFilePath);
		}
		props.load(propFileStream);
		GPMain.devLog.log(Level.FINE, propertyFilePath + " " + MiscUtilities.propertiesToString(props));
		return props;
	} // end loadPropertiesFile

	public static String propertiesToString(final Properties properties) {
		final StringWriter sw = new StringWriter();
		final PrintWriter pw = new PrintWriter(sw);
		properties.list(pw);
		return sw.toString();
	}

	/**
	 * * found in jscience.org experimental package org.jscience.util Antelmann.com Java Framework by Holger Antelmann Copyright (c) 2005
	 * Holger Antelmann <info@antelmann.com> For details, see also http://www.antelmann.com/developer/
	 * --------------------------------------------------------- takes milliseconds and converts them into a short String. The format is
	 * 
	 * <pre>
	 * h:mm:ss
	 * </pre>
	 * 
	 * .
	 */
	public static String timeAsStringShort(final long milliSecs) {
		final int hours = Math.abs((int) milliSecs / 3600000);
		final int minutes = Math.abs((int) (milliSecs % 3600000) / 60000);
		final int seconds = Math.abs((int) (milliSecs % 60000) / 1000);
		String s = hours + ":";
		s += ((minutes < 10) ? ("0" + minutes) : String.valueOf(minutes));
		s += ":";
		s += ((seconds < 10) ? ("0" + seconds) : String.valueOf(seconds));
		s = s.substring(0, s.length() - 1).replaceAll("^[^1-9]+", "") + s.substring(s.length() - 1); // remove all leading zeros and colons
		if (milliSecs < 0) {
			s = "-" + s;
		}
		return s;
	}

	static final public String truncate(final String target, final int maxSize) {
		return (target.length() > maxSize ? target.substring(0, maxSize) : target);
	}

	public static Runnable wrapRunnableForSwing(final Runnable runnable) {
		final Runnable swingWrappedRunnable = new Runnable() {
			public void run() {
				MiscUtilities.executeRunnableInSwing(runnable);
			}
		};
		return swingWrappedRunnable;
	} // end wrapRunnableForSwing
} // end miscUtilities abstract class

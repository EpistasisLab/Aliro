package org.epistasis.gui;

import java.lang.reflect.InvocationTargetException;

import javax.swing.SwingUtilities;

/**
 * Runnable that invokes another runnable on the swing event queue thread. Uses <code>SwingUtilities.invokeLater()</code> or
 * <code>SwingUtilities.invokeAndWait()</code>, depending on which mode of operation is desired.
 * @see javax.swing.SwingUtilities#invokeAndWait
 * @see javax.swing.SwingUtilities#invokeLater
 */
public class SwingInvoker implements Runnable {
	/** The runnable that will be invoked by the <code>run()</code> method. */
	private final Runnable target;
	/**
	 * Indicates whether the target will be invoked synchronously (true), or asynchronously (false).
	 */
	private final boolean wait;

	/**
	 * Construct a <code>SwingInvoker</code> that invokes the target asynchronously.
	 * @param target Runnable to be invoked
	 */
	public SwingInvoker(final Runnable target) {
		this(target, false);
	}

	/**
	 * Construct a <code>SwingInvoker</code> that invokes the target either synchronously or asynchronously, depending on the value of the
	 * <code>wait</code> parameter.
	 * @param target Runnable to be invoked
	 * @param wait True for synchronous, false for asynchronous
	 */
	public SwingInvoker(final Runnable target, final boolean wait) {
		this.target = target;
		this.wait = wait;
	}

	/**
	 * Invoke the target runnable.
	 */
	public void run() {
		if (wait) {
			try {
				// call the synchronous swing invocation
				SwingUtilities.invokeAndWait(target);
			} catch (final InterruptedException ex) {
				// if the current thread was interrupted while waiting for
				// the target, the InterruptedException eats the interrupted
				// status for the thread, so interrupt it again
				Thread.currentThread().interrupt();
			} catch (final InvocationTargetException ex) {
				// run isn't allowed to throw exceptions, so just print the
				// stack trace
				ex.printStackTrace();
			}
		} else {
			// call the asynchronous swing invocation
			SwingUtilities.invokeLater(target);
		}
	}
}

package org.epistasis;

import java.util.AbstractList;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Manage a group of threads. The threads in the pool will be started at the same time and interrupted at the same time, and the pool itself
 * will wait until all threads terminate before terminating itself.
 */
public class ThreadPool extends AbstractList<Thread> implements Runnable {
	/** Indicates whether the pool is running */
	private boolean running = false;
	/** The list of threads in the pool */
	private final List<Thread> threads = Collections.synchronizedList(new ArrayList<Thread>());

	/**
	 * Add code to the pool with the default priority. This should not be called while the pool is running.
	 * @param r Code to run on a thread in the pool
	 */
	public void add(final Runnable r) {
		add(r, Thread.NORM_PRIORITY);
	}

	/**
	 * Add code to the pool. This should not be called while the pool is running.
	 * @param r Code to run on a thread in the pool
	 * @param priority Priority for thread
	 */
	public void add(final Runnable r, final int priority) {
		// check to make sure we're not running yet
		if (running) {
			throw new IllegalStateException("ThreadPool is running.");
		}
		// creat the thread
		final Thread t = new Thread(r);
		t.setPriority(priority);
		// add the thread to the pool
		threads.add(t);
	}

	/**
	 * Clear the threads from the pool. This should not be called while the pool is running.
	 */
	@Override
	public void clear() {
		// check to make sure we're not running yet
		if (running) {
			throw new IllegalStateException("ThreadPool is running.");
		}
		// clear the pool
		threads.clear();
	}

	/**
	 * Get a specific thread in the pool.
	 * @param index index of thread to get
	 * @return thread in pool at index
	 */
	@Override
	public Thread get(final int index) {
		return threads.get(index);
	}

	/**
	 * Interrupt all threads in the pool. This may not stop the threads if they mask interrupts.
	 */
	public void interrupt() {
		// if we're not running, there's nothing to interrupt
		if (!running) {
			return;
		}
		// iterate over threads, calling interrupt() on each
		for (final Thread t : threads) {
			t.interrupt();
		}
		// we're no longer running
		running = false;
	}

	/**
	 * Remove a specific thread from the pool.
	 * @param index index of thread to remove
	 * @return removed thread
	 */
	@Override
	public Thread remove(final int index) {
		return threads.remove(index);
	}

	/**
	 * Start the thread pool.
	 */
	public void run() {
		// we'll now start the pool
		running = true;
		// iterate over threads, starting each one
		for (final Thread t : threads) {
			t.start();
		}
		try {
			// iterate over threads, waiting for each one to finish
			for (final Thread t : threads) {
				t.join();
			}
		} catch (final InterruptedException ex) {
			// if the current thread is interrupted while waiting for the
			// child threads to end, interrupt all the child threads
			interrupt();
			// propagate the interrupt
			Thread.currentThread().interrupt();
		}
		// we're done now
		running = false;
	}

	/**
	 * Get the number of threads in the pool.
	 * @return number of threads in the pool
	 */
	@Override
	public int size() {
		return threads.size();
	}
}

package org.epistasis;
/**
 * Framework for setting up a multithreaded producer/consumer pattern.
 * @param <T> type of objects which are produced and consumed
 */
public class ProducerConsumerThread<T> extends Thread {
	/** Producer thread for the pattern. */
	private Producer<T> producer = null;
	/** Queue to hold that which is produced and consumed. */
	private final ArrayBlockingQueue<T> queue = new ArrayBlockingQueue<T>(100);
	/** Pool to hold the producer and consumer threads. */
	private final ThreadPool threads = new ThreadPool();

	/**
	 * Add a consumer to the thread.
	 * @param consumer consumer to add
	 */
	public void addConsumer(final Consumer<T> consumer) {
		consumer.setQueue(queue);
		threads.add(consumer);
	}

	/**
	 * Remove all current consumers from the list. This should not be called while the thread is running.
	 */
	public void clearConsumers() {
		threads.clear();
		if (producer != null) {
			threads.add(producer);
		}
	}

	/**
	 * Stop the whole thread and all subthreads, at the earliest opportunity.
	 */
	@Override
	public void interrupt() {
		threads.interrupt();
		super.interrupt();
	}

	/**
	 * Start the thread and all subthreads. There must be at least one producer and one consumer.
	 */
	@Override
	public void run() {
		if (producer == null) {
			throw new IllegalStateException("No Producer");
		}
		if (threads.size() < 2) {
			throw new IllegalStateException("No Consumers");
		}
		threads.run();
	}

	/**
	 * Set the producer for the thread.
	 * @param producer producer to set for the thread
	 * @return old producer for thread, or null if none
	 */
	public Producer<T> setProducer(final Producer<T> producer) {
		final Producer<T> ret = this.producer;
		if (this.producer != null) {
			threads.remove(this.producer);
			this.producer.setQueue(null);
		}
		this.producer = producer;
		if (producer != null) {
			producer.setQueue(queue);
			threads.add(producer);
		}
		return ret;
	}

	/**
	 * Base class for consumer half of pattern.
	 * @param <T> type of objects which are consumed
	 */
	public abstract static class Consumer<T> implements Runnable {
		/** Reference to common queue. */
		private ArrayBlockingQueue<T> queue;

		/**
		 * Consume an object. Implement this to control how an object is consumed.
		 * @param obj object to consume
		 */
		public abstract void consume(T obj);

		/**
		 * Main loop for consumer thread.
		 */
		public void run() {
			// continue consuming until null is consumed, or thread is
			// interrupted
			try {
				while (!Thread.currentThread().isInterrupted()) {
					final T obj = queue.take();
					// if null is consumed, put null back on queue for other
					// consumers and exit loop
					if (obj == null) {
						queue.put(null);
						return;
					}
					consume(obj);
				}
			} catch (final InterruptedException ex) {
				Thread.currentThread().interrupt();
			}
		}

		/**
		 * Associate this consumer with a queue.
		 * @param queue the queue with which to associate
		 */
		public void setQueue(final ArrayBlockingQueue<T> queue) {
			this.queue = queue;
		}
	}

	/**
	 * Base class for the producer half of the pattern.
	 * @param <T> type of objects which are produced
	 */
	public abstract static class Producer<T> implements Runnable {
		/** Reference to common queue */
		private ArrayBlockingQueue<T> queue;

		/**
		 * Produce an object. Implement this method to control what gets produced.
		 * @return produced object, or null to signal end of production
		 */
		public abstract T produce();

		/**
		 * Main loop for producer thread.
		 */
		public void run() {
			T obj = null;
			try {
				// continue producing until null is produced, or the thread is
				// interrupted, and put the products on the queue
				while (((obj = produce()) != null) && !Thread.currentThread().isInterrupted()) {
					queue.put(obj);
				}
				// signal end of production by putting null on the queue
				queue.put(null);
			} catch (final InterruptedException ex) {
				Thread.currentThread().interrupt();
			}
		}

		/**
		 * Associate this producer with a queue.
		 * @param queue the queue with which to associate
		 */
		public void setQueue(final ArrayBlockingQueue<T> queue) {
			this.queue = queue;
		}
	}
}

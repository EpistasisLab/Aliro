package org.epistasis.gui;

import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.SwingUtilities;

/**
 * Component which graphically displays progress. It also displays elapsed time and linearly extrapolates expected time to completion.
 */
public class ProgressPanel extends TitledPanel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private final GridBagLayout gblLayout = new GridBagLayout();
	private final GridLayout grdLayout = new GridLayout();
	private final JLabel lblElapsed = new JLabel();
	private final JLabel lblElapsedLabel = new JLabel();
	private final JLabel lblRemaining = new JLabel();
	private final JLabel lblRemainingLabel = new JLabel();
	private final JLabel lblTotal = new JLabel();
	private final JLabel lblTotalLabel = new JLabel();
	private final JPanel pnlElapsed = new JPanel();
	private final JPanel pnlMain = new JPanel();
	private final JPanel pnlRemaining = new JPanel();
	private final JPanel pnlTime = new JPanel();
	private final JPanel pnlTotal = new JPanel();
	private final JProgressBar prgProgress = new JProgressBar();
	/** Time value when the timer was started. */
	private long startTime = -1;
	/** Timer update thread. */
	private Thread update;
	/** Progress value. */
	private double value = 0;

	/**
	 * Convert an integer number of milliseconds to a String value suitable for display.
	 * @param millis number of milliseconds
	 * @return value suitable for display
	 */
	private static String millisToString(final long millis) {
		final StringBuffer b = new StringBuffer();
		long time = Math.round(millis / 1000.0);
		final int seconds = (int) (time % 60);
		time /= 60;
		final int minutes = (int) (time % 60);
		time /= 60;
		final long hours = time;
		b.append(hours);
		b.append(':');
		if (minutes < 10) {
			b.append('0');
		}
		b.append(minutes);
		b.append(':');
		if (seconds < 10) {
			b.append('0');
		}
		b.append(seconds);
		return b.toString();
	}

	/**
	 * Construct a ProgressPanel.
	 */
	public ProgressPanel() {
		try {
			jbInit();
		} catch (final Exception ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * If the timer thread is still running when this object is garbage collected, stop it.
	 */
	@Override
	protected void finalize() throws Throwable {
		if ((update != null) && update.isAlive()) {
			update.interrupt();
		}
		super.finalize();
	}

	/**
	 * Get progress value.
	 * @return progress value
	 */
	public double getValue() {
		return value;
	}

	/**
	 * JBuilder nastiness.
	 */
	private void jbInit() throws Exception {
		setTitle("Progress");
		setLayout(gblLayout);
		prgProgress.setValue(0);
		lblElapsedLabel.setText("Elapsed:");
		lblRemainingLabel.setText("Remaining:");
		lblTotalLabel.setText("Total:");
		pnlMain.setLayout(gblLayout);
		pnlTime.setLayout(grdLayout);
		pnlTime.add(pnlElapsed);
		pnlElapsed.setLayout(gblLayout);
		pnlTime.add(pnlRemaining);
		pnlRemaining.setLayout(gblLayout);
		pnlTime.add(pnlTotal);
		pnlTotal.setLayout(gblLayout);
		this.add(pnlMain, new GridBagConstraints(0, 0, 1, 1, 1.0, 1.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 0,
				0), 0, 0));
		pnlMain.add(prgProgress, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.NONE, new Insets(0,
				0, 0, 0), 0, 0));
		pnlMain.add(pnlTime, new GridBagConstraints(0, 1, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(5, 5,
				5, 5), 0, 0));
		pnlMain.add(prgProgress, new GridBagConstraints(0, 0, 1, 1, 1.0, 1.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(5,
				5, 0, 5), 0, 0));
		pnlElapsed.add(lblElapsedLabel, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.WEST, GridBagConstraints.NONE,
				new Insets(0, 0, 0, 0), 0, 0));
		pnlRemaining.add(lblRemainingLabel, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.NONE,
				new Insets(0, 0, 0, 0), 0, 0));
		pnlTotal.add(lblTotalLabel, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.NONE,
				new Insets(0, 0, 0, 0), 0, 0));
		pnlElapsed.add(lblElapsed, new GridBagConstraints(1, 0, 1, 1, 1.0, 0.0, GridBagConstraints.WEST, GridBagConstraints.NONE, new Insets(0,
				5, 0, 0), 0, 0));
		pnlRemaining.add(lblRemaining, new GridBagConstraints(1, 0, 1, 1, 1.0, 0.0, GridBagConstraints.WEST, GridBagConstraints.NONE,
				new Insets(0, 5, 0, 0), 0, 0));
		pnlTotal.add(lblTotal, new GridBagConstraints(1, 0, 1, 1, 1.0, 0.0, GridBagConstraints.WEST, GridBagConstraints.NONE, new Insets(0, 5,
				0, 0), 0, 0));
		prgProgress.setStringPainted(true);
	}

	/**
	 * Stop the progress meter and reset it.
	 */
	public void reset() {
		stop();
		setValue(0);
		lblElapsed.setText("");
	}

	/**
	 * Set the font to be used for all child components.
	 * @param font font to be used for all child components
	 */
	@Override
	public void setFont(final Font font) {
		super.setFont(font);
		if (lblElapsedLabel == null) {
			return;
		}
		lblElapsedLabel.setFont(font);
		lblElapsed.setFont(font);
		lblRemainingLabel.setFont(font);
		lblRemaining.setFont(font);
		lblTotalLabel.setFont(font);
		lblTotal.setFont(font);
	}

	/**
	 * Set the progress value.
	 * @param value progress value in [0,1].
	 */
	public void setValue(final double value) {
		this.value = value;
		prgProgress.setValue((int) Math.round(value * 100.0));
	}

	/**
	 * Start the progress meter.
	 */
	public void start() {
		if ((update != null) && update.isAlive()) {
			update.interrupt();
			try {
				update.join();
			} catch (final InterruptedException ex) {
				return;
			}
		}
		update = new Thread(new UpdateLoop(), "ProgressTimer");
		startTime = System.currentTimeMillis();
		update.start();
	}

	/**
	 * Stop the progress meter.
	 */
	public void stop() {
		if ((update != null) && update.isAlive()) {
			update.interrupt();
			lblElapsed.setText(ProgressPanel.millisToString(System.currentTimeMillis() - startTime));
		}
		lblRemaining.setText("");
		lblTotal.setText("");
		startTime = -1;
	}

	/**
	 * Timer update loop to be run in a seperate thread.
	 */
	private class UpdateLoop implements Runnable {
		private long lastMillis;

		/**
		 * Run the loop.
		 */
		public void run() {
			lastMillis = System.currentTimeMillis();
			while (!Thread.interrupted()) {
				try {
					final long elapsed = System.currentTimeMillis() - startTime;
					final String strElapsed = ProgressPanel.millisToString(elapsed);
					String strRemaining;
					String strTotal;
					if ((value == 0) || (elapsed == 0)) {
						strRemaining = strTotal = "";
					} else {
						final long total = Math.round(elapsed / value);
						final long remaining = total - elapsed;
						strTotal = ProgressPanel.millisToString(total);
						strRemaining = ProgressPanel.millisToString(remaining);
					}
					SwingUtilities.invokeAndWait(new UpdateTimerText(strElapsed, strRemaining, strTotal));
					final long currentMillis = System.currentTimeMillis();
					final long sleep = 1000 - (currentMillis - lastMillis);
					lastMillis = currentMillis;
					Thread.sleep(Math.max(sleep, 0));
				} catch (final InterruptedException ex) {
					break;
				} catch (final Exception ex) {
					ex.printStackTrace();
				}
			}
		}
	}

	/**
	 * Task to update the timer text on the panel. This is a Runnable so that it can be used with {@link SwingInvoker}.
	 */
	private class UpdateTimerText implements Runnable {
		/** Text for the elapsed time field. */
		private final String elapsed;
		/** Text for the remaining time field. */
		private final String remaining;
		/** Text for the total time field. */
		private final String total;

		/**
		 * Construct an UpdateTimerText
		 * @param elapsed text for the elapsed time field
		 * @param remaining text for the remaining time field
		 * @param total text for the total time field
		 */
		public UpdateTimerText(final String elapsed, final String remaining, final String total) {
			this.elapsed = elapsed;
			this.remaining = remaining;
			this.total = total;
		}

		/**
		 * Update the timer fields.
		 */
		public void run() {
			lblElapsed.setText(elapsed);
			lblRemaining.setText(remaining);
			lblTotal.setText(total);
		}
	}
}

package org.epistasis;

import java.awt.Component;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.List;

import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileFilter;

/**
 * Utility class to manage the saving of files.
 */
public final class FileSaver {
	/** Filter to accept all files. */
	public static final FileFilter allFilter = new AcceptAllFilter();
	/** Filter to accept .eps files. */
	public static final ExtensionFilter epsFilter = new ExtensionFilter("eps", "Encapsulated Postscript Images (*.eps)");
	/** Filter to accept .jpg files. */
	public static final ExtensionFilter jpgFilter = new ExtensionFilter("jpg", "JPEG Images (*.jpg)");
	/** Filter to accept .png files. */
	public static final ExtensionFilter pngFilter = new ExtensionFilter("png", "PNG Images (*.png)");
	/** Filter to accept .txt files. */
	public static final ExtensionFilter txtFilter = new ExtensionFilter("txt", "Text Files (*.txt)");
	/** Folder from which to open save dialogs. */
	private static File fSaveFolder = new File("");

	/**
	 * Open a file chooser dialog to ask the user for a filename to use to save a file. If the file exists, the user is prompted to confirm
	 * overwriting.
	 * @param parent The parent window for the dialog
	 * @param title The title for the dialog
	 * @return a Pair composed of the selected file and the filter under which the user selected the file, or null if the user cancelled
	 */
	public static Pair<File, FileFilter> getSaveFile(final Component parent, final String title, final List<FileFilter> filters) {
		final JFileChooser fc = new JFileChooser();
		File f = null;
		boolean overwrite = false;
		// configure the file chooser
		fc.setDialogTitle(title);
		fc.setMultiSelectionEnabled(false);
		fc.setCurrentDirectory(FileSaver.fSaveFolder);
		if ((filters != null) && !filters.isEmpty()) {
			for (final FileFilter ff : filters) {
				fc.addChoosableFileFilter(ff);
			}
			fc.removeChoosableFileFilter(fc.getAcceptAllFileFilter());
		}
		// keep asking until we get a satisfactory answer, which could be
		// one of: cancel, write a new file, or a confirmed overwrite
		while ((f == null) || (f.exists() && !overwrite)) {
			// ask for which file to write, and if the user cancels,
			// we're done
			if (fc.showSaveDialog(parent) != JFileChooser.APPROVE_OPTION) {
				return null;
			}
			// get the user's selection
			f = fc.getSelectedFile();
			// get the selected file filter
			final FileFilter filter = fc.getFileFilter();
			// adjust file extension if necessary
			if ((filter != null) && (filter instanceof ExtensionFilter)) {
				final ExtensionFilter extFilter = (ExtensionFilter) filter;
				final String name = f.getAbsolutePath();
				final int pos = name.lastIndexOf('.');
				if (pos < 0) {
					f = new File(name + '.' + extFilter.getExtension());
				}
			}
			// if the file the user chose exists, ask if the file should
			// be overwritten
			if (f.exists()) {
				switch (JOptionPane.showConfirmDialog(parent, "File '" + f.toString() + "' exists.  Overwrite?", title,
						JOptionPane.YES_NO_CANCEL_OPTION)) {
					// user chose yes, so write the file
					case JOptionPane.YES_OPTION:
						overwrite = true;
						break;
					// user chose no, so ask again what file to write
					case JOptionPane.NO_OPTION:
						overwrite = false;
						break;
					// user chose cancel, so we're done
					case JOptionPane.CANCEL_OPTION:
						return null;
				}
			}
		}
		// keep track of where to save these files
		FileSaver.fSaveFolder = f.getParentFile();
		return new Pair<File, FileFilter>(f, fc.getFileFilter());
	}

	/**
	 * Get the save folder. This is the folder whence save dialogs are opened. Saving a file using the functions in this class sets the save
	 * folder to that file's location.
	 * @return save folder
	 */
	public static File getSaveFolder() {
		return FileSaver.fSaveFolder;
	}

	/**
	 * Open a PrintWriter to a file. This function opens a file chooser dialog to ask the user the filename to use.
	 * @param parent The parent window for the dialog
	 * @param title The title for the dialog
	 * @return PrintWriter to a file, or null if user cancelled
	 */
	public static PrintWriter openFileWriter(final Component parent, final String title) {
		final List<FileFilter> noFilters = Collections.emptyList();
		return FileSaver.openFileWriter(parent, title, noFilters);
	}

	/**
	 * Open a PrintWriter to a file. This function opens a file chooser dialog to ask the user the filename to use. This overload allows a
	 * list of file filters to be passed in.
	 * @param parent The parent window for the dialog
	 * @param title The title for the dialog
	 * @param filters FileFilters to add to the dialog
	 * @return PrintWriter to a file, or null if user cancelled
	 */
	public static PrintWriter openFileWriter(final Component parent, final String title, final List<FileFilter> filters) {
		final Pair<File, FileFilter> ff = FileSaver.getSaveFile(parent, title, filters);
		if (ff == null) {
			return null;
		}
		// open the file, and display any errors
		try {
			return new PrintWriter(new FileWriter(ff.getFirst()));
		} catch (final IOException e) {
			JOptionPane.showMessageDialog(parent, e.getMessage(), "I/O Error", JOptionPane.ERROR_MESSAGE);
		}
		return null;
	}

	/**
	 * Set the save folder.
	 * @param fSaveFolder save folder
	 * @see #getSaveFolder()
	 */
	public static void setSaveFolder(final File fSaveFolder) {
		FileSaver.fSaveFolder = fSaveFolder;
	}

	/**
	 * This class is not to be instantiated.
	 */
	private FileSaver() {
	}

	/**
	 * Simple FileFilter that accepts all files and directories.
	 */
	private static class AcceptAllFilter extends FileFilter {
		/** Description of this filter. */
		private static String description = "All Files";

		/**
		 * Test a file to see if the filter accepts it.
		 * @param f file to test for acceptance
		 * @return true if the file is accepted, false otherwise
		 */
		@Override
		public boolean accept(final File f) {
			return true;
		}

		/**
		 * Get a description of this filter. This is used in the save dialog.
		 * @return description of this filter
		 */
		@Override
		public String getDescription() {
			return AcceptAllFilter.description;
		}
	}

	/**
	 * FileFilter that accepts all files with a given extension. Directories are accepted regardless of extension.
	 */
	public static class ExtensionFilter extends FileFilter {
		/** Description of this filter. */
		private final String description;
		/** Extension for this filter. */
		private final String extension;

		/**
		 * Construct an ExtensionFilter.
		 * @param extension extension for this filter
		 * @param description description of this filter
		 */
		public ExtensionFilter(final String extension, final String description) {
			this.extension = extension;
			this.description = description;
		}

		/**
		 * Test a file to see if the filter accepts it.
		 * @param pathname file to test for acceptance
		 * @return true if the file is accepted, false otherwise
		 */
		@Override
		public boolean accept(final File pathname) {
			return pathname.isDirectory() || pathname.getName().endsWith('.' + extension);
		}

		/**
		 * Get a description of this filter. This is used in the save dialog.
		 * @return description of this filter
		 */
		@Override
		public String getDescription() {
			return description;
		}

		/**
		 * Get the extension for this filter.
		 * @return extension for this filter
		 */
		public String getExtension() {
			return extension;
		}
	}
}

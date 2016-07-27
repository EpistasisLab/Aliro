package org.epistasis.symod;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

import javax.swing.event.EventListenerList;

import org.epistasis.symod.tree.FunctionNode;

/**
 * Object to hold configuration options for an analysis. Other objects may subscribe to property change events this object generates when
 * configuration options are changed.
 */
public class Configuration implements Cloneable {
	/** Default value for {@link #constmax}. */
	public static final double dftConstMax = 2;
	/** Default value for {@link #constmin}. */
	public static final double dftConstMin = -2;
	/** Default value for {@link #constprob}. */
	public static final double dftConstProb = 0.1;
	/** Default value for {@link #conststep}. */
	public static final double dftConstStep = 1;
	/** Default value for {@link #constsummary}. */
	public static final boolean dftConstSummary = false;
	/** Default value for {@link #datamode}. */
	public static final DataMode dftDatamode = DataMode.NONE;
	/** Default value for {@link #ekfitness}. */
	public static final boolean dftEKFitness = false;
	/** Default value for {@link #ekfitnessalpha}. */
	public static final double dftEKFitnessAlpha = 1.0;
	/** Default value for {@link #ekfitnessbeta}. */
	public static final double dftEKFitnessBeta = 1.0;
	/** Default value for {@link #ekfitnesszxform}. */
	public static final boolean dftEKFitnessZTransform = true;
	/** Default value for {@link #ekinitialization}. */
	public static final boolean dftEKInitialization = false;
	/** Default value for {@link #ekselection}. */
	public static final boolean dftEKSelection = false;
	/** Default value for {@link #ekselectiontopn}. */
	public static final int dftEKSelectionTopN = 5;
	/** Default value for {@link #elitist}. */
	public static final int dftElitist = 1;
	/** Default value for {@link #tournamentsize}. */
	public static final int dftTournamentsize = 3;
	/** Default value for {@link #landscapesize}. */
	public static final int dftLandscapesize = 20;
	/** Default value for {@link #depthmax}. */
	public static final int dftMaxdepth = 3;
	/** Default value for {@link #depthmin}. */
	public static final int dftMindepth = 1;
	/** Default value for {@link #neval}. */
	public static final int dftNeval = 5000;
	/** Default value for {@link #ngen}. */
	public static final int dftNgen = 500;
	/** Default value for {@link #parallel}. */
	public static final boolean dftParallel = true;
	/** Default value for {@link #pcross}. */
	public static final double dftPcross = 0.9;
	/** Default value for {@link #pmut}. */
	public static final double dftPmut = 0.01;
	/** Default value for {@link #popsize}. */
	public static final int dftPopsize = 100;
	/** percentage noise (what percent of attributes will have their values purposefully changed per generation) */
	public static final int dftPercentagenoise = 0;
	/** maximum number of discrete values an attribute can have and still be considered discrete */
	public static final int dftMaxdiscreteattributelevels = 3;
	/** Default value for {@link #randomseed}. */
	public static final long dftRandomseed = 0;
	/** Default value for {@link #searchtype}. */
	public static final SearchType dftSearchtype = SearchType.GP;
	/** Maximum value of constants to generate. */
	private double constmax = Configuration.dftConstMax;
	/** Minimum value of constants to generate. */
	private double constmin = Configuration.dftConstMin;
	/** Probability that a random leaf will be a constant. */
	private double constprob = Configuration.dftConstProb;
	/** Step value of constants to generate. */
	private double conststep = Configuration.dftConstStep;
	/**
	 * Whether to include summary statistics of the continuous class column as possible constants to generate.
	 */
	private boolean constsummary = Configuration.dftConstSummary;
	/** Current (unfiltered) data set. */
	private AbstractDataset data;
	/**
	 * Extra information about current data set, to be displayed next to the filename.
	 */
	private String dataextra = "";
	/** File object pointing to data set on disk. */
	private File datafile = new File("");
	/** Mode of current data set. */
	private DataMode datamode = Configuration.dftDatamode;
	/** Maximum tree depth to consider. */
	private int depthmax = Configuration.dftMaxdepth;
	/** Minimum tree depth to consider. */
	private int depthmin = Configuration.dftMindepth;
	/** File object pointing to expert knowledge set on disk. */
	private File ekfile = new File("");
	/** Whether to use expert knowledge fitness. */
	private boolean ekfitness = Configuration.dftEKFitness;
	/** Weight of actual fitness in expert knowledge fitness function. */
	private double ekfitnessalpha = Configuration.dftEKFitnessAlpha;
	/** Weight of expert fitness in expert knowledge fitness function. */
	private double ekfitnessbeta = Configuration.dftEKFitnessBeta;
	/**
	 * Whether to z-transform the actual fitnesses from the current population for the expert knowledge fitness function.
	 */
	private boolean ekfitnesszxform = Configuration.dftEKFitnessZTransform;
	/** Whether to use expert knowledge initialization. */
	private boolean ekinitialization = Configuration.dftEKInitialization;
	/** Whether to use expert knowledge selection. */
	private boolean ekselection = Configuration.dftEKSelection;
	/** How many best trees to select for expert knowledge fitness. */
	private int ekselectiontopn = Configuration.dftEKSelectionTopN;
	/** Integer indicating how many of the previous best should be seeded into new populations for a GP analysis. */
	private Integer elitist = Configuration.dftElitist;
	/** how many contestants in a tournament selection */
	private Integer tournamentsize = Configuration.dftTournamentsize;
	/** Current expert knowledge set. */
	private ExpertKnowledge expert;
	/** Filtered version of data set, if any. */
	private AbstractDataset filtData;
	/** Set of functions to use when generating random trees. */
	private List<Class<? extends FunctionNode>> functions = new ArrayList<Class<? extends FunctionNode>>();
	/** Number of best training models to test. */
	private int landscapesize = Configuration.dftLandscapesize;
	/** List of event listeners for all events this class publishes. */
	private final EventListenerList listenerList = new EventListenerList();
	/** Number of evaluations for random search. */
	private int neval = Configuration.dftNeval;
	/** Number of GP generations. */
	private int ngen = Configuration.dftNgen;
	/** Whether things that can be done in parallel will be. */
	private boolean parallel = Configuration.dftParallel;
	/** GP crossover probability. */
	private double pcross = Configuration.dftPcross;
	/** GP mutation probability. */
	private double pmut = Configuration.dftPmut;
	/** GP population size. */
	private int popsize = Configuration.dftPopsize;
	/** percentage noise (what percent of attributes will have their values purposefully changed per generation) */
	private int percentagenoise = Configuration.dftPercentagenoise;
	/** maximum number of discrete values an attribute can have and still be considered discrete */
	public int maxdiscreteattributelevels = Configuration.dftMaxdiscreteattributelevels;
	/** Random seed for the analysis. */
	private long randomseed = Configuration.dftRandomseed;
	/** Search type for the analysis. */
	private SearchType searchtype = Configuration.dftSearchtype;

	/**
	 * Construct a configuration with all default values.
	 */
	public Configuration() {
	}

	/**
	 * Construct a configuration from a Properties object.
	 * @param properties Properties object to read
	 */
	public Configuration(final Properties properties) {
		readProperties(properties);
	}

	/**
	 * Register an object to receive notification of data set changes.
	 * @param l object to receive notification
	 */
	public void addDatasetChangeListener(final DatasetChangeListener l) {
		listenerList.add(DatasetChangeListener.class, l);
	}

	/**
	 * Register an object to receive notification of expert knowledge set changes.
	 * @param l object to receive notification
	 */
	public void addExpertKnowledgeChangeListener(final ExpertKnowledgeChangeListener l) {
		listenerList.add(ExpertKnowledgeChangeListener.class, l);
	}

	/**
	 * Add a function to the list of functions used to generate trees.
	 * @param nodetype Class object of a class derived from {@link org.epistasis.symod.tree.FunctionNode}
	 */
	public void addFunction(final Class<? extends FunctionNode> nodetype) {
		final String oldValue = getFunctionSetString();
		functions.add(nodetype);
		firePropertyChange(PropertyName.FUNCTIONS.getName(), oldValue, getFunctionSetString());
	}

	/**
	 * Register an object to receive notification of configuration value changes.
	 * @param l object to receive notification
	 */
	public void addPropertyChangeListener(final PropertyChangeListener l) {
		listenerList.add(PropertyChangeListener.class, l);
	}

	/**
	 * Clear the set of functions used to generate trees.
	 */
	public void clearFunctionSet() {
		final String oldValue = getFunctionSetString();
		functions.clear();
		firePropertyChange(PropertyName.FUNCTIONS.getName(), oldValue, getFunctionSetString());
	}

	/**
	 * Create a deep copy of this Configuration object and return it.
	 * @return deep copy of this Configuration object
	 */
	@Override
	public Object clone() {
		Configuration c = null;
		try {
			c = (Configuration) super.clone();
			c.functions = new ArrayList<Class<? extends FunctionNode>>(functions);
		} catch (final CloneNotSupportedException ex) {
		}
		return c;
	}

	/**
	 * Notify all registered listeners of a change in the current data set.
	 * @param data current data set
	 * @param filtered true if the current data set is a filtered data set, false otherwise
	 */
	protected void fireDatasetChange(final AbstractDataset data, final boolean filtered) {
		final Object[] listeners = listenerList.getListenerList();
		DatasetChangeEvent e = null;
		for (int i = listeners.length - 2; i >= 0; i -= 2) {
			if (listeners[i] == DatasetChangeListener.class) {
				if (e == null) {
					e = new DatasetChangeEvent(this, data, filtered);
				}
				((DatasetChangeListener) listeners[i + 1]).datasetChange(e);
			}
		}
	}

	/**
	 * Notify all registered listeners of a change in the current expert knowledge set.
	 * @param expert current expert knowledge set
	 */
	protected void fireExpertKnowledgeChange(final ExpertKnowledge expert) {
		final Object[] listeners = listenerList.getListenerList();
		ExpertKnowledgeChangeEvent e = null;
		for (int i = listeners.length - 2; i >= 0; i -= 2) {
			if (listeners[i] == ExpertKnowledgeChangeListener.class) {
				if (e == null) {
					e = new ExpertKnowledgeChangeEvent(this, expert);
				}
				((ExpertKnowledgeChangeListener) listeners[i + 1]).expertKnowledgeChange(e);
			}
		}
	}

	/**
	 * Notify all registered listeners that a property has changed value.
	 * @param name property name
	 * @param oldValue previous value
	 * @param newValue subsequent value
	 */
	protected void firePropertyChange(final String name, final Object oldValue, final Object newValue) {
		// don't fire for false alarms
		if ((oldValue == newValue) || ((oldValue != null) && oldValue.equals(newValue))) {
			return;
		}
		final Object[] listeners = listenerList.getListenerList();
		PropertyChangeEvent e = null;
		for (int i = listeners.length - 2; i >= 0; i -= 2) {
			if (listeners[i] == PropertyChangeListener.class) {
				if (e == null) {
					e = new PropertyChangeEvent(this, name, oldValue, newValue);
				}
				((PropertyChangeListener) listeners[i + 1]).propertyChange(e);
			}
		}
	}

	/**
	 * Get the maximum value to use when generating random constants.
	 * @return maximum value to use when generating random constants
	 */
	public double getConstMax() {
		return constmax;
	}

	/**
	 * Get the minimum value to use when generating random constants.
	 * @return minimum value to use when generating random constants
	 */
	public double getConstMin() {
		return constmin;
	}

	/**
	 * Get the probability that a random leaf node will be a constant.
	 * @return probability that a random leaf node will be a constant
	 */
	public double getConstProb() {
		return constprob;
	}

	/**
	 * Get the step value to use when generating random constants.
	 * @return step value to use when generating random constants
	 */
	public double getConstStep() {
		return conststep;
	}

	/**
	 * Get the data set to analyze. If there is a filtered version, that is the one that will be returned.
	 * @return data set to analyze
	 */
	public AbstractDataset getData() {
		return isFiltered() ? filtData : data;
	}

	/**
	 * Get the string to display after the name of the data set.
	 * @return string to display after the name of the data set
	 */
	public String getDataExtra() {
		return dataextra;
	}

	/**
	 * Get the File object representing the current data set.
	 * @return File object representing the current data set
	 */
	public File getDataFile() {
		return datafile;
	}

	/**
	 * Get the mode of the current data set.
	 * @return mode of the current data set
	 */
	public DataMode getDataMode() {
		return datamode;
	}

	/**
	 * Get the largest tree depth to analyze.
	 * @return largest tree depth to analyze
	 */
	public int getDepthMax() {
		return depthmax;
	}

	/**
	 * Get the smallest tree depth to analze.
	 * @return smallest tree depth to analze
	 */
	public int getDepthMin() {
		return depthmin;
	}

	/**
	 * Get the File object representing the current expert knowledge set.
	 * @return File object representing the current expert knowledge set
	 */
	public File getEKFile() {
		return ekfile;
	}

	/**
	 * Get the weight of the actual fitness for expert knowledge fitness.
	 * @return weight of the actual fitness for expert knowledge fitness
	 */
	public double getEKFitnessAlpha() {
		return ekfitnessalpha;
	}

	/**
	 * Get the weight of the expert knowledge for expert knowledge fitness.
	 * @return weight of the expert knowledge for expert knowledge fitness
	 */
	public double getEKFitnessBeta() {
		return ekfitnessbeta;
	}

	/**
	 * Get the number of trees to select for expert knowledge selection.
	 * @return number of trees to select for expert knowledge selection
	 */
	public int getEKSelectionTopN() {
		return ekselectiontopn;
	}

	/**
	 * @return the number of best people that should be copied into the new generation
	 */
	public Integer getElitist() {
		return elitist;
	}

	/**
	 * Get the current expert knowledge set.
	 * @return current expert knowledge set
	 */
	public ExpertKnowledge getExpertKnowledge() {
		return expert;
	}

	/**
	 * Get the set of functions to use for generating trees.
	 * @return set of functions to use for generating trees
	 */
	public List<Class<? extends FunctionNode>> getFunctionSet() {
		return Collections.unmodifiableList(functions);
	}

	/**
	 * Get a string representing the current function set. This is the fully-qualified class name of each FunctionNode class separated by
	 * semicolons (;).
	 * @return string representing the current function set
	 */
	private String getFunctionSetString() {
		final StringBuffer b = new StringBuffer();
		for (final Class<? extends FunctionNode> functionNode : functions) {
			b.append(functionNode.getName());
			b.append(';');
		}
		return b.toString();
	}

	/**
	 * Get whether the GP is elitist. That is, retains the best model seen to date.
	 * @return true if the GP is elitist, false otherwise
	 */
	public Integer getGPElitist() {
		return elitist;
	}

	/**
	 * Get the number of generations to run the GP.
	 * @return number of generations to run the GP
	 */
	public int getGPGenerations() {
		return ngen;
	}

	/**
	 * @return maximum number of discrete values an attribute can have and still be considered discrete
	 */
	public int getGPMaxDiscreteAttributeLevels() {
		return maxdiscreteattributelevels;
	}

	/**
	 * Get the crossover probability for the GP.
	 * @return crossover probability for the GP
	 */
	public double getGPPCross() {
		return pcross;
	}

	/**
	 * @param percentage noise (what percent of attributes will have their values purposefully changed per generation)
	 */
	public int getGPPercentageNoise() {
		return percentagenoise;
	}

	/**
	 * Get the mutation probability for the GP.
	 * @return mutation probability for the GP
	 */
	public double getGPPMut() {
		return pmut;
	}

	/**
	 * Get the population size for the GP.
	 * @return population size for the GP
	 */
	public int getGPPopSize() {
		return popsize;
	}

	/**
	 * @return How many contestants in a tournament selection
	 */
	public Integer getGPTournamentSize() {
		return tournamentsize;
	}

	/**
	 * Get the number of best models, based on training fitness, to test.
	 * @return number of best models, based on training fitness, to test
	 */
	public int getLandscapeSize() {
		return landscapesize;
	}

	/**
	 * Calculate the number of models the current configuration will cause to be evaluated.
	 * @return number of models the current configuration will cause to be evaluated
	 */
	public int getNModels() {
		switch (searchtype) {
			case GP:
				return (ngen * popsize) * (depthmax - depthmin + 1);
			case RANDOM:
				return neval * (depthmax - depthmin + 1);
			default:
				return 0;
		}
	}

	/**
	 * Get the current data set in its unfiltered form.
	 * @return current data set in its unfiltered form
	 */
	public AbstractDataset getOrigData() {
		return data;
	}

	/**
	 * Get a property value from a Properties object and which is specified by a PropertyName.
	 * @param properties Properties object from which to get a value
	 * @param name PropertyName which specifies which value to get
	 * @return requested value
	 */
	private String getProperty(final Properties properties, final PropertyName name) {
		return properties.getProperty(name.getName());
	}

	/**
	 * Get the number of evaluations for a random search.
	 * @return number of evaluations for a random search
	 */
	public int getRandNEval() {
		return neval;
	}

	/**
	 * Get the random seed to use for the analysis.
	 * @return random seed to use for the analysis
	 */
	public long getRandomSeed() {
		return randomseed;
	}

	/**
	 * Get the search type to use for the analysis.
	 * @return search type to use for the analysis
	 */
	public SearchType getSearchType() {
		return searchtype;
	}

	/**
	 * Get whether summary statistics of the status column of a continuous mode data set are added into the pool of available random constants
	 * for tree generation.
	 * @return true if summary statistics are included, false otherwise
	 */
	public boolean isConstSummaryStats() {
		return constsummary;
	}

	/**
	 * Get whether the expert knowledge fitness function is enabled.
	 * @return whether the expert knowledge fitness function is enabled
	 */
	public boolean isEKFitness() {
		return ekfitness;
	}

	/**
	 * Get whether the actual fitness values for a generation should be z-transformed before applying the expert knowledge fitness function.
	 * @return true if the the actual fitness values for a generation should be z-transformed before applying the expert knowledge fitness
	 *         function, false otherwise
	 */
	public boolean isEKFitnessZTransform() {
		return ekfitnesszxform;
	}

	/**
	 * Get whether the expert knowledge population initialization function is used.
	 * @return true if the expert knowledge population initialization function is used, false otherwise
	 */
	public boolean isEKInitialization() {
		return ekinitialization;
	}

	/**
	 * Get whether the expert knowledge selection function is used.
	 * @return true if the expert knowledge selection function is used, false otherwise
	 */
	public boolean isEKSelection() {
		return ekselection;
	}

	/**
	 * Get whether the current data set is filtered.
	 * @return true if the current data set is filtered, false otherwise
	 */
	public boolean isFiltered() {
		return filtData != null;
	}

	/**
	 * Get whether things that can be done in parallel will be done in parallel threads.
	 * @return true if things that can be done in parallel will be done in parallel threads, false otherwise
	 */
	public boolean isParallel() {
		return parallel;
	}

	/**
	 * Set configuration values by reading them from a Properties object.
	 * @param properties object from which to read property values
	 */
	public void readProperties(final Properties properties) {
		String value;
		if ((value = getProperty(properties, PropertyName.RANDOMSEED)) != null) {
			randomseed = Long.parseLong(value);
		}
		if ((value = getProperty(properties, PropertyName.SEARCHTYPE)) != null) {
			searchtype = SearchType.fromLabel(value);
		}
		if ((value = getProperty(properties, PropertyName.DEPTHMIN)) != null) {
			depthmin = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.DEPTHMAX)) != null) {
			depthmax = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.CONSTMIN)) != null) {
			constmin = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.CONSTMAX)) != null) {
			constmax = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.CONSTSTEP)) != null) {
			conststep = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.CONSTPROB)) != null) {
			constprob = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.CONSTSUMMARYSTATS)) != null) {
			constsummary = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.LANDSCAPESIZE)) != null) {
			landscapesize = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_FILENAME)) != null) {
			ekfile = new File(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_FITNESS)) != null) {
			ekfitness = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_FITNESS_ALPHA)) != null) {
			ekfitnessalpha = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_FITNESS_BETA)) != null) {
			ekfitnessbeta = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_FITNESS_ZTRANSFORM)) != null) {
			ekfitnesszxform = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_INITIALIZATION)) != null) {
			ekinitialization = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_SELECTION)) != null) {
			ekselection = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.EK_SELECTION_TOPN)) != null) {
			ekselectiontopn = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.FUNCTIONS)) != null) {
			final String[] names = value.split(";");
			for (final String element : names) {
				try {
					@SuppressWarnings("unchecked")
					final Class<FunctionNode> functionClass = (Class<FunctionNode>) Class.forName(element);
					functions.add(functionClass);
				} catch (final Exception ex) {
					// if a function class isn't found, ignore it
					// ex.printStackTrace();
				}
			}
		}
		if ((value = getProperty(properties, PropertyName.PARALLEL)) != null) {
			parallel = Boolean.parseBoolean(value);
		}
		if ((value = getProperty(properties, PropertyName.DATA_FILE)) != null) {
			datafile = new File(value);
		}
		if ((value = getProperty(properties, PropertyName.DATA_EXTRA)) != null) {
			final String oldValue = dataextra;
			dataextra = value;
			firePropertyChange(PropertyName.DATA_EXTRA.getName(), oldValue, value);
		}
		if ((value = getProperty(properties, PropertyName.DATA_MODE)) != null) {
			datamode = DataMode.fromLabel(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_POPSIZE)) != null) {
			popsize = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_PERCENTAGE_NOISE)) != null) {
			percentagenoise = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_MAX_DISCRETE_ATTRIBUTE_LEVELS)) != null) {
			maxdiscreteattributelevels = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_NGEN)) != null) {
			ngen = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_PCROSS)) != null) {
			pcross = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_PMUT)) != null) {
			pmut = Double.parseDouble(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_ELITIST)) != null) {
			elitist = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.GP_TOURNAMENTSIZE)) != null) {
			tournamentsize = Integer.parseInt(value);
		}
		if ((value = getProperty(properties, PropertyName.RAND_NEVAL)) != null) {
			neval = Integer.parseInt(value);
		}
	}

	/**
	 * Unregister an object from receiving notification of data set changes.
	 * @param l object to unregister from receiving notification of data set changes
	 */
	public void removeDatasetChangeListener(final DatasetChangeListener l) {
		listenerList.remove(DatasetChangeListener.class, l);
	}

	/**
	 * Unregister an object from receiving notification of expert knowledge set changes.
	 * @param l object to unregister from receiving notification of expert
	 */
	public void removeExpertKnowledgeChangeListener(final ExpertKnowledgeChangeListener l) {
		listenerList.remove(ExpertKnowledgeChangeListener.class, l);
	}

	/**
	 * Remove a Class object which derives from {@link org.epistasis.symod.tree.FunctionNode} from the set of functions from which to generate
	 * trees.
	 * @param nodetype Class object to remove
	 */
	public void removeFunction(final Class<? extends FunctionNode> nodetype) {
		final String oldValue = getFunctionSetString();
		functions.remove(nodetype);
		firePropertyChange(PropertyName.FUNCTIONS.getName(), oldValue, getFunctionSetString());
	}

	/**
	 * Unregister an object from receiving notification of a change in configuration values.
	 * @param l object to unregister from receiving notification of a change in configuration values
	 */
	public void removePropertyChangeListener(final PropertyChangeListener l) {
		listenerList.remove(PropertyChangeListener.class, l);
	}

	/**
	 * If the current data set is filtered, restore the data set to its unfiltered state. This is simply a pointer assignment, and has no
	 * effect if the data set is unfiltered to begin with.
	 */
	public void revertFilteredData() {
		if (filtData == null) {
			return;
		}
		filtData = null;
		setDataExtra("");
		fireDatasetChange(data, false);
	}

	/**
	 * Set the maximum value to use for generating random constants.
	 * @param constmax maximum value to use for generating random constants
	 */
	public void setConstMax(final double constmax) {
		final String oldValue = Double.toString(this.constmax);
		this.constmax = constmax;
		firePropertyChange(PropertyName.CONSTMAX.getName(), oldValue, Double.toString(constmax));
	}

	/**
	 * Set the minimum value to use for generating random constants.
	 * @param constmin minimum value to use for generating random constants
	 */
	public void setConstMin(final double constmin) {
		final String oldValue = Double.toString(this.constmin);
		this.constmin = constmin;
		firePropertyChange(PropertyName.CONSTMIN.getName(), oldValue, Double.toString(constmin));
	}

	/**
	 * Set the probability that a randomly generated leaf node will be a constant.
	 * @param constprob probability that a randomly generated leaf node will be a constant
	 */
	public void setConstProb(final double constprob) {
		final String oldValue = Double.toString(this.constprob);
		this.constprob = constprob;
		firePropertyChange(PropertyName.CONSTPROB.getName(), oldValue, Double.toString(constprob));
	}

	/**
	 * Set the step value to use for generating random constants.
	 * @param conststep step value to use for generating random constants
	 */
	public void setConstStep(final double conststep) {
		final String oldValue = Double.toString(this.conststep);
		this.conststep = conststep;
		firePropertyChange(PropertyName.CONSTSTEP.getName(), oldValue, Double.toString(conststep));
	}

	/**
	 * Set whether to include summary statistics of the continuous status column as potential constant values.
	 * @param constsummary whether to include summary statistics of the continuous status column as potential constant values
	 */
	public void setConstSummaryStats(final boolean constsummary) {
		final String oldValue = Boolean.toString(this.constsummary);
		this.constsummary = constsummary;
		firePropertyChange(PropertyName.CONSTSUMMARYSTATS.getName(), oldValue, Boolean.toString(constsummary));
	}

	/**
	 * Set the data set to analyze.
	 * @param data data set to analyze
	 */
	public void setData(final AbstractDataset data) {
		this.data = data;
		filtData = null;
		setDataExtra("");
		fireDatasetChange(data, false);
	}

	/**
	 * Set the extra information to be displayed along with the data set filename.
	 * @param dataextra extra information to be displayed along with the data set filename
	 */
	public void setDataExtra(final String dataextra) {
		final String oldValue = this.dataextra;
		this.dataextra = dataextra;
		firePropertyChange(PropertyName.DATA_EXTRA.getName(), oldValue, dataextra);
	}

	/**
	 * Set the File object that represents the current data set.
	 * @param filename File object that represents the current data set
	 */
	public void setDataFile(final File filename) {
		final String oldValue = datafile == null ? "" : datafile.toString();
		datafile = filename;
		firePropertyChange(PropertyName.DATA_FILE.getName(), oldValue, datafile == null ? "" : datafile.toString());
	}

	/**
	 * Set the reported mode of the data set.
	 * @param mode reported mode of the data set
	 */
	public void setDataMode(final DataMode mode) {
		final String oldValue = datamode.getLabel();
		datamode = mode;
		firePropertyChange(PropertyName.DATA_MODE.getName(), oldValue, mode.getLabel());
	}

	/**
	 * Set the maximum tree depth to be analyzed.
	 * @param depthmax maximum tree depth to be analyzed
	 */
	public void setDepthMax(final int depthmax) {
		final String oldValue = Integer.toString(this.depthmax);
		this.depthmax = depthmax;
		firePropertyChange(PropertyName.DEPTHMAX.getName(), oldValue, Integer.toString(depthmax));
	}

	/**
	 * Set the minimum tree depth to ba analyzed.
	 * @param depthmin maximum tree depth to be analyzed
	 */
	public void setDepthMin(final int depthmin) {
		final String oldValue = Integer.toString(this.depthmin);
		this.depthmin = depthmin;
		firePropertyChange(PropertyName.DEPTHMIN.getName(), oldValue, Integer.toString(depthmin));
	}

	/**
	 * Set the File object corresponding to the current expert knowledge set.
	 * @param filename File object corresponding to the current expert knowledge set
	 */
	public void setEKFile(final File filename) {
		final String oldValue = ekfile == null ? "" : ekfile.toString();
		ekfile = filename;
		firePropertyChange(PropertyName.EK_FILENAME.getName(), oldValue, ekfile == null ? "" : ekfile.toString());
	}

	/**
	 * Set whether to use an expert knowledge fitness function.
	 * @param ekfitness whether to use an expert knowledge fitness function
	 */
	public void setEKFitness(final boolean ekfitness) {
		final String oldValue = Boolean.toString(this.ekfitness);
		this.ekfitness = ekfitness;
		firePropertyChange(PropertyName.EK_FITNESS.getName(), oldValue, Boolean.toString(ekfitness));
	}

	/**
	 * Set the weight for the actual fitness value in the expert knowledge fitness function.
	 * @param ekfitnessalpha weight for the actual fitness value in the expert knowledge fitness function
	 */
	public void setEKFitnessAlpha(final double ekfitnessalpha) {
		final String oldValue = Double.toString(this.ekfitnessalpha);
		this.ekfitnessalpha = ekfitnessalpha;
		firePropertyChange(PropertyName.EK_FITNESS_ALPHA.getName(), oldValue, Double.toString(ekfitnessalpha));
	}

	/**
	 * Set the weight for the expert knowledge value in the expert knowledge fitness function.
	 * @param ekfitnessbeta weight for the expert knowledge value in the expert knowledge fitness function
	 */
	public void setEKFitnessBeta(final double ekfitnessbeta) {
		final String oldValue = Double.toString(this.ekfitnessbeta);
		this.ekfitnessbeta = ekfitnessbeta;
		firePropertyChange(PropertyName.EK_FITNESS_BETA.getName(), oldValue, Double.toString(ekfitnessbeta));
	}

	/**
	 * Set whether the actual fitness scores for a population of trees should be z-transformed before feeding them into the expert knowledge
	 * fitness function.
	 * @param ekfitnesszxform whether the actual fitness scores for a population of trees should be z-transformed before feeding them into the
	 *          expert knowledge fitness function
	 */
	public void setEKFitnessZTransform(final boolean ekfitnesszxform) {
		final String oldValue = Boolean.toString(this.ekfitnesszxform);
		this.ekfitnesszxform = ekfitnesszxform;
		firePropertyChange(PropertyName.EK_FITNESS_ZTRANSFORM.getName(), oldValue, Boolean.toString(ekfitnesszxform));
	}

	/**
	 * Set whether expert knowledge initialization is used.
	 * @param ekinitialization whether expert knowledge initialization is used
	 */
	public void setEKInitialization(final boolean ekinitialization) {
		final String oldValue = Boolean.toString(this.ekinitialization);
		this.ekinitialization = ekinitialization;
		firePropertyChange(PropertyName.EK_INITIALIZATION.getName(), oldValue, Boolean.toString(ekinitialization));
	}

	/**
	 * Set whether expert knowledge selection is used.
	 * @param ekselection whether expert knowledge selection is used
	 */
	public void setEKSelection(final boolean ekselection) {
		final String oldValue = Boolean.toString(this.ekselection);
		this.ekselection = ekselection;
		firePropertyChange(PropertyName.EK_SELECTION.getName(), oldValue, Boolean.toString(ekselection));
	}

	/**
	 * Set the number of best trees to use for expert knowledge selection.
	 * @param ekselectiontopn number of best trees to use for expert knowledge selection
	 */
	public void setEKSelectionTopN(final int ekselectiontopn) {
		final String oldValue = Integer.toString(this.ekselectiontopn);
		this.ekselectiontopn = ekselectiontopn;
		firePropertyChange(PropertyName.EK_SELECTION_TOPN.getName(), oldValue, Integer.toString(ekselectiontopn));
	}

	/**
	 * Set the scores to use for expert knowledge features.
	 * @param expert scores to use for expert knowledge features
	 */
	public void setExpertKnowledge(final ExpertKnowledge expert) {
		if (this.expert == expert) {
			return;
		}
		this.expert = expert;
		fireExpertKnowledgeChange(expert);
	}

	/**
	 * Set the filtered version of the current data set.
	 * @param data filtered version of the current data set
	 */
	public void setFilteredData(final AbstractDataset data) {
		filtData = data;
		setDataExtra("(Filtered)");
		fireDatasetChange(data, true);
	}

	/**
	 * Set whether the GP analysis is elitist.
	 * @param elitist whether the GP analysis is elitist
	 */
	public void setGPElitist(final Integer elitist) {
		final String oldValue = this.elitist.toString();
		this.elitist = elitist;
		firePropertyChange(PropertyName.GP_ELITIST.getName(), oldValue, elitist.toString());
	}

	/**
	 * Set the number of generations for the GP to run.
	 * @param ngen number of generations for the GP
	 */
	public void setGPGenerations(final int ngen) {
		final String oldValue = Integer.toString(this.ngen);
		this.ngen = ngen;
		firePropertyChange(PropertyName.GP_NGEN.getName(), oldValue, Integer.toString(ngen));
	}

	/**
	 * Set the crossover probability for GP.
	 * @param pcross crossover probability for GP
	 */
	public void setGPPCross(final double pcross) {
		final String oldValue = Double.toString(this.pcross);
		this.pcross = pcross;
		firePropertyChange(PropertyName.GP_PCROSS.getName(), oldValue, Double.toString(pcross));
	}

	/**
	 * @param percentage noise (what percent of attributes will have their values purposefully changed per generation)
	 */
	public void setGPPercentageNoise(final int percentagenoise) {
		final String oldValue = Integer.toString(this.percentagenoise);
		this.percentagenoise = percentagenoise;
		firePropertyChange(PropertyName.GP_PERCENTAGE_NOISE.getName(), oldValue, Integer.toString(percentagenoise));
	}

	/**
	 * Set the mutation probability for GP.
	 * @param pmut mutation probability for GP
	 */
	public void setGPPMut(final double pmut) {
		final String oldValue = Double.toString(this.pmut);
		this.pmut = pmut;
		firePropertyChange(PropertyName.GP_PMUT.getName(), oldValue, Double.toString(pmut));
	}

	/**
	 * Set the population size for GP.
	 * @param popsize population size for GP
	 */
	public void setGPPopSize(final int popsize) {
		final String oldValue = Integer.toString(this.popsize);
		this.popsize = popsize;
		firePropertyChange(PropertyName.GP_POPSIZE.getName(), oldValue, Integer.toString(popsize));
	}

	/**
	 * @param Number of contestants in a selection tournament
	 */
	public void setGPTournamentSize(final Integer tournamentsize) {
		final String oldValue = tournamentsize.toString();
		this.tournamentsize = tournamentsize;
		firePropertyChange(PropertyName.GP_TOURNAMENTSIZE.getName(), oldValue, tournamentsize.toString());
	}

	/**
	 * Set the number of trees to select based on training value for further testing.
	 * @param landscapesize number of trees to select based on training value for further testing
	 */
	public void setLandscapeSize(final int landscapesize) {
		final String oldValue = Integer.toString(this.landscapesize);
		this.landscapesize = landscapesize;
		firePropertyChange(PropertyName.LANDSCAPESIZE.getName(), oldValue, Integer.toString(landscapesize));
	}

	/**
	 * Set whether things that can be done in parallel will be.
	 * @param parallel whether things that can be done in parallel will be
	 */
	public void setParallel(final boolean parallel) {
		final String oldValue = Boolean.toString(this.parallel);
		this.parallel = parallel;
		firePropertyChange(PropertyName.PARALLEL.getName(), oldValue, Boolean.toString(parallel));
	}

	/**
	 * Set a property value in a Properties object and which is specified by a PropertyName.
	 * @param properties Properties object in which to set a value
	 * @param name PropertyName which specifies which value to set
	 * @param value value to set
	 */
	private void setProperty(final Properties properties, final PropertyName name, final String value) {
		properties.setProperty(name.getName(), value);
	}

	/**
	 * Set the number of evaluations to make per tree depth in random search mode.
	 * @param neval number of evaluations to make per tree depth in random search mode
	 */
	public void setRandNEval(final int neval) {
		final String oldValue = Integer.toString(this.neval);
		this.neval = neval;
		firePropertyChange(PropertyName.RAND_NEVAL.getName(), oldValue, Integer.toString(neval));
	}

	/**
	 * Set the random seed to use for the analysis.
	 * @param seed random seed to use for the analysis
	 */
	public void setRandomSeed(final long seed) {
		final String oldValue = Long.toString(randomseed);
		randomseed = seed;
		firePropertyChange(PropertyName.RANDOMSEED.getName(), oldValue, Long.toString(randomseed));
	}

	/**
	 * Set the search type to use for the analysis.
	 * @param searchtype search type to use for the analysis
	 */
	public void setSearchType(final SearchType searchtype) {
		final String oldValue = this.searchtype.getLabel();
		this.searchtype = searchtype;
		firePropertyChange(PropertyName.SEARCHTYPE.getName(), oldValue, searchtype.getLabel());
	}

	/**
	 * Store the configuration properties into a Properties object
	 * @param properties
	 */
	public void writeProperties(final Properties properties) {
		setProperty(properties, PropertyName.RANDOMSEED, Long.toString(randomseed));
		setProperty(properties, PropertyName.SEARCHTYPE, searchtype.getLabel());
		setProperty(properties, PropertyName.DEPTHMIN, Integer.toString(depthmin));
		setProperty(properties, PropertyName.DEPTHMAX, Integer.toString(depthmax));
		setProperty(properties, PropertyName.LANDSCAPESIZE, Integer.toString(landscapesize));
		setProperty(properties, PropertyName.CONSTMIN, Double.toString(constmin));
		setProperty(properties, PropertyName.CONSTMAX, Double.toString(constmax));
		setProperty(properties, PropertyName.CONSTSTEP, Double.toString(conststep));
		setProperty(properties, PropertyName.CONSTPROB, Double.toString(constprob));
		setProperty(properties, PropertyName.CONSTSUMMARYSTATS, Boolean.toString(constsummary));
		setProperty(properties, PropertyName.FUNCTIONS, getFunctionSetString());
		setProperty(properties, PropertyName.EK_FILENAME, ekfile.toString());
		setProperty(properties, PropertyName.EK_FITNESS, Boolean.toString(ekfitness));
		setProperty(properties, PropertyName.EK_FITNESS_ALPHA, Double.toString(ekfitnessalpha));
		setProperty(properties, PropertyName.EK_FITNESS_BETA, Double.toString(ekfitnessbeta));
		setProperty(properties, PropertyName.EK_FITNESS_ZTRANSFORM, Boolean.toString(ekfitnesszxform));
		setProperty(properties, PropertyName.EK_INITIALIZATION, Boolean.toString(ekinitialization));
		setProperty(properties, PropertyName.EK_SELECTION, Boolean.toString(ekselection));
		setProperty(properties, PropertyName.EK_SELECTION_TOPN, Integer.toString(ekselectiontopn));
		setProperty(properties, PropertyName.PARALLEL, Boolean.toString(parallel));
		setProperty(properties, PropertyName.DATA_FILE, datafile.toString());
		setProperty(properties, PropertyName.DATA_EXTRA, dataextra);
		setProperty(properties, PropertyName.DATA_MODE, datamode.getLabel());
		setProperty(properties, PropertyName.GP_POPSIZE, Integer.toString(popsize));
		setProperty(properties, PropertyName.GP_NGEN, Integer.toString(ngen));
		setProperty(properties, PropertyName.GP_PMUT, Double.toString(pmut));
		setProperty(properties, PropertyName.GP_PCROSS, Double.toString(pcross));
		setProperty(properties, PropertyName.GP_ELITIST, Integer.toString(elitist));
		setProperty(properties, PropertyName.RAND_NEVAL, Integer.toString(neval));
	}

	/**
	 * Enumeration of data modes.
	 */
	public enum DataMode {
		/** No data mode. Only valid when no data set is loaded. */
		NONE(""),
		/** Continuous class column data set. */
		CONTINUOUS("Continuous"),
		/** Discrete class column data set. */
		DISCRETE("Discrete");
		/** String value attached to this DataMode. */
		private final String label;

		/**
		 * Find the DataMode which has a given label. This uses a linear search.
		 * @param label label to search for
		 * @return DataMode for the given label, or NONE if label is not found
		 */
		public static DataMode fromLabel(final String label) {
			for (final DataMode d : DataMode.values()) {
				if (d.getLabel().equals(label)) {
					return d;
				}
			}
			return NONE;
		}

		/**
		 * Construct a DataMode with a given string label.
		 * @param label string value attached to this DataMode
		 */
		private DataMode(final String label) {
			this.label = label;
		}

		/**
		 * Get the label for this DataMode.
		 * @return label for this DataMode
		 */
		public String getLabel() {
			return label;
		}
	}

	/**
	 * Enumeration of property names for configuration properties. These are used for {@link java.beans.PropertyChangeEvent}s as well as for
	 * reading/writing a Configuration to/from a stream.
	 */
	public enum PropertyName {
		/** Maximum value for generating constants. */
		CONSTMAX("symod.global.tree.const.max"),
		/** Minimum value for generating constants. */
		CONSTMIN("symod.global.tree.const.min"),
		/** Probability that a random leaf will be a constant. */
		CONSTPROB("symod.global.tree.const.prob"),
		/** Step size designating possible constant values from min to max. */
		CONSTSTEP("symod.global.tree.const.step"),
		/**
		 * Boolean value indicating whether to include summary statistics (e.g. mean) of the continuous status column as additional constants.
		 */
		CONSTSUMMARYSTATS("symod.global.tree.const.summarystats"),
		/** Additional information string displayed after the data file name. */
		DATA_EXTRA("symod.data.extra"),
		/** File name of the current data set. */
		DATA_FILE("symod.data.filename"),
		/**
		 * Whether the current data set has a continuous status column or a discrete one.
		 */
		DATA_MODE("symod.data.mode"),
		/** Largest tree depth to consider in an analysis. */
		DEPTHMAX("symod.global.tree.depth.max"),
		/** Smallest tree depth to consider in an analysis. */
		DEPTHMIN("symod.global.tree.depth.min"),
		/** Filename of the expert knowledge score file. */
		EK_FILENAME("symod.expert.filename"),
		/** Boolean indicating whether to use expert knowledge fitness function. */
		EK_FITNESS("symod.expert.fitness.enabled"),
		/** Weight of the actual fitness score for expert knowledge fitness. */
		EK_FITNESS_ALPHA("symod.expert.fitness.alpha"),
		/** Weight of the expert knowledge score for expert knowledge fitness. */
		EK_FITNESS_BETA("symod.expert.fitness.beta"),
		/**
		 * Boolean indicating whether to z-transform the actual fitness scores for expert fitness.
		 */
		EK_FITNESS_ZTRANSFORM("symod.expert.fitness.ztransform"),
		/** Boolean indicating whether to use expert knowledge initialization. */
		EK_INITIALIZATION("symod.expert.initialization.enabled"),
		/** Boolean indicating whether to use expert knowledge selection. */
		EK_SELECTION("symod.expert.selection.enabled"),
		/** Number of best trees to select for expert selection. */
		EK_SELECTION_TOPN("symod.expert.selection.topn"),
		/** Names of function node classes to use for generating trees. */
		FUNCTIONS("symod.global.tree.functions"),
		/** integer indicating how many of the previous best should be seeded into new populations for a GP analysis. */
		GP_ELITIST("symod.gp.elitist"),
		/** integer indicating how many of the previous best should be seeded into new populations for a GP analysis. */
		GP_TOURNAMENTSIZE("symod.gp.tournamentsize"),
		/** Number of generations to evolve for a GP analysis. */
		GP_NGEN("symod.gp.ngen"),
		/** Probability of crossover for a GP analysis. */
		GP_PCROSS("symod.gp.pcross"),
		/** Probability of mutation for a GP analysis. */
		GP_PMUT("symod.gp.pmut"),
		/** Population size for a GP analysis. */
		GP_POPSIZE("symod.gp.popsize"),
		/** maximum number of discrete values an attribute can have and still be considered discrete */
		GP_MAX_DISCRETE_ATTRIBUTE_LEVELS("symod.gp.maxdiscreteattributelevels"),
		/** percentage noise (what percent of attributes will have their values purposefully changed per generation) */
		GP_PERCENTAGE_NOISE("symod.gp.percentage"),
		/** Number of best training models to keep for testing. */
		LANDSCAPESIZE("symod.global.landscapesize"),
		/** Boolean indicating whether to parallelize that which can be. */
		PARALLEL("symod.global.parallel"),
		/** Number of evaluations for a random search. */
		RAND_NEVAL("symod.randsearch.neval"),
		/** Random seed for the analysis. */
		RANDOMSEED("symod.global.randomseed"),
		/** Search type for the analysis. */
		SEARCHTYPE("symod.global.searchtype");
		/** Name for this PropertyName. */
		private final String name;

		/**
		 * Construct a PropertyName with a given name string.
		 */
		private PropertyName(final String name) {
			this.name = name;
		}

		/**
		 * Get the name for this PropertyName.
		 * @return name for this PropertyName
		 */
		public String getName() {
			return name;
		}
	}

	/**
	 * Enumeration of search types.
	 */
	public enum SearchType {
		/** No search type. */
		NONE(""),
		/** Genetic Programming search. */
		GP("GP"),
		/** Random search. */
		RANDOM("Random Search");
		/** Label for this search type. */
		private final String label;

		/**
		 * Get a SearchType value from a label. This performs a linear search.
		 * @param label label for which to search
		 * @return SearchType value corresponding to given label, or NONE if the label isn't found
		 */
		public static SearchType fromLabel(final String label) {
			for (final SearchType s : SearchType.values()) {
				if (s.getLabel().equals(label)) {
					return s;
				}
			}
			return NONE;
		}

		/**
		 * Construct a SearchType with a given label.
		 */
		private SearchType(final String label) {
			this.label = label;
		}

		/**
		 * Get the label for this SearchType.
		 * @return label for this SearchType
		 */
		public String getLabel() {
			return label;
		}
	}
}

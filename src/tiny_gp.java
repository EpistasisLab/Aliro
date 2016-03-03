/* 
 * Program:   tiny_gp.java
 *
 * Author:    Riccardo Poli (email: rpoli@essex.ac.uk)
 *
 */


import org.epistasis.emergent.*;

import java.io.File;
import java.io.OutputStreamWriter;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Random;
import java.util.logging.Logger;

import org.epistasis.evolutionary.Evolution;
import org.epistasis.evolutionary.Evolver;
import org.epistasis.evolutionary.MaxGenTerminator;
import org.epistasis.evolutionary.TournamentSelector;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.AbstractFitnessFunction;
import org.epistasis.symod.Configuration;
import org.epistasis.symod.GPMain;
import org.epistasis.symod.GPSearch;
import org.epistasis.symod.MainBase;
import org.epistasis.symod.SyModProperties;
import org.epistasis.symod.continuous.SSEFitness;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.FitnessFunction;
import org.epistasis.symod.discrete.MedianDiscriminator;
import org.epistasis.symod.tree.StepConstantNodeFactory;
import org.epistasis.symod.tree.TreeFactory;
import org.epistasis.symod.tree.TreeFactory.FunctionGroup;


import static spark.Spark.*;


public class tiny_gp {
  public static void main(String[] args) {
	  
    //String fname = "problem.dat";
    String fname = "dataset.txt";
	  long s = -1;
    
    if ( args.length == 2 ) {
      s = Integer.valueOf(args[0]).intValue();
      fname = args[1];
    }
    if ( args.length == 1 ) {
      fname = args[0];
    }
    fname="sin-data.txt"; 
    //TinyGP gp = new TinyGP(fname, s);
    MainGP jocl = new MainGP(fname, s);
    //jocl.evolve();
    //System.out.println("Result");
   get("/emergent/gp", (req, res) -> jocl.return_params());
   get("/emergent/hello", (req, res) -> "Hello World");	
   jocl.evolve();
    
    
    
	final String experimentalTest = null;
	if (experimentalTest != null) {
		final String[] propertyAndPossibleValues = experimentalTest.split(" ");
		if (propertyAndPossibleValues.length >= 2) {
			final String propertyName = propertyAndPossibleValues[0];
			final String propertyValue = System.getProperty(propertyName);
			if ((propertyValue != null) && (propertyValue.length() > 0)) {
				for (int index = 1; index < propertyAndPossibleValues.length; ++index) {
					if (propertyValue.equals(propertyAndPossibleValues[index])) {
						GPMain.SHOW_EXPERIMENTAL_FUNCTIONS = true;
						break;
					}
				}
			}
		}
	}
	if (args.length > 0) {
		//consoleMain(args);
	} else {
		//consoleMain(args);
	}
	
}
    
    
    
  
    


	private static void consoleMain(final String args[]) {
		try {
			final int depth = Integer.parseInt(args[1]);
			final int numGenerations = Integer.parseInt(args[2]);
			final int populationSize = Integer.parseInt(args[3]);
			final double probabilityCrossover = Double.parseDouble(args[4]);
			final double probabilityMutation = Double.parseDouble(args[5]);
			final int landscapeSize = Integer.parseInt(args[6]);
			long seed = Long.parseLong(args[7]);
			if (seed == -1) {
				seed = System.currentTimeMillis();
			}
			final Random rnd = new Random(seed);
			final String[] functionGroupNames = args[8].split(",");
			if ((functionGroupNames.length == 0) || (functionGroupNames.length > FunctionGroup.values().length)) {
				throw new IllegalArgumentException("Argument #9 '" + args[8]
						+ "' should be a comma-delimited list containinf some or all of the following: " + Arrays.toString(FunctionGroup.values()));
			}
			final EnumSet<FunctionGroup> functionGroups = EnumSet.noneOf(FunctionGroup.class);
			for (final String functionGroupName : functionGroupNames) {
				final FunctionGroup functionGroup = Enum.valueOf(FunctionGroup.class, functionGroupName);
				functionGroups.add(functionGroup);
			}
			final int xml_or_inline = Integer.parseInt(args[9]);
			final int serial_or_parallel = Integer.parseInt(args[10]);
			final double minConst = Double.parseDouble(args[11]);
			final double maxConst = Double.parseDouble(args[12]);
			final double stepConst = Double.parseDouble(args[13]);
			final String maskFile = args.length > 14 ? args[14] : null;
			AbstractFitnessFunction ff = null;
			final AbstractDataset data = AbstractDataset.create(new File(args[0]), Configuration.dftMaxdiscreteattributelevels);
			if (data instanceof org.epistasis.symod.discrete.Dataset) {
				final Discriminator disc = new MedianDiscriminator(((org.epistasis.symod.discrete.Dataset) data).getStatuses());
				ff = new FitnessFunction(disc);
			} else if (data instanceof org.epistasis.symod.continuous.Dataset) {
				ff = new SSEFitness();
			}
			final AbstractDataset[] part = data.partition(rnd);
			final TreeFactory tf = new TreeFactory(depth, rnd, 0.0);
			final Evolver.Selector selector = new TournamentSelector(Configuration.dftTournamentsize, rnd);
			final Evolution.Terminator term = new MaxGenTerminator(numGenerations);
			tf.addConstantNodeFactory(new StepConstantNodeFactory(minConst, maxConst, stepConst));
			tf.addFunctionNodeTypes(functionGroups, maskFile);
			tf.setVariables(data.getLabels(), null, TreeFactory.DEFAULT_VAR_FREQ, data.getAttributeDiscreteValues());
			final GPSearch gps = new GPSearch(rnd, part[0], part[1], ff, tf, selector, term, new Evolver(), populationSize, probabilityCrossover,
					probabilityMutation, landscapeSize, 1, serial_or_parallel != 0, null, null, Configuration.dftPercentagenoise);
			gps.run();
			if (xml_or_inline == 0) {
				MainBase.writeResultsXML(new OutputStreamWriter(System.out), gps.getLandscape(), ff, part[2], seed);
			} else {
				MainBase.writeResultsTable(new OutputStreamWriter(System.out), gps.getLandscape(), ff, part[2], seed);
			}
		} catch (final Exception e) {
			System.err.println("Arguments to SyMod:");
			System.err.println("1 - dataset");
			System.err.println("2 - tree depth");
			System.err.println("3 - n gen");
			System.err.println("4 - pop size");
			System.err.println("5 - pcross");
			System.err.println("6 - pmut");
			System.err.println("7 - landscape size");
			System.err.println("8 - random seed");
			System.err
					.println("9 - comma delimited list of function groups such as Arithmetic,Relational,Logical,Trigonometric,Miscellaneous,Experimental");
			System.err.println("10 - 0 = xml; 1 = inline");
			System.err.println("11 - 0 = serial, 1 = parallel");
			System.err.println("12 - minimum constant value");
			System.err.println("13 - maximum constant value");
			System.err.println("14 - constant step value");
			System.err.println("15 - FileMaskNode file (optional)");
			e.printStackTrace();
		}
    
    
  }
};

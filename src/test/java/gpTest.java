package test.java;
import java.io.File;
import java.util.Random;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.EnumSet;
import java.util.Arrays;
import org.epistasis.emergent.*;
import org.epistasis.evolutionary.Evolution;
import org.epistasis.evolutionary.Evolver;
import org.epistasis.evolutionary.MaxGenTerminator;
import org.epistasis.evolutionary.TournamentSelector;
import org.junit.Test;
import org.junit.Assert;
import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.AbstractFitnessFunction;
import org.epistasis.symod.Configuration;
import org.epistasis.symod.GPSearch;
import org.epistasis.symod.MainBase;
import org.epistasis.symod.continuous.SSEFitness;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.FitnessFunction;
import org.epistasis.symod.discrete.MedianDiscriminator;
import org.epistasis.symod.tree.StepConstantNodeFactory;
import org.epistasis.symod.tree.TreeFactory;
import org.epistasis.symod.tree.TreeFactory.FunctionGroup;


public class gpTest {
	@Test
	public void testTinyGp() {
		Assert.assertTrue(initGp());
	}
	public static boolean  initGp() {
		final int depth = 1;
		final int numGenerations = 3000;
		final int populationSize = 200;
		final double probabilityCrossover = .9;
		final double probabilityMutation = .02;
		final int landscapeSize = 20;
		long seed = System.currentTimeMillis();
		final Random rnd = new Random(seed);
		final int xml_or_inline = 0;
		final int serial_or_parallel = 0;
		final double minConst = -2;
		final double maxConst = 2;
		final double stepConst = 1;
		final String maskFile =  null;
		final String twoDfname="files/imputed.csv";
		final long s = -1;
		final String[] functionGroupNames = "Arithmetic,Relational,Logical,Trigonometric,Miscellaneous,Experimental".split(",");
		final EnumSet<FunctionGroup> functionGroups = EnumSet.noneOf(FunctionGroup.class);
		for (final String functionGroupName : functionGroupNames) {
			final FunctionGroup functionGroup = Enum.valueOf(FunctionGroup.class, functionGroupName);
			functionGroups.add(functionGroup);
		}
	      AbstractFitnessFunction ff = null;
    try {
    	        //load a test dataset into local ram
                final AbstractDataset data = AbstractDataset.create(new File(twoDfname), Configuration.dftMaxdiscreteattributelevels);
    if (data instanceof org.epistasis.symod.discrete.Dataset) {
                final Discriminator disc = new MedianDiscriminator(((org.epistasis.symod.discrete.Dataset) data).getStatuses());
                System.out.println(disc);
    
             
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

System.out.println("wait for it:");
/*
long startTime = System.currentTimeMillis();
	final GPSearch gps = new GPSearch(rnd, part[0], part[1], ff, tf, selector, term, new Evolver(), populationSize, probabilityCrossover,
			probabilityMutation, landscapeSize, 1, serial_or_parallel != 0, null, null, Configuration.dftPercentagenoise);
gps.run();
	MainBase.writeResultsTable(new OutputStreamWriter(System.out), gps.getLandscape(), ff, part[2], seed);
long endTime = System.currentTimeMillis();
System.out.println("That took " + (endTime - startTime) + " milliseconds");
*/

    HardwareAdapter hardwary = new  HardwareAdapter();
    
    		hardwary.hwadd(data);
	
        } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
        }
    		
    		
    		
    		
    		
    		
		return true;
	}
	


}

/* 
 * Program:   tiny_gp.java
 *
 * Author:    Riccardo Poli (email: rpoli@essex.ac.uk)
 *
 */


import org.epistasis.emergent.*;
import java.io.File;
import java.io.IOException;

import javax.swing.JFrame;

import org.epistasis.symod.AbstractDataset;
import org.epistasis.symod.Configuration;
import org.epistasis.symod.discrete.Discriminator;
import org.epistasis.symod.discrete.MedianDiscriminator;
import static spark.Spark.*;
public class Gp {
  public static void main(String[] args) {
	  
    //String fname = "problem.dat";
   
	
		    String oneDfname = "tests/oneD.txt";
		    String twoDfname="tests/twoD.txt";
			long s = -1;
		     TinyGP gp = new TinyGP(oneDfname,s);
		    //jocl.evolve();
		     GraphAdapter applet = new GraphAdapter();
		        applet.init();
		        JFrame frame = new JFrame();
		        frame.getContentPane().add(applet);
		        frame.setTitle("JGraphT Adapter to JGraph Demo");
		        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		        frame.pack();
		        frame.setVisible(true);
		    gp.evolve();

	


    try {
		final AbstractDataset data = AbstractDataset.create(new File(twoDfname), Configuration.dftMaxdiscreteattributelevels);

    
    if (data instanceof org.epistasis.symod.discrete.Dataset) {
		final Discriminator disc = new MedianDiscriminator(((org.epistasis.symod.discrete.Dataset) data).getStatuses());
    }
    
	} catch (IOException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
    
    //* web interface *//
   //get("/emergent/gp", (req, res) -> jocl.return_params());
   //get("/emergent/hello", (req, res) -> "Hello World");	
   //jocl.evolve();
    
    
  
	
}
    
    
    
  
    


	
};

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

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

@Path("/")

public class Gp {

	@GET
	@Produces("text/html")
	public Response getStartingPage()
	{
		String output = "<h1>Hello World!<h1>" +
				"<p>RESTful Service is running ... <br>Ping @ </p<br>";
		return Response.status(200).entity(output).build();
	}
	
	
	public static void main(String[] args) {
			String oneDfname = "tests/oneD.txt";
			String twoDfname="tests/twoD.txt";
			long s = -1;
			TinyGP gp = new TinyGP(oneDfname,s);
			//gp.evolve();
		                    /*
		                    GraphAdapter applet = new GraphAdapter();
		                       applet.init();
		                       JFrame frame = new JFrame();
		                       frame.getContentPane().add(applet);
		                       frame.setTitle("JGraphT Adapter to JGraph Demo");
		                       frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		                       frame.pack()
		                       frame.setVisible(true);
		                   */
		 


	}
}

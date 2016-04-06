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

	
}

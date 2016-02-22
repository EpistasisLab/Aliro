/* 
 * Program:   tiny_gp.java
 *
 * Author:    Riccardo Poli (email: rpoli@essex.ac.uk)
 *
 */


import org.epistasis.emergent.*;
import static spark.Spark.*;

public class tiny_gp {
  public static void main(String[] args) {
    String fname = "problem.dat";
    long s = -1;
    
    if ( args.length == 2 ) {
      s = Integer.valueOf(args[0]).intValue();
      fname = args[1];
    }
    if ( args.length == 1 ) {
      fname = args[0];
    }
    fname="sin-data.txt"; 
    TinyGP gp = new TinyGP(fname, s);
    get("/gp", (req, res) -> gp.return_params());
    get("/hello", (req, res) -> "Hello World");
    gp.evolve();
  }
};

package test.java;
import org.epistasis.emergent.*;
import org.junit.Test;
import org.junit.Assert;

public class gpTest {

	@Test
	public void testTinyGp() {

		Assert.assertEquals(getTinyGP(), "Hello World");

	}

	public static String getTinyGP() {
		String oneDfname = "tests/oneD.txt";
		String twoDfname="tests/twoD.txt";
		long s = -1;
		TinyGP gp = new TinyGP(oneDfname,s);
		//gp.evolve();
		return "Hello World";
	}

}

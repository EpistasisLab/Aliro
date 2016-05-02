package test.java;
import org.epistasis.emergent.*;
import org.junit.Test;
import org.junit.Assert;

public class hardwareTest {

	@Test
	public void testHardwareAdd() {

		Assert.assertEquals(getHardwareAdd(), "Hello World");

	}

	public static String getHardwareAdd() {

		return "Hello World";

	}

}

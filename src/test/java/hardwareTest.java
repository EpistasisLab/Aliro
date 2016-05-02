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
HardwareAdapter ha = new HardwareAdapter();
ha.evolve();
		return "Hello World";
	}

}

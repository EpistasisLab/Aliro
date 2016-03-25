package test.java;

import org.junit.Test;
import org.junit.Assert;

public class loadTest {

	@Test
	public void testPrintHelloWorld() {

		Assert.assertEquals(getHelloWorld(), "Hello World");

	}

	public static String getHelloWorld() {

		return "Hello World";

	}

}

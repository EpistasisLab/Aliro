package org.epistasis.symod;

import java.io.BufferedWriter;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.SortedSet;

import org.epistasis.Utility;
import org.epistasis.evolutionary.Score;

public class MainBase {
	protected static void writeResultsTable(final Writer w, final Collection<AbstractModel> landscape, final AbstractFitnessFunction ff,
			final AbstractDataset validation, final long seed) {
		final PrintWriter p = new PrintWriter(new BufferedWriter(w));
		p.println("Training             Testing              Validation           Tree");
		p.println("--------             -------              ----------           ----");
		Score vr = null;
		for (final AbstractModel m : landscape) {
			p.print(Utility.padRight(Double.toString(m.getTrainingScore().getScore()), 21));
			p.print(Utility.padRight(Double.toString(m.getTestingScore().getScore()), 21));
			if (vr == null) {
				vr = ff.test(m, validation);
				p.print(Utility.padRight(Double.toString(vr.getScore()), 21));
			} else {
				p.print(Utility.padRight("N/A", 21));
			}
			p.println(m.getTree().getInfixExpression());
		}
		p.flush();
	}

	protected static void writeResultsXML(final Writer w, final SortedSet<AbstractModel> landscape, final AbstractFitnessFunction ff,
			final AbstractDataset validation, final long seed) {
		final PrintWriter p = new PrintWriter(new BufferedWriter(w));
		System.out.println("<SDA_GP_Models size=" + landscape.size() + " firstTestingScore=" + landscape.first().getTestingScore().getScore()
				+ " lastTestingScore=" + landscape.last().getTestingScore().getScore() + " randomSeed=" + seed + " >");
		for (final AbstractModel m : landscape) {
			final Score vr = ff.test(m, validation);
			p.print("    <Model");
			p.print(" seed=\"");
			p.print(seed);
			p.print("\" training=\"");
			p.print(m.getTrainingScore().getScore());
			p.print("\" testing=\"");
			p.print(m.getTestingScore().getScore());
			p.print("\" validation=\"");
			p.print(vr.getScore());
			p.println("\">");
			p.print(m.getTree().getXML(2));
			p.println("    </Model>");
			p.flush();
		}
		System.out.println("</SDA_GP_Models>");
	}
}

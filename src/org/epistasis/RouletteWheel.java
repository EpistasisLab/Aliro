package org.epistasis;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;

/**
 * List of objects with associated probability of selection. Object,weight pairs are stored in a hash map, which is not deterministic from
 * run to run. When insertion/removal is done, and selection starts, the map is condensed into a list of pairs, sorted in descending order
 * by weight. Ties are broke by insertion order, by default, or by a user-specified comparator. It is very important to make sure that ties
 * are broken the same way from run to run, so if the insertion order is not always the same, an alternate comparator should be supplied to
 * ensure this.
 * @param <T> type of object
 */
public class RouletteWheel<T extends Comparable<? super T>> {
	/** Sum of all weights on the wheel. */
	private double total;
	private double offsetToAdjustNegativeRanges;
	/** Sorted list of object,weight pairs. */
	private final Set<T> existingPrizes = new TreeSet<T>();
	private final List<RouletteWedge> wheelOfWedges = new ArrayList<RouletteWedge>();
	private boolean needsToUpdateTotal = true;

	public static void main(final String[] args) {
		final RouletteWheel<Integer> rouletteWheel = new RouletteWheel<Integer>();
		for (Integer index = 0; index < args.length; ++index) {
			final double weight = Double.parseDouble(args[index]);
			rouletteWheel.add(index, weight);
		}
		rouletteWheel.updateTotalIfNeeded();
		System.out.println("rouletteWheel.total: " + rouletteWheel.total);
		System.out.println("rouletteWheel.offsetToAdjustNegativeRanges: " + rouletteWheel.offsetToAdjustNegativeRanges);
		System.out.println("rouletteWheel.wheelOfWedges: " + rouletteWheel.wheelOfWedges.toString());
	}

	/**
	 * Construct a RouletteWheel.
	 */
	public RouletteWheel() {
	}

	public RouletteWheel(final RouletteWheel<T> rouletteWheelToCopy) {
		for (final RouletteWedge rouletteWedgeToCopy : rouletteWheelToCopy.getRouletteWedges()) {
			wheelOfWedges.add(new RouletteWedge(rouletteWedgeToCopy));
		}
	}

	/**
	 * Add an object to the wheel.
	 * @param prize object to add to the wheel
	 * @param weight relative likelihood of selecting this object
	 * @return old weight for object, if any, 0 otherwise
	 */
	public void add(final T prize, final double weight) {
		if (existingPrizes.add(prize)) {
			wheelOfWedges.add(new RouletteWedge(prize, weight));
			needsToUpdateTotal = true;
		}
	}

	public List<RouletteWedge> getRouletteWedges() {
		return wheelOfWedges;
	}

	public List<T> getTopNPrizes(final int numberToGet) {
		updateTotalIfNeeded();
		final int numberOfItems = Math.min(wheelOfWedges.size(), numberToGet);
		final List<T> bestPrizes = new ArrayList<T>(numberOfItems);
		for (int index = 0; index < numberOfItems; ++index) {
			bestPrizes.add(wheelOfWedges.get(index).prize);
		}
		return bestPrizes;
	}

	/**
	 * Determine if the wheel is empty.
	 * @return true if the wheel is empty
	 */
	public boolean isEmpty() {
		return wheelOfWedges.isEmpty();
	}

	/**
	 * Remove all objects from the wheel.
	 */
	public void reset() {
		wheelOfWedges.clear();
		existingPrizes.clear();
		needsToUpdateTotal = true;
	}

	/**
	 * Get the number of objects on the wheel.
	 * @return the number of objects on the wheel
	 */
	public int size() {
		return wheelOfWedges.size();
	}

	/**
	 * Select a random object from the wheel.
	 * @param rnd random number generator
	 * @return an object from the wheel
	 */
	public T spin(final Random rnd) {
		final RouletteWedge rouletteWedge = spin(rnd, wheelOfWedges, total);
		if (rouletteWedge == null) {
			throw new RuntimeException("RouletteWheel.spin returned null! roulette total: " + total + " wheel: " + wheelOfWedges);
		}
		return rouletteWedge.prize;
	}

	public RouletteWedge spin(final Random rnd, final List<RouletteWedge> wheelCopy, final double totalCopy) {
		updateTotalIfNeeded();
		RouletteWedge chosenWedge = null;
		if (!wheelCopy.isEmpty()) {
			final double rouletteBallDrop = rnd.nextDouble() * totalCopy;
			double totalSoFar = 0;
			for (final RouletteWedge section : wheelCopy) {
				totalSoFar += offsetToAdjustNegativeRanges + section.weight;
				if (totalSoFar >= rouletteBallDrop) {
					chosenWedge = section;
					break;
				}
			} // end for
		} // end if !empty
		return chosenWedge;
	} // end spin

	public List<T> spinNTimes(final Random rnd, final int numberOfAttributes) {
		if (numberOfAttributes > wheelOfWedges.size()) {
			throw new IllegalArgumentException("The requested number of attributes: " + numberOfAttributes
					+ " is greater than the items in the roulette wheel: " + wheelOfWedges.size() + "!");
		}
		final List<T> nPrizes = new ArrayList<T>(numberOfAttributes);
		final List<RouletteWedge> wedgeWheelCopy = new ArrayList<RouletteWedge>(getRouletteWedges());
		double currentTotal = total;
		for (int attributeCtr = numberOfAttributes; attributeCtr > 0; --attributeCtr) {
			final RouletteWedge rouletteWedge = spin(rnd, wedgeWheelCopy, currentTotal);
			nPrizes.add(rouletteWedge.prize);
			currentTotal -= rouletteWedge.getWeight();
			wedgeWheelCopy.remove(rouletteWedge);
		}
		return nPrizes;
	} // end spinNTimes

	private void updateTotalIfNeeded() {
		if (needsToUpdateTotal) {
			Collections.sort(wheelOfWedges); // puts in DESCENDING ORDER
			final RouletteWedge minimumWedge = wheelOfWedges.get(wheelOfWedges.size() - 1);
			if (minimumWedge.weight > 0) {
				offsetToAdjustNegativeRanges = 0;
			} else {
				final RouletteWedge maximumWedge = wheelOfWedges.get(0);
				final double wedgeWeightRange = maximumWedge.weight - minimumWedge.weight;
				final double desiredMinimumWeight = wedgeWeightRange / size();
				// this will make the smallest wedge have a frequency equal to the
				// average difference in frequency between wedges
				offsetToAdjustNegativeRanges = desiredMinimumWeight - minimumWedge.weight;
			}
			total = 0;
			for (final RouletteWedge rouletteWedge : wheelOfWedges) {
				total += offsetToAdjustNegativeRanges + rouletteWedge.weight;
			}
			needsToUpdateTotal = false;
		}
	}

	public class RouletteWedge implements Comparable<RouletteWedge> {
		private T prize;
		private double weight;

		public RouletteWedge(final RouletteWedge rouletteWedgeToCopy) {
			this(rouletteWedgeToCopy.prize, rouletteWedgeToCopy.weight);
		}

		RouletteWedge(final T prize, final double weight) {
			this.prize = prize;
			this.weight = weight;
		}

		public int compareTo(final RouletteWedge o) {
			int comparisonResult = 0;
			if (!super.equals(o)) {
				comparisonResult = -Double.compare(weight, o.weight); // NOTE negative sign makes sort in DESCENDING order
				if (comparisonResult == 0) {
					comparisonResult = prize.compareTo(o.prize);
				}
			}
			return comparisonResult;
		}

		public T getPrize() {
			return prize;
		}

		public double getProportionalWeight() {
			return (offsetToAdjustNegativeRanges + weight) / total;
		}

		public double getWeight() {
			return weight;
		}

		public void setPrize(final T prize) {
			this.prize = prize;
		}

		public void setWeight(final double weight) {
			RouletteWheel.this.needsToUpdateTotal = true;
			this.weight = weight;
		}

		@Override
		public String toString() {
			return "key: " + prize + " weight: " + weight + " portionOfTotal: " + getProportionalWeight();
		}
	} // end private class
} // end class

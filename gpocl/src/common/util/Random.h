// ---------------------------------------------------------------------
// $Id$
//
//   Random.h (created on Tue Nov 08 01:08:35 BRT 2005)
// 
//   Genetic Programming Classifier (gpclassifier)
//
//   Copyright (C) 2005-2008 Douglas Adriano Augusto
// 
// This file is part of gpclassifier.
// 
// gpclassifier is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or (at
// your option) any later version.
// 
// gpclassifier is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with gpclassifier; if not, see <http://www.gnu.org/licenses/>.
//
// ---------------------------------------------------------------------

#ifndef random_h
#define random_h

#include <cstdlib>
#include <cmath>
#include <ctime>

// ---------------------------------------------------------------------
/**
 * Simple random number generator (based on standard rand() function).
 */
class Random {
public:
   /** Sets the random seed. (0 = "random") */
   static unsigned long Seed( unsigned long seed = 0L ) 
   { 
      srand( seed = ( seed == 0L ) ? time( NULL ) : seed );
      return seed;
   }

   /** Uniform random [0:RAND_MAX] */
   static unsigned long Int() { return rand(); }

   /** Uniform random (integer) [0:n) -- greater than or equal 0 but less than n */
   static unsigned long Int( unsigned long n )
   {
      return static_cast<unsigned long>( double( Int() ) * n  / (RAND_MAX + 1.0) );
   }    

   /** Uniform random (integer) [a:b] */
   static long Int( long a, long b )
   {
      return a + static_cast<long>( Int() * (b - a + 1.0) / (RAND_MAX + 1.0) );
   }    

   /** Uniform random (real) [a:b) -- includes 'a' but not 'b' */
   static double Real()
   {
      return double( rand() ) / (double( RAND_MAX ) + 1.0);
   }

   /** Uniform random (real) [a:b] -- includes 'a' and 'b' */
   static double Real( double a, double b )
   {
      return a + rand() * (b - a) / double( RAND_MAX );
   }

   /* Non Uniform Random Numbers
    *
    * 'weight = 1': uniform distribution between 'a' and 'b' [a,b]
    * 'weight > 1': non uniform distribution towards 'a'
    * 'weight < 1': non uniform distribution towards 'b'
    */

   /** Non-uniform. Integer version [a,b) -- includes 'a' but not 'b' */
   static long NonUniformInt( double weight, long a, long b )
   {
      return static_cast<long>( pow( Real(), weight ) * (b - a) + a );
   }

   /** Non-uniform. Float version [a,b) */
   static double NonUniformReal( double weight, double a = 0.0, double b = 1.0 )
   {
      return pow( Real(), weight ) * (b - a) + a;
   }

   /** Probability ("flip coin"): [0% = 0.0 and 100% = 1.0] */
   static bool Probability( double p )
   {
      if( p <= 0.0 ) return false;
      if( p >= 1.0 ) return true;

      return Real() < p ? true : false;
   }
};

// --------------------------------------------------------------------

#endif

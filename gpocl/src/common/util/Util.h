// ---------------------------------------------------------------------------
// $Id$
//
//   Util.h (created on Wed Aug  6 12:00:14 BRT 2008)
// 
//   C++ Utility Functions
//
//   Copyright (C) 2008 Douglas Adriano Augusto
// 
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 3 of the License, or (at your option)
// any later version.
// 
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
// 
// You should have received a copy of the GNU General Public License along
// with this program; if not, see <http://www.gnu.org/licenses/>.
//
// ---------------------------------------------------------------------------

#ifndef _util_h
#define _util_h

#include <string>
#include <sstream>
#include <cstring>
#include <cmath>

// -----------------------------------------------------------------------------
namespace util {
// -----------------------------------------------------------------------------


/**
 * @brief Try to convert a string to a number of type T.
 *
 * @param[out] d the resulting number
 * @param[in] s the input string
 * @return @p true if conversion is completed; @p false otherwise
 */
template<class T> inline bool StringTo( T& n, const std::string& s )
{
   std::istringstream iss(s); return !(iss >> std::dec >> n).fail();
}

// -----------------------------------------------------------------------------
/**
 * @brief Converts a type into a string.
 */
template<class T> inline std::string ToString( const T& t )
{
   try {
      std::stringstream ss; ss << t; return ss.str();
   }
   catch( ... ) { return ""; }
}

// -----------------------------------------------------------------------------
/**
 * @brief Return a copy of the string in lower case. 
 *
 * @param[in] s the input string
 * @return the string in lowercase
 */
std::string inline ToLower( const std::string& str )
{
   std::string s;
   std::string::const_iterator i = str.begin();

   while( i != str.end() ) s += std::tolower( *i++ );

   return s;
}

// -----------------------------------------------------------------------------
/**
 * @brief Round a given float number.
 */
template<class T, class D> inline T Round( const D n )
{
   return static_cast<T>( n < 0 ? std::ceil( n - 0.5 ) : std::floor( n + 0.5 ) );
}

/**
  @brief Round a given positive number.

  This specific version takes advantage of the fact that 'n' is known to be
  positive, so RndPosNum runs faster by avoiding a comparison. 
 */
template<class T, class D> inline T RndPosNum( const D n )
{
   return static_cast<T>( std::floor( n + 0.5 ) );
}

/**
  @brief Round a given negative number.

  This specific version takes advantage of the fact that 'n' is known to be
  negative, so RndNegNum runs faster by avoiding a comparison. 
 */
template<class T, class D> inline T RndNegNum( const D n )
{
   return static_cast<T>( std::ceil( n - 0.5 ) );
}

// -----------------------------------------------------------------------------
/** 
 * @brief Compare two double considering the not exact float point
 * representation. 
 */
template<class T> inline bool AlmostEqual( const T& u, const T& v, 
                                           const T& epsilon = 1.0E-10 )
{
   return std::fabs( u - v ) <= epsilon * std::fabs( u ) &&
          std::fabs( u - v ) <= epsilon * std::fabs( v );
}

// -----------------------------------------------------------------------------
/** @brief Function object to generate an increasing sequence of natural numbers.
  */
class IotaGen {
public:
   IotaGen( unsigned start = 0 ): current( start ) { }
   unsigned operator() () { return current++; }
private:
   unsigned current;
};

// -----------------------------------------------------------------------------
/** @brief Determine if a given integral number is power of two.
  */
inline bool IsPowerOf2( int n )
{
   return (n & -n) == n;
}

// -----------------------------------------------------------------------------
/** @brief Calculate the next power of 2 of a given integral number.
  */
inline unsigned NextPowerOf2( unsigned n )
{
   n--;
   n |= n >> 1;  // handle  2 bit numbers
   n |= n >> 2;  // handle  4 bit numbers
   n |= n >> 4;  // handle  8 bit numbers
   n |= n >> 8;  // handle 16 bit numbers
   n |= n >> 16; // handle 32 bit numbers
   n++;

   return n;
}

// -----------------------------------------------------------------------------
} // end namespace
// -----------------------------------------------------------------------------

#endif

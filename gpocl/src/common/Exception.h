// ---------------------------------------------------------------------
// $Id$
//
//   Exception.h
// 
//   Genetic Programming in OpenCL (gpocl)
//
//   Copyright (C) 2010 Douglas Adriano Augusto
// 
// This file is part of gpocl.
// 
// gpocl is free software; you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software
// Foundation; either version 3 of the License, or (at your option) any later
// version.
// 
// gpocl is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
// details.
// 
// You should have received a copy of the GNU General Public License along with
// gpocl; if not, see <http://www.gnu.org/licenses/>.
//
//----------------------------------------------------------------------------

#ifndef _exception_h
#define _exception_h 

#include <string>
#include <sstream>
#include <exception>

//namespace GPC { // (G)enetic (P)rogramming (C)lassifier

//----------------------------------------------------------------------------
#ifdef NDEBUG
   const bool debug = false;
#else 
   const bool debug = true;
#endif

class Exception;

//----------------------------------------------------------------------------
/**
 * Exception base class.
 */
class Exception: std::exception { 
public:
  /**
   * Create an exception with an optional message "L" and an
   * error message "M".
   */
  Exception( const std::string& L = "", const std::string& M = "" )
             : m_loc( L ), m_msg( M ) {}

  virtual ~Exception() throw() {};
  /**
   * Return the error message.
   */
  virtual const char* what() const throw() { return m_msg.c_str(); }
  /** 
   * Return the user message. 
   */
  virtual const std::string& local() const throw() { return m_loc; }

  /** 
   * Set the local message.
   */
  virtual std::string& local( const std::string& l ) throw() { 
     m_loc = l; return m_loc;
  }

protected:
  std::string m_loc;
  std::string m_msg;
};

//----------------------------------------------------------------------------
inline std::ostream&
operator<<( std::ostream& o, const Exception& e )
{
   o << '\n' << "> Error: " << e.what();
   if( !e.local().empty() ) o << " [" << e.local() << "]";
   o << std::endl;

   return o;
}

//----------------------------------------------------------------------------
template<class X, class A> inline void Assert( A expression )
{
   if( debug && !expression ) throw X();
} 

inline void Assert( bool expression )
{
   Assert<Exception>( expression );
}

//----------------------------------------------------------------------------
//} // namespace GPC
//----------------------------------------------------------------------------

#endif

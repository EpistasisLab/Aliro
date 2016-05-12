// ---------------------------------------------------------------------
// $Id$
//
//   CmdLineException.h (created on Tue Aug 23 01:08:35 BRT 2005)
// 
//   Command-line Parser
//
//   Copyright (C) 2006-2008 Douglas Adriano Augusto (daaugusto)
// 
// This file is part of Command-line Parser.
//
// Command-line Parser is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published
// by the Free Software Foundation; either version 3 of the License, or (at
// your option) any later version.
// 
// Command-line Parser is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
// Public License for more details.
// 
// You should have received a copy of the GNU General Public License along
// with Command-line Parser; if not, see <http://www.gnu.org/licenses/>.
//
// ------------------------------------------------------------------------

#ifndef cmdline_exception_h
#define cmdline_exception_h 

#include <string>
#include <sstream>
#include <limits>
#include <exception>
#include <list>

namespace CmdLine {

class E_Exception;

//----------------------------------------------------------------------
/**
 * Exception base class.
 */
class E_Exception: std::exception { 
public:
  /**
   * Create an exception with an optional message "L" and an
   * error message "M".
   */
  E_Exception( const std::string& L = "", const std::string& M = "" )
            : m_msg( M ), m_loc( L ) {}

  virtual ~E_Exception() throw() {};
  /** 
   * Return the user message. 
  */
  virtual const char* local() { return m_loc.c_str(); }
  /**
   * Return the error message.
   */
  virtual const char* what() const throw() { return m_msg.c_str(); }

protected:
  std::string m_msg; /**< The error message. */
  std::string m_loc; /**< Optional message, such as the name of the
                          function where throw was called. */
};

//----------------------------------------------------------------------
inline std::ostream&
operator<<( std::ostream& o, const E_Exception& e )
{
   o << '\n' << "> Error: " << e.what() << std::endl;
   return o;
}

//-----------------------------------------------------------------------------
/**
 * When a Max value is smaller than a given Min value.
 *
 * Usage: if (max<min) throw E_MaxMin<type>(min, max,"optional text");
 */
template<class T> class E_MaxMin : public E_Exception {
public:  
   E_MaxMin (T min, T max, const std::string& loc = "")
   { 
      std::ostringstream o;

      o << loc << "'max' (" << max << ") smaller than 'min' (" << min << ")" 
        << ", feasible range: ["<< std::numeric_limits<T>::min() << ":"
                                << std::numeric_limits<T>::max() << "]";

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
/**
 * When a value is not provided or it is incompatible
 *
 * Usage: throw E_NoValue("option");
 */
class E_NoValue : public E_Exception {
public:  
   E_NoValue( const std::string& loc = "" )
   { 
      std::ostringstream o;

      o << loc << ": a value was not provided or it is incompatible.";

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
/**
 * When a value is out of a defined range.
 *
 * Usage: throw E_OutOfRange<type>(min, max,"optional text");
 */
template<class T> class E_OutOfRange : public E_Exception {
public:  
   E_OutOfRange (T value, T min, T max, const std::string& loc = "")
   { 
      std::ostringstream o;

      o << loc << ": value " << value << " is out of range" 
        << ", feasible range: ["<< min << ":"
                                << max << "]";

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
/**
 * When a value is out of a defined range.
 *
 * Usage: throw E_OutOfRange<string>("value", m_range, "arg" );
 */
template< > class E_OutOfRange<std::string> : public E_Exception {
public:  
   E_OutOfRange<std::string>( const std::string& value, const 
            std::list<std::string>& range, const std::string& arg = "" )
   { 
      std::ostringstream o;

      std::list<std::string>::const_iterator it = range.begin(); 
      o << arg << ": value '" << value << "' is out of range. Allowed values:";
      while( it != range.end() ) o << " '" << *it++ << "'";

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
/**
 * When a value is out of a defined range.
 *
 * Usage: throw E_OutOfRange<char>("value", m_range, "arg" );
 */
template< > class E_OutOfRange<char> : public E_Exception {
public:  
   E_OutOfRange<char>( const char* value, const char* range, 
                                          const std::string& arg = "" )
   { 
      std::ostringstream o;

      o << arg << ": value '" << value << "' is out of range. Allowed values:";
      for( int i = 0; range[i] != '\0'; ++i ) { o << " '" << range[i] << "'"; }

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
/**
 * When a option is declared twice (or more) times.
 *
 * Usage: throw E_Duplicate( "option" );
 */
class E_Duplicate: public E_Exception {
public:  
   E_Duplicate( const std::string& loc = "" )
   { 
      std::ostringstream o; o << loc << ": duplicate option.";

      m_msg = o.str();
   }
};

//-----------------------------------------------------------------------------
} // end namespace scope
//-----------------------------------------------------------------------------
#endif

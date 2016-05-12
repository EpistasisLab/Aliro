// ---------------------------------------------------------------------------
// $Id$
//
//   CmdLineParser.h (created on Tue Aug 8 11:01:58 BRT 2006)
// 
//   Command-line Parser
//
//   Copyright (C) 2006-2008 Douglas Adriano Augusto (daaugusto)
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

#ifndef cmd_line_parser_h
#define cmd_line_parser_h

/** @file CmdLineParser.h
 *
 * Reads and extracts options/args from the command-line (via argv/argc).
 *
   Example:
   @code
     int main( int argc, char** argv )
     {
       CmdLine::Parser Opts( argc, argv );
  
       // declaring a boolean option with an alias (optional)
       Opts.Bool.Add( "-h", "--help" );
  
       // an integer option (without alias) with default, min and max values
       Opts.Int.Add( "-n","",5, 0, 10 );
  
       // a float (float/double/long double) option
       Opts.Float.Add( "--float", "--float-option" ,1.0, -10.0, 10.0 );
  
       // a char option that specifies a set of valid characters
       Opts.Char.Add( "--letter", "", "A", "abcABC" );
  
       // a string option
       Opts.String.Add( "-s", "--string-option", "default string" );
  
       // another string option, but it specifies a range of values
       Opts.String.Add( "--rgb-color", "", "red", "red", "green" ,"blue", NULL );
  
       // ...
  
       // it will contain the unrecognized options/arguments
       vector<const char*> remains;
  
       // processing the command-line
       Opts.Process( remains );
  
       // getting the results!
       if (Opts.Bool.Get("-h")) cout << "-h is set" << endl;
  
       if (!Opts.Int.Found("-n")) 
          cout << "-n not declared, using default." << endl;
  
       int integer = Opts.Int.Get("-n");
       cout << "Value for '-n': " << integer << " As short int: "
            << Opts.Int.Get<short int>("-n") << endl;
  
       cout << "Value for '-s': " << Opts.String.Get("-s") << endl;
  
       // ...
  
       cout << "\nUnrecognized arguments:" << endl;
  
       list<const char*>::const_iterator ci = remains.begin();
       while (ci != remains.end()) cout << *ci++ << endl;
     }
   @endcode
  
   For the code above, for example:
   @verbatim
   $ ./a.out -h --string-option "abc" item1 item2
   -h is set
   -n not declared, using default.
   Value for '-n': 5
   Value for '-s': abc
  
   Unrecognized arguments:
   item1
   item2
   @endverbatim
  
   Other features:
  
   @li A command-line with '--' makes the remaining parameters "unrecognized" 
       a priori, i.e., stops the searching/processing for options.

   @li Using an option with a minus sign after the name cancels the previous
       declaration (if any). For instance, '-x-' (or '--blahblah-') turns off
       the previous declaration of '-x' (or '--blahblah').

   @li If an option is declared two or more times, the last is used.

   @li 'Char' options allow special characters such as '\\0', '\\n', etc.
*/

/**
 * @page page1 Command-line Parser: General Documentation
 
   There are four steps for a complete parsing of the command-line
   arguments:

     -# Initialization (@ref sec1)
     -# Options inclusion (@ref sec2)
     -# The parsing itself (@ref sec3)
     -# Getting the values of the options (@ref sec4)

   @section sec1 Initialization

   In the initialization phase it is given to parser two variables: (1)
   an integer indicating the @e number of strings (tokens) provided; (2)
   the <tt>char** argv</tt>, containing a null-terminated list of
   strings (the command-line itself). There are two ways to call the
   @ref CmdLine::Parser constructor:

   @code
   CmdLine::Parser Opts( argc, argv );
   @endcode
   
   that creates the parser object Opts over the command-line argv.
   Also, one could pass some flags:
   
   @code
   CmdLine::Parser Opts( m_argc, m_argv, CmdLine::SILENT | 
                         CmdLine::OUT_OF_RANGE | CmdLine::NO_VALUE );
   @endcode

   The possible flags are:

     - @b NONE just an alias to zero (0). To be used as Flags( CmdLine::NONE )
       in order to clear the current flags.
     - @b SILENT if set don't print warning messages to cerr (stderr).
     - @b OUT_OF_RANGE throw a fatal exception (@ref CmdLine::E_OutOfRange)
       when a value is out of a certain range provided by the user. If not
       set, then the @b default value (provided by the user) is used when
       a argument value is out of range.
     - @b NO_VALUE throw a fatal exception (@ref CmdLine::E_NoValue) when no
       value is found for an option that requires argument. If not set, that
       option will be @b ignored and considered not found (Found() will return
       false).
     - @b DUPLICATE throw an error when an option is declared twice (or more)
       times in command-line.
     - @b FIRSTONLY pick up the first declaration only (discards all duplicates).

   @section sec2 Declaring the Options

   An user may specify five types of option: @b boolean (Bool), @b integer (Int),
   @b float (Float), @b char (Char), and @b string (String) options.

   The basic declaration format is: <tt>Object.<type>.Add( "--option-name" )</tt>.
   For instance:

   @code
   Opts.Bool.Add( "-h" );
   @endcode

   will declare a boolean option labeled @c "-h". You can also create an alias 
   for an option:

   @code
   Opts.Bool.Add( "-h", "--help" );
   @endcode

   so the following two command-lines are equivalent:

   @verbatim
   program -h
   program --help
   @endverbatim

   For the @e integer and @e float options it is possible to provide a default 
   value and a range of accepted values (min and max). For example:

   @code
   Opts.Int.Add( "-age", "", 18, 10, 65 );
   Opts.Float.Add( "-f", "--float", 3.14, -1.0, numeric_limits<float>::max() );
   @endcode

   will declare an option labeled @c -age with no alias, default value @c 18,
   minimum value @c 10 and maximum allowed value @c 65. Analogically, a float
   option @c -f/--float is declared with a maximum value defined as the maximum
   value supported by a primitive float type.

   The @b Char and @b String options go further allowing the specification, 
   respectively, of a set of valid characters or strings. For instance, the
   code:

   @code
   Opts.Char.Add( "-c", "", 'a', "abcXYZ\n" );
   @endcode

   declares an option '-c' with default value 'a' and allows one of 'a', 'b',
   'c', 'X', 'Y', 'Z', and '\\n' chars. If the user gives a value not in this
   valid set, the default value 'a' is used or an exception out of range is 
   thrown (if @c OUT_OF_RANGE is set).

   The String type uses a slightly different mode:

   @code
   Opts.String.Add( "-s", "", "low", "low", "high", NULL );
   @endcode

   In the above declaration, the valid values for -s are "low" and "high";
   the default is "low".

   @attention Since that version of the Add function allows variable
   number of arguments, the keyword @b NULL is required in order to
   close the list of valid strings. An unexpected error will be caused
   if you forget that.

   Also, one can specify custom flags to each option. E.g.:

   @code
   // Adding flags (use the operator | to add more than one at a time):
   Opts.Int.Add( "-i", "--int" ).Set( CmdLine::NO_VALUE );

   // Unsetting flags:
   Opts.Int.Add( "-i", "--int" ).UnSet( CmdLine::NO_VALUE );
   
   // Reseting default flags and adding specific ones:
   Opts.Int.Add( "-i", "--int" ).Flags( CmdLine::SILENT | CmdLine::NO_VALUE );

   // Reseting all default flags:
   Opts.Int.Add( "-i", "--int" ).Flags( CmdLine::NONE );
   @endcode

   Unsetting the @c NO_VALUE helps one to declare two options (one being
   boolean) with the same name in order to simulate an option that behaves
   either as not requiring arguments (boolean type) as requiring arguments.
   For instance, consider:

   @code
   // Declaration
   Opts.Bool.Add( "--print" );
   Opts.Int.Add( "--print" ).UnSet( CmdLine::NO_VALUE );

   // Parsing
   Opts.Process();

   // Getting the values
   int item = Opts.Int.Get( "--print" );
   bool to_print = Opts.Bool.Get( "--print" ) || Opts.Int.Found( "--print" );
   @endcode

   In the above code, the user wants to be able do specify on the command-line,
   for instance, just '--print' or '--print 5'. If the user types '--print',
   then the variable @c to_print will be @c true, but @c item will have the
   default value declared in the Int option (in this case 0). If the user types
   '--print 5', @c to_print will be @c true while @c item will contain the
   value 5. 

   @section sec3 Parsing

   The parsing is done by the @ref Parser::Process() function. It searches the
   command-line, store the values of the arguments of each declared option and
   finally returns the number of found (matched) options.

   If the user wants to access the unrecognized options--like filenames--, it
   is possible to pass a STL container as argument of Process(), e.g.:

   @code
   vector<string> residue;
   Opts.Process( residue ); // will fill residue with the unrecognized tokens
   @endcode

   One could also @c char* and <tt>const char*</tt> instead of @c
   string. Moreover, Process( T& ), being a template function, will
   accept any container provided that it implements @c clear() and @c
   push_back() member functions.

   @section sec4 Getting the Values

   Finally, the processed values of the arguments of the options can be
   accessed by the Get() function. Also, finding out whether an
   option was found or not may be useful; this can be achieved by the function
   Found( "option label" ). Consider the examples below:

   @code
   if( Opts.Bool.Get( "-h" ) ) { ShowHelp(); return; }
   
   // If not provided by the user, it returns the default value
   int age = Opts.Int.Get( "-age" );

   // Alternative mode
   int age;
   bool found = Opts.Int.Get( "-age", age );
   if( found )
      cout << "The age is: " << age;
   else
      cout << "-age option not provided."

   // Still, if the user just needs to know whether an option was
   // provided on the command-line:
   if( Opts.Int.Found( "-age" ) ) cout << "Age not specified."
   @endcode
*/

#include <string>
#include <sstream>
#include <list>
#include <limits>
#include <map>
#include <cstring>
#include <iostream>

#include "CmdLineException.h"

// ---------------------------------------------------------------------
namespace CmdLine {

/** Default type for the <b>float</b> options */
typedef long double FLOAT;

/** Default type for the <b>integer</b> options */
typedef long INT;

/** @enum */
enum { NONE = 0,         /**< Alias to zero (0) */
       SILENT = 1,       /**< if set, don't print warnings to stderr. */
       OUT_OF_RANGE = 2, /**< Throw an out of range exception if an 
                              option value is out of its defined range. */
       NO_VALUE = 4,     /**< Throw an error when an option is found 
                              in command-line but its value is either 
                              incompatible or unspecified. */
       DUPLICATE = 8,    /**< Throw an error when an option is declared twice
                              (or more) times in command-line. */
       FIRSTONLY = 16    /**< Pick up the first declaration only (discards all
                              duplicates). */
};

// ---------------------------------------------------------------------
/** 
 * Holds the current value, min and max values for an option.
 */
template<class T> class Option {
public:
   Option( T def, T min, T max ) 
      : m_value( def ), m_min( min ), m_max( max ),
        m_found( false ), m_has_alias( false ), m_flags( 0 ) {}

public:
   T m_value, /**< Current value (the last encountered) for the option. */
     m_min, /**< Minimum allowed value (only for numerical types).*/
     m_max; /**< Maximum allowed value (only for numerical types).*/

   bool m_found; /**< @c true if the option was provided on the 
                   command-line; @c false otherwise. */
public:
   /** @brief Check if one or more flags are set. 
    *
    *  @param flag The flag to be checked. To check for more than one flag at a
    *  time, use the operator @b | (or).
    *  @return @c true if @c flag is set; @c false otherwise.
    **/
   bool IsSet( unsigned flag ) const { return m_flags & flag; }

   /** @brief Set one or more flags.
    *
    *  @param flag The flag to be set. To set more than one flag at a time, use
    *  the operator @b | (or).
    *  @return The current object @c Option<T>.*/
   Option<T>& Set( unsigned flag ) { return m_flags |= flag, *this; }
   
   /** @brief Unset one or more flags.
    *
    *  @param flag The flag to be unset. To unset more than one flag at a time,
    *  use the operator @b | (or).
    *  @return The current object @c Option<T>.*/
   Option<T>& UnSet( unsigned flag ) { return m_flags &= ~flag, *this; }

   /** @brief Reset the current flags and set new ones.
    *
    *  @param flag The flag to be set. To set more than one flag at a time, use
    *  the operator @b | (or).
    *  @return The current object @c Option<T>.*/
   Option<T>& Flags( unsigned flag ) { return m_flags = flag, *this; }

public:
   /**
    * Indicate if this option has an alias. Used to avoid double free
    * corruption during memory deallocation. 
    *
    * @see OptionsType::~OptionsType()
    */
   bool m_has_alias;
private:
   unsigned m_flags; /**< Custom flags for this option. Currently may hold
                          NONE, SILENT, OUT_OF_RANGE and NO_VALUE flags */
};

// ---------------------------------------------------------------------
/**
 * Base class for the five types of options: Bool, Integer, Float, Char
 * and String.
 */
template <class T> class OptionsType {
public:
   /**
    * @param[in] parser Reference to the Parser object that owns this
    * OptionsType object.
    */
   OptionsType( const class Parser& parser ): m_parser( parser ) {}

   /**
    * Just for maintaining the code clean.
    */
   typedef typename std::map<std::string, void*>::const_iterator CI;

   /**
    * Add an option into @ref m_opts, checking for errors. Actually
    * m_opts holds just the name/alias (sorted), which then link to an
    * Option<T> object:
    *
    * @verbatim
    ...
    [name_option_1]  ------> | Option<T> |
    ...                   /  |   object  | 
    [alias_option_1] ----/    (values of 
    ...                        option_1)
    @endverbatim
    */
   Option<T>& Add(const std::string& name, const std::string& alias="", 
                          T def=T(), T min=T(), T max=T() )
   {
      CheckOption( name, alias );

      void* tmp = new Option<T>( def, min, max );
      m_opts[name] = tmp;

      if( alias.size() > 0 ) // was provided an alias?
      {
         m_opts[alias] = tmp;
         static_cast<Option<T>*>( tmp )->m_has_alias = true;
      }

      return *static_cast<Option<T>*>( tmp );
   }

   /** 
    * Return the value of option 's'. If 's' is not found in
    * command-line (or not in range [min:max]) then @c default value
    * is returned.
    *
    * @param[in] s The option's label
    * @return The option's value
    */
   T Get( const std::string& s ) const
   {
      const Option<T>* p = Find( s ); if( p ) return p->m_value;

      throw E_Exception("","Option "+s+" does not exist");
   }

   /**
    * Overloaded version of Get( const std::string& ) that puts the
    * option argument value in the given parameter @c value and returns
    * true if option @c s was provided on the command-line; false
    * otherwise.
    *
    * @param[in] s The option's label/name
    * @param[out] value The option's value 
    * @return true if matched; false otherwise
    */
   bool Get( const std::string& s, T& value ) const
   {
      const Option<T>* p = Find( s ); 

      if( p ) {
         value = p->m_value;
         return p->m_found;
      }

      throw E_Exception("","Option "+s+" does not exist");
   }

   /**
    * Simplified interface to perform casting. At times it is necessary
    * to convert a INT (possibly "long int") into 'short int', for
    * instance.
    */
   template<class C> C Get( const std::string& s ) const
   {
      return static_cast<C>( Get( s ) );
   }

   /** Same as above but it returns both the option's value and if the
    * option was found on the command-line. */
   template<class C> bool Get( const std::string& s, C& value ) const
   {
      const Option<T>* p = Find( s ); 

      if( p ) {
         value = static_cast<C>( p->m_value );
         return p->m_found;
      }

      throw E_Exception("","Option "+s+" does not exist");
   }

   /**
    * Returns true if the option specified as 's' was found in
    * command-line parameters. Returns false otherwise.
    *
    * @attention It isn't recommended to call Found() followed by Get()
    * because doing so two calls to Find() are being performed. Instead,
    * prefer to use bool Get( const std::string&, T& ), in which just a
    * single call to Find() is performed.
    */
   bool Found( const std::string& s ) const
   {
      const Option<T>* p = Find( s ); if( p ) return p->m_found;

      throw E_Exception("","Option "+s+" does not exist");
   }

public:
   /** This reference provides access to Parser member
    * objects/variables. Passing a reference to Parser is
    * preferable to declaring its member objects as static. 
    */
   const class Parser& m_parser;

protected:
   /**
    * Memory deallocation for Option<T> objects. First checks if the
    * object has two shared references (when an alias is used), making
    * sure that only one reference (pointer) will be deleted.
    */
   virtual ~OptionsType()
   {
      for( CI p = m_opts.begin(); p != m_opts.end(); ++p )
      {
         if( Cast(p)->m_has_alias ) { Cast(p)->m_has_alias = false; continue; }

         delete Cast(p);
      }
   }

   /**
    * Make sure that an option name/alias begins with minus sign.
    */
   void CheckOption( const std::string& name, const std::string& alias ) const
   {
      if( name[0] != '-' )
         throw E_Exception( "","Invalid option name: '"+name+"'" );

      if( alias.size() > 0 && alias[0] != '-' )
         throw E_Exception( "","Invalid option alias: '"+alias+"'" );
   }

   /**
    * Performs a static_cast from a void pointer, returning the
    * correct type of option.
    */
   Option<T>* Cast( CI p ) const { return static_cast<Option<T>*>(p->second); }

   /**
    * Try to find an option 's' and returns its pointer. The binary
    * search--provided by std::map--is used.
    */
   Option<T>* Find( const std::string& s ) const
   { 
      CI p = m_opts.find(s); return p != m_opts.end() ? Cast(p) : 0;
   }

   /**
    * @brief Check if an option was declared before.
    *
    * @param p Pointer to option to be checked
    * @param opt Option's name
    * @return @c true if one should accept the option; @c false otherwise.
    *
    * If flag @c DUPLICATE is set then a fatal exception is thrown if the option
    * was declared before. If flag @c FIRSTONLY is set then the function
    * returns @c false indicating that this duplicate declaration is to be
    * ignored.
    */
   bool CheckDuplicate( const Option<T>* p, const std::string& opt ) const
   {
      if( p->m_found ) // already declared before?
      {
         if( p->IsSet( DUPLICATE ) ) throw E_Duplicate( opt );

         if( !p->IsSet( SILENT ) )
            std::cerr << "> Option '" << opt 
                      << "' was declared more than once.\n";

         return !p->IsSet( FIRSTONLY );
      }

      return true; // ok, not declared before
   }

private:
   /**
    * Database of options of type T (Bool, Int, Float, Char or String).
    * STL 'map' object provides fast search via 'binary search'.
    */
   std::map<std::string, void*> m_opts;
};

class Parser;

// ---------------------------------------------------------------------
/**
 * Integer options.
 */
class OptionsINT: public OptionsType<INT> {
public:
   OptionsINT( const Parser& parser ): OptionsType<INT>( parser ) {}
   
   Option<INT>& Add( const std::string&, const std::string& = "", 
                     INT = 0, INT = std::numeric_limits<INT>::min(), 
                     INT = std::numeric_limits<INT>::max() );
   /**
    * Try to identify an integer option in command-line and then add it
    * (together its int argument) into @ref m_opts.
    */
   bool Match( int&, char**, int );

};

// ---------------------------------------------------------------------
/**
 * Float options.
 */
class OptionsFLOAT: public OptionsType<FLOAT> {
public:
   OptionsFLOAT( const Parser& parser ): OptionsType<FLOAT>( parser ) {}

   Option<FLOAT>& Add( const std::string&, const std::string& = "", 
                       FLOAT = 0.0, FLOAT = -std::numeric_limits<FLOAT>::max(), 
                       FLOAT = std::numeric_limits<FLOAT>::max() );

   /**
    * Try to identify a float option in command-line and then add it
    * (together its float argument) into @ref m_opts.
    */
   bool Match( int&, char**, int );

   /** Class OptionsINT needs to access OptionsFLOAT::Find() in order to
    * check if there exists a FLOAT option with the same name. */
   friend bool OptionsINT::Match( int&, char**, int );
};

// ---------------------------------------------------------------------
/**
 * Boolean options.
 */
class OptionsBOOL: public OptionsType<bool> {
public:
   OptionsBOOL( const Parser& parser ): OptionsType<bool>( parser ) {}
   /**
    * Try to identify a bool option in command-line and then add it
    * into @ref m_opts.
    */
   bool Match( int&, char**, int );
};

// ---------------------------------------------------------------------
/**
 * Char options.
 */
class OptionsCHAR: public OptionsType<char> {
public:
   OptionsCHAR( const Parser& parser ): OptionsType<char>( parser ) {}

   /** This function allows a certain range of chars (null terminated
    * string) to be specified. If the found value doesn't match one of
    * these chars, then the default value is used.
    *
    * @param[in] name The option's label
    * @param[in] alias The option's alias
    * @param[in] def The option's default value
    * @param[in] range An array of characters that defines the set of
    * allowed chars
    * @param[in] include_null_char If the NULL char is one of the
    * allowed values of the option, set this parameter to @c true
    *
    * Example usage: 
    *
    * @code
    * Bool.Add("-c", "--char", 'a", "abc");
    * @endcode
    *
    * In this example the default char is 'a' and the allowed chars are
    * 'a', 'b' and 'c'. If the user gives, for instance, '--char d',
    * then Bool.Get("-c") will return 'a' rather than 'd'.
    *
    * If you want to add the NULL char (\\0) as a valid value, then calls
    * Bool.Add as follows:
    *
    * @code
    * Bool.Add("-c", "--char", 'a", "abc", true);
    * @endcode
    */
   Option<char>& Add( const std::string&, const std::string& = "", char =
                           '\0', const char* = 0, bool = false );

   /**
    Try to identify a char option in command-line and then add it
    (together its char argument) into @ref m_opts.
    
    Some input combinations are interpreted as special characters:
    
    @verbatim
    \0 = null byte
    \a = bell character
    \b = backspace
    \f = formfeed
    \n = newline
    \r = carriage return
    \t = horizontal tab
    \v = vertical tab
    \\ = backslash
    @endverbatim
   */
   bool Match( int&, char**, int );

private:
   std::map<std::string, std::pair<const char*, bool> > m_ranges;
};

// ---------------------------------------------------------------------
/**
 * String options.
 */
class OptionsSTRING: public OptionsType<std::string> {
public:
   OptionsSTRING( const Parser& parser ): OptionsType<std::string>( parser ) {}

   /**
    * @attention Do not forget to end the sequence with @b NULL. For
    * instance:
    *
    * @code
    * String.Add( "-s", "--str", "name1", "name2", NULL );
    * @endcode
    */
   Option<std::string>& Add( const std::string&, const std::string& = "", 
                             std::string = "", const char* first = 0, ... );

   /**
    * Try to identify a string option in command-line and then add it
    * (together its string argument) into @ref m_opts.
    */
   bool Match( int&, char**, int );

private:
   std::map<std::string, std::list<std::string> > m_ranges;
};

// ---------------------------------------------------------------------
/**
 * The user interface for the command-line parser.
 */
class Parser {
public:
   /**
    * Starts the command-line parser.
    *
    * @param[in] argc The number of tokens in the command-line
    * @param[in] argv The array of string of tokens (in fact, the command-line)
    * @param[in] flags Flags controlling the behaviour of the Parser
    * regarding verbosity, out of range occurrences and absence of
    * values for options requiring arguments (@ref CmdLine::SILENT,
    * CmdLine::OUT_OF_RANGE, and CmdLine::NO_VALUE)
    */
   Parser( int argc, char** argv, unsigned flags = 0 ): 
           Int( *this ), Float( *this ), Bool( *this ), Char( *this ), 
           String( *this ), m_argc( argc ), m_argv( argv ), m_flags( flags ) 
   { }

   /**
    * After added all options then this function process the command-line
    * parameters searching for options and their arguments.
    *
    * @return The number of matched options
    */
   int Process();

   /** 
    * This version of Process() accepts a container of 'const char*',
    * 'char*' or 'string' type that will holds the remaining command-line
    * tokens, i.e, those that do not matched.
    *
    * For example:
    *
    * @code
    * (...)
    * vector<string> remaining;
    *
    * int matched = Opts.Process( remaining );
    *
    * vector<string>::const_iterator ci = remaining.begin();
    *
    * cout << "\nMatched: " << matched << " Unrecognized: " << remaining.size();
    * cout << "\nUnrecognized arguments:\n";
    * while( ci != remaining.end() ) cout << *ci++ << endl;
    * @endcode
    *
    * @warning The container must provide the clear() and push_back()
    * functions.
    */
   template<class T> int Process( T& );

   /** @brief Check if one or more flags are set. 
    *
    *  @param flag The flag to be checked. To check for more than one flag at a
    *  time, use the operator @b | (or).
    *  @return @c true if @c flag is set; @c false otherwise.
    **/
   bool IsSet( unsigned flag ) const { return m_flags & flag; }

   /** @brief Set one or more flags.
    *
    *  @param flag The flag to be set. To set more than one flag at a time, use
    *  the operator @b | (or).
    *  @return The current object @c Parser.*/
   Parser& Set( unsigned flag ) { return m_flags |= flag, *this; }
   
   /** @brief Unset one or more flags.
    *
    *  @param flag The flag to be unset. To unset more than one flag at a time,
    *  use the operator @b | (or).
    *  @return The current object @c Parser.*/
   Parser& UnSet( unsigned flag ) { return m_flags &= ~flag, *this; }

   /** @brief Reset the current flags and set new ones.
    *
    *  @param flag The flag to be set. To set more than one flag at a time, use
    *  the operator @b | (or).
    *  @return The current object @c Parser.*/
   Parser& Flags( unsigned flag ) { return m_flags = flag, *this; }

public:
   class OptionsINT Int; /**< A database of integer options. */
   class OptionsFLOAT Float; /**< A database of float options. */
   class OptionsBOOL Bool; /**< A database of boolean options. */
   class OptionsCHAR Char; /**< A database of char options. */
   class OptionsSTRING String; /**< A database of string options. */

   friend class OptionsINT;
   friend class OptionsFLOAT;
   friend class OptionsBOOL;
   friend class OptionsCHAR;
   friend class OptionsSTRING;
private:
   int m_argc; /**< Number of command-line "tokens". */
   char** m_argv; /**< The "command-line" (pointer to) itself. */
   unsigned m_flags; /**< Currently may hold SILENT, OUT_OF_RANGE and 
                          NO_VALUE flags */
};

// ---------------------------------------------------------------------
template<class T> int Parser::Process( T& remains )
{
   remains.clear(); int i = 1, matched = 0;

   while( i < m_argc )
   {
      if( !strcmp( m_argv[i], "--" ) ) break; // "--" stops the option processing

      if( m_argv[i][0] == '-' && ( Int.Match( i, m_argv, m_argc ) || 
          Float.Match( i, m_argv, m_argc ) || Bool.Match( i, m_argv, m_argc ) || 
          Char.Match( i, m_argv, m_argc ) || String.Match( i, m_argv, m_argc ) ) )
      {
         ++matched;
      }
      else remains.push_back( m_argv[i] ); // not a valid option

      ++i;
   }

   // only if encountered "--": do not process the remaining
   while( ++i < m_argc ) { remains.push_back( m_argv[i] ); }

   return matched;
}

// ---------------------------------------------------------------------
} // end namespace CmdLine
// ---------------------------------------------------------------------
#endif

// ------------------------------------------------------------------------
// $Id$
//
//   CmdLineParser.cc (created on Tue Aug  8 11:01:58 BRT 2006)
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

#include <algorithm>

#include <cstdarg> // for va_list, va_star, and va_end

#include "CmdLineParser.h"

using namespace CmdLine;

// ---------------------------------------------------------------------------
Option<INT>&
OptionsINT::Add( const std::string& name, const std::string& alias, INT def, 
                 INT min, INT max )
{
   if( max < min ) throw E_MaxMin<INT>( min, max, "Option " + name + ": " );

   // calls the base Add function
   return OptionsType<INT>::Add( name, alias, def, min, max ).
                                                     Flags( m_parser.m_flags );
}

// ---------------------------------------------------------------------------
Option<FLOAT>& 
OptionsFLOAT::Add( const std::string& name, const std::string& alias, 
                   FLOAT def, FLOAT min, FLOAT max )
{
   if( max < min ) throw E_MaxMin<FLOAT>( min, max, "Option " + name + ": " );

   // calls the base Add function
   return OptionsType<FLOAT>::Add( name, alias, def, min, max ).
                                                     Flags( m_parser.m_flags );
}

// ---------------------------------------------------------------------------
Option<char>& 
OptionsCHAR::Add( const std::string& name, const std::string& alias, char def,
                  const char* range, bool include_null_char )

{
   m_ranges[name] = std::pair<const char*, bool>(range, include_null_char);

   // calls the base Add function
   return OptionsType<char>::Add( name, alias, def ).Flags( m_parser.m_flags );
}

// ---------------------------------------------------------------------------
Option<std::string>& 
OptionsSTRING::Add( const std::string& name, const std::string& alias, 
               std::string def, const char* first, ... )
{
   std::list<std::string> range;

   if( first ) // check if a list of strings was provided
   {
      const char* str;
      va_list vl;

      str = first;
      va_start( vl, first );

      do 
      {
         range.push_back( std::string( str ) );
         str = va_arg( vl, const char* );
      } while( str != NULL ); // don't work with Zero (0), use NULL

      va_end(vl);
   }

   if( !range.empty() ) m_ranges[name] = range;

   // calls the base Add function
   return OptionsType<std::string>::Add( name, alias, def ).
                                                     Flags( m_parser.m_flags );
}

// ---------------------------------------------------------------------------
bool 
OptionsINT::Match( int& i, char** argv, int argc )
{
   // try to find
   Option<INT>* p = Find( argv[i] );

   if( p ) // found in the database of options OptionsType.m_opts
   {
      // try to convert the option arg to 'int'
      if( i + 1 < argc )
      {
         std::istringstream s( argv[i + 1] ); INT tmp;

         if( !(s >> std::dec >> tmp).fail() ) // ok, successful conversion 
         {
            /* This is a special case. Although the provided value could
             * be converted to an integer type, if the value is real
             * (float) and there is a FLOAT option with the same name, 
             * then we ignore it and the function returns false, i.e.,
             * "that option was not found in the database of options". */
            if( std::string( argv[i + 1] ).find( '.' ) != std::string::npos &&
                                              m_parser.Float.Find( argv[i] ) )
                  return false;

            /* If argv[i] is duplicate, check if we may continue. If not, dis-
             * card its argument (++i) and return true (found, but ignored).*/
            if( !CheckDuplicate( p, argv[i] ) ) { ++i; return true; }

            p->m_found = true; /* an useful/complete option (it has correct value)
                                  found in the command-line. */

            if( tmp >= p->m_min && tmp <= p->m_max ) 
               p->m_value = tmp;
            else {
               if( p->IsSet( OUT_OF_RANGE ) )
                  throw E_OutOfRange<INT>( tmp, p->m_min, p->m_max, argv[i] );

               if( !p->IsSet( SILENT ) )
                  std::cerr << "> [Ignoring] Option '" << argv[i] << 
                               "': value out of range." << std::endl;
            }

            // if used then "eat the argument"
            ++i;

            // ok, there was used tmp or the default value
            return true;
         } 
      }

      /* Option found in command-line, but was a compatible value found
       * either? */
      if( !p->m_found && p->IsSet( NO_VALUE ) ) throw E_NoValue( argv[i] );
   }
   return false;
}

// ---------------------------------------------------------------------
bool 
OptionsFLOAT::Match( int& i, char** argv, int argc )
{
   // try to find
   Option<FLOAT>* p = Find( argv[i] );

   if( p ) // found in the database of options OptionsType.m_opts
   {
      // try to convert the option arg to 'FLOAT'
      if( i + 1 < argc )
      {
         std::istringstream s( argv[i + 1] ); FLOAT tmp;

         if( !(s >> std::dec >> tmp).fail() ) // ok, successful conversion
         {
            /* If argv[i] is duplicate, check if we may continue. If not, dis-
             * card its argument (++i) and return true (found, but ignored).*/
            if( !CheckDuplicate( p, argv[i] ) ) { ++i; return true; }

            p->m_found = true;

            // Check the range
            if( tmp >= p->m_min && tmp <= p->m_max ) 
               p->m_value = tmp;
            else {
               if( p->IsSet( OUT_OF_RANGE ) )
                  throw E_OutOfRange<FLOAT>( tmp, p->m_min, p->m_max, argv[i] );

               if( !p->IsSet( SILENT ) )
                  std::cerr << "> [Ignoring] Option '" << argv[i] << 
                               "': value out of range." << std::endl;
            }

            // if used then "eat the argument"
            ++i;

            return true;
         }
      }

      /* Option found in command-line, but was a compatible value found
       * either? */
      if( !p->m_found && p->IsSet( NO_VALUE ) ) throw E_NoValue( argv[i] );
   }
   return false;
}

// ---------------------------------------------------------------------
bool 
OptionsBOOL::Match( int& i, char** argv, int argc )
{
   /* A minus sign ("-") after the option name disable the previous one,
      i.e.: -d- disables -d if -d was already declared. */
   std::string tmp( argv[i] ); bool disable = false;

   if( tmp.size() > 1 && tmp[tmp.size() - 1] == '-' ) 
   { 
      disable = true; tmp.erase(tmp.end() - 1);
   }

   Option<bool>* p = Find( tmp );

   if( p ) // found!
   {
      /* If argv[i] is duplicate, check if we may continue. If not,
       * return true (found, but ignored).*/
      if( !CheckDuplicate( p, argv[i] ) ) return true;

      p->m_found = true;
      p->m_value = disable ? false : true;

      return true;
   }

   return false;
}

// ---------------------------------------------------------------------
bool 
OptionsCHAR::Match( int& i, char** argv, int argc )
{
   Option<char>* p = Find( argv[i] );

   if( p ) { // found!
      if( i + 1 < argc ) 
      {
         /* If argv[i] is duplicate, check if we may continue. If not, dis-
          * card its argument (++i) and return true (found, but ignored).*/
         if( !CheckDuplicate( p, argv[i] ) ) { ++i; return true; }

         char default_value = p->m_value;
         // accept only if has one character or two (if the first is
         // a backslash)
         if( argv[i + 1][0] == '\0' || argv[i+1][1] == '\0') 
         {
            p->m_value = argv[i+1][0];
            p->m_found = true;
         }
         else if( argv[i + 1][0] == '\\' && argv[i + 1][2] == '\0' ) 
         {
            switch( argv[i + 1][1] ) {
               case '0' : p->m_value = '\0'; break;
               case 'a' : p->m_value = '\a'; break;
               case 'b' : p->m_value = '\b'; break;
               case 'f' : p->m_value = '\f'; break;
               case 'n' : p->m_value = '\n'; break;
               case 'r' : p->m_value = '\r'; break;
               case 't' : p->m_value = '\t'; break;
               case 'v' : p->m_value = '\v'; break;
               case '\\': p->m_value = '\\'; break;
               default  : p->m_value = argv[i+1][1]; break;
            }
            p->m_found = true;
         }

         if( p->m_found )
         {
            std::map<std::string, std::pair<const char*, bool> >
                                     ::iterator it = m_ranges.find( argv[i] );
            /*
             * it->second:        pair<const char*, bool>
             * it->second.first:  const char* [ range of valid chars ]
             * it->second.second: bool        [ if \0 is also a valid char ]
             */

            // A valid set of values was provided?
            if( it != m_ranges.end() && it->second.first )
            {
               bool in_range = false;
               for( int j = 0; (it->second.first)[j] != '\0'; ++j )
               {
                  if( p->m_value == (it->second.first)[j] ) 
                  {
                     in_range = true;
                     break;
                  }
               }

               // Include the null char as a valid one?
               if( it->second.second ) in_range |= p->m_value == '\0';

               if( !in_range )  // p->m_value not in it
               {
                  if( p->IsSet( OUT_OF_RANGE ) )
                     throw E_OutOfRange<char>( argv[i + 1], it->second.first, argv[i] );

                  if( !p->IsSet( SILENT ) )
                     std::cerr << "> [Ignoring] Option '" << argv[i] << 
                                        "': value out of range." << std::endl;

                  // restore the default value
                  p->m_value = default_value;
               }
            }

            ++i; // if used then "eat the argument"

            return true;
         } 
      }  

      /* Option found in command-line, but was a compatible value found
       * either? */
      if( p->IsSet( NO_VALUE ) ) throw E_NoValue( argv[i] );
   }
   return false;
}

// ---------------------------------------------------------------------
bool 
OptionsSTRING::Match( int& i, char** argv, int argc )
{
   // try to find
   Option<std::string>* p = Find( argv[i] );

   if( p ) // found!
   {
      if( i + 1 < argc )
      {
         /* If argv[i] is duplicate, check if we may continue. If not, dis-
          * card its argument (++i) and return true (found, but ignored).*/
         if( !CheckDuplicate( p, argv[i] ) ) { ++i; return true; }

         p->m_found = true;

         // check if a range was given for the option argv[i]
         std::map<std::string, std::list<std::string> >
                                  ::iterator it = m_ranges.find( argv[i] );

         // verify if a range has specified and if argv[i + 1] is in range
         if( it != m_ranges.end() && 
                         find( it->second.begin(), it->second.end(), 
                         std::string( argv[i + 1] ) ) == it->second.end() ) 
         {  
            if( p->IsSet( OUT_OF_RANGE ) )
               throw E_OutOfRange<std::string>( argv[i + 1], it->second, 
                                                                 argv[i] );

            if( !p->IsSet( SILENT ) )
               std::cerr << "> [Ignoring] Option '" << argv[i] << 
                            "': value out of range." << std::endl;
         } 
         else p->m_value = std::string( argv[i + 1] );

         // if used then "eat the argument"
         ++i;

         return true;
      }

      /* Option found in command-line, but was a value found either? */
      if( !p->m_found && p->IsSet( NO_VALUE ) ) throw E_NoValue( argv[i] );
   }
   return false;
}

// ---------------------------------------------------------------------
int 
Parser::Process()
{
   int matched = 0;
   for( int i = 1; i < m_argc; ++i )
   {
      if( !strcmp( m_argv[i], "--" ) ) break; // "--" stops the option processing

      if( m_argv[i][0] == '-' && ( Int.Match( i, m_argv, m_argc ) || 
          Float.Match( i, m_argv, m_argc ) || Bool.Match( i, m_argv, m_argc ) || 
          Char.Match( i, m_argv, m_argc ) || String.Match( i, m_argv, m_argc )) )
      {
         ++matched;
      }
   }

   return matched;
}

// ---------------------------------------------------------------------

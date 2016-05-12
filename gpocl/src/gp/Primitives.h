// -----------------------------------------------------------------------------
// $Id$
//
//   Primitives.h
// 
//   Genetic Programming in OpenCL (gpocl)
//
//   Copyright (C) 2010-2011 Douglas A. Augusto
// 
// This file is part of gpocl
// 
// GPOCL is free software; you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software
// Foundation; either version 3 of the License, or (at your option) any later
// version.
// 
// GPOCL is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
// details.
// 
// You should have received a copy of the GNU General Public License along
// with GPOCL; if not, see <http://www.gnu.org/licenses/>.
//
// -----------------------------------------------------------------------------

#ifndef _primitives_h
#define _primitives_h

#include "/share/devel/Gp/gpocl/src/gp/CL/cl.hpp"

#include "../common/Exception.h"
#include "../common/util/Util.h"

// Functions definition
#include "kernels/common.cl"

#include <string>
#include <iostream>
#include <vector>
#include <cassert>
#include <cassert>

// -----------------------------------------------------------------------------
class Primitives {
public:
   /**
    * @class Error
    *
    * @brief Class for GP's fatal exceptions.
    */
   struct Error: public Exception {
      Error( const std::string& msg ): Exception( "@ Primitives ", msg ) {};
   };

   enum { GPT_EPHEMERAL = 0, GPT_CLASS = 1, GPF_IDENTITY = 126, GPT_VAR = 127 };
public:
   Primitives();

   struct Primitive { 
      Primitive( cl_uint a, const std::string& n, const std::string& s, 
                 const std::string& c, const std::string& fc = "" ):
         arity( a ), name( n ), symbol( s ), code( c ), fastcode( fc ) {}
      cl_uint arity;
      std::string name;
      std::string symbol;
      std::string code;
      std::string fastcode;
   };

   /** @brief The database of primitives

     Each member of DB holds the name, symbol (alias), arity, and type of the primitive.
    */
   std::vector<Primitive> DB;
   std::vector<cl_uint> m_primitives;

public:

   void ShowAvailablePrimitives() const 
   { 
      std::cout << "List of available primitives (operators/operands)\n\n";
      std::cout.fill(' ');                    // fill using # 
      for( unsigned i = 0; i < DB.size(); ++i )
      {
         std::cout << "Arity: " << DB[i].arity << " | Symbol: ";
         std::cout.width(10); 
         std::cout << DB[i].symbol;
         std::cout <<  " | Name: ";
         std::cout.width(12); 
         std::cout << DB[i].name << std::endl;
      }
      std::cout << "\nTo specify them, use for example: -p \"sin,cos,+,-,*,/\"\n";
   }

   cl_uint RandomNode( unsigned min, unsigned max ) const;
   void Load( unsigned, unsigned, const std::string& );

   bool m_need_identity;
   unsigned m_max_arity;
   unsigned m_min_arity_user_given_function;
   unsigned m_min_Y;
   unsigned m_max_Y;
private:
   /**
     Try to find the corresponding primitive by name or symbol. When it finds,
     then it returns a pair of 'arity' and 'index'. Otherwise it throws an error.
     */
   std::pair<cl_uint, cl_uint> Find( const std::string& token );
   void Register( cl_uint, const std::string&, const std::string&, const std::string&, const std::string& = "" );

   std::vector<std::pair<unsigned, unsigned> > m_primitives_boundaries;

public:
   static void RepackNodeValue( cl_uint& node, cl_float new_value ) 
   {
      // Clear previous value and set the new one
      node = (node & 0xFFC00000) | EncodeFloat( new_value ); // 0xFFC00000 = 11111111 11000000 00000000 00000000
   }

   static void RepackNodeValue( cl_uint& node, cl_uint new_value ) 
   {
      // Clear previous value and set the new one
      node = (node & 0xFFC00000) | new_value; // 0xFFC00000 = 11111111 11000000 00000000 00000000
   }

   // --------------
   static cl_uint PackNode( cl_uint arity, cl_uint index ) 
   {
      assert( sizeof(cl_uint) == 4 );

      // checking bounds
      assert( ! (arity & 0xFFFFFFF8) ); // 0xFFFFFFF8 = 11111111 11111111 11111111 11111000
      assert( ! (index  & 0xFFFFFF80) ); // 0xFFFFFF80 = 11111111 11111111 11111111 10000000

      return (arity << 29) | (index << 22);
   }

   static cl_uint PackNode( cl_uint arity, cl_uint index, cl_uint value ) 
   {
      // checking bounds
      assert( ! (value & 0xFFC00000) ); // 0xFFC00000 = 11111111 11000000 00000000 00000000

      return PackNode( arity, index ) | value;
   }

   static cl_uint PackNode( cl_uint arity, cl_uint index, cl_float value ) 
   {
      return PackNode( arity, index ) | EncodeFloat( value );
   }

   static cl_uint EncodeFloat( cl_float value )
   {
      cl_uint encoded = util::RndPosNum<cl_float>( value * COMPACT_RANGE / (cl_float) SCALE_FACTOR );
      
      // Checking bounds, i.e. can packed_value fit in 22 bits?)
      assert( ! (encoded & 0xFFC00000) ); // 0xFFC00000 = 11111111 11000000 00000000 00000000

      return encoded;
   }
   // --------------
};

// -----------------------------------------------------------------------------
#endif

// -----------------------------------------------------------------------------
// $Id$
//
//   Primitives.cc
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

#include "Primitives.h"

#include <algorithm>
#include <limits>

#include "../common/util/Random.h"

// -----------------------------------------------------------------------------
Primitives::Primitives(): m_need_identity( false ), 
   m_min_arity_user_given_function( 0 ),
   m_min_Y( std::numeric_limits<unsigned>::max() ),
   m_max_Y( std::numeric_limits<unsigned>::min() )
{
   /* We already check for Infinity/NaN, thus I think we don't need to check
      the inputs of each sensitive function--with unprotected functions the
      evaluation is faster and it seems to produce better programs. Moreover,
      there is a philosophical question here: should a program encoding bad
      combinations (or allowing bad inputs) be considered a possibly good one?
    */
#define UNPROTECTED_FUNCTIONS 1

   /* The first two primitives are special, they need to be the first ones. */
   Register( 0, "ephemeral",    "ephemeral",    "AS_FLOAT( NODE )" );
   assert( GPT_EPHEMERAL == DB.size() - 1 );
   Register( 0, "class",        "class",        "AS_INT( NODE )" );
   assert( GPT_CLASS == DB.size() - 1 );

   Register( 3, "ifthenelse",   "ite",          "(int)ARG(0) ? ARG(1) : ARG(2)" );

   Register( 2, "add",          "+",            "ARG(0) + ARG(1)" );
   Register( 2, "and",          "&&",           "ARG(0) && ARG(1)" );
#ifdef UNPROTECTED_FUNCTIONS
   Register( 2, "div",          "/",            "ARG(0)/ARG(1)", "native_divide(ARG(0), ARG(1))"  );
#else
   Register( 2, "div",          "/",            "(ARG(1) == 0.0f ? 1.0f : ARG(0)/ARG(1))", "(ARG(1) == 0.0f ? 1.0f : native_divide( ARG(0), ARG(1) ) )"  );
#endif
   Register( 2, "equal",        "=",            "ARG(0) == ARG(1)" );
   Register( 2, "mod",          "%",            "fmod(ARG(0), ARG(1))" );
   Register( 2, "greater",      ">",            "ARG(0) > ARG(1)" );
   Register( 2, "greaterequal", ">=",           "ARG(0) >= ARG(1)" );
   Register( 2, "less",         "<",            "ARG(0) < ARG(1)" );
   Register( 2, "lessequal",    "<=",           "ARG(0) <= ARG(1)" );
   Register( 2, "max",          "max",          "max(ARG(0), ARG(1))" );
   Register( 2, "mean",         "mean",         "(ARG(0) + ARG(1))/2.0f" );
   Register( 2, "min",          "min",          "min(ARG(0), ARG(1))" );
   Register( 2, "sub",          "-",            "ARG(0) - ARG(1)" );
   Register( 2, "mul",          "*",            "ARG(0) * ARG(1)" );
   Register( 2, "notequal",     "!=",           "ARG(0) != ARG(1)" );
   Register( 2, "or",           "||",           "ARG(0) || ARG(1)" );
   Register( 2, "pow",          "^",            "pow(ARG(0), ARG(1))" );
   Register( 2, "xor",          "xor",          "((ARG(0) <= 0.0f && ARG(1) > 0.0f) || (ARG(0) > 0.0f && ARG(1) <= 0.0f))" );

   Register( 1, "abs",          "abs",          "fabs(ARG(0))" );
   Register( 1, "ceil",         "ceil",         "ceil(ARG(0))" );
   Register( 1, "cos",          "cos",          "cos(ARG(0))", "native_cos(ARG(0))" );
   Register( 1, "exp",          "exp",          "exp(ARG(0))", "native_exp(ARG(0))" );
   Register( 1, "exp10",        "exp10",        "exp10(ARG(0))", "native_exp10(ARG(0))" );
   Register( 1, "exp2",         "exp2",         "exp2(ARG(0))", "native_exp2(ARG(0))" );
   Register( 1, "floor",        "floor",        "floor(ARG(0))" );
   Register( 1, "pow2",         "^2",           "ARG(0) * ARG(0)" );
   Register( 1, "pow3",         "^3",           "ARG(0) * ARG(0) * ARG(0)" );
   Register( 1, "pow4",         "^4",           "ARG(0) * ARG(0) * ARG(0) * ARG(0)" );
#ifdef UNPROTECTED_FUNCTIONS
   Register( 1, "log",          "log",          "log(ARG(0))",   "native_log(ARG(0))"  );
   Register( 1, "log10",        "log10",        "log10(ARG(0))", "native_log10(ARG(0))" );
   Register( 1, "log2",         "log2",         "log2(ARG(0))",  "native_log2(ARG(0))" );
#else
   Register( 1, "log",          "log",          "(ARG(0) < 1.0f ? 1.0f : log(ARG(0)))", "(ARG(0) < 1.0f ? 1.0f : native_log(ARG(0)))"  );
   Register( 1, "log10",        "log10",        "(ARG(0) < 1.0f ? 1.0f : log10(ARG(0)))", "(ARG(0) < 1.0f ? 1.0f : native_log10(ARG(0)))" );
   Register( 1, "log2",         "log2",         "(ARG(0) < 1.0f ? 1.0f : log2(ARG(0)))", "(ARG(0) < 1.0f ? 1.0f : native_log2(ARG(0)))"  );
#endif
   Register( 1, "neg",          "neg",          "-ARG(0)" );
   Register( 1, "not",          "!",            "!(int)ARG(0)" );
   Register( 1, "round",        "round",        "round(ARG(0))" );
   Register( 1, "sin",          "sin",          "sin(ARG(0))", "native_sin(ARG(0))" );
#ifdef UNPROTECTED_FUNCTIONS
   Register( 1, "sqrt",         "sqrt",         "sqrt(ARG(0))", "native_sqrt(ARG(0))"  );
   Register( 1, "tan",          "tan",          "tan(ARG(0))", "native_tan(ARG(0))" );
#else
   Register( 1, "sqrt",         "sqrt",         "(ARG(0) < 0.0f ? 1.0f : sqrt(ARG(0)))", "(ARG(0) < 0.0f ? 1.0f : native_sqrt(ARG(0)))"  );
#endif
   Register( 1, "step",         "step",         "(ARG(0) >= 0.0f)" );
   Register( 1, "sign",         "sign",         "(ARG(0) > 0.0f ? 1.0f : (ARG(0) < 0.0f ? -1.0f : 0.0f))" );
   Register( 1, "logistic",     "logistic",     "(1.0f/(1.0f + exp(-ARG(0))))", "(1.0f/(1.0f + native_exp(-ARG(0))))" );
   Register( 1, "hill2",        "hill2",        "(ARG(0)*ARG(0)/(1.0f + ARG(0)*ARG(0)))" );
   // Fast factorial
   Register( 1, "gamma",        "gamma",        "pow((ARG(0)/2.71828174591064f)*sqrt(ARG(0)*sinh(1/ARG(0))),ARG(0))*sqrt(2*3.14159274101257f/ARG(0))" );
   Register( 1, "gauss",        "gauss",        "exp(-ARG(0)*ARG(0))", "native_exp(-ARG(0)*ARG(0))" );

   Register( 0, "c_-1",         "-1",           "-1.0f" );
   Register( 0, "c_-2",         "-2",           "-2.0f" );
   Register( 0, "c_-3",         "-3",           "-3.0f" );
   Register( 0, "c_0",          "0",            "0.0f" );
   Register( 0, "c_1",          "1",            "1.0f" );
   Register( 0, "c_1_pi",       "0.3183",       "0.31830987334251f" );
   Register( 0, "c_2",          "2",            "2.0f" );
   Register( 0, "c_2_pi",       "0.6366",       "0.63661974668503f" );
   Register( 0, "c_2_sqrtpi",   "1.1283",       "1.12837922573090f" );
   Register( 0, "c_3",          "3",            "3.0f" );
   Register( 0, "c_apery",      "1.2020",       "1.202056903159594f" );
   Register( 0, "c_catalan",    "0.9159",       "0.915965594177219f" );
   Register( 0, "c_e",          "2.7182",       "2.71828174591064f" );
   Register( 0, "c_euler",      "0.5772",       "0.5772156649015329f" );
   Register( 0, "c_golden",     "1.6180",       "1.618033988749895f" );
   Register( 0, "c_ln10",       "3.3025",       "2.30258512496948f" );
   Register( 0, "c_ln2",        "1.6931",       "0.69314718246460f" );
   Register( 0, "c_log10e",     "0.4342",       "0.43429449200630f" );
   Register( 0, "c_log2e",      "1.4426",       "1.44269502162933f" );
   Register( 0, "c_omega",      "0.5671",       "0.5671432904097839f" );
   Register( 0, "c_pi",         "3.1415",       "3.14159274101257f" );
   Register( 0, "c_pi_2",       "1.5707",       "1.57079637050629f" );
   Register( 0, "c_pi_4",       "0.7853",       "0.78539818525314f" );
   Register( 0, "c_sqrt1_2",    "0.7071",       "0.70710676908493f" );
   Register( 0, "c_sqrt2",      "1.4142",       "1.41421353816986f" );

   /*
   Register( 0, "c_pi",         "3.1415",       "M_PI_F" );
   Register( 0, "c_pi_2",       "1.5707",       "M_PI_2_F" );
   Register( 0, "c_pi_4",       "0.7853",       "M_PI_4_F" );
   Register( 0, "c_1_pi",       "0.3183",       "M_1_PI_F" );
   Register( 0, "c_2_pi",       "0.6366",       "M_2_PI_F" );
   Register( 0, "c_2_sqrtpi",   "1.1283",       "M_2_SQRTPI_F" );
   Register( 0, "c_sqrt2",      "1.4142",       "M_SQRT2_F" );
   Register( 0, "c_sqrt1_2",    "0.7071",       "M_SQRT1_2_F" );
   Register( 0, "c_e",          "2.7182",       "M_E_F" );
   Register( 0, "c_log2e",      "1.4426",       "M_LOG2E_F" );
   Register( 0, "c_log10e",     "0.4342",       "M_LOG10E_F" );
   Register( 0, "c_ln2",        "1.6931",       "M_LN2_F" );
   Register( 0, "c_ln10",       "3.3025",       "M_LN10_F" );
*/
}

// -----------------------------------------------------------------------------
std::pair<cl_uint, cl_uint> Primitives::Find( const std::string& token )
{
   for( unsigned i = 0; i < DB.size(); ++i )
      if( DB[i].name == token || DB[i].symbol == token )
         return std::make_pair( DB[i].arity, i );

   throw Error( "Unrecognized primitive: " + std::string( token ) );
}

// -----------------------------------------------------------------------------
void Primitives::Register( cl_uint arity, const std::string& name, const std::string& symbol,
                           const std::string& code, const std::string& fastcode )
{
   assert( DB.size() < 126 ); // '127 = 2^7 - (1 + 1)', 1 for GPT_VAR and 1 for GPF_IDENTITY
   // Only accept lowercase primitives
   assert( util::ToLower( symbol ) == symbol && util::ToLower( name ) == name );

   DB.push_back( Primitive( arity, name, symbol, code, fastcode ) );
}

// -----------------------------------------------------------------------------
void Primitives::Load( unsigned x_dim, unsigned max_gen_size, const std::string& primitives )
{
   std::vector<std::vector<cl_uint> > per_arity;

   // Adding all problem variables (arity = 0)
   per_arity.resize(1);
   for( unsigned i = 0; i < x_dim; ++i )
      per_arity[0].push_back( PackNode( 0, GPT_VAR, (cl_uint)i ) );

   // Adding user given primitives (functions and terminals)
   std::stringstream ss( util::ToLower( primitives ) ); std::string token;
   while( std::getline( ss, token, ',' ) )
   {
      // node.first -> arity, node.second -> type

      if( token == "all" ) // mostly for testing purposes
      {
         for( unsigned i = 0; i < DB.size(); ++i )
         {
            std::pair<cl_uint, cl_uint> node = std::make_pair( DB[i].arity, i );

            if( node.first >= per_arity.size() ) per_arity.resize( node.first + 1 );
            per_arity[node.first].push_back( PackNode( node.first, node.second ) );
         }
      }
      else
      {
         std::pair<cl_uint, cl_uint> node = Find( token );

         if( node.first >= per_arity.size() ) per_arity.resize( node.first + 1 );
         per_arity[node.first].push_back( PackNode( node.first, node.second ) );
      }
   }

   // --------------- Consistence check
   /*
      per_arity.size() == 1 means that we have only terminals (per_arity[0])
      per_arity.size() == 2 means that we have terminals and functions of one
         argument (per_arity[1])
      per_arity.size() == n (with n>2) means that we have terminals and
        functions. We can guarantee that we have a function requiring 'n'
        arguments, but we cannot guarantee that we have functions requiring less
        than 'n' arguments.
    */
   if( per_arity.size() > 2 )
   {
   /*
      In order to initialize a linear tree of exactly a given size we need to have
      at least one operator requiring *one* argument. If the user didn't give this
      type of operator, we resort to a fake one-argument function called "identity".
      This function, as one can guess, just returns the value of its operator.
    */
      if( per_arity[1].empty() ) m_need_identity = true;
   }
   else if( per_arity.size() == 1 && max_gen_size > 1 )
   {
   /*
      The only case where we can allow not having a primitive operator is when
      the maximum program size is equal to 1, so any terminal can serve any
      program.
    */
      throw Error( "You should enter at least an operator (function)." );
   }
   // --------------- 

   /* 
      Populate the array of primitives, where in each position is stored a primitive.
      The primitives are ordered by arity, ranging from 0 (terminals) to 'n'.

      Simultaneously, the array of boundaries is filled. It stores the 'start index'
      and 'end index' of each set of arities. This allows us to randomly select
      primitives of a given arity of range of arities.
    */
   m_primitives_boundaries.resize( per_arity.size() );
   for( unsigned i = 0; i < per_arity.size(); ++i )
   {
      if( !per_arity[i].empty() ) // there is at least one primitive with such arity
      {
         if( m_min_arity_user_given_function == 0 )
            m_min_arity_user_given_function = i;

         m_primitives.insert( m_primitives.end(), per_arity[i].begin(), per_arity[i].end() );
         m_primitives_boundaries[i].first = m_primitives.size() - per_arity[i].size();
         m_primitives_boundaries[i].second = m_primitives.size() - 1;
      }
      else
         /* When GPF_IDENTITY is needed then its boundaries (as below) are meaningless. */
         m_primitives_boundaries[i] = m_primitives_boundaries[i - 1];
   }

   // Fill m_max_arity
   m_max_arity = per_arity.size() - 1;

#ifndef NDEBUG
   // ----------------------------------------------
   std::cout << std::endl;
   for( int i = 0; i < m_primitives.size(); ++i )
   {
      std::cout << "[" << i << "] Arity: " << ARITY( m_primitives[i] ) << " Index: " << INDEX( m_primitives[i] ) << std::endl;
   }

   std::cout << std::endl;
   for( int i = 0; i < m_primitives_boundaries.size(); ++i )
   {
      std::cout << "Boundaries " << i << " : " << m_primitives_boundaries[i].first << "," << m_primitives_boundaries[i].second << std::endl;
   }

   std::cout << "\nMinimum arity of user given function: " << m_min_arity_user_given_function << std::endl;
#endif
}

// -----------------------------------------------------------------------------
cl_uint Primitives::RandomNode( unsigned min, unsigned max ) const
{
   if( m_need_identity && (min == 1) )
   {
      if( max < m_min_arity_user_given_function ) 
      {
         /*
            There isn't originally a *function* of less than
            'm_min_arity_user_given_function' arguments, the user didn't give
            us.  But we need a function *within* this range of required
            arguments. So we are going to use the "fake" one-arity identity
            function, which just returns the value of its operand.
          */
         return PackNode( 1, GPF_IDENTITY );
      }
      else // max >= m_min_arity_user_given_function
      {
         /*
            Hmmm... GP needs a function of 'm_min_arity_user_given_function' or
          *more* arguments. Since we only use GPF_IDENTITY when it is really
          necessary, we will increment 'min' to
          'm_min_arity_user_given_function' so that Random will avoid choosing
          a non user given function of less than
          'm_min_arity_user_given_function' arguments.  At this point there is
          only the fake GPF_IDENTITY as a function accepting less than
          'm_min_arity_user_given_function' arguments. 
          */
         min = m_min_arity_user_given_function;
      }
   }

   // Truncate to m_max_arity if necessary
   max = std::min( m_max_arity, max );

   cl_uint node = m_primitives[Random::Int( m_primitives_boundaries[min].first, 
                                            m_primitives_boundaries[max].second )];

   // Handle the ephemeral constants because they need to get a random value on-the-fly
   if( INDEX( node ) == GPT_EPHEMERAL )
      node = PackNode( 0, GPT_EPHEMERAL, (float) Random::Real( 0.0, SCALE_FACTOR ) );
   else if( INDEX( node ) == GPT_CLASS ) // packs a random class index
      // TODO: Accept negative values (not particularly useful, but...)
      node = PackNode( 0, GPT_CLASS, (cl_uint) Random::Int( m_min_Y, m_max_Y ) );

   // The returned cl_uint is a packed node
   return node;
}

// -----------------------------------------------------------------------------

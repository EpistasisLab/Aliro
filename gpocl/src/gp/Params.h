// -----------------------------------------------------------------------------
// $Id$
//
//   Params.h
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

#ifndef params_hh
#define params_hh

#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <list>
#include <limits>

#include "../common/Exception.h"
#include "../common/util/CmdLineParser.h"

#define GPOCL_VERSION "0.1.0"

//----------------------------------------------------------------------
/** @class Params
 *
 * This class gets and processes parameters (general and GP-related)
 * specified by the user.
 */
class Params {
public:
   // possibly some typedefs
   //typedef long double BigFloat; /**< big float datatype. */
public:
   Params( int& argc, char** argv ): m_argc( argc ), m_argv( argv ), 
                                     m_device( DEVICE_CPU ),
                                     m_cpu_cores( 0 ) {}
   /**
    * Print gpclassifier version and exit
    */
   void ShowVersion() const;
   /**
    * Show a brief help text and exit.
    */
   void ShowUsage( const char* ) const;
   /**
    * Set gpclassifier options from user args.
    */
   bool Initialize();

public:
   int& m_argc;
   char** m_argv;

public:
   enum { DEVICE_CPU, DEVICE_GPU_FPI, DEVICE_GPU_FPC, DEVICE_GPU_PPCU, DEVICE_GPU_PPPE };

   // General options.
   bool m_verbose; /**< switch to verbose mode. */

   int m_device;
   int m_cpu_cores;

   std::string m_primitives; /**< function and terminal set. */
   bool m_print_primitives;

   // Genetic Programming options.
   int m_population_size; /**< Population size */
   int m_number_of_generations; /**< Number of generations */
   long m_seed; /**< GP seed */
   int m_tournament_size; /**< Selection pressure */
   int m_elitism_size; /**< Elitism size */
   int m_maximum_tree_size; /**< The maximum allowed size for a program. */
   int m_minimum_tree_size; /**< The minimum allowed size for a program. */
   int m_max_local_size; /**< The maximum allowed work group size. */
   float m_crossover_probability; /**< Crossover probability */
   float m_mutation_probability; /**< Mutation probability */
   float m_error_tolerance; /**< Error tolerance (stop criterion) */

   std::string m_output_file; /**< output filename. */

   std::vector<std::string> m_data_points; /**< Name of the data points file. */

public:
   /**
    * Class for Params exceptions.
    */
   struct Error: public Exception {
      Error( const std::string& msg ): Exception( "@ Params", msg ) {};
   };
};

//----------------------------------------------------------------------
#endif

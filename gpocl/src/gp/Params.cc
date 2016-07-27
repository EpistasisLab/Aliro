// -----------------------------------------------------------------------------
// $Id$
//
//   Params.cc
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

#include "Params.h"
#include "../common/util/Util.h"

using namespace std;

//---------------------------------------------------------------------
void
Params::ShowVersion() const // --version
{
   cout

   << "gpocl (GP in OpenCL) " << GPOCL_VERSION << " Copyright (C) 2010-2011\n"
   << "\n"
   << "This is free software. You may redistribute copies of it under the terms\n"
   << "of the GNU General Public License <http://www.gnu.org/licenses/gpl.html>.\n"
   << "There is NO WARRANTY, to the extent permitted by law.\n"
   << "\n"
   << "Written by Douglas Adriano Augusto (daaugusto).\n";
}

//---------------------------------------------------------------------
void
Params::ShowUsage( const char* app = "gpocl" ) const // -h or --help
{
   cout  

   << "Genetic Programming in OpenCL (GPOCL)\n"
   << "\n"
   //<< "Usage: " << app << " [-cpu [n] | -gpu <fpi|fpc|ppcu|pppe>] [OPTION] <data points>\n"
   << "Usage: " << app << " [-cpu [n] | -gpu <fpi|ppcu|pppe>] [OPTION] <data points>\n"
   << "\n"    
   << "General options:\n"
   //<< "  -o file, --output-file file\n"
   //<< "     save result in 'file' [default = gpocl.out]\n"
   << "  -v, --verbose\n"
   << "     verbose\n"
   << "  --version\n"
   << "     print gpocl version and exit\n"
   << "  -h, --help\n"
   << "     print this help and exit\n"
   << "\n"
   << "Genetic Programming options:\n"
   << "  -p <p1,...,pn>, --primitives <p1,...,pn>\n"
   << "     GP primitives (operators/operands) [default = +,-,*,/,neg,ephemeral]\n"
   << "  -pp, --print-primitives\n"
   << "     Print all available GP primitives\n"
   << "  -g <n>, --generations <n>\n"
   << "     number of generations, n>0 [default = 1000]\n"
   << "  -s <n>, --seed <n>\n"
   << "     GP initialization seed, n>=0 [default = 0, random]\n"
   << "  -ps <n>, --population-size <n>\n"
   << "     number of individuals [default = 1024]\n"
   << "  -cp <f>, --crossover-probability <f>\n"
   << "     crossover probability, 0.0<=f<=1.0 [default = 0.95]\n"
   << "  -mp <f>, --mutation-probability <f>\n"
   << "     mutation probability, 0.0<=f<=1.0 [default = 0.10]\n"
   << "  -sp <n>, --seletion-pressure <n>\n"
   << "     selection pressure (tournament size), n>=1 [default = 3]\n"
   //<< "  -es <n>, --elitism-size <n>\n"
  // << "     elitism size [default = 1]\n"
   << "  -es <n>, --elitism-size <n>\n"
   << "     elitism size, 0<=n<=1 [default = 1]\n"
   << "  -max <n>, --maximum-size <n>\n"
   << "     maximum program size [default = 20]\n"
   << "  -min <n>, --minimum-size <n>\n"
   << "     minimum program size [default = 1]\n"
   << "  -et <n>, --error-tolerance <f>\n"
   << "     tolerance of error (stop criterion) [default = none]\n"
   << "\n"
   << "OpenCL options:\n"
   << "  -cl-mls <n>, --cl-maximum-local-size <n>\n";
}

//----------------------------------------------------------------------
bool 
Params::Initialize()
{
   // The 'Opts' object holds and processes user's input arguments
   CmdLine::Parser Opts( m_argc, m_argv, CmdLine::OUT_OF_RANGE | CmdLine::NO_VALUE );

   // Let's declare all possible command-line options

   Opts.Bool.Add( "-h", "--help" );
   Opts.Bool.Add( "--version" );

   Opts.Bool.Add( "-v", "--verbose" );

   Opts.String.Add( "-o", "--output-file", "gpocl.out" );

   // Function/terminal sets option
   Opts.String.Add( "-p", "--primitives", "+,-,*,/,neg,ephemeral" );
   Opts.Bool.Add( "-pp", "--print-primitives" );

   Opts.Bool.Add( "-cpu", "--cpu" );
   Opts.Int.Add( "-cpu", "--cpu", 1, 1, numeric_limits<int>::max() ).UnSet( CmdLine::NO_VALUE );
   Opts.String.Add( "-gpu", "--gpu", "ppcu", "fpi", "fpc", "ppcu", "pppe", NULL );

   // Termination criteria
   Opts.Int.Add( "-g", "--generations", 1000, 1, numeric_limits<int>::max() );

   // Seed options
   Opts.Int.Add( "-s", "--seed", 0, 0, numeric_limits<long>::max() );

   Opts.Int.Add( "-ps", "--population-size", 1024, 5, numeric_limits<int>::max() );
   Opts.Float.Add( "-cp", "--crossover-probability", 0.95, 0.0, 1.0 );
   Opts.Float.Add( "-mp", "--mutation-probability", 0.10, 0.0, 1.0 );
   Opts.Int.Add( "-sp", "--seletion-pressure", 3, 1, numeric_limits<int>::max() );

   // FIXME: Opts.Int.Add( "-es", "--elitism-size", 1, 0, numeric_limits<int>::max() );
   Opts.Int.Add( "-es", "--elitism-size", 1, 0, 1 );

   Opts.Int.Add( "-max", "--maximum-size", 20, 1, numeric_limits<int>::max() );
   Opts.Int.Add( "-min", "--minimum-size", 1, 1, numeric_limits<int>::max() );

   Opts.Float.Add( "-et", "--error-tolerance", -1.0, 0.0 );

   Opts.Int.Add( "-cl-mls", "--cl-maximum-local-size", 0, 1 );
   // -- Get the options! ----------------
   /* Right now, the 'Opts' object will process the command-line, i.e.,
    * it will try to recognize the options and their respective arguments. */
   Opts.Process( m_data_points );

   if( Opts.String.Found( "-gpu" ) )
   {
      const std::string gpu_strategy = Opts.String.Get( "-gpu" );

      if( gpu_strategy == "fpi" ) // Fitness-parallel interpreted
         m_device = DEVICE_GPU_FPI;
      else if( gpu_strategy == "fpc" ) // Fitness-parallel compiled
         m_device = DEVICE_GPU_FPC;
      else if( gpu_strategy == "ppcu" ) // Population-parallel computing unit
         m_device = DEVICE_GPU_PPCU;
      else if( gpu_strategy == "pppe" ) // Population-parallel computing element
         m_device = DEVICE_GPU_PPPE;
   } 
   else
   {
      if( Opts.Bool.Get( "-cpu" ) || !Opts.Int.Found( "-cpu" ) ) 
         m_cpu_cores = 0;
      else 
         m_cpu_cores = Opts.Int.Get( "-cpu" );
   }

   // ------------------------------------
   if( Opts.Bool.Get( "-h" ) ) 
   { 
      ShowUsage(); 
      return false; /* exit */
   }
   if( Opts.Bool.Get( "--version" ) ) 
   { 
      ShowVersion(); 
      return false; /* exit */ 
   }

   // --- verbose
   m_verbose = Opts.Bool.Get( "-v" );

   // ---- Genetic Programming ------------------------------------------

   // -- Maximum number of generations
   m_primitives = Opts.String.Get( "-p" );
   m_print_primitives = Opts.Bool.Get( "-pp" );

   m_number_of_generations = Opts.Int.Get( "-g" );

   // -- Initialization seed
   m_seed = Opts.Int.Get( "-s" );

   m_population_size = Opts.Int.Get( "-ps" );
   m_crossover_probability = Opts.Float.Get( "-cp" );
   m_mutation_probability = Opts.Float.Get( "-mp" );
   m_elitism_size = Opts.Int.Get( "-es" );

   m_maximum_tree_size = Opts.Int.Get( "-max" );
   m_minimum_tree_size = std::min( (int) Opts.Int.Get( "-min" ), m_maximum_tree_size );
   
   // -- Selection pressure (currently "tournament size")
   m_tournament_size = Opts.Int.Get( "-sp" );
                                              
   m_error_tolerance = Opts.Float.Get( "-et" );

   m_output_file = Opts.String.Get( "-o" );

   // ---- OpenCL ------------------------------------------
   m_max_local_size = Opts.Int.Get( "-cl-mls" );

   // ---------------
   return true;
}

//---------------------------------------------------------------------

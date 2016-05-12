// -----------------------------------------------------------------------------
// $Id$
//
//   gpocl.cc
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

#include "GP.h"
#include "CPU.h"
#include "GPU.h"

#include "../common/Exception.h"
#include "../common/util/CmdLineException.h"

#include <iostream>

// ---------------------------------------------------------------------
int main( int argc, char** argv )
{
   try {
      // Read the options
      Params parameters( argc, argv );

      // Just ShowUsage()?
      if( !parameters.Initialize() ) return 0;

      GP* gp_engine = 0;

      try {
         switch( parameters.m_device )
         {
            case Params::DEVICE_CPU:
               gp_engine = new GPonCPU( parameters );
               break;
            case Params::DEVICE_GPU_FPI:
               gp_engine = new FPI( parameters );
               break;
            case Params::DEVICE_GPU_FPC:
               gp_engine = new FPC( parameters );
               break;
            case Params::DEVICE_GPU_PPCU:
               gp_engine = new PPCU( parameters );
               break;
            case Params::DEVICE_GPU_PPPE:
               gp_engine = new PPPE( parameters );
               break;
         }

         gp_engine->Run();
      }
      catch(...) {
         delete gp_engine;
         throw;
      }

      // Free the GP engine
      delete gp_engine; 
   }
   catch( const CmdLine::E_Exception& e ) {
      std::cerr << e;
      return 1;
   } 
   catch( const Exception& e ) {
      std::cerr << e;
      return 2;
   } 
   catch( cl::Error& e ) {
      std::cerr << '\n' << "> Error: " << e.what() << std::endl;

      switch( e.err() )
      {
         case CL_OUT_OF_RESOURCES:
            std::cerr << "CL_OUT_OF_RESOURCES: failure to allocate resources required by the OpenCL implementation on the device.\n";
            break;
         case CL_OUT_OF_HOST_MEMORY:
            std::cerr << "CL_OUT_OF_HOST_MEMORY: failure to allocate resources required by the OpenCL implementation on the host.\n";
            break;
      }

      return 4;
   }
   catch( const std::exception& e ) {
      std::cerr << '\n' << "> Error: " << e.what() << std::endl;
      return 8;
   }
   catch( ... ) {
      std::cerr << '\n' << "> Error: " << "An unknown error occurred." << std::endl;
      return 16;
   }

   return 0;
}

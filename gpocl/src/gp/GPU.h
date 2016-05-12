// -----------------------------------------------------------------------------
// $Id$
//
//   GPU.h
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

#ifndef _GPU_h
#define _GPU_h

#include "GP.h"

// -----------------------------------------------------------------------------
class GPonGPU: public GP {
public:
   GPonGPU( Params& p ): GP( p, CL_DEVICE_TYPE_GPU )
   {
      // Load common definitions
      LoadKernel( "kernels/common.cl" );
   }

   virtual ~GPonGPU() {}

   void PrintStrategy() const 
   { 
      std::cout << "GPU" << " (" << m_max_cu << " compute units) ";
   }

   void LoadPoints();
};

// -----------------------------------------------------------------------------
class PPCU: public GPonGPU {
public:
   PPCU( Params& p ): GPonGPU( p )
   {
      std::cout << "Strategy 'population-parallel compute unit'\n";
      LoadKernel( "kernels/gpu_ppcu.cl" );
   }

   virtual ~PPCU() {}

   void PrintStrategy() const { GPonGPU::PrintStrategy(); std::cout << "PPCU"; }

   void SetKernelArgs()
   {
      GP::SetKernelArgs();

      m_kernel.setArg( 4, sizeof(uint) * MaximumTreeSize(), NULL );
   }

   void CalculateNDRanges(); 
};

// -----------------------------------------------------------------------------
class PPPE: public GPonGPU {
public:
   PPPE( Params& p ): GPonGPU( p )
   {
      std::cout << "Strategy 'population-parallel processing element'\n";
      LoadKernel( "kernels/gpu_pppe.cl" );
   }

   virtual ~PPPE() {}

   void PrintStrategy() const { GPonGPU::PrintStrategy(); std::cout << "PPPE"; }

   void CalculateNDRanges();
};

// -----------------------------------------------------------------------------
class FPI: public GPonGPU {
public:
   FPI( Params& p ): GPonGPU( p )
   {
      std::cout << "Strategy 'fitness-parallel interpreted'\n";
      LoadKernel( "kernels/gpu_fpi.cl" );
   }

   virtual ~FPI() {}

   void PrintStrategy() const { GPonGPU::PrintStrategy(); std::cout << "FPI"; }

   void CalculateNDRanges();

   void SetKernelArgs()
   {
      GP::SetKernelArgs();

      // Allocate the memory for caching the program
      m_kernel.setArg( 4, sizeof(uint) * MaximumTreeSize(), NULL );
   }

   void CreateBuffers()
   {
      CreateBufferDataPoints();
      CreateBufferPopulation();

#ifndef NDEBUG
      std::cout << "Trying to allocate " << m_params->m_population_size * (m_global_size / m_local_size) * sizeof(cl_float) << " bytes for the partial prediction errors\n";
#endif
      m_buf_E = cl::Buffer( m_context, CL_MEM_WRITE_ONLY | CL_MEM_ALLOC_HOST_PTR,
                           m_params->m_population_size * (m_global_size / m_local_size) * sizeof(cl_float) );
   }

   void CalculateErrors( const cl_uint* pop );
};

// -----------------------------------------------------------------------------
class FPC: public GPonGPU {
public:
   FPC( Params& p ): GPonGPU( p )
   {
      std::cout << "Strategy 'fitness-parallel compiled'\n";
      LoadKernel( "kernels/gpu_fpc.cl" );
   }

   virtual ~FPC() {}

   void PrintStrategy() const { GPonGPU::PrintStrategy(); std::cout << "FPC"; }

   void CalculateNDRanges() {}
};

// -----------------------------------------------------------------------------
#endif

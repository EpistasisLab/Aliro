// -----------------------------------------------------------------------------
// $Id$
//
//   CPU.h
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

#ifndef _CPU_h
#define _CPU_h

#include "GP.h"

// -----------------------------------------------------------------------------
class GPonCPU: public GP {
public:
   GPonCPU( Params& );

   void CalculateNDRanges() 
   {
      // On the CPU there is only on work-item per work-group
      m_local_size = 1;

      // One individual being evaluated per compute unit ("core")
      m_global_size = m_params->m_population_size;
   }

   void PrintStrategy() const { std::cout << "CPU (" << m_max_cu << " compute units)"; }
   virtual ~GPonCPU() {}

   void LoadPoints();

   unsigned DeviceFission();
};


// -----------------------------------------------------------------------------
#endif

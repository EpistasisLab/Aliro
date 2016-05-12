// -----------------------------------------------------------------------------
// $Id$
//
//   CPU.cc
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

#include "CPU.h"

// -----------------------------------------------------------------------------
GPonCPU::GPonCPU( Params& p ): GP( p, CL_DEVICE_TYPE_CPU )
{
   LoadKernel( "kernels/common.cl" );
   LoadKernel( "kernels/cpu.cl" );
}

// -----------------------------------------------------------------------------
unsigned GPonCPU::DeviceFission()
{
   // Use the default procedure if the user doesn't want to restrict the number of cores to use
   if( m_params->m_cpu_cores == 0 ) 
      return GP::DeviceFission();


   // 1) Check for the existence of the 'cl_ext_device_fission' extension; if not, 
   //    fall back to the default procedure
   if( m_device.getInfo<CL_DEVICE_EXTENSIONS>().find( "cl_ext_device_fission" ) == std::string::npos )
      return GP::DeviceFission();

   // 2) Set the way we want to subdivide the device by creating a list of properties
   size_t cu = std::min( (unsigned) m_params->m_cpu_cores, 
                         (unsigned) m_device.getInfo<CL_DEVICE_MAX_COMPUTE_UNITS>() );

   cl_device_partition_property_ext subdevice_properties[] =
        { CL_DEVICE_PARTITION_BY_COUNTS_EXT, cu, CL_PARTITION_BY_COUNTS_LIST_END_EXT, 
          CL_PROPERTIES_LIST_END_EXT };

   // 3) Create a sub device containing the specified number of processors the user wants
   std::vector<cl::Device> subdevices;
   m_device.createSubDevices( subdevice_properties, &subdevices );

   // 4) Finally, set m_device to be the newly created device (subdevices) and
   //    return the actual number of compute units
   return m_device = subdevices.front(), cu;
}

// -----------------------------------------------------------------------------
void GPonCPU::LoadPoints()
{
   std::vector<std::vector<cl_float> > tmp_X;
   GP::LoadPoints( tmp_X );

   // Allocate enough memory (linear) to hold the linear version
   m_X = new cl_float[ m_num_points * m_x_dim ];

   // Linearization
   unsigned pos = 0;
   for( unsigned i = 0; i < tmp_X.size(); ++i )
      for( unsigned j = 0; j < tmp_X[0].size(); ++j )
         m_X[pos++] = tmp_X[i][j];

   /*
   for( unsigned i = 0; i < m_num_points * m_x_dim; ++i)
      std::cout << m_X[i] << " ";
   std::cout << std::endl;
   for( unsigned i = 0; i < m_num_points; ++i)
      std::cout << m_Y[i] << " ";
   std::cout << std::endl;
   */
}

// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// $Id$
//
//   GPU.cc
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

#include "GPU.h"

#include <iomanip>

// -----------------------------------------------------------------------------
void GPonGPU::LoadPoints()
{
   std::vector<std::vector<cl_float> > tmp_X;
   GP::LoadPoints( tmp_X );

   // Allocate enough memory (linear) to hold the transposed version
   m_X = new cl_float[ m_num_points * m_x_dim ];

   /*
     TRANSPOSITION (for coalesced access on the GPU)

                                 Transformed and linearized data points
                                 +----------++----------+   +----------+
                                 | 1 2     q|| 1 2     q|   | 1 2     q|
           +-------------------> |X X ... X ||X X ... X |...|X X ... X |
           |                     | 1 1     1|| 2 2     2|   | p p     p|
           |                     +----------++----------+   +----------+
           |                                ^             ^
           |    ____________________________|             |
           |   |       ___________________________________|
           |   |      |
         +--++--+   +--+
         | 1|| 1|   | 1|
         |X ||X |...|X |
         | 1|| 2|   | p|
         |  ||  |   |  |
         | 2|| 2|   | q|
         |X ||X |...|X |
         | 1|| 2|   | p|
         |. ||. |   |. |
         |. ||. |   |. |
         |. ||. |   |. |
         | q|| q|   | q|
         |X ||X |...|X |
         | 1|| 2|   | p|
         +--++--+   +--+
      Original data points

    */
   unsigned pos = 0;
   for( unsigned j = 0; j < tmp_X[0].size(); ++j )
      for( unsigned i = 0; i < tmp_X.size(); ++i )
         m_X[pos++] = tmp_X[i][j];
/*
   for( unsigned i = 0; i < m_num_points * m_x_dim; ++i)
      std::cout << m_X[i] << " ";
   for( unsigned i = 0; i < m_num_points; ++i)
      std::cout << m_Y[i] << " ";
 */
}

// -----------------------------------------------------------------------------
void PPCU::CalculateNDRanges() 
{
   if( m_num_points < m_max_local_size )
      m_local_size = m_num_points;
   else
      m_local_size = m_max_local_size;

   // One individual per work-group
   m_global_size = m_local_size * m_params->m_population_size;

   m_compile_flags += " -D LOCAL_SIZE_ROUNDED_UP_TO_POWER_OF_2=" 
                      + util::ToString( util::NextPowerOf2( m_local_size ) );

   if( MaximumTreeSize() > m_local_size )
      m_compile_flags += " -D PROGRAM_TREE_DOES_NOT_FIT_IN_LOCAL_SIZE";

   if( ! util::IsPowerOf2( m_local_size ) )
      m_compile_flags += " -D LOCAL_SIZE_IS_NOT_POWER_OF_2";

   if( m_num_points % m_local_size != 0 )
      m_compile_flags += " -D NUM_POINTS_IS_NOT_DIVISIBLE_BY_LOCAL_SIZE";
}

// -----------------------------------------------------------------------------
void PPPE::CalculateNDRanges() 
{
   // Evenly distribute the workload among the compute units (but avoiding local size
   // being more than the maximum allowed.
   m_local_size = std::min( m_max_local_size, 
                            (unsigned) ceil( m_params->m_population_size/(float) m_max_cu ) ) ;

   m_global_size = m_params->m_population_size;

   // It is better to have global size divisible by local size
   if( m_global_size % m_local_size != 0 )
      // Round to the next divisible size (the kernel will ensure that
      // no access outside the population range will occur).
      m_global_size += m_local_size - (m_global_size % m_local_size);
}

// -----------------------------------------------------------------------------
void FPI::CalculateNDRanges() 
{
   // Evenly distribute the workload among the compute units (but avoiding local size
   // being more than the maximum allowed.
   m_local_size = std::min( m_max_local_size, 
                            (unsigned) ceil( m_num_points/(float) m_max_cu ) );

   m_global_size = m_num_points;

   // It is better to have global size divisible by local size
   if( m_global_size % m_local_size != 0 )
   {
      m_compile_flags += " -D NUM_POINTS_IS_NOT_DIVISIBLE_BY_LOCAL_SIZE";
      // Round to the next divisible size (the kernel will ensure that
      // no access outside the population range will occur).
      m_global_size += m_local_size - (m_global_size % m_local_size); 
   }

   // OpenCL compiler flags
   m_compile_flags += " -D LOCAL_SIZE_ROUNDED_UP_TO_POWER_OF_2=" 
                      + util::ToString( util::NextPowerOf2( m_local_size ) );

   if( MaximumTreeSize() > m_local_size )
      m_compile_flags += " -D PROGRAM_TREE_DOES_NOT_FIT_IN_LOCAL_SIZE";

   if( ! util::IsPowerOf2( m_local_size ) )
      m_compile_flags += " -D LOCAL_SIZE_IS_NOT_POWER_OF_2";
}

// -----------------------------------------------------------------------------
void FPI::CalculateErrors( const cl_uint* pop )
{
   // -----------------------------------------------------------------------
   /*
      Each kernel execution will put in m_buf_E the partial errors of each program:

      |  0 |  0 |     |  0    ||   1 |  1 |     |  1   |     |  p-1 |  p-1 |     |  p-1 |
      | E  | E  | ... | E     ||  E  | E  | ... | E    | ... | E    | E    | ... | E    |        
      |  0 |  1 |     |  n-1  ||   0 |  1 |     |  n-1 |     |  0   |  1   |     |  n-1 |    


      where 'p-1' is the index of the last program, and 'n-1' is the index of the
      last 'partial error', that is, 'n-1' is the index of the last work-group (gr_id).
    */

   const unsigned num_work_groups = m_global_size / m_local_size;

   // The line below maps the contents of 'm_buf_E' into 'partial_errors'.
   cl_float* partial_errors = (cl_float*) 
            m_queue.enqueueMapBuffer( m_buf_E, CL_TRUE, CL_MAP_READ, 0, 
            m_params->m_population_size * num_work_groups * sizeof(cl_float) );

   // Reduction on host!
   for( unsigned p = 0; p < m_params->m_population_size; ++p )
   {
      m_E[p] = 0.0f;
      for( unsigned gr_id = 0; gr_id < num_work_groups; ++gr_id ) 
         m_E[p] += partial_errors[p * num_work_groups + gr_id];

      // Check whether we have found a better solution
      UpdateBestProgram( Program( pop, p ), m_E[p] );
   }

   // Unmapping
   m_queue.enqueueUnmapMemObject( m_buf_E, partial_errors ); 

   // TODO: Pick the best and fill the elitism vector (if any)
}

// -----------------------------------------------------------------------------

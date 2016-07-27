#define ASYNC_WG_COPY

__kernel void evaluate( __global const uint* pop, __global const float* X, 
#ifdef Y_DOES_NOT_FIT_IN_CONSTANT_BUFFER
      __global const 
#else
      __constant 
#endif
      float* Y, __global float* E, __local uint* program )
{
   __local float PE[LOCAL_SIZE];
   __local uint program_size;

   CREATE_STACK

   uint lo_id = get_local_id( 0 );
   uint gr_id = get_group_id( 0 );

   // Get the actual program's size
   if( lo_id == 0 ) program_size = pop[(MAX_TREE_SIZE + 1) * gr_id];

   barrier(CLK_LOCAL_MEM_FENCE);

#ifdef ASYNC_WG_COPY
   // Automatically managed copy from 'global' to 'local' memory
   event_t e_copy = async_work_group_copy( program, 
                    (__global  uint*)(pop + (MAX_TREE_SIZE + 1) * gr_id + 1),
                    program_size, 0 );
   wait_group_events( 1, &e_copy );

#else // Manually managed copy from 'global' to 'local' memory

#ifndef PROGRAM_TREE_DOES_NOT_FIT_IN_LOCAL_SIZE
   if( lo_id < program_size ) program[lo_id] = pop[(MAX_TREE_SIZE + 1) * gr_id + lo_id + 1];
#else   
   // Too few workers for the program_size, thus we need to do the work iteratively
   for( uint i = 0; i < ceil( program_size / (float) LOCAL_SIZE ); ++i )
   {
      uint index = i * LOCAL_SIZE + lo_id;

      if( index < program_size )
         program[index] =   pop[(MAX_TREE_SIZE + 1) * gr_id + index + 1];
   } 
#endif

   barrier(CLK_LOCAL_MEM_FENCE);

#endif // ASYNC_WG_COPY

   PE[lo_id] = 0.0f;

#ifndef NUM_POINTS_IS_NOT_DIVISIBLE_BY_LOCAL_SIZE
   /* When we know that NUM_POINTS is divisible by LOCAL_SIZE then we can avoid a
      comparison in each iteration due to the guarantee of not having work-items
      accessing beyond the available amount of points. */
   for( uint iter = 0; iter < NUM_POINTS/LOCAL_SIZE; ++iter )
   {
#else
   for( uint iter = 0; iter < ceil( NUM_POINTS / (float) LOCAL_SIZE ); ++iter )
   {
      //if( iter == ceil( NUM_POINTS / (float) LOCAL_SIZE) - 1 && lo_id < NUM_POINTS % LOCAL_SIZE )
      if( iter * LOCAL_SIZE + lo_id < NUM_POINTS )
      {
#endif
         // -------------------------------
         // Calls the interpreter (C macro)
         // -------------------------------
         for( int op = program_size; op-- ; )
            switch( INDEX( program[op] ) )
            {
               INTERPRETER_CORE
               default:
                  // Coalesced access pattern
                  PUSH_0( X[iter * LOCAL_SIZE + NUM_POINTS * AS_INT( program[op] ) + lo_id] );
            }

         // -------------------------------

         PE[lo_id] += ERROR_METRIC( POP, Y[iter * LOCAL_SIZE + lo_id] );

         // Avoid further calculations if the current one has overflown the float
         // (i.e., it is inf or NaN).
         if( isinf( PE[lo_id] ) || isnan( PE[lo_id] ) ) break;
#ifdef NUM_POINTS_IS_NOT_DIVISIBLE_BY_LOCAL_SIZE
      }
#endif
   }

   /*
      Parallel way to perform reduction within the work-group:

      | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |                  _  
        |_______________|                -> (lo_id = 0)   | 
            |_______________|            -> (lo_id = 1)   |  t0
                |_______________|        -> (lo_id = 2)   | (s=4)
                    |_______________|    -> (lo_id = 3)  _| 
                                                         _
        |_______|                        -> (lo_id = 0)   |  t1
            |_______|                    -> (lo_id = 1)  _| (s=2)
                                                         _
        |___|                            -> (lo_id = 0)  _|  t2 (s=1)

        L----> total sum is stored on the first work-item
    */
         
   for( uint s = LOCAL_SIZE_ROUNDED_UP_TO_POWER_OF_2 / 2; s > 0; s >>= 1 ) 
   {
      barrier(CLK_LOCAL_MEM_FENCE);

#ifndef LOCAL_SIZE_IS_NOT_POWER_OF_2
      if( lo_id < s )
#else
      /* LOCAL_SIZE is not power of 2, so we need to perform an additional
       * check to ensure that no access beyond PE's range will occur. */ 
      if( (lo_id < s) && (lo_id + s < LOCAL_SIZE) )
#endif 
         PE[lo_id] += PE[lo_id + s];
   }

   // Store on the global memory (to be read by the host)
   if( lo_id == 0 ) 
      // Check for infinity/NaN
      E[gr_id] = ( isinf( PE[0] ) || isnan( PE[0] ) ) ? MAX_FLOAT : PE[0];
}

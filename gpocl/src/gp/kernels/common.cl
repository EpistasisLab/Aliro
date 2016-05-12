// -----------------------------------------------------------------------------
// The errors metric
// -----------------------------------------------------------------------------
// absolute difference
#define ERROR_METRIC( actual, expected ) fabs( actual - expected )
// square of the difference
//#define ERROR_METRIC( actual, expected ) pown( actual - expected, 2 )
// -----------------------------------------------------------------------------

#define MAX_INT_VALUE 4194303 // 2^22 - 1
#define COMPACT_RANGE MAX_INT_VALUE // 2^22 - 1
#define SCALE_FACTOR 16 // Range of possible float values: [0.0, SCALE_FACTOR]

/*
   
   Structure of a program (individual)

     |                         |
+----+-----+----+--------------+-------------
|size|arity|type| index/value  |  ...
| 32 |  3  | 7  |     22       |
+----+-----+----+--------------+-------------
     |    first element        | second ...

*/
#define ARITY( packed ) ((packed & 0xE0000000) >> 29) // 0xE0000000 = 11100000 00000000 00000000 00000000
#define INDEX( packed ) ((packed & 0x1FC00000) >> 22) // 0x1FC00000 = 00011111 11000000 00000000 00000000
#define AS_INT( packed ) (packed & 0x3FFFFF)          // 0x3FFFFF = 00000000 00111111 11111111 11111111
#define AS_FLOAT( packed ) ((float)( packed & 0x3FFFFF ) * SCALE_FACTOR / COMPACT_RANGE) // 0x3FFFFF = 00000000 00111111 11111111 11111111

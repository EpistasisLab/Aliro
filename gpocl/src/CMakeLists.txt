cmake_minimum_required( VERSION 2.6 )

# Set the default build type as "release with debug information". This build
# type is optimized but has debug symbols.
IF( NOT CMAKE_BUILD_TYPE )
  SET( CMAKE_BUILD_TYPE RELEASE CACHE STRING
      "You can choose the following build types: None Debug Release
RelWithDebInfo MinSizeRel."
      FORCE)
ENDIF( NOT CMAKE_BUILD_TYPE )

# Setting the build type to upper-case to make further comparisons
# case-insensitive
STRING( TOUPPER ${CMAKE_BUILD_TYPE} CMAKE_BUILD_TYPE )

IF( CMAKE_BUILD_TYPE MATCHES DEBUG )
   # Enabling compilation warnings in debug mode
   SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -W" )
ENDIF( CMAKE_BUILD_TYPE MATCHES DEBUG )

# Define the project if it wasn't defined, i.e., if the user has called cmake
# directly from src/ directory instead of the project root directory.
IF( NOT gpocl_BINARY_DIR AND NOT gpocl_SOURCE_DIR )
   PROJECT( gpocl )
ENDIF( NOT gpocl_BINARY_DIR AND NOT gpocl_SOURCE_DIR )

# Put the executable into the root of the building directory
SET( EXECUTABLE_OUTPUT_PATH ${gpocl_BINARY_DIR} )

MESSAGE( ">  The executables will be created in ${EXECUTABLE_OUTPUT_PATH}" )

ADD_SUBDIRECTORY( common )
INCLUDE_DIRECTORIES( common/util )
LINK_DIRECTORIES( ${gpocl_BINARY_DIR}/common/util )

ADD_SUBDIRECTORY( gp )

# - Try to find OpenCL library and headers

# This module tries to find an OpenCL implementation on the system.
#
# Once done this will define
#  OPENCL_FOUND         - system has OpenCL
#  OPENCL_INCLUDE_DIRS  - the OpenCL include directory
#  OPENCL_LIBRARIES     - link these to use OpenCL
#
# WIN32 should work, but is untested

FIND_PACKAGE( PackageHandleStandardArgs )

SET (OPENCL_VERSION_STRING "0.1.1")
SET (OPENCL_VERSION_MAJOR 0)
SET (OPENCL_VERSION_MINOR 1)
SET (OPENCL_VERSION_PATCH 1)

IF (APPLE)

  FIND_LIBRARY(OPENCL_LIBRARIES OpenCL DOC "OpenCL lib for OSX")
  FIND_PATH(OPENCL_INCLUDE_DIRS OpenCL/cl.h DOC "Include for OpenCL on OSX")
  FIND_PATH(_OPENCL_CPP_INCLUDE_DIRS OpenCL/cl.hpp DOC "Include for OpenCL CPP bindings on OSX")

ELSE (APPLE)

   FIND_PATH(OPENCL_INCLUDE_DIRS CL/cl.h DOC "Include for OpenCL")
   FIND_PATH(_OPENCL_CPP_INCLUDE_DIRS CL/cl.hpp DOC "Include for OpenCL C++ bindings")

	IF (WIN32)
	
	    # The AMD SDK currently installs both x86 and x86_64 libraries
	    # This is only a hack to find out architecture
	    IF( ${CMAKE_SYSTEM_PROCESSOR} STREQUAL "AMD64" )
	    	SET(OPENCL_LIB_DIR "$ENV{ATISTREAMSDKROOT}/lib/x86_64")
	    ELSE (${CMAKE_SYSTEM_PROCESSOR} STREQUAL "AMD64")
	    	SET(OPENCL_LIB_DIR "$ENV{ATISTREAMSDKROOT}/lib/x86")
	    ENDIF( ${CMAKE_SYSTEM_PROCESSOR} STREQUAL "AMD64" )
	    FIND_LIBRARY(OPENCL_LIBRARIES OpenCL.lib ${OPENCL_LIB_DIR})
	    
	    GET_FILENAME_COMPONENT(_OPENCL_INC_CAND ${OPENCL_LIB_DIR}/../../include ABSOLUTE)
	    
	    # On Win32 search relative to the library
	    FIND_PATH(OPENCL_INCLUDE_DIRS CL/cl.h PATHS "${_OPENCL_INC_CAND}")
	    FIND_PATH(_OPENCL_CPP_INCLUDE_DIRS CL/cl.hpp PATHS "${_OPENCL_INC_CAND}")
	
	ELSE (WIN32)

            # Unix style platforms
            FIND_LIBRARY(OPENCL_LIBRARIES OpenCL ENV LD_LIBRARY_PATH DOC "OpenCL lib")

            #MESSAGE( "OPENCL_LIBRARIES ${OPENCL_LIBRARIES}" )

            GET_FILENAME_COMPONENT(OPENCL_LIB_DIR ${OPENCL_LIBRARIES} PATH)
            GET_FILENAME_COMPONENT(_OPENCL_INC_CAND ${OPENCL_LIB_DIR}/../../include ABSOLUTE)

            #MESSAGE( "OPENCL_LIB_DIR ${OPENCL_LIB_DIR}" )
            #MESSAGE( "_OPENCL_INC_CAND ${_OPENCL_INC_CAND}" )

            # The AMD SDK currently does not place its headers in /usr/include,
            # therefore also search relative to the library.
            # If the OpenCL headers could not be found, then use the one in
            # the current directory (.)
            FIND_PATH(OPENCL_INCLUDE_DIRS CL/cl.h PATHS ${_OPENCL_INC_CAND} . )
            FIND_PATH(_OPENCL_CPP_INCLUDE_DIRS CL/cl.hpp PATHS ${_OPENCL_INC_CAND} . )

	ENDIF (WIN32)

ENDIF (APPLE)

FIND_PACKAGE_HANDLE_STANDARD_ARGS( OpenCL DEFAULT_MSG OPENCL_LIBRARIES OPENCL_INCLUDE_DIRS )

IF( _OPENCL_CPP_INCLUDE_DIRS )
	SET( OPENCL_HAS_CPP_BINDINGS TRUE )
	LIST( APPEND OPENCL_INCLUDE_DIRS ${_OPENCL_CPP_INCLUDE_DIRS} )
	# This is often the same, so clean up
	LIST( REMOVE_DUPLICATES OPENCL_INCLUDE_DIRS )
ENDIF( _OPENCL_CPP_INCLUDE_DIRS )

MARK_AS_ADVANCED(OPENCL_INCLUDE_DIRS)

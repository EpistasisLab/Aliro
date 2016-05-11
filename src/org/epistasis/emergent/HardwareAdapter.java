package org.epistasis.emergent;
import org.epistasis.symod.AbstractDataset;
import java.awt.image.*;
import javax.imageio.ImageIO;


import static org.jocl.CL.*;
import java.util.ArrayList;
import java.io.*;
import java.util.*;

import org.jocl.*;


public class HardwareAdapter {
   /*
   * The source code of the OpenCL program to execute
   */
    	private static String gpcode(String operation)
    			throws Exception
    			{
    		String filename = "opencl/kernels/"+operation+".c";
    			    String line = null;
    			    String code = "";
    			    List<String> records = new ArrayList<String>();
    			    // wrap a BufferedReader around FileReader
    			    BufferedReader bufferedReader = new BufferedReader(new FileReader(filename));
    			    // use the readLine method of the BufferedReader to read one line at a time.
    			    // the readLine method returns null when there is nothing else to read.
    			    while ((line = bufferedReader.readLine()) != null)
    			    {
    			    	code = code + line;
    			        records.add(line);
    			    }
    			    // close the BufferedReader when we're done
    			    bufferedReader.close();
    			    return code;
	  }

    	
    	
    	 /**
         * The input image
         */
        private BufferedImage inputImage;

        /**
         * The output image
         */
        private BufferedImage outputImage;

        /**
         * The OpenCL context
         */
        private cl_context context;

        /**
         * The OpenCL command queue
         */
        private cl_command_queue commandQueue;

        /**
         * The OpenCL kernel
         */
        private cl_kernel kernel;

        /**
         * The memory object for the input image
         */
        private cl_mem inputImageMem;

        /**
         * The memory object for the output image
         */
        private cl_mem outputImageMem;

        /**
         * The width of the image
         */
        private int imageSizeX;

        /**
         * The height of the image
         */
        private int imageSizeY;

		 public static void main(String args[]){			 
		    add();
		    }


		public static Integer hwadd(final AbstractDataset data) {
		       System.out.println(data.size());
				String programSource = null;
			    try {
					 programSource = gpcode("add");
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			        // Create input- and output data 
			        List<String> labels = data.getLabels();
			        int nrows = data.size();
			        int ncols = labels.size() - 1;
			        
			        int nColors = 4;
			        byte[] reds   = new byte[]{0,(byte)255};
			byte[] greens = new byte[]{0,(byte)255};
			    byte[] blues  = new byte[]{0,(byte)255};

		 
		 IndexColorModel cm = new IndexColorModel(2,2,reds,greens,blues);
			        
			        
			   
			        BufferedImage inputImage = new BufferedImage(ncols,nrows, BufferedImage.TYPE_BYTE_BINARY,cm);
			        BufferedImage outputImage = new BufferedImage( ncols,nrows, BufferedImage.TYPE_BYTE_BINARY,cm);
			        
			        
			        float srcArrayA[] = new float[nrows];
			        float srcArrayB[] = new float[nrows];
			        float dstArray[] = new float[nrows];


			        for(int i = 0; i < nrows; i++)
			        {	
			        	double[] row = data.get(i).getValues();
			        	
			        	srcArrayA[i] = (float) row[34];
			            srcArrayB[i] = (float) row[56];

			           
			        	for(int j = 0; j < ncols; j++) {
	
			        		double value = row[j];
			        		int v = (int) value;
			        		inputImage.setRGB(j, i, v);

			        	//System.out.println(v);
			        	}
	
			        } 
			        /*
			        try {
			            // retrieve image
			            File outputfile = new File("saved.png");
				        ImageIO.write(inputImage, "png", outputfile);
			        } catch (IOException e) {
			          
			        }
			        */
			        
			        Pointer srcA = Pointer.to(srcArrayA);
			        Pointer srcB = Pointer.to(srcArrayB);
			        Pointer dst = Pointer.to(dstArray);
			        
			        
			        
			        // The platform, device type and device number
			        // that will be used
			        final int platformIndex = 0;
			        final long deviceType = CL_DEVICE_TYPE_ALL;
			        final int deviceIndex = 0;

			        // Enable exceptions and subsequently omit error checks in this sample
			        CL.setExceptionsEnabled(true);

			        // Obtain the number of platforms
			        int numPlatformsArray[] = new int[1];
			        clGetPlatformIDs(0, null, numPlatformsArray);
			        int numPlatforms = numPlatformsArray[0];

			        // Obtain a platform ID
			        cl_platform_id platforms[] = new cl_platform_id[numPlatforms];
			        clGetPlatformIDs(platforms.length, platforms, null);
			        cl_platform_id platform = platforms[platformIndex];

			       
			        // Initialize the context properties
			        cl_context_properties contextProperties = new cl_context_properties();
			        contextProperties.addProperty(CL_CONTEXT_PLATFORM, platform);
			        
			        // Obtain the number of devices for the platform
			        int numDevicesArray[] = new int[1];
			        clGetDeviceIDs(platform, deviceType, 0, null, numDevicesArray);
			        int numDevices = numDevicesArray[0];
			        
			        // Obtain a device ID 
			        cl_device_id devices[] = new cl_device_id[numDevices];
			        clGetDeviceIDs(platform, deviceType, numDevices, devices, null);
			        cl_device_id device = devices[deviceIndex];

			        // Create a context for the selected device
			        cl_context context = clCreateContext(
			            contextProperties, 1, new cl_device_id[]{device}, 
			            null, null, null);
			        
			        // Create a command-queue for the selected device
			        cl_command_queue commandQueue = 
			            clCreateCommandQueue(context, device, 0, null);

			        // Allocate the memory objects for the input- and output data
			        cl_mem memObjects[] = new cl_mem[3];
			        memObjects[0] = clCreateBuffer(context, 
			            CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR,
			            Sizeof.cl_float * nrows, srcA, null);
			        memObjects[1] = clCreateBuffer(context, 
			            CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR,
			            Sizeof.cl_float * nrows, srcB, null);
			        memObjects[2] = clCreateBuffer(context, 
			            CL_MEM_READ_WRITE, 
			            Sizeof.cl_float * nrows, null, null);
			        // Create the program from the source code
			        cl_program program = clCreateProgramWithSource(context,
			        1, new String[]{ programSource }, null, null);
			        
			          
			        
			        // Build the program
			        clBuildProgram(program, 0, null, null, null, null);
			        
			        // Create the kernel
			        cl_kernel kernel = clCreateKernel(program, "sampleKernel", null);
			        
			        // Set the arguments for the kernel
			        clSetKernelArg(kernel, 0, 
			            Sizeof.cl_mem, Pointer.to(memObjects[0]));
			        clSetKernelArg(kernel, 1, 
			            Sizeof.cl_mem, Pointer.to(memObjects[1]));
			        clSetKernelArg(kernel, 2, 
			            Sizeof.cl_mem, Pointer.to(memObjects[2]));
			        
			        // Set the work-item dimensions
			        long global_work_size[] = new long[]{nrows};
			        long local_work_size[] = new long[]{1};
			        
			        // Execute the kernel
			        clEnqueueNDRangeKernel(commandQueue, kernel, 1, null,
			            global_work_size, local_work_size, 0, null, null);
			        
			        // Read the output data
			        clEnqueueReadBuffer(commandQueue, memObjects[2], CL_TRUE, 0,
			            nrows * Sizeof.cl_float, dst, 0, null, null);
			        
			        // Release kernel, program, and memory objects
			        clReleaseMemObject(memObjects[0]);
			        clReleaseMemObject(memObjects[1]);
			        clReleaseMemObject(memObjects[2]);
			        clReleaseKernel(kernel);
			        clReleaseProgram(program);
			        clReleaseCommandQueue(commandQueue);
			        clReleaseContext(context);
			        

			            System.out.println("Result: "+java.util.Arrays.toString(dstArray));
			      
				
	return nrows;
		       

		}
		public static Integer add() {
			String programSource = null;
		    try {
				 programSource = gpcode("add");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		        // Create input- and output data 
		        int n = 10;
		        float srcArrayA[] = new float[n];
		        float srcArrayB[] = new float[n];
		        float dstArray[] = new float[n];
		        for (int i=0; i<n; i++)
		        {
		            srcArrayA[i] = i;
		            srcArrayB[i] = i;
		        }
		        Pointer srcA = Pointer.to(srcArrayA);
		        Pointer srcB = Pointer.to(srcArrayB);
		        Pointer dst = Pointer.to(dstArray);

		        // The platform, device type and device number
		        // that will be used
		        final int platformIndex = 0;
		        final long deviceType = CL_DEVICE_TYPE_ALL;
		        final int deviceIndex = 0;

		        // Enable exceptions and subsequently omit error checks in this sample
		        CL.setExceptionsEnabled(true);

		        // Obtain the number of platforms
		        int numPlatformsArray[] = new int[1];
		        clGetPlatformIDs(0, null, numPlatformsArray);
		        int numPlatforms = numPlatformsArray[0];

		        // Obtain a platform ID
		        cl_platform_id platforms[] = new cl_platform_id[numPlatforms];
		        clGetPlatformIDs(platforms.length, platforms, null);
		        cl_platform_id platform = platforms[platformIndex];

		        // Initialize the context properties
		        cl_context_properties contextProperties = new cl_context_properties();
		        contextProperties.addProperty(CL_CONTEXT_PLATFORM, platform);
		        
		        // Obtain the number of devices for the platform
		        int numDevicesArray[] = new int[1];
		        clGetDeviceIDs(platform, deviceType, 0, null, numDevicesArray);
		        int numDevices = numDevicesArray[0];
		        
		        // Obtain a device ID 
		        cl_device_id devices[] = new cl_device_id[numDevices];
		        clGetDeviceIDs(platform, deviceType, numDevices, devices, null);
		        cl_device_id device = devices[deviceIndex];

		        // Create a context for the selected device
		        cl_context context = clCreateContext(
		            contextProperties, 1, new cl_device_id[]{device}, 
		            null, null, null);
		        
		        // Create a command-queue for the selected device
		        cl_command_queue commandQueue = 
		            clCreateCommandQueue(context, device, 0, null);

		        // Allocate the memory objects for the input- and output data
		        cl_mem memObjects[] = new cl_mem[3];
		        memObjects[0] = clCreateBuffer(context, 
		            CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR,
		            Sizeof.cl_float * n, srcA, null);
		        memObjects[1] = clCreateBuffer(context, 
		            CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR,
		            Sizeof.cl_float * n, srcB, null);
		        memObjects[2] = clCreateBuffer(context, 
		            CL_MEM_READ_WRITE, 
		            Sizeof.cl_float * n, null, null);
		        // Create the program from the source code
		        cl_program program = clCreateProgramWithSource(context,
		        1, new String[]{ programSource }, null, null);
		        
		        
		        
		        // Build the program
		        clBuildProgram(program, 0, null, null, null, null);
		        
		        // Create the kernel
		        cl_kernel kernel = clCreateKernel(program, "sampleKernel", null);
		        
		        // Set the arguments for the kernel
		        clSetKernelArg(kernel, 0, 
		            Sizeof.cl_mem, Pointer.to(memObjects[0]));
		        clSetKernelArg(kernel, 1, 
		            Sizeof.cl_mem, Pointer.to(memObjects[1]));
		        clSetKernelArg(kernel, 2, 
		            Sizeof.cl_mem, Pointer.to(memObjects[2]));
		        
		        // Set the work-item dimensions
		        long global_work_size[] = new long[]{n};
		        long local_work_size[] = new long[]{1};
		        
		        // Execute the kernel
		        clEnqueueNDRangeKernel(commandQueue, kernel, 1, null,
		            global_work_size, local_work_size, 0, null, null);
		        
		        // Read the output data
		        clEnqueueReadBuffer(commandQueue, memObjects[2], CL_TRUE, 0,
		            n * Sizeof.cl_float, dst, 0, null, null);
		        
		        // Release kernel, program, and memory objects
		        clReleaseMemObject(memObjects[0]);
		        clReleaseMemObject(memObjects[1]);
		        clReleaseMemObject(memObjects[2]);
		        clReleaseKernel(kernel);
		        clReleaseProgram(program);
		        clReleaseCommandQueue(commandQueue);
		        clReleaseContext(context);
		        
		        // Verify the result
		        boolean passed = true;
		        final float epsilon = 1e-7f;
		        for (int i=0; i<n; i++)
		        {
		            float x = dstArray[i];
		            float y = srcArrayA[i] * srcArrayB[i];
		            boolean epsilonEqual = Math.abs(x - y) <= epsilon * Math.abs(x);
		            if (!epsilonEqual)
		            {
		                passed = false;
		                break;
		            }
		        }
		        System.out.println("Test "+(passed?"PASSED":"FAILED"));
		        if (n <= 10)
		        {
		            System.out.println("Result: "+java.util.Arrays.toString(dstArray));
		        }
			// TODO Auto-generated method stub
			
return n;
		}
		
		
		
		/**
	     * Initialize the OpenCL context, command queue and kernel
	     */
	    void initCL()
	    {
	        final int platformIndex = 0;
	        final long deviceType = CL_DEVICE_TYPE_ALL;
	        final int deviceIndex = 0;

	        // Enable exceptions and subsequently omit error checks in this sample
	        CL.setExceptionsEnabled(true);

	        // Obtain the number of platforms
	        int numPlatformsArray[] = new int[1];
	        clGetPlatformIDs(0, null, numPlatformsArray);
	        int numPlatforms = numPlatformsArray[0];

	        // Obtain a platform ID
	        cl_platform_id platforms[] = new cl_platform_id[numPlatforms];
	        clGetPlatformIDs(platforms.length, platforms, null);
	        cl_platform_id platform = platforms[platformIndex];

	        // Initialize the context properties
	        cl_context_properties contextProperties = new cl_context_properties();
	        contextProperties.addProperty(CL_CONTEXT_PLATFORM, platform);
	        
	        // Obtain the number of devices for the platform
	        int numDevicesArray[] = new int[1];
	        clGetDeviceIDs(platform, deviceType, 0, null, numDevicesArray);
	        int numDevices = numDevicesArray[0];
	        
	        // Obtain a device ID 
	        cl_device_id devices[] = new cl_device_id[numDevices];
	        clGetDeviceIDs(platform, deviceType, numDevices, devices, null);
	        cl_device_id device = devices[deviceIndex];

	        // Create a context for the selected device
	        context = clCreateContext(
	            contextProperties, 1, new cl_device_id[]{device}, 
	            null, null, null);
	        
	        // Check if images are supported
	        int imageSupport[] = new int[1];
	        clGetDeviceInfo (device, CL.CL_DEVICE_IMAGE_SUPPORT,
	            Sizeof.cl_int, Pointer.to(imageSupport), null);
	        System.out.println("Images supported: "+(imageSupport[0]==1));
	        if (imageSupport[0]==0)
	        {
	            System.out.println("Images are not supported");
	            System.exit(1);
	            return;
	        }

	        // Create a command-queue
	        System.out.println("Creating command queue...");
	        long properties = 0;
	        properties |= CL_QUEUE_PROFILING_ENABLE;
	        properties |= CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE;
	        commandQueue = clCreateCommandQueue(context, device, properties, null);

	        // Create the program
	        System.out.println("Creating program...");
	        cl_program program = clCreateProgramWithSource(context,
	            1, new String[]{ programSource }, null, null);

	        // Build the program
	        System.out.println("Building program...");
	        clBuildProgram(program, 0, null, null, null, null);

	        // Create the kernel
	        System.out.println("Creating kernel...");
	        kernel = clCreateKernel(program, "rotateImage", null);

	    }
		/**
	     * Initialize the memory objects for the input and output images
	     */
	    private void initImageMem()
	    {
	        // Create the memory object for the input- and output image
	        DataBufferInt dataBufferSrc =
	            (DataBufferInt)inputImage.getRaster().getDataBuffer();
	        int dataSrc[] = dataBufferSrc.getData();

	        cl_image_format imageFormat = new cl_image_format();
	        imageFormat.image_channel_order = CL_RGBA;
	        imageFormat.image_channel_data_type = CL_UNSIGNED_INT8;

	        inputImageMem = clCreateImage2D(
	            context, CL_MEM_READ_ONLY | CL_MEM_USE_HOST_PTR,
	            new cl_image_format[]{imageFormat}, imageSizeX, imageSizeY,
	            imageSizeX * Sizeof.cl_uint, Pointer.to(dataSrc), null);

	        outputImageMem = clCreateImage2D(
	            context, CL_MEM_WRITE_ONLY,
	            new cl_image_format[]{imageFormat}, imageSizeX, imageSizeY,
	            0, null, null);
	    }

		

	}


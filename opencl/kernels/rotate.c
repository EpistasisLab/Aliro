const sampler_t samplerIn = 
    CLK_NORMALIZED_COORDS_FALSE |
    CLK_ADDRESS_CLAMP |
    CLK_FILTER_NEAREST;

const sampler_t samplerOut = 
    CLK_NORMALIZED_COORDS_FALSE |
    CLK_ADDRESS_CLAMP |
    CLK_FILTER_NEAREST;

__kernel void rotateImage(
    __read_only  image2d_t sourceImage, 
    __write_only image2d_t targetImage, 
    float angle)
{
    int gidX = get_global_id(0);
    int gidY = get_global_id(1);
    int w = get_image_width(sourceImage);
    int h = get_image_height(sourceImage);
    int cx = w/2;
    int cy = h/2;
    int dx = gidX-cx;
    int dy = gidY-cy;
    float ca = cos(angle);
    float sa = sin(angle);
    int inX = (int)(cx+ca*dx-sa*dy);
    int inY = (int)(cy+sa*dx+ca*dy);
    int2 posIn = {inX, inY};
    int2 posOut = {gidX, gidY};
    uint4 pixel = read_imageui(sourceImage, samplerIn, posIn);
    write_imageui(targetImage, posOut, pixel);
}


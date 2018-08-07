
// hacky delay
export const delay = (ms) => {
   ms += new Date().getTime();
   while (new Date() < ms){}
};
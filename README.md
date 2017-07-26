1. **Check out the project**
 	- Clone the repository from  <b>git@github.com:EpistasisLab/Gp.git</b> 

2. **Install build requirements**
	- docker [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/)
	- make [http://gnuwin32.sourceforge.net/packages/make.htm](http://gnuwin32.sourceforge.net/packages/make.htm),[https://developer.apple.com/] (https://developer.apple.com),[https://wiki.ubuntu.com/ubuntu-make] (https://wiki.ubuntu.com/ubuntu-make),[https://www.gnu.org/software/make/](https://www.gnu.org/software/make)
3. **Modify Makevars**
        - cd Gp/dockers
        - cp Makevars.example Makevars
        - be sure that SHARE_PATH and PROJECTS_ROOT are set to the parent directory of Gp.  

4. **Start the network**
        - ./toggle shared

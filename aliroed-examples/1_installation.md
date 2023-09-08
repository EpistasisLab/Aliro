
# AliroEd

## AliroEd Installation Requirements
- [Raspberry Pi 400](https://www.raspberrypi.com/products/raspberry-pi-400/)
- A computer running Windows 10 or higher
- A MicroSD Card Reader
- MicroSD Card
  - Minimum capacity: 32GB
  - **Note:** There are different speed classes for MicroSD Cards, Application
    Performance Class 1 (A1) and Application Performance 2 (A2). A2 cards are
    **highly recommended** as these are much faster than A1 cards.
- A copy of the [aliro-imager.exe](http://52.35.223.86/education/#download)

## AliroEd Installation
### Windows
1. Download a copy of the [aliro-imager.exe](http://52.35.223.86/education/#download)
2. Insert the MicroSD Card in your card reader.
3. Double-click the downloaded **aliro-imager-\*.exe** on you computer. If prompted to allow
   the application to run, select **Yes**. You may need to enter your computer's
   **Administrator** password to continue.
4. Follow the prompts to proceed with the installation.  
   ![Aliro Imager Install](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_install.png?raw=true "Aliro Imager Install")
5. Once installed, you can run the **AliroEd Imager** from the Start Menu. When
   the program starts up you will see this screen:  
    ![Aliro Imager Start](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_start.png?raw=true "Aliro Imager Start")
6. Click the **CHOOSE STORAGE** button and select your MicroSD Card from the
   popup menu.  
    ![Aliro Imager Choose Storage](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_choose_storage.png?raw=true "Aliro Imager Choose Storage")
7. Click the **WRITE** button to begin writing the Operatying System to your
   MicroSD Card.  
    ![Aliro Imager Write](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_write.png?raw=true "Aliro Imager Write") - **NOTE** that this will **format** your MicroSD Card and all existing data will
   be erased. Click **Yes** at the prompt to proceed.  
    ![Aliro Imager Format](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_format.png?raw=true "Aliro Imager Format") - This writing process may take several minutes, the progress will be shown
   on the **AliroEd Imager.**  
    ![Aliro Imager Finish](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_imager_finish.png?raw=true "Aliro Imager Finish")
8. Insert the MicroSD Card into your Raspberry Pi 400 and start it up.
9. When the Operating System has finished starting up, double-click the
   AliroEd Icon on the Destop or launch the Web Browser.

Now that Aliro is up and running, you are ready to run experiments, AliroEd
comes preloaded with some data sets for you to experiment with. Other datasets
can be downloaded from the
[Penn Machine Learning Benchmarks](https://github.com/EpistasisLab/pmlb)
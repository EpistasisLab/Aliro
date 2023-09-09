# Running experiments on AliroEd
This guide shows you how to construct your own experiment, construct an AI experiment, and view and download results. It assumes that you have launched AliroEd in your Raspberry Pi.

1. **Introduction page** The first page you will see when AliroEd (in the Rapsberry Pi) launches is the introduction page. You can browse this site while AliroEd is loading.  
<!-- ![AliroEd Intropage](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/1_aliroed_intropage.png?raw=true "AliroEd Intropage") -->
![AliroEd Intropage](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/1_aliroed_intropage.png "AliroEd Intropage")

2. **Ready to Run** On the top-right corner of the introductory page you will see a message saying **Loading AliroEd**. Once AliroEd is loaded, this message will change to **Aliro is ready to run**. This is a link, click on it and will take you to the Aliro landing page (step 3).  
![AliroEd Ready to Run](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/2_aliroed_readytorun.png "AliroEd Ready to Run")

3. **Aliro landing page** This page shows you some preloaded datasets.  
**Note the tooltips that will also guide you through buiding experiments.**  
![AliroEd Landing Page](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/3_aliroed_landingpage.png "AliroEd Landing Page")

4. **Building your own experiment** Click _Build New Experiment_ at the bottom of your dataset box. 
This takes you to the experiment building page.  
![AliroEd Building Experiment](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/4_aliroed_buildingownexperiment.png "AliroEd Building Experiment")

5. **Experiments page** The Experiments page lists information about current experiments, including start time, score, and prediction type. By filtering by Algorithm, you can see the algorithm’s parameters for each experiment. In the Actions column on the right, you may download files to reproduce your results:  
    * **Download model** downloads a pickled model file that contains the trained model. Use it to run analysis on more datasets.

    * **Download script** gives you a Python script to reproduce the analysis in the experiment.  
![AliroEd Experiments Page](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/5_aliroed_experimentspage.png "AliroEd Experiments Page")

6. **Experiment results** The Results page summarizes the experiment results through figures and statistics. The algorithm configuration and runtime information is displayed on the left. On the right, the training and testing balances accuracies are shown. For every experiment, the top 10 most important features are shown in a bar plot on the bottom left. For every classification problem, a confusion matrix is shown. For binary classification, an ROC curve and AUC score is provided.  
![AliroEd Experiment Results](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/6_aliroed_experimentresults.png "AliroEd Experiments Results")

7. **AI Analysis** To allow the AI to choose experiments for you, simply toggle on the AI button in the upper right corner of the dataset box. The AI will then run one or more experiments for which it chooses its own algorithms to run. Progress can be viewed from the Experiments page. To configure the AI settings (for example, the number of experiments to run or time limits), see the configuration file in config/ai.env.  
![AliroEd AI Analysis](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/7_aliroed_ai.png "AliroEd AI Analysis")

8. **Uploading your own dataset** Upload a dataset by clicking the "Add New Dataset" button on the **Aliro Landing Page**.
This will take you to the Dataset Upload screen where you can select a .csv or .tsv file to upload. 
You will see a preview of the data. 
Specify the name of the dependent column, as well as any nominal or ordinal features.
Some example datasets can be found in the [Penn Machine Learning Benchmarks github repository](https://epistasislab.github.io/pmlb)  
![AliroEd Uploading Datasets](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/8_aliroed_addnewdataset.png "AliroEd Uploading Datasets")
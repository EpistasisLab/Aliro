// make varialbe json format

var iris_tree_Data = {
    "name": "petal length (cm) > 2.45000004768",
    "pred": "100 of no, 50 of yes",
    "children": [
        {
            "children": [
                {
                    "children": [
                        {
                            
                            "name": "The number of data = 43",
                            "children": [
  
  
  
                               {
                                    
                                    "name": "0 = setosa",
                                    "children": [],
                                    "side": "right",
                                    "type": "categorical",
                                    "size": 0,
                                    "pred": "0 of no, 0 of yes"
                                },
                                {
                                    
                                  "name": "0 = versicolor",
                                  "children": [],
                                  "side": "right",
                                  "type": "categorical",
                                  "size": 0,
                                  "pred": "0 of no, 0 of yes"
                              }
                              ,
                                {
                                    
                                  "name": "43 = virginica",
                                  "children": [],
                                  "side": "right",
                                  "type": "categorical",
                                  "size": 43,
                                  "pred": "43 of no, 0 of yes"
                              }
  
                            ],
                            "side": "right",
                            "type": "categorical",
                            "size": 43,
                            "pred": "0 of no, 0 of yes"
                        },
                        {
                            
                          "name": "The number of data = 3",
                          "children": [
  
  
                            {
                                    
                              "name": "0 = setosa",
                              "children": [],
                              "side": "right",
                              "type": "categorical",
                              "size": 0,
                              "pred": "0 of no, 0 of yes"
                          },
                          {
                              
                            "name": "1 = versicolor",
                            "children": [],
                            "side": "right",
                            "type": "categorical",
                            "size": 1,
                            "pred": "1 of no, 0 of yes"
                        }
                        ,
                          {
                              
                            "name": "2 = virginica",
                            "children": [],
                            "side": "right",
                            "type": "categorical",
                            "size": 2,
                            "pred": "2 of no, 0 of yes"
                        }
  
  
  
  
                          ],
                          "side": "right",
                          "type": "categorical",
                          "size": 3,
                          "pred": "0 of no, 0 of yes"
                      }
  
                    ],
                    "name": "petal length (cm) > 4.85000038147",
                    "side": "right",
                    "type": "categorical",
                    "size": 46,
                    "pred": "43 of no, 3 of yes"
                },
                {
                    
                    "name": "petal length (cm) > 4.94999980927",
                    "children": [
  
                      {
                              
                          "name": "The number of data = 6",
                          "children": [
    
    
    
                             {
                                  
                                  "name": "0 = setosa",
                                  "children": [],
                                  "side": "right",
                                  "type": "categorical",
                                  "size": 0,
                                  "pred": "0 of no, 0 of yes"
                              },
                              {
                                  
                                "name": "2 = versicolor",
                                "children": [],
                                "side": "right",
                                "type": "categorical",
                                "size": 2,
                                "pred": "2 of no, 0 of yes"
                            }
                            ,
                              {
                                  
                                "name": "4 = virginica",
                                "children": [],
                                "side": "right",
                                "type": "categorical",
                                "size": 4,
                                "pred": "4 of no, 0 of yes"
                            }
    
                          ],
                          "side": "right",
                          "type": "categorical",
                          "size": 6,
                          "pred": "0 of no, 0 of yes"
                      },
                      
                      {
                          
                        "name": "The number of data = 48",
                        "children": [
    
    
                          {
                                  
                            "name": "0 = setosa",
                            "children": [],
                            "side": "right",
                            "type": "categorical",
                            "size": 0,
                            "pred": "0 of no, 0 of yes"
                        },
                        {
                            
                          "name": "47 = versicolor",
                          "children": [],
                          "side": "right",
                          "type": "categorical",
                          "size": 47,
                          "pred": "47 of no, 0 of yes"
                      }
                      ,
                        {
                            
                          "name": "1 = virginica",
                          "children": [],
                          "side": "right",
                          "type": "categorical",
                          "size": 1,
                          "pred": "1 of no, 0 of yes"
                      }
    
    
    
    
                        ],
                        "side": "right",
                        "type": "categorical",
                        "size": 48,
                        "pred": "0 of no, 0 of yes"
                      }
    
                        
    
                      ],
                    "side": "left",
                    "type": "categorical",
                    "size": 54,
                    "pred": "6 of no, 48 of yes"
                }
            ],
            "name": "petal width (cm) > 1.75",
            "side": "right",
            "type": "numerical",
            "size": 100,
            "pred": "46 of no, 54 of yes"
        },{
          "name": "The number of data = 50",
          "children": [
  
  
  
              {
                  
                  "name": "50 = setosa",
                  "children": [],
                  "side": "right",
                  "type": "categorical",
                  "size": 50,
                  "pred": "50 of no, 0 of yes"
              },
              {
                  
                "name": "0 = versicolor",
                "children": [],
                "side": "right",
                "type": "categorical",
                "size": 0,
                "pred": "0 of no, 0 of yes"
            }
            ,
              {
                  
                "name": "0 = virginica",
                "children": [],
                "side": "right",
                "type": "categorical",
                "size": 0,
                "pred": "0 of no, 0 of yes"
            }
  
          ],
          "side": "right",
          "type": "categorical",
          "size": 50,
          "pred": "0 of no, 0 of yes"
        }
    ],
    "side": "right",
    "size": 150
  }


var iris_tree_Data = {
  "name": "petal length (cm) > 2.45000004768",
  "children": [
    {
      "name": "petal width (cm) > 1.75",
      "children": [
        {
          "name": "petal length (cm) > 4.85000038147",
          "children": [
            {
              "name": "0 of setosa, 0 of versicolor, 43 of virginica"
            },
            {
              "name": "0 of setosa, 1 of versicolor, 2 of virginica"
            }
          ]
        },
        {
          "name": "petal length (cm) > 4.94999980927",
          "children": [
            {
              "name": "0 of setosa, 2 of versicolor, 4 of virginica"
            },
            {
              "name": "0 of setosa, 47 of versicolor, 1 of virginica"
            }
          ]
        }
      ]
    },
    {
      "name": "50 of setosa, 0 of versicolor, 0 of virginica"
    }
  ]
}
  
  
  
  
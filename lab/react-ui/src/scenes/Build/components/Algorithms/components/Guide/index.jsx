import React from 'react';
import { Popup, Label, Header, Button } from 'semantic-ui-react';

export class Guide extends React.Component {
    constructor() {
        super();
        this.state = {
            isOpen: false,
            step: {
                text: 'Do you need help choosing an algorithm?',
                choices: {
                    'Yes': {
                        text: 'Do you prefer accuracy or faster training time?',
                        choices: {
                            'Accuracy': {
                                text: 'Would a linear model work for your data?',
                                choices: {
                                    'Yes': {
                                        text: 'Here is one recommendation:',
                                        results: ['averaged perceptron']
                                    },
                                    'No': {
                                        text: 'Here is one recommendation:',
                                        results: ['neural network']
                                    }
                                }
                            },
                            'Training Time': {
                                text: 'Would a linear model work for your data?',
                                choices: {
                                   'Yes': {
                                        text: 'Here is one recommendation:',
                                        results: ['logistic regression']
                                    },
                                    'No': {
                                        text: 'Here is one recommendation:',
                                        results: ['support vector machine']
                                    }
                                }
                            }
                        }
                    },
                    'No': {
                        text: 'Okay, have at it!'
                    }
                }
            }
        };
    }

    nextStep(choice) {
        this.setState({ isOpen: true, step: choice });
    }

    handleOpen(e) {
        console.log(e.target);
        this.setState({ isOpen: true })
    }

    handleClose(e) {
        if(e.target.nodeName !== 'BUTTON'){
            this.setState({ isOpen: false });
        }
    }


    render() {
        const color = 'orange';
        const btnColors = ['blue', 'violet', 'pink'];
        const label = <Label color={color} corner='right' icon='question'></Label>;
        return <Popup
                    size='small' flowing 
                    trigger={label}
                    on='click'
                    open={this.state.isOpen}
                    onClose={(e) => this.handleClose(e)}
                    onOpen={(e) => this.handleOpen(e)}
                >
                    <Header>{this.state.step.text}</Header>
                    {this.state.step.choices &&
                        <Button.Group fluid>
                            {Object.entries(this.state.step.choices).map(([key, value], i) =>
                            <Button 
                                key={key} 
                                basic color={btnColors[i]} 
                                onClick={() => this.nextStep(value)}
                            >{key}</Button>
                        )}
                        </Button.Group>
                    }

                     {this.state.step.results &&
                        <Button.Group fluid>
                            {this.state.step.results.map((key, i) =>
                            <Button 
                                key={key} 
                                basic color={btnColors[i]} 
                                //onClick={() => this.nextStep(value)}
                            >{key}</Button>
                        )}
                        </Button.Group>
                    }
                </Popup>;
    }
}
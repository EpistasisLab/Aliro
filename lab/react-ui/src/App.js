import React, { Component } from 'react';
import { Container, Divider, Button, Segment, Header, Grid, Dropdown, Icon, Modal, List } from 'semantic-ui-react';
import './App.css';

// test variables for rending
const datasets = [
  'gametes.csv',
  'adults.csv',
  'thyroid.csv',
  'breast-cancer.csv',
  'hypothryroid.csv',
  'mushrooms.csv'
]

const algorithms = [
  'BernoulliNB',
  'GaussianNB',
  'LinearSVC',
  'LinearSVR',
  'MDR',
  'ElasticNetCV'
]

// display vs value
const params = {
  "alpha": {
    "help": "Additive (Laplace/Lidstone) smoothing parameter (0 for no smoothing).",
    "accepts": "float",
    "default": 1.0,
    "ui": {
      "style": "radio",
      "choices": [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]
    }
  },
  "binarize": {
    "help": "Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.",
    "accepts": "float",
    "default": 0.0,
    "ui": {
      "style": "radio",
      "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
    }
  },
  "fit_prior": {
    "alias": "fit prior",
    "help": "Whether to learn class prior probabilities or not. If false, a uniform prior will be used.",
    "accepts": "bool",
    "default": "true",
    "ui": {
      "style": "radio",
      "choices": ["true", "false"]
    }
  },
  "another": {
    "help": "Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.",
    "accepts": "float",
    "default": 0.0,
    "ui": {
      "style": "radio",
      "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
    }
  },
  "one more": {
    "help": "Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.",
    "accepts": "float",
    "default": 0.0,
    "ui": {
      "style": "radio",
      "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
    }
  },
}

// Refactor!!
// Sizing based on screen dimensions!!
// Naming conventions for classes
// Find text editor for react

class App extends Component {
  render() {
    return (
      <Container fluid className="app">
        <Divider horizontal inverted>
            <Header as='h1' inverted color='grey' content='PennAI' subheader='Your friendly machine learning assistant' />
        </Divider>

        <Grid columns="equal" stretched>
          <Dataset color="orange" list={datasets} />
          <Algorithm color="orange" list={algorithms} />
          <Level color="orange" />
          {Object.keys(params).map(function(key){
            return (
              <Parameter color="blue" key={key} paramName={key} paramData={params[key]} selected={params[key].default} />
            );
          })}
          <Launcher color="olive" />
        </Grid>
      </Container>
    );
  }
}

class Dataset extends Component {
  constructor() {
    super();
    this.state = {
      selected: '',
      modalOpen: false
    };
  }

  handleOpen = (e) => this.setState({
    modalOpen: true
  })

  handleClose = (e) => this.setState({
    modalOpen: false
  })

  render() {
    const color = this.props.color;
    const action = 'Select dataset';
    const btn = <Button inverted color={color} onClick={this.handleOpen}>{action}</Button>;
    return (
      <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
        <Segment inverted color={color}>
          <Header as='h1' inverted color={color} content='Dataset' subheader='Select a dataset for analysis' />
          <Header inverted disabled>Selected: {this.state.selected || 'none' }</Header>
          <Modal basic size='small' dimmer="blurring" trigger={btn} open={this.state.modalOpen} onClose={this.handleClose}>
            <Header content={action} />
            <Modal.Content>
              <Modal.Description>
                <Header inverted>Choose from the following:</Header>
                <List inverted selection divided size="massive">
                {this.props.list.map(function(item, i){
                  return (
                    <List.Item key={item} onClick={() => this.setState({selected: item})}>
                      <List.Header>
                        {item} {item === this.state.selected &&
                          <List.Icon name='check' color={color} className="right" />
                        }
                      </List.Header>
                    </List.Item>
                  );
                }.bind(this))}
                </List>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button inverted color='grey' onClick={this.handleClose}>
                <Icon name='close' /> Close
              </Button>
              <Button inverted color={color} onClick={this.handleClose}>
                <Icon name='checkmark' /> Done
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment>
      </Grid.Column>
    );
  }
}

class Algorithm extends Component {
  constructor() {
    super();
    this.state = {
      selected: '',
      modalOpen: false
    };
  }

  handleOpen = (e) => this.setState({
    modalOpen: true
  })

  handleClose = (e) => this.setState({
    modalOpen: false
  })

  render() {
    const color = this.props.color;
    const action = 'Select algorithm';
    const btn = <Button inverted color={color} onClick={this.handleOpen}>{action}</Button>;
    return (
      <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
        <Segment inverted color={color}>
          <Header as='h1' inverted color={color} content='Algorithm' subheader='Select a machine learning algorithm' />
          <Header inverted disabled>Selected: {this.state.selected || 'none'}</Header>
          <Modal basic size='small' dimmer="blurring" trigger={btn} open={this.state.modalOpen} onClose={this.handleClose}>
            <Header content={action} />
            <Modal.Content>
              <Modal.Description>
                <Header inverted>Choose from the following:</Header>
                <List inverted selection divided size="massive">
                {this.props.list.map(function(item, i){
                  return (
                    <List.Item key={item} onClick={() => this.setState({selected: item})}>
                      <List.Header>
                        {item} {item === this.state.selected &&
                          <List.Icon name='check' color={color} className="right" />
                        }
                      </List.Header>
                    </List.Item>
                  );
                }.bind(this))}
                </List>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button inverted color='grey' onClick={this.handleClose}>
                <Icon name='close' /> Close
              </Button>
              <Button inverted color={color} onClick={this.handleClose}>
                <Icon name='checkmark' /> Done
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment>
      </Grid.Column>
    );
  }
}

class Level extends Component {
   constructor() {
    super();
    this.state = {
      selected: 'Basic'
    };
  }

  render() {
    const color = this.props.color;
    const options = [
      {text: 'Basic', value: 'Basic'},
      {text: 'Advanced', value: 'Advanced'},
      {text: 'Grid Search', value: 'Grid Search'},
      {text: 'Random Search', value: 'Random Search'}
    ];
    return (
      <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
        <Segment inverted color={color}>
          <Header as='h1' inverted color={color} content='Parameter Level' subheader='Select the level of control over parameters' />
          <Header inverted disabled>Selected: {this.state.selected || 'none'}</Header>
          <Dropdown selection button options={options} defaultValue={this.state.selected} onChange={(e,d) => this.setState({selected: d.value})} />
        </Segment>
      </Grid.Column>
    );
  }
}

class Parameter extends Component {
   constructor(props) {
    super();
    this.state = {
      selected: props.selected
    };
  }

  render() {
    const color = this.props.color;
    const name = this.props.paramName;
    const data = this.props.paramData;
    return (
      <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
        <Segment inverted color={color}>            
          <Header as='h1' inverted color={color} content={data.alias || name} subheader={data.help} />
          {data.ui.choices.map(function(choice, i){
            return <Button inverted key={choice} color='blue' content={choice} active={choice === this.state.selected} onClick={() => this.setState({selected: choice})} />;
          }.bind(this))}
        </Segment>
      </Grid.Column>  
    );
  }
}

class Launcher extends Component {
  render() {
    const color = this.props.color;
    return (
      <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
        <Segment inverted color={color}>   
          <Header as='h1' inverted color={color} content='Launch experiment' subheader='Start your experiment' />
          <p>include overview of chosen params</p>
          <Button inverted color={color}>Launch</Button>
        </Segment>
      </Grid.Column>
    );
  }
}

class ListModal extends Component {
  render() {
    const action = 'Select ' + this.props.listName;
    const btn = <Button inverted color={this.props.color}>{action}</Button>;
    return (
      <Modal basic size='small' dimmer="blurring" trigger={btn}>
        <Header content={action} />
        <Modal.Content>
          <Modal.Description>
            <Header inverted>Choose from the following:</Header>
            <List inverted selection divided size="massive">
            {this.props.list.map(function(item, i){
              return (
                <List.Item key={item} onClick={() => this.props.onClose({selected: item})}>
                  <List.Header>
                    {item} {item === this.props.selected &&
                      <List.Icon name='check' color={this.props.color} className="right" />
                    }
                  </List.Header>
                </List.Item>
              );
            }.bind(this))}
            </List>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button inverted color='grey'>
            <Icon name='close' /> Close
          </Button>
          <Button inverted color={this.props.color}>
            <Icon name='checkmark' /> Done
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default App;
import React from 'react';
import { Modal, Button, Header, Input } from 'semantic-ui-react';

function AddNewAlgorithm() {
  const trigger = (
    <Button 
      inverted
      color="blue" 
      compact 
      size="small" 
      icon="plus"
      content="Add new algorithm"
    />
  );

  return (
    <Modal trigger={trigger} size="small" closeIcon>
      <Header icon="plus" content="Add New Algorithm" />
      <Modal.Content>
        <p>{'Upload a valid project schema. The name of the JSON file will be used to name the project.'}</p>
        <Input type="file" name="schema" />
      </Modal.Content>
      <Modal.Actions>
        <Button color="blue" icon="upload" content="Upload" />
      </Modal.Actions>
    </Modal>
  );
}

export default AddNewAlgorithm;
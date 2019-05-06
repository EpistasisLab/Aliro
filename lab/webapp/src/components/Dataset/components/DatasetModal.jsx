import React from 'react';
import { Modal } from 'semantic-ui-react';

const DatasetModal = ({ project, handleClose }) => {
  if(!project) { return null; }
  // use inline styling because I can't figure out css
  return (
    <Modal basic style={{ marginTop:'0' }} open={project ? true : false} onClose={handleClose} closeIcon>
      <Modal.Header>metadataStuff from server goes here: {project.name}</Modal.Header>
      <Modal.Content>
        <pre>{JSON.stringify(project.schema, null, 2)}</pre>
      </Modal.Content>
    </Modal>
  );
};

export default DatasetModal;

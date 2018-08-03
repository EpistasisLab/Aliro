import React from 'react';
import { Modal } from 'semantic-ui-react';

const ProjectModal = ({ project, handleClose }) => {
  if(!project) { return null; }

  return (
    <Modal basic open={project ? true : false} onClose={handleClose} closeIcon>
      <Modal.Header>Schema: {project.name}</Modal.Header>
      <Modal.Content>
        <pre className="schema">{JSON.stringify(project.schema, null, 2)}</pre>
      </Modal.Content>
    </Modal>
  );
};

export default ProjectModal;
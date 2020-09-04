/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
import React from 'react';
import { Modal } from 'semantic-ui-react';

const ProjectModal = ({ project, handleClose }) => {
  if(!project) { return null; }

  return (
    <Modal basic open={project ? true : false} onClose={handleClose} closeIcon>
      <Modal.Header>Schema: {project.name}</Modal.Header>
      <Modal.Content>
        <pre className="schema">{JSON.stringify(project, null, 2)}</pre>
      </Modal.Content>
    </Modal>
  );
};

export default ProjectModal;

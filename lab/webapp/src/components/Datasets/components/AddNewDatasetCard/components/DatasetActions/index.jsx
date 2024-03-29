/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
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

(Autogenerated header, do not modify)

*/
import React from 'react';
import { Loader, Dimmer, Checkbox, Popup, Dropdown, Icon } from 'semantic-ui-react';

function DatasetActions({ dataset, recommender, toggleAI }) {
  const onToggleAI = () => {
    const aiState = dataset.ai;
    const aiNextState = aiState === 'off' || aiState === 'finished' ? 'requested' : 'off';

    toggleAI(dataset._id, aiNextState);
  };

  // ai states: on, queueing, requested, off, finished
  // recommender states: initializing, disabled, active

  // if the recommender is in an off or initializing state, disable the ai toggle
  const hasMetadata = dataset.has_metadata;
  const aiLabelText = 'AI';
  
  const recState = recommender.status;
  const aiState = dataset.ai; 

  const aiInitializing = (recState === 'initializing') ? true : false;
  const aiDisabled = (recState === 'running') ? dataset.isTogglingAI : true;
  const aiIsChecked = (aiState === 'off' || aiState === 'finished') ? false : true;

  const aiLabelClass = `ai-label ${(aiIsChecked) ? 'bright' : 'dim' }`;
  const aiToggleClass = `ai-switch ${(aiState === 'on' || aiState === 'queuing') ? 'active' : aiState }`;

  const aiPopupContent = (recState === 'running') ? `AI ${aiState}` : `AI recommender ${recState}`;

  const dropdownIcon = <Icon inverted color="grey" size="large" name="caret down" />; 


  if (aiInitializing) {
    return (
      <span>
        <span>
          <span className={aiLabelClass}>
            {aiLabelText}
          </span>
          <Loader size='small' active inline indeterminate />
        </span>
       </span>
    );
  } else {
    return (
      <span>
        {hasMetadata &&
          <span>
            <span className={aiLabelClass}>
              {aiLabelText}
            </span>
            <Popup
              content={aiPopupContent}
              size="small"
              hideOnScroll
              trigger={
                <Checkbox
                  toggle
                  checked={aiIsChecked}
                  className={aiToggleClass}
                  onChange={onToggleAI}
                  disabled={aiDisabled}
                />
              }
            />
          </span>
        }
        {/*<Dropdown pointing="top right" icon={dropdownIcon}>
          <Dropdown.Menu>
            <Dropdown.Item icon="file" text="Replace file" />
            <Dropdown.Item icon="trash" text="Delete" />
          </Dropdown.Menu>
        </Dropdown>*/}
      </span>
    );
  }
}

export default DatasetActions;

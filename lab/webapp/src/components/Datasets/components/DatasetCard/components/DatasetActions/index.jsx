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

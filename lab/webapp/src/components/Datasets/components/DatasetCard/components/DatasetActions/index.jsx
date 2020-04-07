import React from 'react';
import { Checkbox, Popup, Dropdown, Icon } from 'semantic-ui-react';

function DatasetActions({ dataset, toggleAI }) {
  const onToggleAI = () => {
    const aiState = dataset.ai;
    const aiNextState = aiState === 'off' || aiState === 'finished' ? 'requested' : 'off';

    toggleAI(dataset._id, aiNextState);
  };

  // ai states: on, queueing, requested, off, finished
  // recommender states: initilizing, disabled, active

  // if the recommender is in an off or initilizing state, disable the ai toggle
  const hasMetadata = dataset.has_metadata;
  const aiLabelText = 'AI';

  const aiState = dataset.ai;

  const aiDisabled = dataset.isTogglingAI;
  const aiIsChecked = (aiState === 'off' || aiState === 'finished') ? false : true;

  const aiLabelClass = `ai-label ${(aiIsChecked) ? 'bright' : 'dim' }`;
  const aiToggleClass = `ai-switch ${(aiState === 'on' || aiState === 'queuing') ? 'active' : aiState }`;

  const aiPopupContent = `AI ${aiState}`;

  const dropdownIcon = <Icon inverted color="grey" size="large" name="caret down" />;

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

export default DatasetActions;

import React from 'react';
import { Checkbox, Popup, Dropdown, Icon } from 'semantic-ui-react';

function DatasetActions({ dataset, toggleAI }) {
  const onToggleAI = () => {
    const aiState = dataset.ai;
    const aiNextState = aiState === 'off' ? 'requested' : 'off';

    toggleAI(dataset._id, aiNextState);
  };

  const hasMetadata = dataset.has_metadata;

  const aiState = dataset.ai;

  const aiLabelText = 'AI';

  const aiLabelClass = `ai-label ${aiState}`;

  const aiToggleClass = `ai-switch ${aiState === 'requested' ? 'requested' : '' }`;

  const aiIsChecked = aiState === 'off' ? false : true;

  const aiIsToggling = dataset.isTogglingAI;

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
                disabled={aiIsToggling}
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
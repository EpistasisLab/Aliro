import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Checkbox, Popup, Dropdown, Icon } from 'semantic-ui-react';

function DatasetActions({ dataset, toggleAI }) {
  const onToggleAI = () => {
    const aiState = dataset.get('ai');
    const aiNextState = aiState === 'off' ? 'requested' : 'off';

    toggleAI(dataset.get('_id'), aiNextState);
  };

  const hasMetadata = dataset.get('has_metadata');

  const aiState = dataset.get('ai');

  const aiLabelText = 'AI';

  const aiLabelClass = `ai-label ${aiState}`;

  const aiToggleClass = `ai-switch ${aiState === 'requested' ? 'requested' : '' }`;

  const aiIsChecked = aiState === 'off' ? false : true;

  const aiIsToggling = dataset.get('isTogglingAI');

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
      <Dropdown pointing="top right" icon={dropdownIcon}>
        <Dropdown.Menu>
          <Dropdown.Item icon="file" text="Replace file" />
          <Dropdown.Item icon="trash" text="Delete" />
        </Dropdown.Menu>
      </Dropdown>
    </span>
  );
}

DatasetActions.propTypes = {
  dataset: ImmutablePropTypes.map.isRequired,
  toggleAI: PropTypes.func.isRequired
};

export default DatasetActions;
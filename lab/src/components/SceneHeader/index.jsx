import React from 'react';
import PropTypes from 'prop-types';
import { Header, Button } from 'semantic-ui-react';

function SceneHeader({
  header, 
  subheader, 
  btnText, 
  btnIcon, 
  //btnAction
}) {
  return (
    <div className="scene-header">
      <Header 
        inverted 
        size="huge" 
        content={header}
        subheader={subheader}
      />
      {btnText &&
        <Button 
          inverted 
          color="blue" 
          compact 
          size="small" 
          icon={btnIcon}
          content={btnText}
        />
      }
    </div>
  );
}

SceneHeader.propTypes = {
  header: PropTypes.string.isRequired,
  subheader: PropTypes.string,
  btnText: PropTypes.string,
  btnIcon: PropTypes.string,
  btnAction: PropTypes.func
};

export default SceneHeader;
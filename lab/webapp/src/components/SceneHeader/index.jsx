import React from 'react';
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

export default SceneHeader;
import React from 'react';
import { Segment, Header, Popup, Button } from 'semantic-ui-react';

function InvertedCard({ 
  header, 
  tooltip, 
  options, 
  content, 
  footer 
}) {
  return (
    <div className="inverted-card">
      <Segment inverted attached="top">
        <Header inverted size="medium" content={header} />
        {tooltip &&
          <span className="float-right">
            <Popup
              trigger={<Button circular icon="info" />}
              content={tooltip}
            />
          </span>  
        }
        {options &&
          <span className="float-right">
            {options}
          </span>
        }
      </Segment>
      <Segment inverted attached="bottom">
        {content}
      </Segment>
      {footer &&
        <span>{footer}</span>
      }
    </div>
  );
}

export default InvertedCard;
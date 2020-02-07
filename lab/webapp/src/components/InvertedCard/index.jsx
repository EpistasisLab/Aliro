import React from 'react';
import { Segment, Header, Popup, Button } from 'semantic-ui-react';

function InvertedCard({
  header,
  headericon,
  tooltip,
  options,
  content,
  footer
}) {
  return (
    <div className="inverted-card">
      <Segment inverted attached="top">
        <Header inverted size="medium">
          {header}
          {headericon &&
            <span className="float-right">
              {headericon}
            </span>
          }
        </Header>
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

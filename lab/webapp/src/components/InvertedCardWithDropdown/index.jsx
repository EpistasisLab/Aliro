import React from 'react';
import { Dropdown, Grid, Segment, Header, Popup, Button } from 'semantic-ui-react';

function InvertedCardWithDropdown({ 
  header,
  headericon, 
  tooltip, 
  options, 
  placeholder, 
  selectoption, 
  dropdownoptions, 
  onoptionchange,
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
              trigger={<Button circular class="small button" icon="info" />}
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
        <span>
          <Header inverted size="small" content={
            <Grid>
              <Grid.Column width={5} style={
                {verticalAlign: 'center',
                textAlign: 'center',
                lineHeight: '30px'}}>
                Class Name
              </Grid.Column> 
              <Grid.Column width={11}>
                <Dropdown
                    style={{fontSize: '12px'}}
                    placeholder={placeholder}
                    fluid
                    search
                    selection
                    onChange={onoptionchange}
                    value={selectoption}
                    options={dropdownoptions}
                  />
              </Grid.Column>
            </Grid>
          } />
          {content}
        </span>
      </Segment>
      {footer &&
        <span>{footer}</span>
      }
    </div>
  );
}

export default InvertedCardWithDropdown;
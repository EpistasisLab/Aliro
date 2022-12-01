import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router';

import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router';

function tooltip({
  header,
  subheader,
  btnText,
  btnIcon,
  linkText
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
          as={ Link }
          to={linkText}
        />
      }
    </div>
  );
}

export default tooltip;

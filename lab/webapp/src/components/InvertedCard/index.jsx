/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, Cedars-Sinai Medical Center

Aliro is maintained by:
    - Jun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

(Autogenerated header, do not modify)

*/
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

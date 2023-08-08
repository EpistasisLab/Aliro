/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
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
import React from "react";
import { Grid, Segment, Header, Popup, Button, Icon } from "semantic-ui-react";
import { formatAlgorithm } from "utils/formatter";

function AlgorithmOptions({
  algorithms,
  currentAlgorithm,
  setCurrentAlgorithm,
}) {
  const getIsActive = (algorithm) => {
    return currentAlgorithm && algorithm._id === currentAlgorithm._id;
  };

  const contextRef = React.useRef();

  console.log("algorithms", algorithms);
  console.log("currentAlgorithm", currentAlgorithm);
  console.log("setCurrentAlgorithm", setCurrentAlgorithm);

  function openTrueOrFalse_algorithm_popup() {
    if (localStorage.getItem("algorithm-popup") == "true") {
      // if (document.getElementById("aiTooglePopup")!==null){
      //   document.getElementById("aiTooglePopup").style.cssText = "display: block !important";
      // }

      return false;
    } else {
      return true;
    }
  }

  return (
    <Grid.Column width={16}>
      <Segment inverted attached="top" className="panel-header">
        <Header
          inverted
          size="large"
          color="orange"
          content="Select Algorithm"
        />
      </Segment>

      <Popup
        id="algorithm-popup"
        trigger={
          <Segment inverted attached="bottom">
            <Grid columns={3} stackable className="compressed">
              {algorithms &&
                algorithms.map((algorithm) => (
                  <Grid.Column key={algorithm._id}>
                    <Button
                      fluid
                      inverted
                      color="orange"
                      size="large"
                      active={getIsActive(algorithm)}
                      onClick={() => setCurrentAlgorithm(algorithm)}
                      className="algorithm-btn"
                    >
                      {formatAlgorithm(algorithm.name)}
                      <div className="param-count">
                        {`${Object.keys(algorithm.schema).length} parameters`}
                      </div>
                    </Button>
                    <Popup
                      on="click"
                      position="right center"
                      header={formatAlgorithm(algorithm.name)}
                      content={
                        <div className="content">
                          <p>{algorithm.description}</p>
                          {algorithm.url && (
                            <a href={algorithm.url} target="_blank">
                              <strong>
                                Read more here{" "}
                                <Icon name="angle double right" />
                              </strong>
                            </a>
                          )}
                        </div>
                      }
                      trigger={
                        <Icon
                          inverted
                          size="large"
                          color="orange"
                          name="info circle"
                        />
                      }
                    />
                  </Grid.Column>
                ))}
            </Grid>
          </Segment>
        }
        content="Step 4: Select an algorithm to begin building a model."
        position="top center"
        open={openTrueOrFalse_algorithm_popup()}
        onClick={() => {
          if (document.getElementById("algorithm-popup") != null) {
            document.getElementById("algorithm-popup").style.cssText +=
              ";display:none !important;";

            localStorage.setItem("algorithm-popup", "true");
            // show the local storage on the console
            console.log(
              "algorithm-popup",
              localStorage.getItem("algorithm-popup")
            );

            // get class name content under id aiTooglePopup
            var content = document
              .getElementById("param-popup")
              .getElementsByClassName("content")[0];
            // set border-radius: 10px;
            content.style.cssText += ";border-radius: 10px;";

            var parampopup = document.getElementById("param-popup");

            // set display: flex;
            parampopup.style.cssText += ";display: flex;";
            // set flex-direction: row;
            parampopup.style.cssText += ";flex-direction: row;";
            // set align-items: center;
            parampopup.style.cssText += ";align-items: center;";

            // border: 2px solid red;
            parampopup.style.cssText += ";border: 2px solid red;";

            // set animation: blinker 1s linear infinite;
            parampopup.style.cssText +=
              ";animation: blinker 1s linear infinite;";

            // display: flex;
            // flex-direction: row;
            // align-items: center;
            // border: 2px solid red;
            // animation: blinker 1s linear infinite;
          }
        }}
      />
    </Grid.Column>
  );
}

export default AlgorithmOptions;

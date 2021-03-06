import React, { useState, useEffect, useContext } from "react";
import { TankContext } from "../../../context/tankContext";
import { simulate } from "../../../api/simulationFunctions";
import InfoSet from "../result/InfoSet";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import {
  SimulationContainer,
  SimulationDataContainer,
} from "./simulationElements";
import { InfoSetContainer } from "../result/InfoSet";
const OpenSimulation = () => {
  const {
    calculationArr,
    setCalculationArr,
    validationError,
    validationArray,
    setValidationArray,
    pageObj,
    tcalc,
    dt,
    setTcalc,
    setDt,
    setResultArr,
    handlePageObj,
    setStandardResultArr,
  } = useContext(TankContext);
  const [localSet, setLocalSet] = useState(calculationArr);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [time, setTime] = useState(null);
  const [step, setStep] = useState(null);
  const addNewSet = () => {
    const actualSet = [...localSet];

    const tempArr = JSON.parse(JSON.stringify(actualSet[0]));

    actualSet.push(tempArr);
    setLocalSet(actualSet);
    setCalculationArr(actualSet);
  };

  const handleChangeMassAndVolume = (e, indexOfSet, tankIndex, toChange) => {
    const actualSet = [...localSet];
    actualSet[indexOfSet][tankIndex][toChange] = parseFloat(
      e.target.value.replace(/,/, ".")
    );
    console.log(actualSet);
    setLocalSet(actualSet);
    setCalculationArr(actualSet);
  };
  const handleChangeFlux = (e, indexOfSet, tankIndex, fluxName) => {
    console.log(indexOfSet);
    const actualSet = [...localSet];
    console.log(actualSet[indexOfSet]);
    actualSet[indexOfSet][tankIndex].out.forEach((outObj) =>
      outObj.fluxName === fluxName
        ? (outObj.fluxValue = parseFloat(e.target.value.replace(/,/, ".")))
        : outObj
    );
    actualSet[indexOfSet].forEach((tank) =>
      tank.in.forEach((inObj) =>
        inObj.fluxName === fluxName
          ? (inObj.fluxValue = parseFloat(e.target.value.replace(/,/, ".")))
          : inObj
      )
    );
    console.log(actualSet);
    setLocalSet(actualSet);
    setCalculationArr(actualSet);
  };

  const validateSet = (set) => {
    const temp = set.filter((el) => el.id !== "255" && el.id !== "277");
    const fluxArr = [];
    console.log("temp", temp);
    temp.forEach((tank) => {
      let tempArr = [];
      tank.in.forEach((inObj) => tempArr.push(inObj.fluxValue));
      tank.out.forEach((outObj) => tempArr.push(-outObj.fluxValue));
      fluxArr.push(tempArr.reduce((a, b) => a + b));
    });
    console.log(fluxArr);
    const validationArray = fluxArr.map((el) =>
      // el === 0 || (el < 1e-8 && el > 0) ? 0 : 1
      el === 0 || (el < 1e-8 && el > 0) ? 0 : 1
    );
    console.log("validationarr", validationArray);
    const validation = validationArray.reduce((a, b) => a + b);
    if (validation === 0) {
      console.log(true);
      return true;
    } else {
      console.log(false);
      return false;
    }
  };

  const verify = () => {
    const actualCalculationArr = [...calculationArr];
    const tempValidationArr = [];

    actualCalculationArr.forEach((set, index) => {
      if (index === 0) {
        tempValidationArr.push(true);
      } else {
        let isValidated = validateSet(set);
        tempValidationArr.push(isValidated);
      }
    });
    setValidationArray(tempValidationArr);
    const isValidated = tempValidationArr.reduce((a, b) => a && b);
    let message = isValidated ? "validation success" : "validation failed";
    handlePageObj("simulation", isValidated, message);
    console.log(isValidated);
    console.log(validationArray);

    if (isValidated) {
      console.log("simulation...");
      console.log(validationArray);
      console.log("pageobj", pageObj);
    }
  };
  return (
    <SimulationContainer>
      {calculationArr.length === 0 ? (
        <h1>Stw??rz model uk??adu w zak??adce MODEL</h1>
      ) : (
        <>
          {pageObj[1].validation ? (
            <SimulationDataContainer>
              <p>
                Walidacja pomy??lna, prosz?? uzupe??ni?? dane i zatwierdzi??
                przyciskiem poni??ej.
              </p>
              {error ? (
                <p style={{ color: "red" }}>Prosz?? poda?? krok czasowy!</p>
              ) : null}
              <br />
              <TextField
                id="outlined-basic"
                label="Czas ca??kowity [s]"
                variant="outlined"
                className="login"
                onChange={(e) =>
                  setTime(parseFloat(e.target.value.replace(/,/, ".")))
                }
              />
              <br />
              <br />
              <TextField
                id="outlined-basic"
                label="Krok czasowy [s]"
                variant="outlined"
                className="login"
                onChange={(e) =>
                  setStep(parseFloat(e.target.value.replace(/,/, ".")))
                }
              />
              <br />
              <br />
              {success ? (
                <h3 style={{ color: "blue", marginBottom: "20px" }}>
                  Symulacja przebieg??a pomy??lnie, przejd?? do zak??adki Wyniki
                </h3>
              ) : null}
              <Button
                variant="contained"
                color="primary"
                className="submit"
                onClick={() =>
                  simulate(
                    time,
                    step,
                    calculationArr,
                    setResultArr,
                    setStandardResultArr,
                    setError,
                    handlePageObj,
                    setSuccess
                  )
                }
              >
                Symulacja
              </Button>
            </SimulationDataContainer>
          ) : (
            <>
              <div>
                {validationError.error ? (
                  <p>{validationError.message}</p>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      className="submit"
                      onClick={() => addNewSet()}
                    >
                      Nowy set
                    </Button>
                  </>
                )}

                {/* localSet jest tablic?? set??w (simulation set) => set jest tablic?? Tank??w => tank to obiekt o w??a??ciwo??ciach: tankId, mass, volume, in (tablica strumieni wej??ciowych), out (talica strumieni wyj??ciowych)
      obiekty w tablicy "in" maj?? w??asciwo??ci: fluxName i fluxValue
      obiekty w tablicy "out" maj?? w??asciwo??ci: fluxName, fluxValue oraz tankIdInMassArr (kt??ry okre??la ID masy w tablicy mas potrzebnych do oblicze??)
    */}
                {calculationArr
                  ? calculationArr.map((set, indexOfSet) => {
                      if (indexOfSet === 0) {
                        return <InfoSet set={set} indexSet={indexOfSet} />;
                      } else {
                        return (
                          <InfoSetContainer key={indexOfSet}>
                            <h1>SimulationSet {indexOfSet}</h1>
                            {set.map((tank, tankIndex) =>
                              tank.id !== "277" && tank.id !== "255" ? (
                                <div key={tankIndex}>
                                  <h2>
                                    Tank
                                    {tank.id}
                                  </h2>
                                  <h4>
                                    {tank.label
                                      ? `Nazwa podobszaru: ${tank.label}`
                                      : ""}
                                  </h4>
                                  <label>
                                    m<sub>{tank.id}</sub>
                                    <input
                                      type="text"
                                      onChange={(e) =>
                                        handleChangeMassAndVolume(
                                          e,
                                          indexOfSet,
                                          tankIndex,
                                          "mass"
                                        )
                                      }
                                    />
                                  </label>
                                  <br />
                                  <label>
                                    V<sub>{tank.id}</sub>
                                    <input
                                      type="text"
                                      onChange={(e) =>
                                        handleChangeMassAndVolume(
                                          e,
                                          indexOfSet,
                                          tankIndex,
                                          "volume"
                                        )
                                      }
                                    />
                                  </label>
                                  <br />
                                  <h4>Flux out</h4>
                                  {tank.out.map((flux, index) => (
                                    <>
                                      <label key={index}>
                                        {flux.target === "277" ? (
                                          <span>
                                            F<sub>w</sub>
                                          </span>
                                        ) : (
                                          <span>
                                            F<sub>{flux.fluxName}</sub>
                                          </span>
                                        )}
                                        <input
                                          type="text"
                                          onChange={(e) =>
                                            handleChangeFlux(
                                              e,
                                              indexOfSet,
                                              tankIndex,
                                              flux.fluxName
                                            )
                                          }
                                        />
                                      </label>
                                      <br />
                                    </>
                                  ))}
                                </div>
                              ) : tank.id === "255" ? (
                                <div>
                                  <label key={"out"}>
                                    <span>
                                      F<sub>w</sub>
                                    </span>
                                    <input
                                      type="text"
                                      onChange={(e) =>
                                        handleChangeFlux(
                                          e,
                                          indexOfSet,
                                          tankIndex,
                                          tank.out[0].fluxName
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              ) : (
                                ""
                              )
                            )}
                            <p
                              style={{
                                color: `${
                                  validationArray[indexOfSet] ? "blue" : "red"
                                }`,
                              }}
                            >
                              Validation:
                              {validationArray[indexOfSet]
                                ? "correct"
                                : "false"}
                            </p>
                          </InfoSetContainer>
                        );
                      }
                    })
                  : null}
              </div>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  className="submit"
                  onClick={() => verify()}
                >
                  Sprawd?? i zatwierd??
                </Button>

                <h2>{pageObj[1].message}</h2>
              </div>
            </>
          )}
        </>
      )}
    </SimulationContainer>
  );
};

export default OpenSimulation;

import * as React from "react";
import { IAdministrationProps } from "./IAdministrationProps";
import styles from "../Navigation/SpfxReactRouter.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import * as strings from "MeetingAppWebPartStrings";

function Administration(props: IAdministrationProps) {
  return (
    // <div className={styles.spfxReactRouter}>
    //   <h1>Administration <span style={{color:'green'}}></span></h1>
    // </div>

    <div>
    <h2>Administration</h2>
    <p>Sie können hier Einstellungen für die Meeting-App vornehmen</p>
    <p>Bitte wählen Sie eine Aktion aus</p>
    </div>
  );
}

export default Administration;

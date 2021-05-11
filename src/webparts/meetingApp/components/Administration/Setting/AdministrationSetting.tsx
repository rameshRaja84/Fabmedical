import * as React from "react";
import { IAdministrationSettingProps } from "./IAdministrationSettingProps";
//import styles from "../Navigation/SpfxReactRouter.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import * as strings from "MeetingAppWebPartStrings";


function AdministrationSetting(props: IAdministrationSettingProps) {

  function _getPeoplePickerItems(items: any[]) {
    console.log('Items:', items);
  }


  return (
    // <div className={styles.spfxReactRouter}>
    //   <h1>Administration <span style={{color:'green'}}></span></h1>
    // </div>

    <div>
      <PeoplePicker
        context={props.context}
        titleText={strings.AdminSettingGroupContributers}
        personSelectionLimit={25}
        groupName={"Meeting App Contributors"} // Leave this blank in case you want to filter from all users
        showtooltip={true}
        required={true}
        disabled={false}
        onChange={_getPeoplePickerItems}
        showHiddenInUI={false}
        principalTypes={[PrincipalType.User]}
        resolveDelay={1000}
      />

      <PeoplePicker
        context={props.context}
        titleText={strings.AdminSettingGroupAdministrators}
        personSelectionLimit={25}
        groupName={"Meeting App Administrators"} // Leave this blank in case you want to filter from all users
        showtooltip={true}
        required={true}
        disabled={false}
        onChange={_getPeoplePickerItems}
        showHiddenInUI={false}
        principalTypes={[PrincipalType.User]}
        resolveDelay={1000}
      />
    </div>
  );
}

export default AdministrationSetting;

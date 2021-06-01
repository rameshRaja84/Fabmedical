import * as React from "react";
import { useState } from "react";
/*import styles from './SpfxReactHooksCrud.module.scss';*/
import { INavigationProps } from "./INavigationProps";
import styles from "./Navigation.module.scss";

import {
  Nav,
  INavLink,
  INavStyles,
  INavLinkGroup,
} from "office-ui-fabric-react/lib/Nav";

import Administration from "../Administration/Administration";
import AdministrationSetting from "../Administration/Setting/AdministrationSetting";
import Calendar from "../Calendar/Calendar";
import Agenda from "../Agenda/Agenda";
import HomePage from "../Home/Home";

//UI Themes
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { NeutralColors } from '@fluentui/theme';

//const UserContext = React.createContext([]);
const navStyles: Partial<INavStyles> = {
  root: {
    width: 208,
    height: 350,
    boxSizing: "border-box",
    border: "1px solid #eee",
    overflowY: "auto",
  },
};

const navLinkGroups: INavLinkGroup[] = [
  {
    links: [
      {
        name: "Home",
        url: "#/",
        expandAriaLabel: "Expand Home section",
        collapseAriaLabel: "Collapse Home section",
        isExpanded: true,
        key: "homeKey",
      },
      // {
      //   name: "Start Meeting",
      //   url: "#/",
      //   isExpanded: true,
      //   key: "appointementStartKey",
      // },
      {
        name: "Administration",
        url: "#/",
        key: "adminKey",
        isExpanded: false,
        links: [
          // {
          //   name: "Setting",
          //   url: "#/",
          //   key: "adminSettingKey",
          // },
          {
            name: "Manage Meeting",
            url: "#/",
            key: "adminManageMeetingKey",
          },
          {
            name: "Agenda",
            url: "#/",
            key: "adminAgendaKey",
            // links: [
            //   {
            //     name: "Add Agenda",
            //     url: "#/",
            //     key: "adminAddAgendaKey",
            //   },
            // ],
          },
        ],
      },
    ],
  },
];

function Navigation(props: INavigationProps) {
  const [showContent, setShowContent] = useState("none");

  //Show Content for Admin
  function _onLinkClick(ev?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    //console.log("Seleced key is " + item.key);
    if (item && item.key === "adminKey") {
      setShowContent("adminHome");
    } else if (item && item.key === "adminSettingKey") {
      setShowContent("adminsetting");
    } else if (item && item.key === "adminManageMeetingKey") {
      setShowContent("adminManageMeeting");
    } else if (item && item.key === "adminAgendaKey") {
      setShowContent("adminAgendaKey");
    } else if (item && item.key === "adminAddAgendaKey") {
      setShowContent("adminAddAgendaKey");
    } else {
      setShowContent("home");
    }
  }

  const renderComponent = () => {
    if (showContent === "adminHome") {
      return (
        <div className={styles.NavigationContent}>
          <Administration></Administration>
        </div>
      );
    }

    if (showContent === "adminsetting") {
      return (
        <div className={styles.NavigationContent}>
          <AdministrationSetting
            context={props.context}
          ></AdministrationSetting>
        </div>
      );
    } else if (showContent === "adminManageMeeting") {
      return (
        <div className={styles.NavigationContent}>
           <Customizer {...FluentCustomizations}>
          <Calendar
            context={props.context}
            updateProperty={props.updateProperty}
            displayMode={props.displayMode}
            siteUrl={props.siteUrl}
            title={props.title}
            list={props.list}
            eventStartDate={props.eventStartDate}
            eventEndDate={props.eventEndDate}
          ></Calendar></Customizer>
        </div>
      );
    } else if (showContent === "home") {
      return (
        <div style={{ backgroundColor: NeutralColors.gray60 }}>
      <Customizer {...FluentCustomizations}>
      <HomePage title="MeetingApp" ></HomePage></Customizer>
        </div>
);
    } else if (showContent === "adminAgendaKey") {
      return (
        <div className={styles.NavigationContent}>
           <Customizer {...FluentCustomizations}>
          <Agenda
            usePaging={true}
            context={props.context}
            agendaSiteUrl={props.siteUrl}
            eventStartDate={props.eventStartDate}
            eventEndDate={props.eventEndDate}
            list={props.list}
          ></Agenda></Customizer>
        </div>
      );
    }
    else{
      return (
        <div style={{ backgroundColor: NeutralColors.gray60 }}>
        <Customizer {...FluentCustomizations}>
        <HomePage title="MeetingApp" ></HomePage></Customizer>
          </div>
      );
    }
  };

  return (
    <div>
      <div className={styles.NavigationMain}>
      <Customizer {...FluentCustomizations}>
        <Nav
          onLinkClick={_onLinkClick}
          ariaLabel="Nav basic example"
          styles={navStyles}
          groups={navLinkGroups}
        /></Customizer>
      </div>
      {renderComponent()}
    </div>
  );
}

export default Navigation;

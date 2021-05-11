import * as React from "react";
import styles from "./MeetingApp.module.scss";
import { IMeetingAppProps } from "./IMeetingAppProps";
import { escape } from "@microsoft/sp-lodash-subset";
// import SimpleHooks from "./HooksExample/SimpleHooks"
import Navigation from "./Navigation/Navigation";

export default class MeetingApp extends React.Component<IMeetingAppProps, {}> {
  public render(): React.ReactElement<IMeetingAppProps> {
    return (
      <div>
        <Navigation
          context={this.props.context}
          updateProperty={this.props.updateProperty}
          displayMode={this.props.displayMode}
          siteUrl={this.props.siteUrl}
          title={this.props.title}
          list={this.props.list}
          eventStartDate={this.props.eventStartDate}
          eventEndDate={this.props.eventEndDate}
        ></Navigation>
      </div>
    );
  }
}

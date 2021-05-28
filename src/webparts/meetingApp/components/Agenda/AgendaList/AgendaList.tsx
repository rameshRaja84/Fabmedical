import * as React from "react";
import * as moment from "moment";
import { useState, useEffect } from "react";
import { IAgendaListProps } from "./IAgendaListProps";
import { IAgendaListPropsState } from "./IAgendaListPropsState";
import { sp } from "@pnp/sp";
import spservices from "../../../../../services/spservices";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { SPHttpClient } from "@microsoft/sp-http";
import { ECB } from "../../../HelperComponents/contextDialog/ECB";
import { IECBProps } from "../../../HelperComponents/contextDialog/IECBProps";

import {
  ListView,
  IViewField,
  SelectionMode,
  GroupOrder,
  IGrouping,
} from "@pnp/spfx-controls-react/lib/ListView";
import { Items } from "@pnp/sp/items";

export default class AgendaList extends React.Component<
  IAgendaListProps,
  IAgendaListPropsState
> {
  constructor(props: IAgendaListProps) {
    super(props);

    this.state = {
      items: [],
    };
  }

  public async componentDidMount() {
    await this.getItems();
  }


  public render(): React.ReactElement<IAgendaListProps> {
    const viewFields: IViewField[] = [
      {
        name: "Title",
        displayName: "Title",
        sorting: true,
        maxWidth: 80,
      },
      {
        name: "",
        sorting: false,
        maxWidth: 40,
        render: (rowitem: any) => {
          const element: React.ReactElement<IECBProps> = React.createElement(
            ECB,
            {
              item: rowitem,
              context: this.props.context,
              ondatachange: this.test(),
              clickMe : this.handleClick
            }
          );
          return element;
        },
      },
      {
        name: "MeetingAppRank",
        displayName: "Rank",
        sorting: true,
        maxWidth: 80,
      },
      {
        name: "MeetingAppDuration",
        displayName: "Duration",
        sorting: false,
        maxWidth: 80,
      },
      {
        name: "MeetingAppTopic",
        displayName: "Topic",
        sorting: true,
        maxWidth: 80,
      },
    ];

    const groupByFields: IGrouping[] = [
      {
        name: "Company",
        order: GroupOrder.ascending,
      },
    ];

    return (
      <ListView
        items={this.state.items}
        viewFields={viewFields}
        iconFieldName="ServerRelativeUrl"
        compact={true}
        selectionMode={SelectionMode.single}
        selection={this._getSelection}
      />
    );
  }


  private async getItems() {
    if (this.props.meetingID) {
      const restApi = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('MApp-Agenda')/items?$filter=MeetingAppEventID eq ${this.props.meetingID}`;

      //alert("Getting Documents");
      this.props.context.spHttpClient
        .get(restApi, SPHttpClient.configurations.v1)
        .then((resp) => {
          return resp.json();
        })
        .then((items) => {
          this.setState({
            items: items.value ? items.value : [],
          });
        });
    }
  }

  private test() {
    //alert("Data changed");
  }

  private _getSelection(items: any[]) {
    console.log("Selected items:", items);
  }

   handleClick = (actionType: string, seletedfile: any, event) => {   

    alert(actionType);
      if (actionType === 'open') {
        alert("open");
          // window.open(
          //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=1",
          //     '_blank'
          // );
      }
      else if (actionType === 'download') {
        alert("download");
        // window.open(
          //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=0",
          //     '_blank'
          // );
      }
      else if (actionType === 'delete') {
        alert("delete");
          // let list = sp.web.lists.getByTitle("Policies");
          // await list.items.getById(seletedfile["ListItemAllFields.ID"]).delete();
          // this.props.ondatachange();
      }
    
    }
}

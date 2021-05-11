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
import { SPHttpClient } from '@microsoft/sp-http';
import {ECB} from "../../../HelperComponents/contextDialog/ECB";
import {IECBProps} from "../../../HelperComponents/contextDialog/IECBProps";

import {
  ListView,
  IViewField,
  SelectionMode,
  GroupOrder,
  IGrouping
} from "@pnp/spfx-controls-react/lib/ListView";
import { Items } from "@pnp/sp/items";

export default class AgendaList extends React.Component<IAgendaListProps, IAgendaListPropsState> {
  constructor(props: IAgendaListProps) {
    super(props);

    this.state = {
      items: []
    };
  }

  public componentDidMount() {
  this.getItems();
}

public getItems(){

  if(this.props.meetingID){
    const restApi = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('MApp-Agenda')/items?$filter=MeetingAppEventID eq ${this.props.meetingID}`;
    this.props.context.spHttpClient.get(restApi, SPHttpClient.configurations.v1)
      .then(resp => { return resp.json(); })
      .then(items => {
        this.setState({
          items: items.value ? items.value : []
        });
      });
  }
  // else{
  //   this.setState({
  //     items:[]
  // });

//}
}



  public render(): React.ReactElement<IAgendaListProps> {
    //this.getItems();

    const viewFields: IViewField[] = [



      {
        name: 'Title',
        displayName: 'Title',
        sorting: true,
        maxWidth: 80
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
              ondatachange: this.getItems()
            }
          );
          return element;
        }
      },
      {
        name: 'MeetingAppRank',
        displayName: 'Rank',
        sorting: true,
        maxWidth: 80
      },
      {
        name: 'MeetingAppDuration',
        displayName: "Duration",
        sorting: false,
        maxWidth: 80
      },
      {
        name: 'MeetingAppTopic',
        displayName: "Topic",
        sorting: true,
        maxWidth: 80
      }
      // ,
      // {
      //   name: 'MeetingAppContent',
      //   displayName: "Content",
      //   sorting: false,
      //   maxWidth: 80,
      //   render: (item: any) => {
      //     const content = item['MeetingAppContent'];
      //       return <div>{content}</div>
      //   }
      // }
      // ,
      // {
      //   name: 'Email',
      //   displayName: "Email Address",
      //   sorting: true,
      //   maxWidth: 100,
      //   render: (item: any) => {
      //     return <a href={"mailto:" + item['Email']}>{item['Email']}</a>;
      //   }
      // }
    ];

    const groupByFields: IGrouping[] = [
      {
        name: "Company",
        order: GroupOrder.ascending
      }
    ];

    return (
      <ListView
      items={this.state.items}
      viewFields={viewFields}
      iconFieldName="ServerRelativeUrl"
      compact={true}
      selectionMode={SelectionMode.single}
      selection={this._getSelection}/>
    );
  }

  private _getSelection(items: any[]) {
    console.log('Selected items:', items);
  }
}


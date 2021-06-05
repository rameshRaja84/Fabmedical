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
import { DetailsDialog } from "../../../HelperComponents/modalDialog/confirmDialog";
import { IECBProps } from "../../../HelperComponents/contextDialog/IECBProps";

import {
  ListView,
  IViewField,
  SelectionMode,
  GroupOrder,
  IGrouping,
} from "@pnp/spfx-controls-react/lib/ListView";
import { Items } from "@pnp/sp/items";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import { TextField } from "@fluentui/react/lib/TextField";
import {
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
} from "@fluentui/react/lib/Dropdown";
import { Label } from "@fluentui/react/lib/Label";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { Stack, IStackProps, IStackStyles } from "@fluentui/react/lib/Stack";
import styles from "./AgendaList.module.scss";
import { IAgenda } from "../../../../../services/IAgenda";


const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 550 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 20 },
  styles: { root: { width: 400 } },
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 400 },
};

const rankOptions: IDropdownOption[] = [
  { key: "1", text: "1" },
  { key: "2", text: "2" },
  { key: "3", text: "3" },
  { key: "4", text: "4" },
  { key: "5", text: "5" },
  { key: "6", text: "6" },
  { key: "7", text: "7" },
  { key: "8", text: "8" },
  { key: "9", text: "9" },
  { key: "10", text: "10" },
  { key: "11", text: "11" },
  { key: "12", text: "12" },
  { key: "13", text: "13" },
  { key: "14", text: "14" },
  { key: "15", text: "15" },
];

const durationOptions: IDropdownOption[] = [
  { key: "15", text: "15" },
  { key: "30", text: "30" },
  { key: "45", text: "45" },
  { key: "60", text: "60" },
];

export default class AgendaList extends React.Component<
  IAgendaListProps,
  IAgendaListPropsState
> {
  private spService: spservices = null;

  constructor(props: IAgendaListProps) {
    super(props);

    this.spService = new spservices(this.props.context);

    this.state = {
      items: [],
      content: "",
      duration: "15",
      rank: "1",
      title: "",
      topic: "",
      panelIsOpen: false,
      panelType: PanelType.medium,
      currentAction: "none",
      hideConfirmDialog: true,
      openDialog: false,
      selectedAgendaID: null,
      selectedAgendaTitle: "",
      updateItems: false,
    };
  }

  public async componentDidMount() {
    await this.getItems();
  }

  public async componentDidUpdate() {
    //console.log("AgendaList updated ");
    if (this.props.update) {
      await this.getItems();
    } else {
      console.log("Not updated");
    }
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
              ondatachange: this._ecbOnDatachange(),
              clickMe: this.handleClick,
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

    let panel;
    if (this.state.panelIsOpen == true) {
      if (this.state.currentAction == "edit") {
        panel = this.getEditPanel();
      }
    }

    return (
      <React.Fragment>
        <ListView
          items={this.state.items}
          viewFields={viewFields}
          iconFieldName="ServerRelativeUrl"
          compact={true}
          selectionMode={SelectionMode.single}
          selection={this.getSelection}
        />
        {panel}
        {this.state.openDialog ? (
          <DetailsDialog
            title="Confirm"
            subText="Do you really want to delete?"
            open={this.state.openDialog}
            onClose={this.closeDialog.bind(this)}
            agendaName={this.state.selectedAgendaTitle}
            onDelete={this.deleteAgenda.bind(this)}
          ></DetailsDialog>
        ) : (
          <></>
        )}
      </React.Fragment>
    );
  }


 /**
   * @Methods
   * @memberof AgendaList
   */

  public closeDialog() {
    this.setState({ openDialog: false });
  }

  openDialog = () => {
    this.setState({ openDialog: true });
  };

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

  getSelection = (items: any[]) => {
    if (items.length > 0) {
      //console.log("Selected items:", items);
      let itemID = items[0].ID;
      //console.log("Item is is" + itemID);
      this.setState({
        selectedAgendaID: itemID,
        selectedAgendaTitle: items[0].Title,
      });
    }
  };



  private getEditPanel() {
    return (
      <Panel
        isOpen={this.state.panelIsOpen}
        onDismiss={() => this._onDismissPanel()}
        type={this.state.panelType}
        customWidth={
          this.state.panelType === PanelType.custom ||
          this.state.panelType === PanelType.customNear
            ? "888px"
            : undefined
        }
        closeButtonAriaLabel="Close"
        headerText="Edit Agenda"
      >
        <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <Stack {...columnProps}>
            <TextField
              className={styles.dialogControls}
              name="title"
              label="Title"
              id="title"
              required
              value={this.state.title}
              onChange={this.onHandleInputChange}
            />
            <Dropdown
              className={styles.dialogControls}
              id="rank"
              placeholder="Please select"
              label="Rank"
              options={rankOptions}
              styles={dropdownStyles}
              selectedKey={this.state.rank}
              onChange={this.onHandleInputChange}
            />
            <Dropdown
              className={styles.dialogControls}
              id="duration"
              placeholder="Please select"
              label="Duration"
              options={durationOptions}
              styles={dropdownStyles}
              selectedKey={this.state.duration}
              onChange={this.onHandleInputChange}
            />
            <TextField
              className={styles.dialogControls}
              name="Topic"
              label="Topic"
              id="topic"
              required
              value={this.state.topic}
              onChange={this.onHandleInputChange}
            />

            <Label>Content</Label>
            <RichText
              className={styles.dialogControls}
              value={this.state.content}
              onChange={this._onTextChange}
            />
          </Stack>
        </Stack>
        <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <PrimaryButton
            text="Save"
            onClick={this.handleUpdateSubmit}
            allowDisabledFocus
            className={styles.panelButton}
          />
          <DefaultButton
            text="Cancel"
            onClick={() => this._onDismissPanel()}
            allowDisabledFocus
            className={styles.panelButton}
          />
        </Stack>
      </Panel>
    );
  }

  private async getEditItem() {
    if (this.state.selectedAgendaID != null) {
      const agenda: IAgenda = await this.spService.getAgendaByID(
        this.props.agendaSiteUrl,
        escape(this.props.list),
        this.state.selectedAgendaID
      );

      this.setState({
        title: agenda.Title,
        topic: agenda.MeetingAppTopic,
        rank: agenda.MeetingAppRank,
        content: agenda.MeetingAppContent,
        duration: agenda.MeetingAppDuration,
      });
    }
  }

  handleUpdateSubmit = () => {
    const updateAgenda: IAgenda = {
      Title: this.state.title,
      MeetingAppDuration: this.state.duration,
      MeetingAppContent: this.state.content,
      MeetingAppEventID: this.props.meetingID,
      MeetingAppRank: this.state.rank,
      MeetingAppTopic: this.state.title,
    };
    //alert("Calling save");
    this.updateAgenda(updateAgenda);
  };

  private async updateAgenda(addAgenda: IAgenda) {
    await this.spService.updateAgenda(
      this.props.agendaSiteUrl,
      escape(this.props.list),
      this.state.selectedAgendaID,
      addAgenda
    );
    await this.getItems();
  }

  private async deleteAgenda() {
    await this.spService.deleteAgenda(
      this.props.agendaSiteUrl,
      escape(this.props.list),
      this.state.selectedAgendaID
    );

    this.closeDialog();
    await this.getItems();
  }

  handleClick = (actionType: string, seletedfile: any, event) => {
    // alert(actionType);

    if (actionType === "edit") {
      this.onHandeEditAction(actionType);

      //alert("edit");

      // window.open(
      //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=1",
      //     '_blank'
      // );
    } else if (actionType === "copy") {
      //alert("copy");
      // window.open(
      //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=0",
      //     '_blank'
      // );
    } else if (actionType === "delete") {
      this.openDialog();
      //alert("Calling delete");
      //this.deleteConfirm();
      //alert("delete");
      // let list = sp.web.lists.getByTitle("Policies");
      // await list.items.getById(seletedfile["ListItemAllFields.ID"]).delete();
      // this.props.ondatachange();
    }
  };



   /**
   * @Events
   * @memberof AgendaList
   */

    private onHandleInputChange(event) {
      const target = event.target;
      const value = target.type === "checkbox" ? target.checked : target.value;
      const id = target.id;


      if (id == "title") {
        this.setState({
          title: value,
        });
      } else if (id == "topic") {
        this.setState({
          topic: value,
        });
      } else if (id == "duration") {
        this.setState({
          duration: value,
        });
      } else if (id == "rank") {
        this.setState({
          rank: value,
        });
      }
    }

    private _onTextChange = (newText: string) => {
      this.setState({ content: newText });
      return newText;
    };

    private _onDismissPanel() {
      this.setState({
        panelIsOpen: false,
      });
    }

    private _ecbOnDatachange() {
      //alert("Data changed");
    }


    private async onHandeEditAction(actionType) {
      await this.getEditItem();
      this.setState({
        panelIsOpen: true,
        currentAction: actionType,
      });
    }
}

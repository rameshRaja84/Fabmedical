import * as React from 'react';
import { IPanelDialogProps } from './Props.types';
import {IPanelDialogState} from './Props.types'
import * as strings from 'MeetingAppWebPartStrings';
import {getNativeProps, Panel, PanelType } from "office-ui-fabric-react";
import { TextField, MaskedTextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from '@fluentui/react/lib/Stack';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';

const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

const rankOptions: IDropdownOption[] = [
  { key: '1', text: '1' },
  { key: '2', text: '2' },
  { key: '3', text: '3' },
  { key: '4', text: '4' },
  { key: '5', text: '5'},
  { key: '6', text: '6' },
  { key: '7', text: '7' },
  { key: '8', text: '8' },
  { key: '9', text: '9' },
  { key: '10', text: '10' },
  { key: '11', text: '11' },
  { key: '12', text: '12' },
  { key: '13', text: '13' },
  { key: '14', text: '14' },
  { key: '15', text: '15' },
];

const durationOptions: IDropdownOption[] = [
  { key: '15', text: '15' },
  { key: '30', text: '30' },
  { key: '45', text: '45' },
  { key: '60', text: '60' },
];


export default class PanelDialog extends React.Component<
IPanelDialogProps,
IPanelDialogState
> {
  constructor(props: IPanelDialogProps, state: IPanelDialogState) {
    super(props);
    this.state = {
      content:"",
      duration:15,
      panelIsOpen:this.props.panelIsOpen,
      panelType:PanelType.medium,
      rank:1,
      title:"",
      topic:""
    };

  }

   handleChange(event) {

    ({value: event.target.value});
  }

  private _onDismissPanel() {
    this.setState({
      panelIsOpen: false,
    });
  }

  public render(): React.ReactElement<IPanelDialogProps> {
  if(this.props.editMode =="addAgenda"){
    return (
      <div>
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
      headerText={this.props.header}>
     <p>
     <Stack horizontal tokens={stackTokens} styles={stackStyles}>
      <Stack {...columnProps}>
        <TextField label="Title" id="title" required  value={this.state.title} onChange={this.handleChange}/>
        <Dropdown
        id="rank"
        placeholder="Please select"
        label="Rank"
        options={rankOptions}
        styles={dropdownStyles}
        selectedKey={this.state.rank} onChange={this.handleChange}
      />
         <Dropdown
        id="duration"
        placeholder="Please select"
        label="Duration"
        options={durationOptions}
        styles={dropdownStyles}
        selectedKey={this.state.rank} onChange={this.handleChange}
      />
        <TextField label="Topic" id="topic" required value={this.state.title} onChange={this.handleChange}/>
      </Stack>
      </Stack>

     </p>
    </Panel>
    </div>);
  }
  else{
    return (
      <div>
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
      headerText={this.props.header}>

      <p>

        {this.state.panelType === PanelType.smallFixedFar
          ? " (the default size)"
          : ""}
        .
      </p>
      <p>
        Select this size using{" "}
        <code>{`type={PanelType.${
          PanelType[this.state.panelType]
        }}`}</code>
        .
      </p>
    </Panel>
    </div>);
  }
  }

}


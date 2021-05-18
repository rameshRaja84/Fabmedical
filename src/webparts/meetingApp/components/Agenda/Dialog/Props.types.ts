import { PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { PanelType } from "office-ui-fabric-react";

export interface IPanelDialogProps {
  header: string;
  editMode: string;
  panelType: PanelType;
  eventID:number;
  panelIsOpen:boolean;
  ClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface IPanelDialogState {
  panelIsOpen:boolean;
  panelType:PanelType;
  title:string;
  rank:number;
  duration:number;
  topic:string;
  content:string;
}

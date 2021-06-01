import { IViewField } from "@pnp/spfx-controls-react/lib/ListView";
import { PanelType } from "office-ui-fabric-react";

export interface IAgendaListPropsState {
  items: any[];
  panelIsOpen:boolean;
  panelType:PanelType;
  title:string;
  rank:string;
  duration:string;
  topic:string;
  content:string;
  currentAction:string;
  selectedAgendaID:number;
  selectedAgendaTitle:string;
  hideConfirmDialog:boolean;
  openDialog:boolean;
  updateItems:boolean;
  //viewFields: IViewField[];
}

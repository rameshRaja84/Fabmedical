import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDateTimeFieldValue } from '@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker';
import { PanelType } from "office-ui-fabric-react";
import { IEventAgenda } from "../../../../services/IEventAgenda";
import { IAgenda } from "../../../../services/IAgenda";

export interface ICompactProps {
  usePaging: boolean;
  agendaSiteUrl: string;
  list: string;
  context: WebPartContext;
  eventStartDate:  IDateTimeFieldValue;
  eventEndDate: IDateTimeFieldValue;


}

export interface ICompactState {
  items: any[];
  currentPage: number;
  showDialog: boolean;
  eventData:  IEventAgenda[];
  selectedEvent: IEventAgenda;
  addAgenda: IAgenda;
  startDateSlot?: Date;
  endDateSlot?:Date;
  isloading: boolean;
  hasError: boolean;
  errorMessage: string;
  showAgendas:boolean;
  selectedEventID:number;
  showAgendaDetails:boolean;
  panelIsOpen:boolean;
  panelType:PanelType;
  panelDescription:string;
  agendaEditMode:string;
  title:string;
  rank:string;
  duration:string;
  topic:string;
  content:string;

}

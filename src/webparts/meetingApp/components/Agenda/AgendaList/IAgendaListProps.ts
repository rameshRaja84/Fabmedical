import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IAgendaListProps {
  meetingID:number;
  context: WebPartContext;
  agendaSiteUrl: string;
  list: string;
}

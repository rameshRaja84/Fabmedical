export interface IEventAgenda {
  Id?: number;
  ID?: number;
  title: string;
  Description?: any;
  EventDate: Date;
  EndDate: Date;
  ownerInitial?: string;
  ownerEmail?: string;
  ownerName?: string;
  fAllDayEvent?: boolean;
  attendes?: number[];
  Duration?: number;
  RecurrenceData?: string;
  fRecurrence?: string | boolean;
  EventType?: string;
  UID?: string;
  RecurrenceID?: Date;
  MasterSeriesItemID?: string;
}

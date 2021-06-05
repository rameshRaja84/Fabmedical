export interface DetailsDialogProps {
  title:string;
  subText:string;
  children?: never[]
  open: boolean;
  agendaName:string;
  onClose: () => void;
  onDelete:() => void;
}

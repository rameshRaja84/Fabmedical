export interface IConfirmProps {
  isDraggable:boolean;
  labelId:string;
  subTextId:string;
  displayDialog:boolean;
}

export interface IConfirmState {
  showDialog:boolean;
  hideDialog:boolean;
}

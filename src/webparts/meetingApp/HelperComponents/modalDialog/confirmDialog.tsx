import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
//import { useBoolean } from '@uifabric/react-hooks';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
//import { ContextualMenu } from '@fluentui/react/lib/ContextualMenu';
import {DetailsDialogProps} from './Confirm.types'


export function DetailsDialog(props: DetailsDialogProps) {

  // function formatValue(val: string) {
  //   return (val ? val : "-");
  // }

  const { title, subText, open, agendaName, onClose, onDelete } = props;
  const dialogStyles = { main: { maxWidth: 800 } };

  const dialogContentProps = {
    type: DialogType.normal,
    title: title,
    closeButtonAriaLabel: 'Close',
    subText: subText
  };



  const handleClose = () => () => {
    onClose();
  };

  const handleDelete = () => () => {
    onDelete();
  };


  const modalProps = {
    isBlocking: true,
    styles: { main: { maxWidth: 450 } },
  }

  return (

    <Dialog
      hidden={!open}
      onDismiss={handleClose()}
      isDarkOverlay={true}
      dialogContentProps={dialogContentProps}
      styles={dialogStyles}
      modalProps={modalProps}>

      <div>
       {agendaName}
      </div>
      <DialogFooter>
        <PrimaryButton onClick={handleDelete()} text="Delete"/>
        <DefaultButton onClick={handleClose()} text="Cancel" />
      </DialogFooter>
    </Dialog>
  );
}

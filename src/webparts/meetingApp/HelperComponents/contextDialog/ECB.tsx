import * as React from 'react';
import { Layer, IconButton, IButtonProps } from 'office-ui-fabric-react';
import { ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';
// The following are project specific components
import { IECBProps } from './IECBProps';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import styles from './ECB.module.scss';

export class ECB extends React.Component<IECBProps, {}> {

  public constructor(props: IECBProps) {
      super(props);
      sp.setup({
          spfxContext: this.props.context
      });
      this.state = {
          panelOpen: false
      };
  }

  public render() {
      return (
          <div>
              <IconButton id='ContextualMenuButton1'
                  text=''
                  width='30'
                  split={false}
                  iconProps={{ iconName: 'MoreVertical' }}
                  menuIconProps={{ iconName: '' }}
                  menuProps={{
                      shouldFocusOnMount: true,
                      items: [
                          {
                              key: 'action1',
                              name: 'Edit',
                              onClick: this.handleClick.bind(this, "edit", this.props.item)
                          },
                          {
                              key: 'divider_1',
                              itemType: ContextualMenuItemType.Divider
                          },
                          {
                              key: 'action2',
                              name: 'Copy',
                              onClick: this.handleClick.bind(this, "copy", this.props.item)
                          },
                          {
                              key: 'action3',
                              name: 'Delete',
                              onClick: this.handleClick.bind(this, "delete", this.props.item)
                          },
                          {
                              key: 'disabled',
                              name: 'Disabled action',
                              disabled: true,
                              onClick: () => console.error('Disabled action should not be clickable.')
                          }
                      ]
                  }} />
          </div>
      );
  }


  private async handleClick(actionType: string, seletedfile: any, event) {

    this.props.clickMe(actionType,seletedfile,event);
      // if (actionType === 'open') {
      //   alert("open");
      //     // window.open(
      //     //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=1",
      //     //     '_blank'
      //     // );
      // }
      // else if (actionType === 'download') {
      //   alert("download");
      //   // window.open(
      //     //     window.location.protocol + "//" + window.location.host + seletedfile.ServerRelativeUrl + "?web=0",
      //     //     '_blank'
      //     // );
      // }
      // else if (actionType === 'delete') {
      //   alert("delete");
      //     // let list = sp.web.lists.getByTitle("Policies");
      //     // await list.items.getById(seletedfile["ListItemAllFields.ID"]).delete();
      //     // this.props.ondatachange();
      // }
  }


  
}

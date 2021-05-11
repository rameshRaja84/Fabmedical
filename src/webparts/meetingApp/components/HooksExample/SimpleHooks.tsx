import * as React from 'react';
import { useState } from 'react';
import { ISpfxReactHooksProps } from "./ISpfxReactHooksProps";
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import useFriendStatus from "./../HooksFunctions/SubscribeDemo";

function simplehooks(props: ISpfxReactHooksProps) {
  const [firstName, setFistName] = useState("No first Name")
  const [lastName, setLastName] = useState("No last Name")
 
  //const isOnline = useFriendStatus(props.lastName);

  const _onbtnclick = () => {
    console.log('Changing value')
    setFistName('new fist name')
  }
 
  const _lastNameChanged = (changedvalue: any) => {
    setLastName(changedvalue)
  }

  // if (isOnline === null){
  //   setFistName("isOffline");
  // }

  return (<div>Fullname : {firstName + ' ' + lastName}
    <br />
    <div>this info {props.firstName}{props.lastName}</div>
    <div></div>
    <br />
    <TextField label="last name" onChanged={_lastNameChanged} value={lastName} />
    <br />
    <br />
    <PrimaryButton text="change state value" onClick={() => _onbtnclick()} />
  </div>);
}
 
export default simplehooks;

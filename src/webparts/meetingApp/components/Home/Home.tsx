import * as React from 'react';
import { IHomeProps } from './IHomeProps';
import * as strings from 'MeetingAppWebPartStrings';
import styles from "./Home.module.scss";
import { getTheme } from '@fluentui/react';
//https://developer.microsoft.com/de-DE/fluentui#/controls/web/layer



function HomePage(props: IHomeProps) {
  return (
  <div className={styles.HomeMain}>
   <h1 >Meeting-App</h1>
   <p>Verwalten Sie ihre Termine unter Administration</p>
    </div>
  );
}
export default HomePage;

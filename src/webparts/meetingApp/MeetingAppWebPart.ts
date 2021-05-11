import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'MeetingAppWebPartStrings';
import MeetingApp from './components/MeetingApp';
import { IMeetingAppProps } from './components/IMeetingAppProps';
import { PropertyFieldDateTimePicker, DateConvention, TimeConvention, IDateTimeFieldValue } from '@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker';
import {
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
  PropertyPaneLabel

} from '@microsoft/sp-property-pane';

import { PropertyPaneHorizontalRule } from "@microsoft/sp-property-pane";
import spservices from '../../services/spservices';
import * as moment from 'moment';
import { format } from '@uifabric/utilities';


export interface IMeetingAppWebPartProps {
  title: string;
  siteUrl: string;
  list: string;
  eventStartDate: IDateTimeFieldValue ;
  eventEndDate: IDateTimeFieldValue;
  errorMessage: string;

}

export default class MeetingAppWebPart extends BaseClientSideWebPart <IMeetingAppWebPartProps> {
  private lists: IPropertyPaneDropdownOption[] = [];
  private listsDropdownDisabled: boolean = true;
  private spService: spservices = null;
  private errorMessage: string;


  public render(): void {
    const element: React.ReactElement<IMeetingAppProps> = React.createElement(
      MeetingApp,
      {
        title :this.properties.title,
        siteUrl : this.properties.siteUrl,
        list : this.properties.list,
        eventStartDate : this.properties.eventStartDate,
        eventEndDate:this.properties.eventEndDate,
        updateProperty: (value: string) => {
          this.properties.title = value;
        },
        context: this.context,
        displayMode:this.displayMode
      }
    );

    ReactDom.render(element, this.domElement);
  }

 // onInit
 public  async onInit(): Promise<void> {

  this.spService = new spservices(this.context);
  this.properties.siteUrl = this.properties.siteUrl ? this.properties.siteUrl : this.context.pageContext.site.absoluteUrl;
  if (!this.properties.eventStartDate){
    this.properties.eventStartDate = { value: moment().subtract(2,'years').startOf('month').toDate(), displayValue: moment().format('ddd MMM MM YYYY')};
  }
  if (!this.properties.eventEndDate){
    this.properties.eventEndDate = { value: moment().add(20,'years').endOf('month').toDate(), displayValue: moment().format('ddd MMM MM YYYY')};
  }
  if (this.properties.siteUrl && !this.properties.list) {
   const _lists = await this.loadLists();
   if ( _lists.length > 0 ){
    this.lists = _lists;
    this.properties.list = this.lists[0].key.toString();
   }
  }

  return Promise.resolve();
}


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected async onPropertyPaneConfigurationStart() {

    try {
      if (this.properties.siteUrl) {
        const _lists = await this.loadLists();
        this.lists = _lists;
        this.listsDropdownDisabled = false;
        //  await this.loadFields(this.properties.siteUrl);
        this.context.propertyPane.refresh();

      } else {
        this.lists = [];
        this.properties.list = '';
        this.listsDropdownDisabled = false;
        this.context.propertyPane.refresh();
      }

    } catch (error) {

    }
  }

  /**
   *
   * @private
   * @returns {Promise<IPropertyPaneDropdownOption[]>}
   * @memberof CalendarWebPart
   */
  private async loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    const _lists: IPropertyPaneDropdownOption[] = [];
    try {
      console.log("URL is " + this.properties.siteUrl);
      const results = await this.spService.getSiteLists(this.properties.siteUrl);
      console.log("results length is "+ results);
      for (const list of results) {
        _lists.push({ key: list.Id, text: list.Title });
      }
      // push new item value
    } catch (error) {
      this.errorMessage =  `${error.message} -  please check if site url if valid.` ;
      this.context.propertyPane.refresh();
    }
    return _lists;
  }


  private onSiteUrlGetErrorMessage(value: string) {
    let returnValue: string = '';
    if (value) {
      returnValue = '';
    } else {
      const previousList: string = this.properties.list;
      const previousSiteUrl: string = this.properties.siteUrl;
      // reset selected item
      this.properties.list = undefined;
      this.properties.siteUrl = undefined;
      this.lists = [];
      this.listsDropdownDisabled = true;
      this.onPropertyPaneFieldChanged('list', previousList, this.properties.list);
      this.onPropertyPaneFieldChanged('siteUrl', previousSiteUrl, this.properties.siteUrl);
      this.context.propertyPane.refresh();
    }
    return returnValue;
  }

  private onEventStartDateValidation(date:string){
    if (date && this.properties.eventEndDate.value){
      if (moment(date).isAfter(moment(this.properties.eventEndDate.value))){
        return strings.SartDateValidationMessage;
      }
    }
    return '';
  }

  private onEventEndDateValidation(date:string){
    if (date && this.properties.eventEndDate.value){
      if (moment(date).isBefore( moment(this.properties.eventStartDate.value))){
        return strings.EnDateValidationMessage;
      }
    }
    return '';
  }


  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: string, newValue: string) {
    try {
      // reset any error
      this.properties.errorMessage = undefined;
      this.errorMessage = undefined;
      this.context.propertyPane.refresh();

      if (propertyPath === 'siteUrl' && newValue) {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        const _oldValue = this.properties.list;
        this.onPropertyPaneFieldChanged('list', _oldValue, this.properties.list);
        this.context.propertyPane.refresh();
        const _lists = await this.loadLists();
        this.lists = _lists;
        this.listsDropdownDisabled = false;
        this.properties.list = this.lists.length > 0 ? this.lists[0].key.toString() : undefined;
        this.context.propertyPane.refresh();
        this.render();
      }
      else {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      }
    } catch (error) {
      this.errorMessage =  `${error.message} -  please check if site url if valid.` ;
      this.context.propertyPane.refresh();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('siteUrl', {
                  label: strings.SiteUrlFieldLabel,
                  onGetErrorMessage: this.onSiteUrlGetErrorMessage.bind(this),
                  value: this.context.pageContext.site.absoluteUrl,
                  deferredValidationTime: 1200,
                }),
                PropertyPaneDropdown('list', {
                  label: strings.ListFieldLabel,
                  options: this.lists,
                  disabled: this.listsDropdownDisabled,
                }),
                PropertyPaneLabel('eventStartDate', {
                  text: strings.eventSelectDatesLabel
                }),
                PropertyFieldDateTimePicker('eventStartDate', {
                  label: 'From',
                  initialDate: this.properties.eventStartDate,
                  dateConvention: DateConvention.Date,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  onGetErrorMessage: this.onEventStartDateValidation,
                  deferredValidationTime: 0,
                  key: 'eventStartDateId'
                }),
                PropertyFieldDateTimePicker('eventEndDate', {
                  label: 'to',
                  initialDate:  this.properties.eventEndDate,
                  dateConvention: DateConvention.Date,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  onGetErrorMessage:  this.onEventEndDateValidation,
                  deferredValidationTime: 0,
                  key: 'eventEndDateId'
                }),
                PropertyPaneLabel('errorMessage', {
                  text:  this.errorMessage,
                }),


              ]
            }
          ]
        }
      ]
    };
  }
}

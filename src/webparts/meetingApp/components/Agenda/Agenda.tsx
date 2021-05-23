import * as React from "react";
import styles from "./Agenda.module.scss";
import { ICompactProps, ICompactState } from "./Agenda.types";
import * as strings from "MeetingAppWebPartStrings";
import { IEventAgenda } from "../../../../services/IEventAgenda";
import { IUserPermissions } from "../../../../services/IUserPermissions";
import spservices from "../../../../services/spservices";
import * as moment from "moment";
import AgendaList from "./AgendaList/AgendaList";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import {
  CommandBar,
  ICommandBarItemProps,
} from "@fluentui/react/lib/CommandBar";
import { IButtonProps } from "@fluentui/react/lib/Button";

// Used to render document cards
import {
  DocumentCard,
  DocumentCardPreview,
  DocumentCardDetails,
  DocumentCardTitle,
  IDocumentCardPreviewProps,
  DocumentCardActivity,
  IDocumentCardStyles,
  DocumentCardType,
} from "office-ui-fabric-react/lib/DocumentCard";
import CompactLayout from "../../HelperComponents/compactLayout/CompactLayout";
import { Paging } from "../../HelperComponents/paging";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import { SharedColors } from "@fluentui/theme";
import PanelDialog from "./Dialog/PanelDialog";
import { TextField, MaskedTextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from '@fluentui/react/lib/Stack';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IAgenda } from "../../../../services/IAgenda";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";

const tileStyle: IDocumentCardStyles = {
  root: {
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "blue",
    boxShadow: "0 5px 15px rgba(50, 50, 90, .1)",
  },
};

var _items: ICommandBarItemProps[] = null;
const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

const rankOptions: IDropdownOption[] = [
  { key: '1', text: '1' },
  { key: '2', text: '2' },
  { key: '3', text: '3' },
  { key: '4', text: '4' },
  { key: '5', text: '5'},
  { key: '6', text: '6' },
  { key: '7', text: '7' },
  { key: '8', text: '8' },
  { key: '9', text: '9' },
  { key: '10', text: '10' },
  { key: '11', text: '11' },
  { key: '12', text: '12' },
  { key: '13', text: '13' },
  { key: '14', text: '14' },
  { key: '15', text: '15' },
];

const durationOptions: IDropdownOption[] = [
  { key: '15', text: '15' },
  { key: '30', text: '30' },
  { key: '45', text: '45' },
  { key: '60', text: '60' },
];




// const _overflowItems: ICommandBarItemProps[] = [
//   { key: 'move', text: 'Move to...', onClick: () => console.log('Move to'), iconProps: { iconName: 'MoveToFolder' } },
//   { key: 'copy', text: 'Copy to...', onClick: () => console.log('Copy to'), iconProps: { iconName: 'Copy' } },
//   { key: 'rename', text: 'Rename...', onClick: () => console.log('Rename'), iconProps: { iconName: 'Edit' } },
// ];

export default class Agenda extends React.Component<
  ICompactProps,
  ICompactState
> {
  private spService: spservices = null;
  private userListPermissions: IUserPermissions = undefined;

  /**
   *
   */
  constructor(props: ICompactProps) {
    super(props);
    this.spService = new spservices(this.props.context);
    moment.locale(
      this.props.context.pageContext.cultureInfo.currentUICultureName
    );

    // Sample data generated at https://mockaroo.com/
    this.state = {
      showDialog: false,
      eventData: [],
      addAgenda:null,
      selectedEvent: undefined,
      isloading: true,
      hasError: false,
      errorMessage: "",
      currentPage: 1,
      items: [],
      showAgendas: false,
      selectedEventID: undefined,
      showAgendaDetails: false,
      panelDescription: "Some Panel",
      panelIsOpen: false,
      panelType: PanelType.medium,
      agendaEditMode:"none",
      content : "",
      duration : "15",
      rank : "1",
      title : "",
      topic : ""
    };

    this.initializeTopCommandBar();

    //this.loadEvents();

    this.handleInputChange = this.handleInputChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
  }

  public async componentDidMount(){
   this.setState({ isloading: true });
   //alert("Called componend did mount");
   await this.loadEvents();
   this.setState({ isloading: false });
 }

  /**
   * @private
   * @memberof Calendar
   */
  private async loadEvents() {
    try {
      // Teste Properties
      if (
        !this.props.list ||
        !this.props.agendaSiteUrl ||
        !this.props.eventStartDate.value ||
        !this.props.eventEndDate.value
      )
        return;

      this.userListPermissions = await this.spService.getUserPermissions(
        this.props.agendaSiteUrl,
        this.props.list
      );

      const eventsData: IEventAgenda[] = await this.spService.getEventsAgenda(
        this.props.agendaSiteUrl,
        escape(this.props.list),
        this.props.eventStartDate.value,
        this.props.eventEndDate.value
      );
      this.setState({
        eventData: eventsData,
        hasError: false,
        errorMessage: "",
      });
    } catch (error) {
      this.setState({
        hasError: true,
        errorMessage: error.message,
        isloading: false,
      });
    }
  }

  public initializeTopCommandBar() {
    _items = [
      {
        key: "newItem",
        text: strings.Agenda_Detail_BackBtn,
        cacheKey: "backCacheKey", // changing this key will invalidate this item's cache
        iconProps: { iconName: "NavigateBack" },
        onClick: () => this._onBackToOverView(),
      },
      {
        key: "addNew",
        text: strings.Agenda_Detail_AddNewBtn,
        iconProps: { iconName: "Add" },
        onClick: () => this._onAddNewDialog(),
      },
    ];
  }




  private handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    //const name = target.name;
    const id = target.id;
    //console.log("Names is " + name);
    console.log("ID is " + id);

    if(id == "title"){
      this.setState({
        title: value
      });
    }
    else if (id == "topic"){
      this.setState({
        topic: value
      });
    }

    else if (id == "duration"){
      this.setState({
        duration: value
      });
    }

    else if (id == "rank"){
      this.setState({
        rank: value
      });
    }
  }


  // private async handleSubmit(event: MouseEvent) {

  //   console.log("Starting save");
  //   this.state.addAgenda.Title = this.state.title;
  //   this.state.addAgenda.MeetingAppDuration = this.state.duration;
  //   this.state.addAgenda.MeetingAppTopic = this.state.topic;
  //   this.state.addAgenda.MeetingAppRank = this.state.rank;
  //   this.state.addAgenda.MeetingAppEventID = this.state.selectedEventID;

  //   console.log("Calling save");
  //   await this.spService.addAgenda(this.props.agendaSiteUrl, this.props.list, this.state.addAgenda);
  //   event.preventDefault();
  // }

  handleSubmit = () => {
//alert("Was clicked");

console.log("Starting save");
console.log("Saving values are title: " + this.state.title + "- duration: " + this.state.duration + "-topic: " + this.state.topic + " and rank: " + this.state.rank);

const addAgenda: IAgenda = { Title:this.state.title, MeetingAppDuration:this.state.duration,MeetingAppContent:"dummy", MeetingAppEventID:this.state.selectedEventID,MeetingAppRank:this.state.rank,MeetingAppTopic: this.state.title}
alert("Calling save");
this.callSave(addAgenda);
  }





    private async callSave(addAgenda:IAgenda){
      await this.spService.addAgenda(this.props.agendaSiteUrl, "MApp-Agenda", addAgenda);
      this._onDismissPanel();
    }

    private _onTextChange = (newText: string) => {
      this.setState({ content: newText });
      return newText;
    }


  public render(): React.ReactElement<ICompactProps> {
    //alert("rendering " + this.state.showAgendaDetails);
    let pagedItems: any[] = this.state.eventData;
    const totalItems: number = pagedItems.length;
    let showPages: boolean = false;
    const maxEvents: number = 5;
    const { currentPage } = this.state;

    if (
      this.props.usePaging === true &&
      totalItems > 0 &&
      totalItems > maxEvents
    ) {
      // calculate the page size
      const pageStartAt: number = maxEvents * (currentPage - 1);
      const pageEndAt: number = maxEvents * currentPage;
      pagedItems = pagedItems.slice(pageStartAt, pageEndAt);
      showPages = true;
    }

    if (this.state.showAgendaDetails) {

      let panel;
      // panelIsOpen: true,
      // agendaEditMode:"newAgenda"
      if(this.state.panelIsOpen == true){
        if(this.state.agendaEditMode == "newAgenda"){
          panel =
          <Panel
            isOpen={this.state.panelIsOpen}
            onDismiss={() => this._onDismissPanel()}
            type={this.state.panelType}
            customWidth={
              this.state.panelType === PanelType.custom ||
              this.state.panelType === PanelType.customNear
                ? "888px"
                : undefined
            }
            closeButtonAriaLabel="Close"
            headerText="Add Agenda" >
              <Stack horizontal tokens={stackTokens} styles={stackStyles}>

              <Stack {...columnProps}>
                <TextField className={styles.spfxPnpRichtext} name="title" label="Title" id="title" required  value={this.state.title} onChange={this.handleInputChange}/>
                <Dropdown
                className={styles.spfxPnpRichtext}
                id="rank"
                placeholder="Please select"
                label="Rank"
                options={rankOptions}
                styles={dropdownStyles}
                selectedKey={this.state.rank} onChange={this.handleInputChange}
              />
                <Dropdown
                className={styles.spfxPnpRichtext}
                id="duration"
                placeholder="Please select"
                label="Duration"
                options={durationOptions}
                styles={dropdownStyles}
                selectedKey={this.state.duration} onChange={this.handleInputChange}
              />
                <TextField  className={styles.spfxPnpRichtext} name="Topic" label="Topic" id="topic" required value={this.state.topic}  onChange={this.handleInputChange}/>


                <RichText className={styles.spfxPnpRichtext} value={this.state.content} onChange={this._onTextChange} />

              </Stack>

              </Stack>
              <Stack horizontal tokens={stackTokens} styles={stackStyles}>
              <DefaultButton text="Save" onClick={this.handleSubmit} allowDisabledFocus  style={{ backgroundColor: SharedColors.green10 }} />
              <DefaultButton text="Cancel" onClick={() => this._onDismissPanel()} allowDisabledFocus  style={{ backgroundColor: SharedColors.red10 }} />
              </Stack>
          </Panel>;
        }

      }



      return (
        <div>
          {/* <DefaultButton text={strings.Agenda_Detail_BackBtn} onClick={() => this._onBackToOverView()} allowDisabledFocus  style={{ backgroundColor: SharedColors.blue10 }} />
           <DefaultButton text={strings.Agenda_Detail_AddNewBtn} style={{ backgroundColor: SharedColors.gray10 }}  onClick={() => this._onAddNewDialog()} allowDisabledFocus /> */}

          <CommandBar
            items={_items}
            ariaLabel="Use left and right arrow keys to navigate between commands"
          />

          <div>
            <AgendaList
              agendaSiteUrl={this.props.agendaSiteUrl}
              meetingID={this.state.selectedEventID}
              context={this.props.context}
              list="MApp-Agenda"
            />
          </div>
           {panel}

        </div>
      );
    } else {
      return this.displayOverView(
        pagedItems,
        showPages,
        currentPage,
        maxEvents,
        totalItems
      );
    }
  }


  public passedFunction = () =>{
  console.log("sucessfully passed");
}

  private displayOverView(
    pagedItems,
    showPages,
    currentPage,
    maxEvents,
    totalItems
  ) {
    return (
      <div>
        <div className={styles.compact}>
          <CompactLayout
            items={pagedItems}
            onRenderGridItem={(item: any, index: number) =>
              this._onRenderGridItem(item, index)
            }
          />
          {showPages && (
            <Paging
              showPageNumber={true}
              currentPage={currentPage}
              itemsCountPerPage={maxEvents}
              totalItems={totalItems}
              onPageUpdate={this._onPageUpdate}
              nextButtonLabel={strings.NextLabel}
              previousButtonLabel={strings.PreviousLabel}
            />
          )}
        </div>
      </div>
    );
  }

  private _onBackToOverView() {
    this.setState({
      showAgendaDetails: false,
    });
  }

  private _onAddNewDialog() {
    this.setState({
      panelIsOpen: true,
      agendaEditMode:"newAgenda"
    });
  }

  private _onDismissPanel() {
    this.setState({
      panelIsOpen: false,
    });
  }


  private _onPageUpdate = (pageNumber: number): void => {
    this.setState({
      currentPage: pageNumber,
    });
  }

  private _onMeetingSelected = (id: number): void => {
    //alert("selected meeting id is : " + id);
    this.setState({
      showAgendas: true,
      selectedEventID: id,
      showAgendaDetails: true,
    });
  }

  private _onRenderGridItem = (item: any, _index: number): JSX.Element => {

    const eventDate: moment.Moment = moment(item.EventDate);
    const dateString: string = item.fAllDayEvent
      ? eventDate.format(strings.AllDayDateFormat)
      : eventDate.format(strings.LocalizedTimeFormat);

    return (
      <div
        data-is-focusable={true}
        data-is-focus-item={true}
        role="listitem"
        aria-label={item.title}
      >
        <h4>{strings.AgendaOverViewText}</h4>
        <DocumentCard
          styles={tileStyle}
          type={DocumentCardType.compact}
          onClick={(ev: React.SyntheticEvent<HTMLElement>) =>
            this._onMeetingSelected(item.ID)
          }
        >
          {/* <DocumentCardPreview {...previewProps} /> */}
          <DocumentCardDetails>
            <DocumentCardTitle title={item.title} shouldTruncate={true} />
            <DocumentCardTitle title={dateString} shouldTruncate={true} />
          </DocumentCardDetails>
        </DocumentCard>
      </div>
    );
  }


}

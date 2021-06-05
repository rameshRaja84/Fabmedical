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
  DocumentCardDetails,
  DocumentCardTitle,
  IDocumentCardStyles,
  DocumentCardType,
} from "office-ui-fabric-react/lib/DocumentCard";
import CompactLayout from "../../HelperComponents/compactLayout/CompactLayout";
import { Paging } from "../../HelperComponents/paging";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import { TextField } from "@fluentui/react/lib/TextField";
import { Stack, IStackProps, IStackStyles } from "@fluentui/react/lib/Stack";
import {
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
} from "@fluentui/react/lib/Dropdown";
import { IAgenda } from "../../../../services/IAgenda";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { Label } from "@fluentui/react/lib/Label";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
import { FileTypeIcon, ApplicationType, IconType, ImageSize } from "@pnp/spfx-controls-react/lib/FileTypeIcon";

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
const maxAgendaRank:number = 15;
const stackStyles: Partial<IStackStyles> = { root: { width: 550 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 20 },
  styles: { root: { width: 400 } },
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 400 },
};

const rankOptions: IDropdownOption[] = [
  { key: "1", text: "1" },
  { key: "2", text: "2" },
  { key: "3", text: "3" },
  { key: "4", text: "4" },
  { key: "5", text: "5" },
  { key: "6", text: "6" },
  { key: "7", text: "7" },
  { key: "8", text: "8" },
  { key: "9", text: "9" },
  { key: "10", text: "10" },
  { key: "11", text: "11" },
  { key: "12", text: "12" },
  { key: "13", text: "13" },
  { key: "14", text: "14" },
  { key: "15", text: "15" },
];

const durationOptions: IDropdownOption[] = [
  { key: "15", text: "15" },
  { key: "30", text: "30" },
  { key: "45", text: "45" },
  { key: "60", text: "60" },
];

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

    this.state = {
      showDialog: false,
      eventData: [],
      addAgenda: null,
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
      agendaEditMode: "none",
      content: "",
      duration: "15",
      rank: "1",
      title: "",
      topic: "",
      updateChild: false,
      filePickerResult:null
    };

    this.initializeTopCommandBar();
    this._onHandleInputChange = this._onHandleInputChange.bind(this);
  }

  public async componentDidMount() {
    this.setState({ isloading: true });
    //alert("Called componend did mount");
    await this.loadEvents();
    this.setState({ isloading: false });
  }

  public render(): React.ReactElement<ICompactProps> {
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
      if (this.state.panelIsOpen == true) {
        if (this.state.agendaEditMode == "newAgenda") {
          panel = this.getAddPanel();
        }
      }

      return (
        <React.Fragment>
          <CommandBar
            items={_items}
            ariaLabel="Use left and right arrow keys to navigate between commands"
          />

          <div>
            <AgendaList
              update={this.state.updateChild}
              agendaSiteUrl={this.props.agendaSiteUrl}
              meetingID={this.state.selectedEventID}
              context={this.props.context}
              list="MApp-Agenda"
            />
          </div>
          {panel}
        </React.Fragment>
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

  /**
   * @Methods
   * @memberof Agenda
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
  };

  private getAddPanel() {
    return (
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
        headerText="Add Agenda"
      >
        <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <Stack {...columnProps}>
          <TextField
             className={styles.spfxPnpRichtext}
             name="rank"
             label="Rank"
             id="rank"
             required
             value={this.state.rank}
             readOnly={true}
             onChange={this._onHandleInputChange}
            ></TextField>
            <TextField
              className={styles.spfxPnpRichtext}
              name="Topic"
              label="Topic"
              id="topic"
              required
              value={this.state.topic}
              onChange={this._onHandleInputChange}
            />
            <PeoplePicker
                context={this.props.context}
                titleText="Initiator"
                personSelectionLimit={1}
                groupName={"Meeting App Contributors"} // Leave this blank in case you want to filter from all users
                showtooltip={true}
                required={true}
                disabled={false}
                onChange={this._getPeoplePickerItems}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000} />
            <Dropdown
              className={styles.spfxPnpRichtext}
              id="duration"
              placeholder="Please select"
              label="Duration (Minutes)"
              options={durationOptions}
              styles={dropdownStyles}
              selectedKey={this.state.duration}
              onChange={this._onHandleInputChange}
            />

            <FilePicker

              accepts= {[".gif", ".jpg", ".jpeg", ".bmp", ".dib", ".tif", ".tiff", ".ico", ".png", ".jxr", ".svg"]}
              buttonIcon="FileImage"
              onSave={this._onFilePickerSave}
              onChange={this._onFilePickerChange}
              context={this.props.context}
            />
            <Label>Content</Label>
            <RichText
              className={styles.spfxPnpRichtext}
              value={this.state.content}
              onChange={this._onTextChange}
            />


          </Stack>
        </Stack>
        <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <PrimaryButton
            text="Save"
            onClick={this._onHandleSubmit}
            allowDisabledFocus
            className={styles.panelButton}
          />
          <DefaultButton
            text="Cancel"
            onClick={() => this._onDismissPanel()}
            allowDisabledFocus
            className={styles.panelButton}
          />
        </Stack>
      </Panel>
    );
  }

  private _onFilePickerSave = async (filePickerResult: IFilePickerResult) => {
    this.setState({ filePickerResultTest: filePickerResult });
    if (filePickerResult) {
      // for (var i = 0; i < filePickerResult.length; i++) {
      //   const item = filePickerResult[i];
      //   const fileResultContent = await item.downloadFileContent();
      //   console.log(fileResultContent);
      // }
    }
  }

  private _onFilePickerChange = async (filePickerResult: IFilePickerResult) => {
    this.setState({ filePickerResultTest: filePickerResult });
    if (filePickerResult) {
      // for (var i = 0; i < filePickerResult.length; i++) {
      //   const item = filePickerResult[i];
      //   const fileResultContent = await item.downloadFileContent();
      //   console.log(fileResultContent);
      // }
    }
  }

  private _getPeoplePickerItems(items: any[]) {
    console.log('Items:', items);
  }


  /**
   * @ Events
   * @memberof Agenda
   */
  private _onHandleInputChange(event) {

    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const id = target.id;


    if (id == "title") {
      this.setState({
        title: value,
      });
    } else if (id == "topic") {
      this.setState({
        topic: value,
      });
    } else if (id == "duration") {
      this.setState({
        duration: value,
      });
    } else if (id == "rank") {
      this.setState({
        rank: value,
      });
    }
  }

  private _onHandleSubmit = () => {
    console.log("Starting save");
    console.log(
      "Saving values are title: " +
        this.state.title +
        "- duration: " +
        this.state.duration +
        "-topic: " +
        this.state.topic +
        " and rank: " +
        this.state.rank
    );

    const addAgenda: IAgenda = {
      Title: this.state.rank + "_" + this.state.topic,
      MeetingAppDuration: this.state.duration,
      MeetingAppContent: this.state.content,
      MeetingAppEventID: this.state.selectedEventID,
      MeetingAppRank: this.state.rank,
      MeetingAppTopic: this.state.topic,
    };
    //alert("Calling save");
    this.callSave(addAgenda);
  };

  private async callSave(addAgenda: IAgenda) {
    await this.spService.addAgenda(
      this.props.agendaSiteUrl,
      "MApp-Agenda",
      addAgenda
    );
    this._onDismissPanel();

    this.setState({
      updateChild: true,
    });
  }

  private _onTextChange = (newText: string) => {
    this.setState({ content: newText });
    return newText;
  };

  private _onBackToOverView() {
    this.setState({
      showAgendaDetails: false,
    });
  }

  private  _onAddNewDialog() {
     this.setAddDialog();

  }

  private async setAddDialog(){
   let topRank:string = await this.spService.getAgendasTopRank( this.props.agendaSiteUrl, escape("MApp-Agenda"), this.state.selectedEventID, maxAgendaRank);

 this.setState({
   panelIsOpen: true,
   agendaEditMode: "newAgenda",
   title: "",
   duration: "15",
   content: "",
   rank: topRank,
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
  };

  private _onMeetingSelected = (id: number): void => {
    //alert("selected meeting id is : " + id);
    this.setState({
      showAgendas: true,
      selectedEventID: id,
      showAgendaDetails: true,
    });
  };

}

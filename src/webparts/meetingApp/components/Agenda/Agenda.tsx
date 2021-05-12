import * as React from "react";
import styles from "./Agenda.module.scss";
import { ICompactProps, ICompactState } from "./Agenda.types";
import * as strings from "MeetingAppWebPartStrings";
import { IEventAgenda } from "../../../../services/IEventAgenda";
import { IUserPermissions } from "../../../../services/IUserPermissions";
import spservices from "../../../../services/spservices";
import * as moment from "moment";
import AgendaList from "./AgendaList/AgendaList";
//import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { TextField } from '@fluentui/react/lib/TextField';
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
import PanelDialog from "./Dialog/PanelDialog"


const tileStyle: IDocumentCardStyles = {
  root: {
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "blue",
    boxShadow: "0 5px 15px rgba(50, 50, 90, .1)",
  },
};

var _items: ICommandBarItemProps[] = null;

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
      agendaEditMode:"none"
    };

    this.initializeTopCommandBar();
    this.setState({ isloading: true });
    this.loadEvents();
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

          <PanelDialog header="Add Agenda" editMode="addAgenda" panelType={PanelType.medium} eventID={this.state.selectedEventID} panelIsOpen={this.state.panelIsOpen} ></PanelDialog>

          {/* <Panel
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
            headerText="Agenda" >
            if()
            <p>
              This is <strong>{this.state.panelDescription}</strong> panel
              {this.state.panelType === PanelType.smallFixedFar
                ? " (the default size)"
                : ""}
              .
            </p>
            <p>
              Select this size using{" "}
              <code>{`type={PanelType.${
                PanelType[this.state.panelType]
              }}`}</code>
              .
            </p>
          </Panel> */}
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
  };

  private _onMeetingSelected = (id: number): void => {
    //alert("selected meeting id is : " + id);
    this.setState({
      showAgendas: true,
      selectedEventID: id,
      showAgendaDetails: true,
    });
  };

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
}

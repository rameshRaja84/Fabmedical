import * as React from "react";
import styles from "./Agenda.module.scss";
import { ICompactProps, ICompactState } from "./Agenda.types";
import * as strings from "MeetingAppWebPartStrings";
import { IEventAgenda } from "../../../../services/IEventAgenda";
import { IUserPermissions } from "../../../../services/IUserPermissions";
import spservices from "../../../../services/spservices";
import * as moment from "moment";
import AgendaList from "./AgendaList/AgendaList";

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
import { ImageFit } from "office-ui-fabric-react/lib/Image";
import CompactLayout from "../../HelperComponents/compactLayout/CompactLayout";
import { Paging } from "../../HelperComponents/paging";

const tileStyle: IDocumentCardStyles = {
  root: {
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "blue",
    boxShadow: "0 5px 15px rgba(50, 50, 90, .1)",
  },
};

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
      showAgendaDetails : false
    };

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

  public render(): React.ReactElement<ICompactProps> {
    //alert("rendering " + this.state.showAgendaDetails);
    let pagedItems: any[] = this.state.eventData;
    const totalItems: number = pagedItems.length;
    let showPages: boolean = false;
    const maxEvents: number = 5;
    const { currentPage } = this.state;

    if ( this.props.usePaging === true && totalItems > 0 && totalItems > maxEvents) {
      // calculate the page size
      const pageStartAt: number = maxEvents * (currentPage - 1);
      const pageEndAt: number = maxEvents * currentPage;
      pagedItems = pagedItems.slice(pageStartAt, pageEndAt);
      showPages = true;
    }

    if(this.state.showAgendaDetails){
      return(
        <div>
        <div>
          <AgendaList
            agendaSiteUrl={this.props.agendaSiteUrl}
            meetingID={this.state.selectedEventID}
            context={this.props.context}
            list="MApp-Agenda"
          />
        </div>
        <button onClick={() => this.backToOverView()}>zurück zur Übersicht</button>
      </div>
      );
      }
    else {
      return this.displayOverView(pagedItems,showPages,currentPage,maxEvents,totalItems);
    }
  }

  private displayOverView(pagedItems,showPages,currentPage,maxEvents,totalItems){
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

  private backToOverView(){
    this.setState({
      showAgendaDetails : false
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
      showAgendaDetails : true
    });
  }

  private _onRenderGridItem = (item: any, _index: number): JSX.Element => {
    // const previewProps: IDocumentCardPreviewProps = {
    //   previewImages: [
    //     {
    //       previewImageSrc: item.thumbnail,
    //       imageFit: ImageFit.centerCover,
    //       height: 48,
    //       width: 48
    //     }
    //   ]
    // };

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

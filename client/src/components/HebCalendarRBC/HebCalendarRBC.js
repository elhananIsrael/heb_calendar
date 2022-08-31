import React, { useEffect, useState } from "react";
import "./HebCalendarRBC.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import CustomDateHeader from "../CustomDateHeader/CustomDateHeader";
import { HebrewCalendar, HDate, Location } from "@hebcal/core";
import { eventToFullCalendar } from "@hebcal/rest-api";
import moment from "moment";
import "moment/locale/he";
import "react-big-calendar/lib/css/react-big-calendar.css";

const hebDaysNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const monthNames = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "צדמבר",
];

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1);
}

const nextMonthFirstDay = (day) => {
  var currDay = day;
  var nextDay = day;
  if (currDay.getMonth() === 11) {
    nextDay = new Date(currDay.getFullYear() + 1, 0, 1);
  } else {
    nextDay = new Date(currDay.getFullYear(), currDay.getMonth() + 1, 1);
  }
  return nextDay;
};

const dateStr = (myDate) => {
  // var today = new Date();
  var dd = String(myDate.getDate()).padStart(2, "0");
  var mm = String(myDate.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = myDate.getFullYear();

  var result = dd + "." + mm + "." + yyyy;
  return result;
};

const strToDate = (stringDate) => {
  const dateArr = stringDate.split(".");
  var dateDay = dateArr[0];
  var dateMonth = dateArr[1];
  var dateYear = dateArr[2];
  var stringDateUpdated = `${dateYear}-${dateMonth}-${dateDay}`;
  // console.log(gregDate);
  var date = new Date(stringDateUpdated);
  return date;
};

const getDesc = (item) => {
  var gregDate = item.date;
  var check = Date.parse(item.date);
  // console.log(gregDate, check, check.toString() === "NaN");
  if (check.toString() === "NaN") gregDate = strToDate(item.date);
  var hebDate = new HDate(gregDate).renderGematriya();
  gregDate = dateStr(gregDate);
  var hebUpdateDate = new HDate(strToDate(item.updateDate)).renderGematriya();
  var myDesc = `שם הרב: ${item.ravName}
  תאריך: ${hebDate} (${gregDate}) 
  שעת השיעור: ${item.time}
  פרטים נוספים: ${item.moreDetails}
  שם איש הקשר: ${item.contactPersonName}
  מקסימום שיעורים שהרב יכול להעביר: ${item.totalNumLessonsRavCanToday}
  תאריך עדכון אחרון: ${hebUpdateDate} (${item.updateDate})`;
  return myDesc;
};

moment.locale("iw-IL");
const localizer = momentLocalizer(moment);
const location = Location.lookup("Tel Aviv");

function HebCalendarRBC({ lessonEvents }) {
  const [eventsData, setEventsData] = useState([]);
  const [view, setView] = useState("month");
  // const [headerTitle, setHeaderTitle] = useState("");

  // const [action, setAction] = useState("TODAY");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "months").endOf("month").startOf("week")._d
  );
  const [endDate, setEndDate] = useState(
    moment().endOf("month").endOf("week")._d
  );

  useEffect(() => {
    // setHeaderTitle(HeaderText(startDate, endDate));
    setEventsData(func(startDate, endDate));
  }, [startDate, endDate, lessonEvents]);

  function func(s, e) {
    const options = {
      start: s,
      end: e,
      isHebrewYear: true,
      candlelighting: false,
      locale: "he",
      il: true,
      sedrot: true,
      dafyomi: false,
      omer: true,
      addHebrewDates: true,
    };
    const events = HebrewCalendar.calendar(options);
    // console.log(events);
    const fcEvents = events
      .map((ev) => {
        const apiObj = eventToFullCalendar(ev, location.tzid);
        // apiObj.description = "";
        apiObj.url = "";
        apiObj.end = apiObj.start;
        // console.log("apiObj", apiObj);
        return apiObj;
      })
      .filter((ev) => ev.className !== "hebdate");
    // console.log(fcEvents);

    let lessonEventsFC = lessonEvents.map((item) => {
      const dateArr = item.date.split(".");
      var dateDay = dateArr[0];
      var dateMonth = dateArr[1];
      var dateYear = dateArr[2];
      var gregDate = `${dateYear}-${dateMonth}-${dateDay}`;
      // console.log(gregDate);
      var hebDate = new HDate(new Date(gregDate)).renderGematriya();

      var lessonEvFcTtile = "";
      if (view === "agenda")
        lessonEvFcTtile = `${hebDate} - שיעור של הרב: ${item.ravName}`;
      else lessonEvFcTtile = `שיעור של הרב: ${item.ravName}`;
      let lessonEvFc = {
        start: `${dateYear}-${dateMonth}-${dateDay}`,
        end: `${dateYear}-${dateMonth}-${dateDay}`,
        allDay: true,
        className: "shiureTora",
        title: lessonEvFcTtile,
        description: getDesc(item),
      };
      return lessonEvFc;
    });
    var allEventsType = [];
    if (view === "month") allEventsType = [...fcEvents, ...lessonEventsFC];
    else allEventsType = [...lessonEventsFC];
    // console.log(allEventsType);
    return allEventsType;
  }

  const monthHeaderTitle = (date, culture, localizer) => {
    // console.log(date);
    let greg_firstDate = getFirstDayOfMonth(
      date.getFullYear(),
      date.getMonth()
    );
    if (greg_firstDate.getDate() !== 1)
      greg_firstDate = nextMonthFirstDay(greg_firstDate);

    const gregTitle = `${
      monthNames[greg_firstDate.getMonth()]
    } ${greg_firstDate.getFullYear()}`;
    // console.log(gregTitle);
    var heb_firstDate = new HDate(greg_firstDate);
    var heb_firstDateArr = heb_firstDate.renderGematriya().split(" ");
    var hYear_firstDate = heb_firstDateArr[2];
    var hMonth_firstDate = heb_firstDateArr[1];
    var greg_lastDate = new Date(
      greg_firstDate.getFullYear(),
      greg_firstDate.getMonth() + 1,
      0
    );
    var heb_lastDate = new HDate(greg_lastDate);
    var heb_lastDateArr = heb_lastDate.renderGematriya().split(" ");
    var hYear_lastDate = heb_lastDateArr[2];
    var hMonth_lastDate = heb_lastDateArr[1];

    let hebTitle = hMonth_firstDate;
    if (hMonth_firstDate !== hMonth_lastDate) hebTitle += "-" + hMonth_lastDate;
    hebTitle += " " + hYear_firstDate;
    if (hYear_firstDate !== hYear_lastDate) hebTitle += "-" + hYear_lastDate;
    var newTitle = `${hebTitle} ( ${gregTitle} )`;
    return newTitle;
  };

  const agendaHeaderTitle = (date, culture, localizer) => {
    const { end, start } = date;
    var gregStartTiTle = dateStr(start);
    var gregEndTiTle = dateStr(end);
    var hebStartDate = new HDate(start).renderGematriya();
    var hebEndDate = new HDate(end).renderGematriya();
    var newTitle = `(${gregStartTiTle}) ${hebStartDate} - ${hebEndDate} (${gregEndTiTle})`;
    return newTitle;
  };

  const dayHeaderTitle = (date, culture, localizer) => {
    var gregDay = String(date.getDate()).padStart(2, "0");
    var gregMonth = monthNames[date.getMonth()];
    const gregTitle = `${gregDay} ${gregMonth}`;
    var hebDateArr = new HDate(date).renderGematriya().split(" ");
    var hDay = hebDateArr[0];
    var hMonth = hebDateArr[1];
    const hebTitle = `${hDay} ${hMonth}`;
    var newTitle = `${
      hebDaysNames[date.getDay()]
    } ${hebTitle} ( ${gregTitle} )`;
    // console.log(date);
    return newTitle;
  };

  const handleSelect = ({ start, end }) => {
    // console.log(slotInfo);
    // console.log(start);
    // console.log(end);
    ///////////////////////
    // const title = window.prompt("New Event name");
    // if (title)
    //   setEventsData([
    //     ...eventsData,
    //     {
    //       start,
    //       end,
    //       title,
    //     },
    //   ]);
    ///////////////////////////
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    // var backgroundColor = "#" + event.hexColor;
    // let style = {};

    return {
      className: event.className,
      // style: style,
    };
  };
  return (
    <div>
      <br />
      <Calendar
        views={["day", "agenda", "month"]}
        actions={["next", "today", "prev"]}
        formats={{
          monthHeaderFormat: monthHeaderTitle,
          agendaHeaderFormat: agendaHeaderTitle,
          dayHeaderFormat: dayHeaderTitle,
        }}
        rtl={true}
        selectable
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        popup
        components={{
          month: {
            dateHeader: CustomDateHeader,
          },
          // agenda: {
          //   dateHeader: CustomDateHeader,
          // },
        }}
        events={eventsData}
        style={{ height: "100vh" }}
        onSelectEvent={(event) => {
          // console.log(event);
          if (event.className === "shiureTora") alert(event.description);
        }}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelect}
        tooltipAccessor={(event) => {
          if (event.description) return event.description;
          else return event.title;
        }}
        messages={{
          today: "היום",
          previous: "הקודם",
          next: "הבא",
          day: "יום",
          agenda: "רשימה",
          work_week: "ראשון-חמישי",
          month: "חודש",
          date: "תאריך",
          time: "שעה",
          event: "השיעור",
          noEventsInRange: "אין שיעורים בטווח הזמנים הזה",
          // more: "עוד",
        }}
        onRangeChange={(newRange, newView) => {
          // console.log(newView);
          if (newView !== undefined) setView(newView);
          if ((view === "day" && newView === undefined) || newView === "day") {
            setStartDate(newRange[0]);
            setEndDate(newRange[0]);
          } else if (
            (view === "work_week" && newView === undefined) ||
            newView === "work_week"
          ) {
            setStartDate(newRange[0]);
            setEndDate(newRange[4]);
          } else {
            setStartDate(newRange.start);
            setEndDate(newRange.end);
          }
          // console.log(newRange, newView);
        }}
        eventPropGetter={eventStyleGetter}
      />
      <br />
    </div>
  );
}

export default HebCalendarRBC;

import React, { createRef, useState } from "react";
import "./HebCalendarFC.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import FullCalendar from "@fullcalendar/react";
import daygridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timegridPlugin from "@fullcalendar/timegrid";

import { HebrewCalendar, HDate, Location } from "@hebcal/core";
import { eventToFullCalendar } from "@hebcal/rest-api";
import moment from "moment";

moment.locale("iw-IL");
const location = Location.lookup("Tel Aviv");

const dateStr = (myDate) => {
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

function HebCalendarFC({ lessonEvents }) {
  const [eventsData, setEventsData] = useState([]);
  const [view, setView] = useState("month");
  const [title, setTitle] = useState("");
  // const [action, setAction] = useState("TODAY");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "months").endOf("month").startOf("week")._d
  );
  const [endDate, setEndDate] = useState(
    moment().endOf("month").endOf("week")._d
  );
  let calendarRef = createRef(null);

  const handleSelect = ({ start, end }) => {
    const title = window.prompt("New Event name");
    if (title)
      setEventsData([
        ...eventsData,
        {
          start,
          end,
          title,
        },
      ]);
  };
  const handleDateClick = (dateClickInfo) => {
    // console.log(dateClickInfo);
  };

  const handleRangeChange = (dateInfo) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let greg_firstDate = dateInfo.start;
    // console.log("greg_firstDate", greg_firstDate);
    if (greg_firstDate.getDate() !== 1)
      greg_firstDate = nextMonthFirstDay(greg_firstDate);
    // console.log(dateInfo);
    const engToolbar = document.getElementById("fc-dom-2");

    const gregTitle = `${
      monthNames[greg_firstDate.getMonth()]
    } ${greg_firstDate.getFullYear()}`;

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
    var newTitle = `<h2 style="margin-left:30px;" }>${hebTitle}</h2><br><h2>${gregTitle}</h2>`;
    // var newTitle = `${hebTitle} ${"\t"}   ${gregTitle}`;

    // console.log("newTitle", newTitle);
    // setTitle(newTitle);
    console.log("calendarRef", calendarRef);
    // if (calendarRef.current !== null)
    //   console.log(
    //     "calendarRef.current.props.titleFormat",
    //     calendarRef.current.props.titleFormat
    //   );

    engToolbar.innerHTML = newTitle;
    // engToolbar.innerText = newTitle;
  };

  return (
    <div>
      <br />
      <FullCalendar
        ref={calendarRef}
        plugins={[daygridPlugin, timegridPlugin, listPlugin, interactionPlugin]}
        dateClick={handleDateClick}
        headerToolbar={{
          left: "today prev,next",
          center: "title", // buttons for switching between views
          right: "dayGridMonth,listMonth",
        }}
        // titleFormat={function (date) {
        //   return date.toString() + "!!!";
        // }}
        // {title}
        direction="rtl"
        timeZone={location.tzid}
        events={function (info, successCallback, failureCallback) {
          const options = {
            start: info.start,
            end: info.end,
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
              // apiObj.end = apiObj.start;
              // console.log("apiObj", apiObj);
              return apiObj;
            })
            .filter((ev) => ev.className !== "hebdate");
          // console.log("lessonEvents", lessonEvents);
          let lessonEventsFC = lessonEvents.map((item) => {
            const dateArr = item.date.split(".");
            var dateDay = dateArr[0];
            var dateMonth = dateArr[1];
            var dateYear = dateArr[2];
            // console.log(date);
            let lessonEvFc = {
              start: `${dateYear}-${dateMonth}-${dateDay}`,
              end: `${dateYear}-${dateMonth}-${dateDay}`,
              allDay: true,
              className: "shiureTora",
              title: `שיעור של הרב: ${item.ravName}`,
              description: getDesc(item),
            };
            return lessonEvFc;
          });
          const allEventsType = [...fcEvents, ...lessonEventsFC];
          // console.log(allEventsType);
          // console.log(fcEvents);
          // return fcEvents;
          successCallback(allEventsType);
          // failureCallback([]);
        }}
        eventDidMount={function (info) {
          // console.log(info);
          if (info.event.extendedProps.description) {
            tippy(info.el, {
              content: info.event.extendedProps.description,
              allowHTML: true,
            });
          }
        }}
        datesSet={handleRangeChange}
        ///////////////////////////////////////////////////////////////
        dayCellContent={function (info, create) {
          // console.log(info);
          var hebDate = new HDate(info.date);
          var hebDateArr = hebDate.renderGematriya().split(" ");
          var hDay = hebDateArr[0];
          var hMonth = hebDateArr[1];
          var hYear = hebDateArr[2];
          var hebCellTitle = "";
          if (hDay === "א׳") hebCellTitle = `${hDay} ${hMonth} ${hYear}`;
          else hebCellTitle = `${hDay} ${hMonth}`;
          return (
            <div className="custom-date-header">
              <div className="dh-item header-left">
                <span>{info.dayNumberText}</span>
              </div>
              <div className="dh-item header-right">
                <span>{hebCellTitle}</span>
              </div>
            </div>
          );
        }}
      />

      <br />
    </div>
  );
}

export default HebCalendarFC;

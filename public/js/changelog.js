const changelogList = {
    "2.52.107": {
        date: "June 16, 2021",
        improved: ["[Adjustment][Wilcon] Importing: Entries with previous dates should be not accepted at all",
                   "[Adjustment][Wilcon] Update status only available to admins"],
        fix: ["[Bug][Wilcon] Update status still viewable by dispatchers",
              "[Bug][Wilcon] Default driver on rest day can still be submitted"]
    },
    "2.51.107": {
        date: "June 09, 2021",
        fix: ["[Adjustment][Wilcon] Importing DE's should still block duplicate entries based on truck/driver/shift schedule",
              "(Fix)[Bug][Wilcon] Scheduled Entries Report missing",
              "(Fix)[Bug?][Wilcon] Importing entries with previous dates was accepted"],
        improved: ["[Adjustment][Wilcon] Days off: different kinds of days off should not be allowed to overlap",
                   "[Adjustment][Wilcon] Update status should not show in DE's"]
    },
    "2.51.106": {
        date: "June 07, 2021",
        feature: ["[Feature][Coke] Admin power to adjust shipment vehicle (and Check-in time) and have WD generate info based on new info"]
    },
    "2.50.106": {
        date: "June 04, 2021",
        feature: ["[Feature][Wilcon] Manpower and Vehicle utilization report"],
        improved: ["[Adjustment][Wilcon] Personnel with scheduled rest days should not be able to be selected in Create Entry",
                   "[Adjustment][Wilcon] Confirmation message for setting and removing rest day"]
    },
    "2.49.106": {
        date: "June 02, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Minor bug fix.",
              "aPAGE[Reports]zPAGE Bug fix - unable to click buttons."],
    },
    "2.49.105": {
        date: "May 27, 2021",
        fix: ["Minor bug fix."],
    },
    "2.49.104": {
        date: "May 26, 2021",
        feature: ["[Feature][Wilcon] Rest days"],
        improved: ["[Adjustment][Wilcon] Add Departure date/time time Delay Notification Page",
                   "[Adjustment][Wilcon] 'Scheduling Report' adjustments"],
    },
    "2.48.104": {
        date: "May 25, 2021",
        improved: ["[Adjustment][Wilcon] Previous dates be selectable in Scheduled Entries Report.",
                   "[Adjustment][Wilcon] Drop down menu for selecting Section and Company of trucks (Vehicle and Vehicle Personnel Page)"],
        fix: ["[Bug][Wilcon] Imported DE's not showing up in Scheduled Entries Report"]
    },
    "2.48.103": {
        date: "May 19, 2021",
        improved: ["[Adjustment][WM] Next Day Scheduled DE Report - Remove 'Next day' in the name; Also make it a date range selection.",
                   "WD accept .ods file for import."],
        feature: ["[Adjustment][Wilcon] Add 'Section' and 'Company' tagging of trucks"]
    },
    "2.47.103": {
        date: "May 19, 2021",
        other: ["[Adjustment][Wilcon] Scheduled entries to have their own box in dashboard."]
    },
    "2.47.102": {
        date: "May 12, 2021",
        fix: ["Fixed dispatch entry bug."]
    },
    "2.47.101": {
        date: "May 11, 2021",
        fix: ["Fixed logout issue. Users are not logged out if their session is expired while WD tab is inactive or if there's no internet connection while session was expired. The fix was to check the session everytime the website got connected to server."]
    },
    "2.47.100": {
        date: "May 10, 2021",
        improved: ["[Adjustment][Wilcon] Remove trailer, pal cap, hauler name from CICO Report and Over Transit Report",
                   "[Adjustment][Wilcon] Change Next day scheduling to be able to select any future date instead"],
        fix: ["[Adjustment] Make WD accept other file formats for importing (.odt)"]
    },
    "2.47.99": {
        date: "May 08, 2021",
        improved: ["aPAGE[Reports]zPAGE Improved  User Login Activity Report format.",
                   "aPAGE[Dispatch Entries]zPAGE Enable dispatchers to edit fields if entry's status is either Queueing, Processing, or Idling."],
    },
    "2.47.98": {
        date: "May 03, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Import file format."],
        improved: ["Version control - able to force update specific client only."],
    },
    "2.47.97": {
        date: "May 03, 2021",
        feature: ["aPAGE[Dispatch Entries]zPAGE New Import file format and process."],
    },
    "2.46.97": {
        date: "April 30, 2021",
        feature: ["Version control."],
    },
    "2.45.97": {
        date: "April 30, 2021",
        improved: ["aPAGE[Dispatch Entries]zPAGE Disabled Edit, Status Update, and Delete button for Dispatchers with conditions."],
    },
    "2.45.96": {
        date: "April 29, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Bug fix."],
    },
    "2.45.95": {
        date: "April 29, 2021",
        other: ["[Wilcon] Added Next Day Scheduled Entries Report."],
    },
    "2.45.94": {
        date: "April 27, 2021",
        fix: ["[Wilcon] WRU Main separated display name, truck number, and plate number. WD is showing truck number twice because of the said change in Main."],
    },
    "2.45.93": {
        date: "April 23, 2021",
        feature: ["[Adjustment][Wilcon] Must not save or create if the truck, driver, checker is already assigned on the same schedule date and time."],
        other: ["[Adjustment][Wilcon] Recombine Truck and Plate # (Except in Export DE excel).",
                "[Adjustment][Wilcon] Additional status for the deployment dashboard 'Scheduled'."],
    },
    "2.44.93": {
        date: "April 21, 2021",
        fix: ["aPAGE[Reports]zPAGE Fixed Dispatch Entries Summary Report bug."],
        other: ["aPAGE[Dispatch Entries]zPAGE Allowed dispatchers to all routes."],
    },
    "2.44.92": {
        date: "April 20, 2021",
        feature: ["[Adjustment][Wilcon] Custom shift schedule"],
        improved: ["[Adjustment][Wilcon] Default scheduled date is the next day (editable)",
                   '[Adjustment][Wilcon] Additional dashboard info "Onsite" "Returning"']
    },
    "2.43.92": {
        date: "April 19, 2021",
        fix: ["aPAGE[Notifications]zPAGE Added escalation to filter."],
    },
    "2.43.91": {
        date: "April 17, 2021",
        feature: ["[Coke] Auto logout after 2 hour idle and Window/tab closure"],
    },
    "2.42.91": {
        date: "April 13, 2021",
        feature: ["[Coke & Wilcon] Modification of Delay Escalations to 'Site based'."],
        improved: ["aPAGE[Reports]zPAGE [Coke] Add status, late entry, comments, and remarks as a last columns of the DE Summary report."]
    },
    "2.41.91": {
        date: "April 12, 2021",
        feature: ["aPAGE[Dispatch Entries]zPAGE Wilcon - Trigger Complete on return to Origin."],
        improved: ["aPAGE[Reports]zPAGE [Coke & Wilcon] Loading percentage for downloading reports.",
                   "aPAGE[Reports]zPAGE [Coke] Add status, late entry, and remarks as a last columns of the DE Summary report."]
    },
    "2.40.91": {
        date: "April 08, 2021",
        improved: ["aPAGE[Reports]zPAGE [Adjustment][Coke] Change date format of DE Summary Report to mm/dd/yyyy; Add status and late entry as a last column of the DE Summary report",
                   "aPAGE[Reports]zPAGE Added Date From and Date To in excel sheet report",
                   "aPAGE[Dispatch Entries]zPAGE [Adjustment][Wilcon] Make shift schedule the basis for DE activation.",
                   "aPAGE[Deployment Dashboard]zPAGE Wilcon - Should base on Scheduled date."],
    },
    "2.40.90": {
        date: "April 08, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Status bug fix."],
    },
    "2.40.89": {
        date: "April 07, 2021",
        feature: ["aPAGE[Reports]zPAGE Coke - Shipment summary report"],
        fix: ["aPAGE[Deployment Dashboard]zPAGE Wilcon - Dashboard displaying last year's entries",
              "aPAGE[Dispatch Entries]zPAGE Wilcon - Auto-generated SN. Only 9 digits. Should be 10 digits."],
    },
    "2.39.89": {
        date: "April 05, 2021",
        feature: ["aPAGE[Dispatch Entries]zPAGE Wilcon - Auto-generated, sequential 10-digit shipment numbers."],
        improved: ["aPAGE[Dispatch Entries]zPAGE Wilcon & Coke - Load vehicle data when user clicks the submit button."],
        fix: ["aPAGE[Deployment Dashboard]zPAGE Wilcon & Coke - Dashboard info is persistent through future dates."],
    },
    "2.38.89": {
        date: "March 30, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed trailer bug and added hourDiff (24 hrs)."],
    }, 
    "2.38.88": {
        date: "March 29, 2021",
        other: ["aPAGE[Dispatch Entries]zPAGE Allow administrators to edit Incomplete shipments. Status will not be affected.",
                "aPAGE[Dispatch Entries]zPAGE Allow administrators to update status with reason."],
    }, 
    "2.38.87": {
        date: "March 29, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed trailer for cases like ACP8836."],
    }, 
    "2.38.86": {
        date: "March 27, 2021",
        fix: ["Disabled delay notifications for normal users and dispatchers."],
    }, 
    "2.38.85": {
        date: "March 26, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed history order."],
    }, 
    "2.38.84": {
        date: "March 26, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Assigned trailer not appearing when selected in Create Entry; Can create an entry without tractor/trailer by adding a comment (Trailer should be required)."],
        improved: ["aPAGE[Reports]zPAGE Add duration to User Login Activity Report.",
                   "aPAGE[Dispatch Entries]zPAGE Will only show the message if required fields are filled."],
    }, 
    "2.38.83": {
        date: "March 25, 2021",
        fix: ["Big fix"],
    }, 
    "2.38.82": {
        date: "March 24, 2021",
        fix: ["Big fix"],
    }, 
    "2.38.81": {
        date: "March 24, 2021",
        fix: ["Big fix"],
    }, 
    "2.38.80": {
        date: "March 24, 2021",
        fix: ["Big fix"],
    }, 
    "2.38.79": {
        date: "March 23, 2021",
        fix: ["Big fix"],
    }, 
    "2.38.78": {
        date: "March 22, 2021",
        improved: ["aPAGE[Vehicle Personnel]zPAGE Wilcon only - Changed Occupation field to select."],
    }, 
    "2.38.77": {
        date: "March 22, 2021",
        other: ["Changed event time logic. Saved as an object list - key is the timestamp instead of status."],
    }, 
    "2.37.77": {
        date: "March 22, 2021",
        improved: ["aPAGE[Deployment Dashboard]zPAGE Wilcon only - Show active entries regardless of their posting date. Removed said feature from Coke."],
        feature: ["aPAGE[Dispatch Entries]zPAGE Wilcon & Coke - Allow Administrator to delete completed entries.",
                  "aPAGE[Dispatch Entries (Deleted)]zPAGE Wilcon & Coke - New page for Developers ONLY. Display deleted entries as well as who deleted it and what time it was deleted."],
    }, 
    "2.36.77": {
        date: "March 20, 2021",
        improved: ["aPAGE[Deployment Dashboard]zPAGE Show In Transit entries regardless of their posting date and show Scheduled date in selected date range."],
    }, 
    "2.36.77": {
        date: "March 20, 2021",
        improved: ["aPAGE[Dispatch Entries]zPAGE Added Hide/Show button to hide or show In Transit entries regardless of their posting date."],
    }, 
    "2.35.77": {
        date: "March 18, 2021",
        other: ["aPAGE[Delay Escalation Dashboard]zPAGE Added Posted By and Posted On in modal."],
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed searching feature in routes."],
    }, 
    "2.35.76": {
        date: "March 15, 2021",
        improved: ["aPAGE[Deployment Dashboard]zPAGE Added View Button in Dispatch Modal.",
                   "Improved live updates for Users and Sessions."],
    }, 
    "2.35.75": {
        date: "March 12, 2021",
        improved: ["Used Socket.IO instead of Websockets for Server-Client communication. Reason: Some clients' browsers may not support Websocket. Socket.IO has a fallback in case these things happen."],
    },
    "2.35.74": {
        date: "March 11, 2021",
        feature: ["aPAGE[Reports]zPAGE Added User Login Activity Report."],
        improved: ["aPAGE[Delay Escalation Dashboard]zPAGE Added Base Plant Column."],
        fix: ["aPAGE[Delay Escalation Dashboard]zPAGE Fixed filter by site & base plant."],
    },
    "2.34.74": {
        date: "March 10, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed Target CICO Time and Search by SN."],
    },
    "2.34.73": {
        date: "March 10, 2021",
        feature: ["Added Vehicle Personnel Page (Wilcon)."],
        improved: [`aPAGE[Dispatch Entries]zPAGE Dropdown list for driver & checker. Driver & Checker will autofill upon vehicle change.`],
        other: ["aPAGE[Dispatch Entries]zPAGE Removed 'Create' button (Coke only)."]
    },
    "2.33.73": {
        date: "March 08, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Updated Import Batch File format for Wilcon. Added Scheduled Date filter for Wilcon.`],
    },
    "2.33.72": {
        date: "March 05, 2021",
        fix: [`User bug fixes.`],
    },
    "2.33.71": {
        date: "March 05, 2021",
        other: [`Back-end update - changestreams.`],
    },
    "2.33.70": {
        date: "March 04, 2021",
        fix: [`aPAGE[Dispatch Entries]zPAGE Bug fix.`],
    },
    "2.33.69": {
        date: "March 03, 2021",
        other: [`aPAGE[Dispatch Entries]zPAGE Disabled searching of Trailer in Create/Edit Admin.`],
    },
    "2.33.68": {
        date: "March 02, 2021",
        fix: [`aPAGE[Vehicles/Trailers]zPAGE Fixed filter issue.`],
    },
    "2.33.67": {
        date: "March 02, 2021",
        feature: [`aPAGE[Vehicles/Trailers]zPAGE Added Site filter.`],
    },
    "2.32.67": {
        date: "March 01, 2021",
        improved: [`aPAGE[Vehicles/Dispatch Entries]zPAGE Added Conduction #.`,`aPAGE[Dispatch Entries]zPAGE Change trailer to "Straight Truck" if the truck is their own trailer.`,`aPAGE[Vehicles]zPAGE Sort by Base Plant/Site.`],
        fix: [`aPAGE[Reports]zPAGE Fixed - unable to generate report.`],
    },
    "2.32.66": {
        date: "February 26, 2021",
        fix: [`aPAGE[Trailers]zPAGE Disable Trailer field in edit.`],
    },
    "2.32.65": {
        date: "February 26, 2021",
        feature: [`aPAGE[Trailers]zPAGE Created Trailers page (data downloaded once from Main but will not be updated when trailers in Main is updated. Independent from Main.)`],
        improved: [`aPAGE[Dispatch Entries]zPAGE Trailer can be independent from vehicles. Trailer info will update when trailer is changed.`],
    },
    "2.31.65": {
        date: "February 24, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Default value in Origin field for Dispatchers and Wilcon. `],
        fix: [`aPAGE[Dispatch Entries]zPAGE Disabled Create (Admin) and Edit (Admin) buttons for Wilcon`],
    },
    "2.31.64": {
        date: "February 24, 2021",
        fix: [`aPAGE[Delay Notifications]zPAGE Export button for Wilcon only.`],
    },
    "2.31.63": {
        date: "February 24, 2021",
        feature: [`aPAGE[Delay Notifications]zPAGE Added Export button (Copy Table, Export as CSV, and Export as Excel).`,
                  `aPAGE[Dispatch Entries]zPAGE Added separate buttons for Create-Admin and Edit-Admin.`],
    },
    "2.30.63": {
        date: "February 24, 2021",
        other: [`aPAGE[Dispatch Entries]zPAGE Removed "Trailer" field.`],
    },
    "2.30.62": {
        date: "February 23, 2021",
        feature: [`aPAGE[Dispatch Entries]zPAGE Added "Trailer" field.`],
    },
    "2.29.62": {
        date: "February 23, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE For dispatchers only - autofilled origin in routes search box.`],
        fix: [`aPAGE[Dispatch Entries]zPAGE Fixed - dispatchers able to see all routes.`],
    },
    "2.29.61": {
        date: "February 22, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Choose origin and destination by routes.`],
        feature: [`aPAGE[Dispatch Entries]zPAGE Wilcon - added ticket number, scheduled date, driver, and checker fields.`],
    },
    "2.28.61": {
        date: "February 18, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Improved View function - more detailed and added logs.`],
        other: [`Removed 'queueingAtDestination' and 'processingAtDestination' status`],
    },
    "2.28.60": {
        date: "February 17, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Pal Cap - set visibility to default; added access for administrators and developers to edit dispatch entries after assigned status.`,
                  `aPAGE[Delay Escalation Dashboard]zPAGE Added CICO Time; removed processing,idling,check-out date & time, and CICO time from queueing pop-up.`,
                  `aPAGE[Reports]zPAGE Added End Date and End Time columns in Vehicle CICO Report.`,],
    },
    "2.28.59": {
        date: "February 16, 2021",
        feature: [`Added options for push notifications in Settings page.`,
                  `aPAGE[Delay Escalation Dashboard]zPAGE Live duration.`],
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Fixed destination status showing up.`]
    },
    "2.27.59": {
        date: "February 15, 2021",
        improved: [`aPAGE[Reports]zPAGE Updated Vehicle CICO Report cells to stick to original format.`],
    },
    "2.27.58": {
        date: "February 11, 2021",
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Fixed target CICO time - changed to origin's.`],
    },
    "2.27.57": {
        date: "February 10, 2021",
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Ignore unnecessary rows.`],
        improved: [`aPAGE[Delay Escalation Dashboard]zPAGE Arranged the delay types.`],
    },
    "2.27.56": {
        date: "February 10, 2021",
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Fixed incorrect duration showing (changed to max).`],
        improved: [`aPAGE[Delay Escalation Dashboard]zPAGE Placed 'Idling Duration' after 'Processing Duration'.`,
                   `Changed 'idle_origin' to 'idlingAtOrigin'. 'idle_origin' is the timestamp where the vehicle is inside Idle geofence while the status of the entry is Dispatch; while 'idleAtOrigin' is the timestamp where the vehicle is also inside the Idle geofence but the status of the entry is Processing.`],
    },
    "2.27.55": {
        date: "February 09, 2021",
        feature: [`aPAGE[Dispatch Entries]zPAGE Added progress bar at the bottom of the table.`,
                  `Pop-up on lower right of the screen for delayed escalation of entries.`],
        improved: [`aPAGE[Delay Escalation Dashboard]zPAGE Increased notification volume.`,
                   `aPAGE[Dispatch Entries]zPAGE Added 'Pal Cap'.`],
    },
    "2.26.55": {
        date: "February 05, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Added 'idle_origin' time.`,
                   `aPAGE[Delay Escalation Dashboard]zPAGE Followed Coke's updated pop-up format.`],
    },
    "2.26.54": {
        date: "February 05, 2021",
        improved: [`aPAGE[Dispatch Entries]zPAGE Added 'entered_origin' time; removed CICO - Destination.`],
    },
    "2.26.53": {
        date: "February 04, 2021",
        other: [`Changed maximum idle time to 30 minutes from 20 minutes.`],
    },
    "2.26.52": {
        date: "February 04, 2021",
        improved: [`aPAGE[Delay Escalation Dashboard]zPAGE Followed Coke's format for the pop-out.`],
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Fixed duplicate row issues.`],
    },
    "2.26.51": {
        date: "February 03, 2021",
        fix: [`aPAGE[Reports]zPAGE Start counting duration when vehicle entered the main geofence (ignore when in Idle, Queueing, or Processing areas).`],
    },
    "2.26.50": {
        date: "February 03, 2021",
        fix: [`aPAGE[Reports]zPAGE Fixed 'Pending' and 'Finished' status error in Vehicle CICO Report.`],
    },
    "2.26.49": {
        date: "February 02, 2021",
        fix: [`aPAGE[Delay Escalation Dashboard]zPAGE Fixed double entry issue.`],
        improved: [`aPAGE[Delay Escalation Dashboard]zPAGE Only show entries with highest escalation level.`,
                   `aPAGE[Reports]zPAGE Deduct 5 minutes from trigger time.`],
    },
    "2.26.48": {
        date: "January 29, 2021",
        feature: [`aPAGE[Delay Escalation Dashboard]zPAGE Added sound when a delay gets escalated; Show more info of dispatch entry when plate number is clicked.`],
    },
    "2.25.48": {
        date: "January 26, 2021",
        fix: [`aPAGE[Reports]zPAGE Fixed sites not showing up in Vehicle CICO Report.`],
    },
    "2.25.47": {
        date: "January 22, 2021",
        improved: [
            `Improved transition of tooltip pop-out.`,
            `aPAGE[Dispatch Entries]zPAGE Display name instead of username when a row is updated.`
        ],
        fix: [`aPAGE[Dispatch Entries]zPAGE Fixed infinite loading of row buttons.`],
    },
    "2.25.46": {
        date: "January 20, 2021",
        refactor: [`Changed 'Dispatch' to 'Assigned'.`],
    },
    "2.25.45": {
        date: "January 19, 2021",
        fix: [`aPAGE[Deployment Dashboard]zPAGE Fixed duplicate shipment entries showing upon clicking rows.`],
    },
    "2.25.44": {
        date: "January 18, 2021",
        fix: [`aPAGE[Deployment Dashboard]zPAGE Fixed trailer issue.`,`aPAGE[Dispatch Entries]zPAGE Fixed status being always 'Dispatch' upon submitting.`],
    },
    "2.25.43": {
        date: "January 17, 2021",
        refactor: [`aPAGE[Reports]zPAGE Changed 'Vehicle Report' to 'Vehicle CICO Report'.`],
        fix: [`aPAGE[Reports]zPAGE Removed 'transit time' in Vehicle CICO Report.`],
    },
    "2.25.42": {
        date: "January 15, 2021",
        improved: [`aPAGE[Deployment Dashboard]zPAGE Added title, fixed trailer number issue, and updating summary when selecting in 'Base Plant'.`],
    },
    "2.25.41": {
        date: "January 14, 2021",
        feature: [`aPAGE[Reports]zPAGE Allowed 'Vehicle Report' button to all users.`],
    },
    "2.25.40": {
        date: "January 13, 2021",
        feature: [`aPAGE[Reports]zPAGE Added 'Vehicle Report' button (temporarily accessible by Developers only).`],
    },
    "2.24.40": {
        date: "January 12, 2021",
        improved: [`aPAGE[Event Viewer/All Events]zPAGE Merged database collections into one. Also changed the database collection structure.`],
    },
    "2.24.39": {
        date: "January 11, 2021",
        other: [`aPAGE[Deployment Dashboard]zPAGE Coke's request: For origin view, show status "Complete" for status "Queueing (Destination)" and "Processing (Destination)".`],
    },
    "2.24.38": {
        date: "January 07, 2021",
        improved: [`Logs are separated from main database.`],
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed saving vehicle data twice."],
    },
    "2.24.37": {
        date: "January 06, 2021",
        improved: [`aPAGE[Vehicles]zPAGE Display last 5 location histories of the vehicle instead of 2.`],
    },
    "2.24.36": {
        date: "January 05, 2021",
        other: [`aPAGE[Deployment Dashboard]zPAGE Coca-Cola Team's Request
                <ol>
                    <li>“Complete” Status Logic in origin perspective.
                        <ul>
                            <li>From: Actual check out at the origin, it will trigger the complete status</li>
                            <li><b>To: Actual check in or arrival of the unit to its destination site, it will trigger the complete status</b></li>
                        </ul>
                    </li>
                    <li>In Destination view, all incoming shipment to destination site is the only shipment will reflect on each column.</li>
                    <li>Upon changing the logic of the “Complete” status, in Destination View, the status “Queueing (Destination), Processing (Destination)” will be not shown or even counted on the “Total Shipment” column.</li>
                </ol>`],
    },
    "2.24.35": {
        date: "January 04, 2021",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed bug in logic (auto-detect of event timestamps)."],
    },
    "2.24.34": {
        date: "December 28, 2020",
        fix: ["aPAGE[Deployment Dashboard]zPAGE Fixed bug in reset filter."],
    },
    "2.24.33": {
        date: "December 22, 2020",
        improved: ["aPAGE[Dispatch Entries]zPAGE Improved algorithm for automatic detection of status and event timestamps based on vehicle's last location data."],
    },
    "2.24.32": {
        date: "December 18, 2020",
        feature: ["aPAGE[Deployment Dashboard/Dispatch Entries]zPAGE Filters are saved and can be reset upon clicking 'Reset filters'."],
    },
    "2.23.32": {
        date: "December 17, 2020",
        fix: ["aPAGE[Dashbord]zPAGE Fixed UI of region list when data exceeded maximum width."],
        refactor: ["Added tab icon."],
    },
    "2.23.31": {
        date: "December 16, 2020",
        improved: ["aPAGE[Geofences]zPAGE Allowed to save without cluster."],
    },
    "2.23.30": {
        date: "December 14, 2020",
        feature: ["Added fullscreen feature."],
        improved: ["aPAGE[Delay Escalation Dashboard]zPAGE Added 'Delay Escalation Dashboard' title; renamed columns 'Destination' to 'Location' in Long Queueing and Over CICO.",
                   "aPAGE[Deployment Dashboard]zPAGE Minor improvement on CSS."],
    },
    "2.22.30": {
        date: "December 11, 2020",
        fix: ["aPAGE[Delay Escalation Dashboard]zPAGE Fixed page to only show 'live' data."],
        improved: ["aPAGE[Delay Escalation Dashboard]zPAGE Allowed multiple selection of site."],
    },
    "2.22.29": {
        date: "December 09, 2020",
        fix: ["aPAGE[Delay Escalation Dashboard]zPAGE fixed bug causing not to update countings."],
    },
    "2.22.28": {
        date: "December 07, 2020",
        feature: ["Added Delay Escalation Dashboard page."],
    },
    "2.21.28": {
        date: "December 04, 2020",
        improved: ["aPAGE[Dispatch Entries]zPAGE Added Site Name in searching origin or destination."],
    },
    "2.21.27": {
        date: "December 02, 2020",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed alert message for vehicles inside geofence but does not have history location yet; Fixed toastr when vehicle data is not yet done loading."],
    },
    "2.21.26": {
        date: "December 01, 2020",
        improved: ["aPAGE[Dispatch Entries]zPAGE Improved logic for CICO at Origin."],
    },
    "2.21.25": {
        date: "November 29, 2020",
        improved: ["aPAGE[Dispatch Entries]zPAGE Added 'Version' data in DE History; improved logic."],
    },
    "2.21.24": {
        date: "November 26, 2020",
        improved: ["aPAGE[Dispatch Entries]zPAGE Added 'Vehicle's Location History at Posting Date' data in DE History."],
    },
    "2.21.23": {
        date: "November 25, 2020",
        feature: ["aPAGE[Vehicles]zPAGE Added View button to view location history of the vehicle."],
    },
    "2.20.23": {
        date: "November 24, 2020",
        fix: ["Fixed minor bugs in error handling."],
        improved: ["aPAGE[Vehicles]zPAGE Added Equipment Number column."],
    },
    "2.20.22": {
        date: "November 23, 2020",
        feature: ["aPAGE[Dispatch Entries]zPAGE Added history button (developers only). User actions are saved for record purposes."],
        improved: ["aPAGE[Dispatch Entries]zPAGE Event timestamps will not reset when user manually changes status or edits data in entry. Event time calculation will only show depending on status."],
    },
    "2.19.22": {
        date: "November 20, 2020",
        improved: ["aPAGE[CICO Dashboard]zPAGE "],
    },
    "2.19.21": {
        date: "November 19, 2020",
        fix: ["aPAGE[Dashboard]zPAGE Fixed 'Choose Site' filter source. Source is from WRU Main instead of WD geofences."],
    },
    "2.19.20": {
        date: "November 18, 2020",
        other: ["aPAGE[Dashboard]zPAGE Renamed 'CICO Dashboard' to 'Deployment Dashboard'; Removed CICO related columns; Added 'Choose Site' filter; enabled Deployment Dashboard for all users."],
    },
    "2.19.19": {
        date: "November 17, 2020",
        improved: ["aPAGE[All Events]zPAGE Improved search feature."],
    },
    "2.19.18": {
        date: "November 16, 2020",
        feature: ["aPAGE[All Events]zPAGE Added All Events Page for developers. This page displays all events sent by vehicles to Events function regardless of conditions."],
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed detection of status."]
    },
    "2.18.18": {
        date: "November 12, 2020",
        feature: ["aPAGE[Vehicles]zPAGE Added 'Last 2 Locations' column with the latest timestamp event recorded."]
    },
    "2.17.18": {
        date: "November 10, 2020",
        feature: ["aPAGE[Dispatch Entries]zPAGE Added checker that looks into the database if vehicle is or has been at the origin or already at destination. Saving event timestamps for CICO purposes."]
    },
    "2.16.18": {
        date: "November 5, 2020",
        fix: ["aPAGE[Login]zPAGE Fixed forever loading when IPInfo (third party) server is down."]
    },
    "2.16.17": {
        date: "November 4, 2020",
        feature: ["Added timeout when page is idle for more than 20 minutes."]
    },
    "2.15.17": {
        date: "November 3, 2020",
        refactor: ["Updated CokeT1 and CokeT2 logos."]
    },
    "2.15.16": {
        date: "October 30, 2020",
        feature: ["aPAGE[Event Viewer]zPAGE Added 'Generate Report' button in table options. Report buttons are only clickable if data are available. Reports for CokeT2 is transferred in Event Viewer page from Reports page. (CokeT2 only)"],
        refactor: ["Updated 'Export Options' icon."]
    },
    "2.14.16": {
        date: "October 29, 2020",
        feature: ["aPAGE[Reports]zPAGE Added Trucks Outside DC Report (for CokeT2)."],
    },
    "2.13.16": {
        date: "October 26, 2020",
        feature: ["aPAGE[Dispatch Entries]zPAGE Added and modified status.[Queueing (Origin), Processing (Origin),Queueing (Destination), Processing (Destination)]."],
        fix: ["aPAGE[Dashboard/Dispatch Entries]zPAGE Fixed CICO and Compliance for Origin."],
    },
    "2.12.16": {
        date: "October 25, 2020",
        feature: ["aPAGE[Dashboard/Dispatch Entries]zPAGE Added Event Queueing, Event Processing, and CICO for origin."],
        improved: ["aPAGE[Event Viewer]zPAGE Improved database structure."],
    },
    "2.11.16": {
        date: "October 23, 2020",
        fix: ["aPAGE[Event Viewer]zPAGE Fixed error caused by null or undefined values."],
    },
    "2.11.15": {
        date: "October 19, 2020",
        feature: ["aPAGE[Dispatch Entries/Dashboard]zPAGE Added CICO Time and CICO Time (Capped) columns. (HH:MM format)"],
    },
    "2.10.15": {
        date: "October 15, 2020",
        refactor: ["Minor UI changes - footer on screen resize. Added version in footer.",
                   "aPAGE[Settings]zPAGE The current version will only appear on the Mobile version and will be hidden on the Web version.."],
    },
    "2.10.14": {
        date: "October 14, 2020",
        feature: ["Detect if user's name and/or email is empty. Show popup with instructions to setup profile.",
                  "Added new roles specifically for CokeT2 (user & developer).",
                  "aPAGE[Profile]zPAGE Added 'Download Profile From WRU Dispatch - CokeT1' button (For CokeT2 only)."],
    },
    "2.9.14": {
        date: "October 10, 2020",
        other: ["Setup CokeT2 WD account."],
        refactor: ["aPAGE[Changelog]zPAGE Minor update on Changelog guide."]
    },
    "2.9.13": {
        date: "October 06, 2020",
        fix: ["aPAGE[Regions]zPAGE Fixed create new region error."],
    },
    "2.9.12": {
        date: "October 02, 2020",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed - Wrong Ave. CICO Time showing for some Plant/DC."],
    },
    "2.9.11": {
        date: "October 01, 2020",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed - Trailer not showing value."],
        refactor: ["aPAGE[Dispatch Entries]zPAGE Minor UI Changes in Import Batch File and updated link of Excel file URL."],
    },
    "2.9.10": {
        date: "October 01, 2020",
        fix: ["aPAGE[Dispatch Entries]zPAGE Fixed bug in posting date filter."],
    },
    "2.9.9": {
        date: "September 30, 2020",
        feature: ["Allow Dispatcher role to view Dashboard (without CICO information and Compliance)."],
        refactor: ["Added background color when a table row is hovered.","aVERSION(Mobile Version)zVERSION Fixed bottom bar menu width.","aPAGE[Dispatch Entries]zPAGE Minor UI updates in 'Create New Dispatch Entry' modal."],
        improved: ["aPAGE[Dispatch Entries]zPAGE Allow user to filter by Departure Date only. Posting date will be empty only if Departure Date has value."],
        fix: ["Fixed date filter (unable to click default date when filter is cleared)."],
    },
    "2.8.9": {
        date: "September 29, 2020",
        improved: ["aPAGE[Dashboard]zPAGE <ul class='pl-4'><li>CICO Time is capped to 5 hours if destination is Plant.</li><li>Followed the logic and formula provided by Coke.</li></ul>"],
        fix: ["aPAGE[Dashboard]zPAGE Fixed the formula for Ave. CICO Time."],
    },
    "2.8.8": {
        date: "September 28, 2020",
        fix: ["aPAGE[Dashboard]zPAGE Fixed the pop-up error showing when a Geofence/Site is not yet assigned to a Region."],
    },
    "2.8.7": {
        date: "September 24, 2020",
        feature: ["aPAGE[Dashboard]zPAGE Added a toggle to switch between Origin View/Destination View."],
        improved: ["aVERSION(Mobile Version)zVERSION aPAGE[Dashboard]zPAGE Disabled keyboard pop-up when selecting a date."],
    },
    "2.7.7": {
        date: "September 22, 2020",
        refactor: ["Changed the term 'Developers Only' to 'For Developers'."],
    },
    "2.7.6": {
        date: "September 22, 2020",
        fix: ["aPAGE[Changelog]zPAGE Fixed - Multiple changelog types not showing."],
        refactor: ["aPAGE[Changelog]zPAGE Minor UI updates (including Changelog Guide).",
                   "aPAGE[Settings]zPAGE Added web application version."],
    },
    "2.7.5": {
        date: "September 21, 2020",
        feature: ["Added Changelog page (accessible to Developers only)."],
        fix: ["aVERSION(Web Version)zVERSION aPAGE[Dashboard]zPAGE Fixed the Customize Display Options height and position."],
    },
    "2.6.5": {
        date: "September 19, 2020",
        feature: ["aPAGE[Dispatch Entries]zPAGE Added feature that enabled users to search for Shipment Number through all records",
                  "aVERSION(Mobile Version)zVERSION aPAGE[Notifications]zPAGE Real-time update"],
    },
    "2.5.5": {
        date: "September 17, 2020",
        improved: ["aVERSION(Mobile Version)zVERSION aPAGE[Dashboard]zPAGE Dispatch list User Interface"],
    },
    "2.5.4": {
        date: "September 16, 2020",
        feature: ["aVERSION(Mobile Version)zVERSION aPAGE[Notifications]zPAGE Added refresh and filter button",
                  "aPAGE[Dashboard]zPAGE Added option to load existing entry on user click (for duplicate shipment number only)"],
        improved: ["aPAGE[Dashboard/Dispatch/Notifications/Event Viewer]zPAGE Pop-up slide when filter/export/customize display options is clicked"],
    },
    "2.4.4": {
        date: "September 14, 2020",
        fix: ["aPAGE[Dashboard]zPAGE Fixed pop-up tooltip in table headers"],
        refactor: ["aPAGE[Dashboard]zPAGE Added Incomplete table header info"],
    },
    "2.4.3": {
        date: "September 02, 2020",
        feature: ["aPAGE[Dashboard]zPAGE Removed refreshing of data every 5 minutes and implemented real-time update instead",
                  "aPAGE[Regions]zPAGE Added 'Sequence' column for sequencing of region tabs in Dashboard"],
        refactor: ["aPAGE[Dashboard]zPAGE Changed 'Plan' to 'Incomplete'",
                   "aPAGE[Vehicles]zPAGE Changed the status 'Truck Rehab' to 'Preventive Maintenance'"],
    },
    "2.3.3": {
        date: "August 26, 2020",
        fix: ["aPAGE[Dispatch]zPAGE Fixed bug when submitting a Dispatch entry"],
    },
    "2.3.2": {
        date: "August 21, 2020",
        feature: ["Added Dashboard page"],
    },
    "2.2.2": {
        date: "August 20, 2020",
        feature: ["aPAGE[Vehicles]zPAGE Changing Availability Status will also change the status in WRU Main",
                  "aPAGE[Profile]zPAGE Added Edit and Download Profile from WRU Main buttons"],
    },
    "2.1.2": {
        date: "August 13, 2020",
        refactor: ["aPAGE[Geofences]zPAGE Changed term from 'Geofences' to 'Distribution Center' to 'Sites'."],
    },
    "2.1.1": {
        date: "August 12, 2020",
        fix: ["aPAGE[Login]zPAGE Changed username to be case-insensitive"],
    },
    "2.1.0": {
        date: "August 01-09, 2020",
        feature: ["aPAGE[Regions/Clusters/Geofences]zPAGE Region, cluster, and geofence data are separated in terms of database structure and page.",
                  "aPAGE[Vehicles/Geofences]zPAGE Data are imported from WRU Main. Watching for updates every 2 minutes."],
    },
    "2.0.0": {
        date: "July 17, 2020",
        release: ["WRU Dispatch hosting on Microsoft Azure.<br>Available to users on August 14, 2020."],
    },
    "1.0.0 - v.1.21.57": {
        date: "mid of May 2020 - September 15, 2020",
        release: ["WRU Dispatch hosted on Google App Engine.<br>Terminated on September 16, 2020.<br>Reason for termination: Google App Engine does not support Web Sockets. Web sockets are used to get real-time data updates. The application instead uses long-polling resulting in thousands of requests per user connection, and the number of requests matters for the billing."],
    },
    "0.0.0 - v.0.4.19": {
        date: "April 2020 - mid of May 2020",
        release: ["WRU Dispatch hosted on MongoDB Stitch.<br>Terminated on mid of May 2020.<br>Reason for termination: MongoDB Stitch uses its own Javascript runtime and the needed modules for the application such as NodeJS, ExpressJS, etc. are not available or supported."],
    }
};
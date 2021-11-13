Original plugin: https://www.daterangepicker.com/

Customized it so it can be used to choose multiple dates.

Usage (demo):
$(`#calendar`).daterangepicker({
	multipleDates: true,
	showSingleCalendar: true,
	displayAsInlineCalendar: true,
	alwaysShowCalendars: true
});

$(`#calendar`).data('daterangepicker').setDates(["08/12/2021","05/21/2021","07/21/2021"]);
$(`#calendar`).data('daterangepicker').clickApply();
$('#calendar').trigger('click');

$(`#calendar`).data('daterangepicker').getDates();
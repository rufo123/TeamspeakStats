import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDatepicker } from "@angular/material/datepicker";
import moment, { Moment } from "moment";
import { FormatTypes } from "../services/switchable-date-picker-format/switchable-date-picker-format-service.service";

import { SwitchableRangeDatePickerComponent } from "./switchable-range-date-picker.component";

describe("SwitchableRangeDatePickerComponent", () => {
    let component: SwitchableRangeDatePickerComponent;
    let fixture: ComponentFixture<SwitchableRangeDatePickerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SwitchableRangeDatePickerComponent],
            providers: [DatePipe], // Provide DatePipe
        });
        fixture = TestBed.createComponent(SwitchableRangeDatePickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    // Test the ngOnChanges method:

    it("should update date format on input format change", () => {
        const format = FormatTypes.year;
        component.inputFormat = format;
        const setFormatsSpy = spyOn(
            component["myFormatsService"],
            "setFormats"
        );

        component.ngOnChanges({ inputFormat: { currentValue: format } } as any);

        expect(setFormatsSpy).toHaveBeenCalledWith(format);
    });

    it("should update date value on inputDate change", () => {
        const dateValue = "2023-07-30";
        component.previousDate = "2023-07-29";
        component.ngOnChanges({
            inputDate: { currentValue: dateValue },
        } as any);

        expect(component.date.value.toISOString()).toEqual(
            new Date(dateValue).toISOString()
        );
    });

    // Test the updateDateEvent method:

    it("should emit newDateEvent with the selected date", () => {
        const dateValue = "2023-07-30 00:00";
        component.date.setValue(moment(dateValue));
        const emitSpy = spyOn(component.newDateEvent, "emit");

        component.updateDateEvent();

        expect(emitSpy).toHaveBeenCalledWith(new Date(dateValue));
    });

    it("should not emit newDateEvent if date value is null", () => {
        component.date.setValue(null);
        const emitSpy = spyOn(component.newDateEvent, "emit");

        component.updateDateEvent();

        expect(emitSpy).not.toHaveBeenCalled();
    });

    // Test the chosenYearHandler and chosenMonthHandler methods:

    it("should update the year when chosenYearHandler is called", () => {
        const datepicker: MatDatepicker<Moment> = jasmine.createSpyObj(
            "MatDatepicker",
            ["close"]
        );
        const year = 2023;
        const normalizedYear = moment([year]);
        component.date.setValue(moment("2021-07-29"));
        const getSelectedFormatsTypeSpy = spyOn(
            component["myFormatsService"],
            "getSelectedFormatsType"
        ).and.returnValue(FormatTypes.year);

        component.chosenYearHandler(normalizedYear, datepicker);

        expect(component.date.value.year()).toEqual(year);
        expect(datepicker.close).toHaveBeenCalled();
        // Restore the original method after the test
        getSelectedFormatsTypeSpy.and.callThrough();
    });

    it("should update the month and emit date when chosenMonthHandler is called", () => {
        const datepicker: MatDatepicker<Moment> = jasmine.createSpyObj(
            "MatDatepicker",
            ["close"]
        );
        const year = 2021;
        const month = 7;
        const normalizedMonth = moment([year, month]);
        const emitSpy = spyOn(component.newDateEvent, "emit");
        component.date.setValue(moment("2021-07-29"));
        // Create a partial mock of the myFormatsService to return the desired format
        const getSelectedFormatsTypeSpy = spyOn(
            component["myFormatsService"],
            "getSelectedFormatsType"
        ).and.returnValue(FormatTypes.yearMonth);

        component.chosenMonthHandler(normalizedMonth, datepicker);
        expect(component.date.value.year()).toEqual(year);
        expect(component.date.value.month()).toEqual(month);
        expect(datepicker.close).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(component.date.value.toDate());

        // Restore the original method after the test
        getSelectedFormatsTypeSpy.and.callThrough();
    });
});

import {
    Component,
    EventEmitter,
    Inject,
    Input,
    Output,
    SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import {
    MomentDateAdapter,
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
    DateAdapter,
    MatDateFormats,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
} from "@angular/material/core";

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from "moment";
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from "moment";
import {
    FormatTypes,
    SwitchableDatePickerFormatService,
} from "../services/switchable-date-picker-format/switchable-date-picker-format-service.service";
import { DatePipe } from "@angular/common";

const moment = _rollupMoment || _moment;

@Component({
    selector: "app-switchable-range-date-picker",
    templateUrl: "./switchable-range-date-picker.component.html",
    styleUrls: ["./switchable-range-date-picker.component.scss"],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        {
            provide: MAT_DATE_FORMATS,
            useFactory: (myFormatsService: SwitchableDatePickerFormatService) =>
                myFormatsService.getFormats(),
            deps: [SwitchableDatePickerFormatService],
        },
    ],
})
export class SwitchableRangeDatePickerComponent {
    constructor(
        @Inject(MAT_DATE_FORMATS) public data: DatePickerData,
        private myFormatsService: SwitchableDatePickerFormatService,
        private datePipe: DatePipe
    ) {
        myFormatsService.setFormats(FormatTypes.yearMonthDay);
        this.previousDate = new Date(Date.now()).toISOString();
    }

    @Output() newDateEvent = new EventEmitter<Date>();
    @Input() inputFormat: FormatTypes = FormatTypes.yearMonthDay;
    @Input() inputDate: string = new Date(Date.now()).toISOString();
    @Input() disabled = false;
    @Input() min: Date = new Date(0);
    @Input() max: Date = new Date(Date.now());

    public previousDate: string;
    public date: FormControl = new FormControl(moment());

    ngOnChanges(changes: SimpleChanges) {
        if (changes["inputFormat"]) {
            const newFormat: FormatTypes = changes["inputFormat"].currentValue;
            this.myFormatsService.setFormats(newFormat);
        }

        this.updateDateOnPickerHack();

        if (changes["inputDate"]) {
            const newDate: string = changes["inputDate"].currentValue;
            this.date.setValue(moment(new Date(newDate)));
            this.previousDate = newDate;
        } else {
            this.date.setValue(moment(new Date(this.previousDate)));
        }
    }

    public updateDateOnPickerHack(): void {
        this.data.parse.dateInput = this.myFormatsService.getFormatLabel();
        this.data.display.dateInput = this.myFormatsService.getFormatLabel();
    }

    public getLabel(): string {
        return this.myFormatsService.getFormatLabel();
    }

    public updateDate(value: Date): void {
        this.newDateEvent.emit(value);
    }

    public chosenYearHandler(
        normalizedYear: Moment,
        datepicker: MatDatepicker<Moment>
    ): void {
        const ctrlValue = this.date.value;
        if (ctrlValue) {
            ctrlValue.year(normalizedYear.year());
            this.date.setValue(ctrlValue);
            if (
                this.myFormatsService.getSelectedFormatsType() ===
                FormatTypes.year
            ) {
                datepicker.close();
            }
        }
    }

    public updateDateEvent(): void {
        if (this.date.value !== null) {
            const newDate: Date = this.date.value.toDate();
            newDate.setHours(0, 0, 0);
            this.updateDate(newDate);
        }
    }

    public chosenMonthHandler(
        normalizedMonth: Moment,
        datepicker: MatDatepicker<Moment>
    ): void {
        const ctrlValue = this.date.value;
        if (ctrlValue) {
            ctrlValue.month(normalizedMonth.month());
            this.date.setValue(ctrlValue);
            if (
                this.myFormatsService.getSelectedFormatsType() ===
                FormatTypes.yearMonth
            ) {
                datepicker.close();
                if (this.date.value !== null) {
                    this.updateDate(this.date.value.toDate());
                }
            }
        }
    }
}

interface DatePickerData {
    parse: {
        dateInput: string;
    };
    display: {
        dateInput: string;
        monthYearLabel: string;
        dateA11yLabel: string;
        monthYearA11yLabel: string;
    };
}

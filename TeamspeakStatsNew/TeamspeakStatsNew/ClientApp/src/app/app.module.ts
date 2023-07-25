import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";
import { CounterComponent } from "./counter/counter.component";
import { FetchDataComponent } from "./fetch-data/fetch-data.component";
import { DateService } from "./services/date/date.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { ThemeService } from "./services/theme/theme.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DateFormatPipe } from "./pipes/date-format.pipe";
import { FetchGraphsComponent } from "./fetch-graphs/fetch-graphs.component";
import { NgChartsModule } from "ng2-charts";
import { DatePipe } from "@angular/common";
import {
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";

import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatLegacySliderModule as MatSliderModule } from "@angular/material/legacy-slider";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        FetchGraphsComponent,
        DateFormatPipe,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,

        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,

        MatIconModule,
        MatBadgeModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatTooltipModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatDividerModule,
        MatCardModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,

        NgChartsModule,

        RouterModule.forRoot([
            { path: "", component: FetchDataComponent, pathMatch: "full" },
            { path: "stats", component: FetchDataComponent },
            { path: "stats/:sort", component: FetchDataComponent },
            { path: "graphs", component: FetchGraphsComponent },
        ]),
    ],
    providers: [DateService, ThemeService, DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}

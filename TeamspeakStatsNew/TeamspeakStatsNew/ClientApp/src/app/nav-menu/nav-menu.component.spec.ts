import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavMenuComponent } from "./nav-menu.component";

describe("NavMenuComponent", () => {
    let component: NavMenuComponent;
    let fixture: ComponentFixture<NavMenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NavMenuComponent],
        });
        fixture = TestBed.createComponent(NavMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should not be expended on collapse", () => {
        component.collapse();
        expect(component.isExpanded).toBeFalsy();
    });

    it("should switch expanded to true if is false before, on toggle", () => {
        component.isExpanded = false;
        component.toggle();
        expect(component.isExpanded).toBeTruthy();
    });

    it("should switch expanded to false if is true before, on toggle", () => {
        component.isExpanded = true;
        component.toggle();
        expect(component.isExpanded).toBeFalsy();
    });
});

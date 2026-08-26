import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HeaderContentComponent } from '../../../../../shared/presentation/components/header-content/header-content.component';
import { PropertiesService } from '../../../../../properties/application/properties.service';
import { PropertyEntity } from '../../../../../properties/domain/model/Property.entity';
import { environment } from '../../../../../../environments/environment';
import {FooterContentComponent} from '../../../../../shared/presentation/components/footer-content/footer-content.component';
import { RouterLink } from '@angular/router';
import {OperationType} from '../../../../../properties/domain/model/enums/OperationType.enum';
import {OperationTypeLabel} from '../../../../../properties/domain/model/enums/OperationType-label';
import {MatMenuModule } from '@angular/material/menu';
import {PropertyTypeLabel} from '../../../../../properties/domain/model/enums/PropertyType-label';
import {PropertyType} from '../../../../../properties/domain/model/enums/PropertyType.enum';
import { ElementRef, HostListener } from '@angular/core';
import {DistrictLabel} from '../../../../../properties/domain/model/enums/District-label';
import {District} from '../../../../../properties/domain/model/enums/District.enum';
import {DepartmentLabel} from '../../../../../properties/domain/model/enums/Department-label';
import {Department} from '../../../../../properties/domain/model/enums/Department.enum';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [HeaderContentComponent, MatCardModule, MatIconModule, FooterContentComponent, RouterLink, MatMenuModule],
  templateUrl: './home-component.component.html',
  styleUrl: './home-component.component.css'
})
export class HomeComponentComponent {

  // OperationType Enum Set Up
  protected readonly operationTypeLabel = OperationTypeLabel;
  protected readonly operationTypes: OperationType[] = Object.values(OperationType);
  operationTypePlaceholder: OperationType = OperationType.SALE;
  isOperationDropdownOpen = false;

  // PropertyType Enum Set Up
  protected readonly propertyTypeLabel = PropertyTypeLabel;
  protected readonly propertyTypes: PropertyType[] = Object.values(PropertyType)
  propertyTypePlaceholder: PropertyType = PropertyType.HOUSE;
  isPropertyDropdownOpen = false;

// Department Set Up
  protected readonly departmentLabel = DepartmentLabel;
  protected readonly departments: Department[] = Object.values(Department);
  departmentPlaceholder: Department = Department.LIMA;
  isDepartmentDropdownOpen = false;

// District Set Up
  protected readonly districtLabel = DistrictLabel;
  protected readonly districts: District[] = Object.values(District);
  districtPlaceholder: District | null = null;
  isDistrictDropdownOpen = false;

  readonly properties: PropertyEntity[] = [];
  private readonly visibleCount = 4;
  private readonly previewCount = 1;
  private startIndex = 0;
  activeIndex = 0;
  isCardsTransitioning = false;
  cardsTransitionDirection: 'left' | 'right' | null = null;
  constructor(private readonly propertiesService: PropertiesService, private readonly elementRef: ElementRef,
              private readonly router: Router) {
    this.loadFeatured();
  }

  private loadFeatured(): void {
    this.propertiesService.getFeatured().subscribe({
      next: (properties) => {
        this.properties.length = 0;
        this.properties.push(...properties);
        this.startIndex = 0;
      },
      error: () => {
        this.properties.length = 0;
        this.startIndex = 0;
      }
    });
  }

  private readonly assetsBaseUrl = this.getAssetsBaseUrl();

  getCoverImage(property: PropertyEntity): string {
    const cover = property.images?.find((image) => image.cover) ?? property.images?.[0];
    const filePath = cover?.filePath?.trim();

    if (!filePath) {
      return 'assets/HomeArt.webp';
    }

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    if (filePath.startsWith('/')) {
      return `${this.assetsBaseUrl}${filePath}`;
    }

    return `${this.assetsBaseUrl}/${filePath}`;
  }

  private getAssetsBaseUrl(): string {
    const apiUrl = environment.serverBasePath.replace(/\/$/, '');
    const origin = new URL(apiUrl).origin;
    return origin;
  }

  editProperty(_property: PropertyEntity): void {
  }

  onDeleteProperty(_property: PropertyEntity): void {
  }

  get visibleProperties(): PropertyEntity[] {
    return this.properties.slice(this.startIndex, this.startIndex + this.visibleCount + this.previewCount);
  }

  isPreviewCard(index: number): boolean {
    return index >= this.visibleCount;
  }

  get canPrevious(): boolean {
    return this.startIndex > 0;
  }

  get canNext(): boolean {
    return this.startIndex + this.visibleCount < this.properties.length;
  }

  isActiveCard(index: number): boolean {
    return index === this.activeIndex && !this.isPreviewCard(index);
  }

  setActiveCard(index: number): void {
    if (this.isPreviewCard(index)) {
      return;
    }
    this.activeIndex = index;
  }

  resetActiveCard(): void {
    this.activeIndex = 0;
  }

  showPreviousCards(): void {
    if (!this.canPrevious) {
      return;
    }
    this.animateCardsTransition('left');
    this.startIndex = Math.max(0, this.startIndex - 1);
    this.activeIndex = 0;
  }

  showNextCards(): void {
    if (!this.canNext) {
      return;
    }
    this.animateCardsTransition('right');
    this.startIndex = Math.min(this.properties.length - this.visibleCount, this.startIndex + 1);
    this.activeIndex = 0;
  }

  private animateCardsTransition(direction: 'left' | 'right'): void {
    this.isCardsTransitioning = true;
    this.cardsTransitionDirection = direction;
    setTimeout(() => {
      this.isCardsTransitioning = false;
      this.cardsTransitionDirection = null;
    }, 380);
  }

  toggleOperationDropdown(): void {
    this.isOperationDropdownOpen = !this.isOperationDropdownOpen;

    if (this.isOperationDropdownOpen) {
      this.isPropertyDropdownOpen = false;
    }
  }

  togglePropertyDropdown(): void {
    this.isPropertyDropdownOpen = !this.isPropertyDropdownOpen;

    if (this.isPropertyDropdownOpen) {
      this.isOperationDropdownOpen = false;
    }
  }

  selectOperationType(type: OperationType): void {
    this.operationTypePlaceholder = type;
    this.isOperationDropdownOpen = false;
  }

  selectPropertyType(type: PropertyType): void {
    this.propertyTypePlaceholder = type;
    this.isPropertyDropdownOpen = false;
  }

  toggleDepartmentDropdown(): void {
    this.isDepartmentDropdownOpen = !this.isDepartmentDropdownOpen;

    if (this.isDepartmentDropdownOpen) {
      this.isOperationDropdownOpen = false;
      this.isPropertyDropdownOpen = false;
      this.isDistrictDropdownOpen = false;
    }
  }

  toggleDistrictDropdown(): void {
    this.isDistrictDropdownOpen = !this.isDistrictDropdownOpen;

    if (this.isDistrictDropdownOpen) {
      this.isOperationDropdownOpen = false;
      this.isPropertyDropdownOpen = false;
      this.isDepartmentDropdownOpen = false;
    }
  }

  selectDepartment(department: Department): void {
    this.departmentPlaceholder = department;
    this.isDepartmentDropdownOpen = false;
  }

  selectDistrict(district: District): void {
    this.districtPlaceholder = district;
    this.isDistrictDropdownOpen = false;
  }

  // To close dropdowns after clicking anything
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedDropdown = target.closest('.dropdown-container');

    if (!clickedDropdown) {
      this.isOperationDropdownOpen = false;
      this.isPropertyDropdownOpen = false;
      this.isDepartmentDropdownOpen = false;
      this.isDistrictDropdownOpen = false;
    }
  }

  searchProperties(): void {
    this.router.navigate(['/browse'], {
      queryParams: {
        operationType: this.operationTypePlaceholder,
        propertyType: this.propertyTypePlaceholder,
        department: this.departmentPlaceholder,
        district: this.districtPlaceholder ?? undefined
      }
    });
  }

}

import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HeaderContentComponent } from '../../../../../shared/presentation/components/header-content/header-content.component';
import { FooterContentComponent } from '../../../../../shared/presentation/components/footer-content/footer-content.component';
import { PropertiesService } from '../../../../../properties/application/properties.service';
import { PropertyEntity } from '../../../../../properties/domain/model/Property.entity';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { PropertySearchParams } from '../../../../../properties/infrastructure/properties-response';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { OperationType } from '../../../../../properties/domain/model/enums/OperationType.enum';
import { PropertyType } from '../../../../../properties/domain/model/enums/PropertyType.enum';
import { Department } from '../../../../../properties/domain/model/enums/Department.enum';
import { District } from '../../../../../properties/domain/model/enums/District.enum';

import { OperationTypeLabel } from '../../../../../properties/domain/model/enums/OperationType-label';
import { PropertyTypeLabel } from '../../../../../properties/domain/model/enums/PropertyType-label';
import { DepartmentLabel } from '../../../../../properties/domain/model/enums/Department-label';
import { DistrictLabel } from '../../../../../properties/domain/model/enums/District-label';

@Component({
  selector: 'app-browse-component',
  standalone: true,
  imports: [
    HeaderContentComponent,
    MatCardModule,
    MatIconModule,
    FooterContentComponent,
    RouterLink,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowseComponent implements OnInit {

  // ============================
  // ENUMS Y LABELS
  // ============================

  protected readonly operationTypeLabel = OperationTypeLabel;
  protected readonly operationTypes: OperationType[] = Object.values(OperationType);

  protected readonly propertyTypeLabel = PropertyTypeLabel;
  protected readonly propertyTypes: PropertyType[] = Object.values(PropertyType);

  protected readonly departmentLabel = DepartmentLabel;
  protected readonly departments: Department[] = Object.values(Department);

  protected readonly districtLabel = DistrictLabel;
  protected readonly districts: District[] = Object.values(District);

  // ============================
  // DROPDOWNS
  // ============================

  isOperationDropdownOpen = false;
  isPropertyDropdownOpen = false;
  isDepartmentDropdownOpen = false;
  isDistrictDropdownOpen = false;

  operationTypePlaceholder: OperationType | null = null;
  propertyTypePlaceholder: PropertyType | null = null;
  departmentPlaceholder: Department | null = null;
  districtPlaceholder: District | null = null;

  // ============================
  // DATA
  // ============================

  readonly properties: PropertyEntity[] = [];

  searchParams: PropertySearchParams = {
    minPriceDollars: undefined,
    maxPriceDollars: undefined,
    department: undefined,
    district: undefined,
    propertyType: undefined,
    operationType: undefined,
    tags: []
  };

  priceAscending = true;
  isLoading = false;

  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly route: ActivatedRoute,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.searchParams.operationType =
        params['operationType'] as OperationType;

      this.searchParams.propertyType =
        params['propertyType'] as PropertyType;

      this.searchParams.department =
        params['department'] as Department;

      this.searchParams.district =
        params['district'] as District;

      // Inicializamos placeholders para mostrar los filtros seleccionados

      this.operationTypePlaceholder =
        this.searchParams.operationType ?? null;

      this.propertyTypePlaceholder =
        this.searchParams.propertyType ?? null;

      this.departmentPlaceholder =
        this.searchParams.department ?? null;

      this.districtPlaceholder =
        this.searchParams.district ?? null;

      this.loadProperties();
    });
  }


  loadProperties(): void {
    this.isLoading = true;

    this.propertiesService.search(this.searchParams)
      .subscribe({
      next: (response) => {
        this.properties.length = 0;
        this.properties.push(...response);

        this.properties.sort((a, b) => {

          if (this.priceAscending) {
            return a.priceDollars - b.priceDollars;
          }

          return b.priceDollars - a.priceDollars;
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.properties.length = 0;
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.loadProperties();
  }

  togglePriceSort(): void {

    this.priceAscending = !this.priceAscending;

    this.properties.sort((a, b) => {

      if (this.priceAscending) {
        return a.priceDollars - b.priceDollars;
      }

      return b.priceDollars - a.priceDollars;
    });
  }

  toggleOperationDropdown(): void {

    this.isOperationDropdownOpen = !this.isOperationDropdownOpen;

    if (this.isOperationDropdownOpen) {
      this.isPropertyDropdownOpen = false;
      this.isDepartmentDropdownOpen = false;
      this.isDistrictDropdownOpen = false;
    }
  }

  togglePropertyDropdown(): void {

    this.isPropertyDropdownOpen = !this.isPropertyDropdownOpen;

    if (this.isPropertyDropdownOpen) {
      this.isOperationDropdownOpen = false;
      this.isDepartmentDropdownOpen = false;
      this.isDistrictDropdownOpen = false;
    }
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

  selectOperationType(type: OperationType): void {
    this.operationTypePlaceholder = type;
    this.searchParams.operationType = type;
    this.isOperationDropdownOpen = false;
  }

  selectPropertyType(type: PropertyType): void {
    this.propertyTypePlaceholder = type;
    this.searchParams.propertyType = type;
    this.isPropertyDropdownOpen = false;
  }

  selectDepartment(department: Department): void {
    this.departmentPlaceholder = department;
    this.searchParams.department = department;
    this.isDepartmentDropdownOpen = false;

    if (department !== Department.LIMA) {
      this.districtPlaceholder = null;
      this.searchParams.district = undefined;
    }
  }

  selectDistrict(district: District): void {
    this.districtPlaceholder = district;
    this.searchParams.district = district;
    this.isDistrictDropdownOpen = false;
    this.departmentPlaceholder = Department.LIMA;
    this.searchParams.department = Department.LIMA;
  }

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


  private readonly assetsBaseUrl = this.getAssetsBaseUrl();

  getCoverImage(property: PropertyEntity): string {

    const cover =
      property.images?.find((image) => image.cover)
      ?? property.images?.[0];

    const filePath = cover?.filePath?.trim();

    if (!filePath) {
      return 'assets/HomeArt.png';
    }

    if (
      filePath.startsWith('http://') ||
      filePath.startsWith('https://')
    ) {
      return filePath;
    }

    if (filePath.startsWith('/')) {
      return `${this.assetsBaseUrl}${filePath}`;
    }

    return `${this.assetsBaseUrl}/${filePath}`;
  }

  private getAssetsBaseUrl(): string {

    const apiUrl =
      environment.serverBasePath.replace(/\/$/, '');

    const origin =
      new URL(apiUrl).origin;

    return origin;
  }




  toggleTag(tag: any): void {

    if (!this.searchParams.tags) {
      this.searchParams.tags = [];
    }

    const index =
      this.searchParams.tags.indexOf(tag);

    if (index > -1) {
      this.searchParams.tags.splice(index, 1);
    } else {
      this.searchParams.tags.push(tag);
    }
  }
}
